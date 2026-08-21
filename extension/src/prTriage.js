import Groq from 'groq-sdk';
import { getSandboxClient } from './lib/supabase.js';

export async function fetchPullRequestsFromGitHub(repo, token) {
  const [owner, name] = repo.split('/');
  if (!owner || !name) throw new Error(`Invalid repository: ${repo}`);

  const url = new URL(`https://api.github.com/repos/${owner}/${name}/pulls`);
  url.searchParams.set('state', 'open');
  url.searchParams.set('per_page', '100');
  url.searchParams.set('direction', 'asc');

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${body}`);
  }

  return response.json();
}

export async function fetchPRDiffFromGitHub(repo, prNumber, token) {
  const [owner, name] = repo.split('/');
  const url = new URL(`https://api.github.com/repos/${owner}/${name}/pulls/${prNumber}/files`);
  url.searchParams.set('per_page', '100');

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status}) fetching diffs`);
  }
  const files = await response.json();
  
  // Filter out noise
  return files.filter(f => 
    f.status !== 'removed' &&
    !f.filename.endsWith('.lock') &&
    !f.filename.endsWith('.svg') &&
    !f.filename.endsWith('.png') &&
    !f.filename.endsWith('.min.js') &&
    f.patch // Must have a patch diff
  );
}

export async function autoLabelPullRequest(repo, prNumber, labels, token) {
  if (!labels || labels.length === 0) return;
  const [owner, name] = repo.split('/');
  const url = `https://api.github.com/repos/${owner}/${name}/issues/${prNumber}/labels`;
  
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json'
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ labels })
  });
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGroqWithRetry(groq, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await groq.chat.completions.create(options);
    } catch (e) {
      if (e.status === 429 && i < retries - 1) {
        let waitTime = 6000;
        const match = e.message?.match(/Please try again in ([\d.]+)s/);
        if (match) {
          waitTime = Math.ceil(parseFloat(match[1]) * 1000) + 500;
        }
        console.warn(`Rate limit hit. Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      } else {
        throw e;
      }
    }
  }
}

export async function processPullRequestMapReduce(repo, pr, keys) {
  const diffFiles = await fetchPRDiffFromGitHub(repo, pr.number, keys.githubToken);
  
  const groq = new Groq({ apiKey: keys.groqApiKey, dangerouslyAllowBrowser: true });
  
  // Map Phase: Summarize files
  const fileSummaries = [];
  for (const file of diffFiles) {
    const prompt = `Summarize what this file diff does in 2 sentences max.\nFile: ${file.filename}\nDiff:\n${file.patch}`;
    try {
      const res = await callGroqWithRetry(groq, {
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1
      });
      const summary = res.choices[0]?.message?.content?.trim();
      fileSummaries.push(`${file.filename}: ${summary}`);
      await delay(1000); // 1s delay between map calls to pace tokens
    } catch (e) {
      console.warn(`Failed to map file ${file.filename}`, e);
    }
  }

  // Find linked issue context if any
  let issueContext = "No linked issue context available.";
  const match = pr.body?.match(/(?:fixes|resolves|closes)\s+#(\d+)/i);
  if (match) {
    const issueNum = parseInt(match[1]);
    const supabase = await getSandboxClient();
    const { data } = await supabase.from('issues').select('analysis_summary').eq('repo_name', repo).eq('issue_number', issueNum).single();
    if (data && data.analysis_summary) {
      issueContext = `Linked Issue #${issueNum} Goal: ${data.analysis_summary}`;
    }
  }

  // Reduce Phase
  const reducePrompt = `You are a strict PR reviewer.
PR Description: ${pr.body || 'None'}
Linked Issue Context: ${issueContext}

Code File Summaries:
${fileSummaries.join('\n\n')}

Analyze the PR based on the above.
Respond STRICTLY with this JSON schema:
{
  "slop_detection": {
    "is_accurate": boolean,
    "confidence_score": number,
    "warning": "string"
  },
  "issue_resolution": {
    "solves_linked_issue": boolean,
    "explanation": "string"
  },
  "domain_impact": [
    { "domain": "string", "percentage": number, "files": ["string"] }
  ],
  "recommended_labels": ["string"]
}`;

  const res = await callGroqWithRetry(groq, {
    messages: [{ role: 'user', content: reducePrompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });
  
  const analysisText = res.choices[0]?.message?.content?.trim();
  const analysis = JSON.parse(analysisText);

  // Save to DB
  const supabase = await getSandboxClient();
  const { error } = await supabase.from('pull_requests').upsert({
    repo_name: repo,
    pr_number: pr.number,
    slop_detection: analysis.slop_detection,
    issue_resolution: analysis.issue_resolution,
    domain_impact: analysis.domain_impact,
    recommended_labels: analysis.recommended_labels
  });

  if (error) console.error("Error saving PR analysis", error);

  // Auto-label (if we are maintainer)
  if (analysis.recommended_labels?.length > 0) {
    try {
      await autoLabelPullRequest(repo, pr.number, analysis.recommended_labels, keys.githubToken);
    } catch (e) {
      console.warn("Failed to auto-label PR", e);
    }
  }

  return analysis;
}
