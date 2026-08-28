
// RepoOwl Issue Analyzer â€” GitHub Actions Script
// Runs server-side so it works 24/7 regardless of whether the maintainer's browser is open.
// Replicates the logic from extension/src/background.js: executeIssueSyncQueue (maintainer path only).

const GROQ_API_KEY    = process.env.GROQ_API_KEY;
const GITHUB_TOKEN    = process.env.GITHUB_TOKEN;
const SUPABASE_URL    = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const REPOSITORY      = process.env.REPOSITORY;   // format: owner/repo
const ISSUE_NUMBER    = process.env.ISSUE_NUMBER; // set on issues.opened; empty on schedule

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'qwen/qwen3.6-27b';
const DELAY_MS   = 2000;

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// â€”â€”â€”â€”â€” Helpers â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”

async function askGroq(systemPrompt, userPrompt) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content?.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  if (!text) throw new Error('Groq returned an empty response.');
  return JSON.parse(text);
}

/**
 * Parse the GitHub issue body into structured template fields,
 * mirroring parseIssueTemplateFields() from background.js.
 */
function parseIssueTemplateFields(body) {
  if (!body) return {};
  const sections = {};
  const regex = /###\s+(.+?)(?:\r?\n)+([\s\S]*?)(?=###\s+|$)/g;
  let match;
  while ((match = regex.exec(body)) !== null) {
    sections[match[1].trim()] = match[2].trim();
  }

  const getVal = (keys) => {
    for (const k of keys) if (sections[k]) return sections[k];
    return null;
  };

  return {
    primary_description: getVal([
      'Bug Description', 'Feature Description', "What documentation is missing?",
      'Task Description', 'Vulnerability Type', 'Current Problem', 'Missing Tests'
    ]),
    context_steps: getVal([
      'Steps to Reproduce', 'Current Design', 'Why is it useful?',
      'Which page?', 'Slow page', 'Affected Components'
    ]),
    expected_outcome: getVal([
      'Expected Behavior', 'Suggested Improvement', 'Proposed Improvement',
      'Expected Output', 'Impact', 'Suggested Fix', 'Alternatives considered?'
    ]),
    technical_metrics: getVal([
      'CPU Usage', 'Memory Usage', 'Logs', 'Browser', 'OS',
      'Files to modify', 'Affected Files'
    ])
  };
}

// â€”â€”â€”â€”â€” Supabase REST helpers (no SDK needed â€” pure fetch) â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”

function supabaseHeaders() {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };
}

async function getAlreadyAnalyzedIssueNumbers(repo) {
  // Only skip issues that have a COMPLETE analysis (analysis_summary is set).
  // Issues with a partial row (failed mid-run) will be re-processed.
  const url = `${SUPABASE_URL}/rest/v1/issues?repo_name=eq.${encodeURIComponent(repo)}&select=issue_number,analysis_summary`;
  const res = await fetch(url, { headers: supabaseHeaders() });
  if (!res.ok) {
    console.warn(`Could not fetch analyzed issues from Supabase: ${await res.text()}`);
    return new Set();
  }
  const rows = await res.json();
  return new Set(
    rows.filter(r => r.analysis_summary && r.analysis_summary.trim() !== '')
        .map(r => r.issue_number)
  );
}

async function getRecentHistory(repo) {
  const url = `${SUPABASE_URL}/rest/v1/issues?repo_name=eq.${encodeURIComponent(repo)}&status=eq.open&select=issue_number,analysis_summary&order=created_at.desc&limit=50`;
  const res = await fetch(url, { headers: supabaseHeaders() });
  if (!res.ok) {
    console.warn(`Could not fetch history from Supabase: ${await res.text()}`);
    return [];
  }
  return await res.json();
}

async function saveAnalysis(repo, issue, analysis) {
  // Use upsert (merge-duplicates) so re-runs complete any half-baked rows.
  const url = `${SUPABASE_URL}/rest/v1/issues`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...supabaseHeaders(), 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({
      repo_name: repo,
      issue_number: issue.number,
      is_duplicate: analysis.is_duplicate,
      analysis_summary: analysis.analysis_summary,
      affected_files: analysis.affected_files ?? null,
      status: 'open'
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase insert failed (${res.status}): ${err}`);
  }
  console.log(`  âœ” Saved analysis for issue #${issue.number} (is_duplicate=${analysis.is_duplicate})`);
}

function getLabelColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "000000".substring(0, 6 - c.length) + c;
}

async function addContextualLabels(repo, issue, analysis) {
  if (!analysis.contextual_labels || !Array.isArray(analysis.contextual_labels) || analysis.contextual_labels.length === 0) {
    return;
  }

  for (const label of analysis.contextual_labels) {
    const color = getLabelColor(label);
    const labelUrl = `https://api.github.com/repos/${repo}/labels`;
    await fetch(labelUrl, {
      method: 'POST',
      headers: ghHeaders(),
      body: JSON.stringify({ name: label, color: color })
    });
  }

  const url = `https://api.github.com/repos/${repo}/issues/${issue.number}/labels`;
  const res = await fetch(url, {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify({ labels: analysis.contextual_labels })
  });
  if (!res.ok) {
    console.warn(`  - Failed to add labels to issue #${issue.number}: ${await res.text()}`);
  } else {
    console.log(`  - Added labels: ${analysis.contextual_labels.join(', ')}`);
  }
}

async function postAnalysisComment(repo, issue, analysis) {
  const url = `https://api.github.com/repos/${repo}/issues/${issue.number}/comments`;

  const yamlContent = `is_duplicate: ${analysis.is_duplicate}
analysis_summary: |
  ${analysis.analysis_summary.replace(/\n/g, '\n  ')}
contextual_labels:
${(analysis.contextual_labels || []).slice(0, 3).map(l => `  - ${l}`).join('\n')}
affected_files:
${(analysis.affected_files || []).map(f => `  - ${f}`).join('\n')}
`;

  const body = `<img src="https://raw.githubusercontent.com/YASHK-arch/RepoOwl-extension/main/extension/public/icons/logo128.png" width="28" height="28" align="left" style="margin-right: 8px;" /> **RepoOwl Issue Analysis**\n\n\`\`\`yaml\n${yamlContent}\n\`\`\``;

  const res = await fetch(url, {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify({ body })
  });

  if (!res.ok) {
    console.warn(`  - Failed to post comment to issue #${issue.number}: ${await res.text()}`);
  } else {
    console.log(`  - Posted analysis comment to issue #${issue.number}`);
  }
}

async function updateRegistryStats(repo, totalAnalyzed, duplicatesFound) {
  const url = `${SUPABASE_URL}/rest/v1/public_ecosystem_registry`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...supabaseHeaders(), 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({
      repo_name: repo,
      total_issues_analyzed: totalAnalyzed,
      duplicates_found: duplicatesFound,
      last_updated: new Date().toISOString()
    })
  });
  if (!res.ok) {
    console.warn(`Registry update failed: ${await res.text()}`);
  }
}

// â€”â€”â€”â€”â€” GitHub helpers â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”

function ghHeaders() {
  return {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

async function fetchIssueFromGitHub(repo, issueNumber) {
  const res = await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, { headers: ghHeaders() });
  if (!res.ok) throw new Error(`GitHub API error fetching issue #${issueNumber}: ${await res.text()}`);
  const issue = await res.json();
  if (issue.pull_request) throw new Error(`#${issueNumber} is a pull request, not an issue.`);
  return issue;
}

async function fetchAllOpenIssues(repo) {
  const issues = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/repos/${repo}/issues?state=open&per_page=100&page=${page}&direction=asc`;
    const res = await fetch(url, { headers: ghHeaders() });
    if (!res.ok) throw new Error(`GitHub API error listing issues: ${await res.text()}`);
    const batch = await res.json();
    const realIssues = batch.filter(i => !i.pull_request);
    issues.push(...realIssues);
    if (batch.length < 100) break;
    page++;
  }
  return issues;
}

// â€”â€”â€”â€”â€” Core analysis logic â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”

async function fetchRepoFileTree(repo) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/git/trees/main?recursive=1`, { headers: ghHeaders() });
    if (!res.ok) return '';
    const data = await res.json();
    return data.tree.filter(t => t.type === 'blob').map(t => t.path).join('\n');
  } catch (e) {
    return '';
  }
}

async function analyzeIssue(issue, history, fileTree) {
  const fields = parseIssueTemplateFields(issue.body || '');

  const historicalLog = history
    .filter(h => h.issue_number !== issue.number)
    .map(h => `[Issue ID: #${h.issue_number}]\nTechnical Summary: ${h.analysis_summary}`)
    .join('\n\n---\n\n') || 'No historical issues to compare against.';

  const systemPrompt =
    `You are an expert GitHub triage AI.\n` +
    `Your task is to analyze a GitHub issue and produce a structured triage report.\n\n` +
    `DUPLICATE RULES:\n` +
    `  - Only set is_duplicate=true if the issue targets the EXACT same root cause or feature as a specific existing open issue.\n` +
    `  - You MUST cite the matching issue number (e.g. "duplicate of #42") in analysis_summary when marking as duplicate.\n` +
    `  - Do NOT mark as duplicate because issues share a topic area or keyword overlap.\n` +
    `  - Do NOT label any issue as spam, noise, or invalid. Assume all submissions are legitimate.\n` +
    `  - Default to is_duplicate=false when uncertain.\n\n` +
    `CONTEXTUAL LABELS:\n` +
    `  - Generate exactly 3 meaningful, contextually appropriate labels for this issue.\n` +
    `  - Labels must describe the functional area, severity, or domain of the problem NOT just keywords extracted from the text.\n` +
    `  - Examples of GOOD labels: "authentication", "performance-regression", "data-integrity", "ux-feedback", "api-contract".\n` +
    `  - Examples of BAD labels: "issue", "bug", "problem", "fix", "error" these are too generic.\n` +
    `  - Labels should be lowercase, hyphen-separated, and 1-3 words max.\n\n` +
    `AFFECTED FILES:\n` +
    `  - Based on the repository file tree, identify up to 8 specific source files most likely to need changes to resolve this issue.\n` +
    `  - Return their paths exactly as they appear in the file tree.\n\n` +
    `You must respond in valid JSON format matching this schema:\n` +
    `{ "is_duplicate": boolean, "analysis_summary": "string", "contextual_labels": ["string"], "affected_files": ["string"] }\n` +
    `Ensure the JSON is well-formed.`;

  const userPrompt =
    `INCOMING ISSUE DATA\n` +
    `Issue #${issue.number}: ${issue.title}\n\n` +
    `1. Core Problem / Request:\n${fields.primary_description || issue.body || 'No description provided.'}\n\n` +
    `2. Context & Reproduction:\n${fields.context_steps || 'N/A'}\n\n` +
    `3. Proposed Solution / Impact:\n${fields.expected_outcome || 'N/A'}\n\n` +
    `4. Technical Metrics & Environment:\n${fields.technical_metrics || 'N/A'}\n\n` +
    `HISTORICAL REPOSITORY CONTEXT\n${historicalLog}\n\n` +
    `REPOSITORY FILE TREE\n${fileTree || 'Not available.'}`;

  // Retry up to 3 times â€” handles rate limits (429) and JSON validation failures (400).
  // On attempt 2+, the file tree is stripped to reduce token load.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const promptToUse = attempt > 1
        ? userPrompt.replace(/\nREPOSITORY FILE TREE[\s\S]*$/, '')
        : userPrompt;
      return await askGroq(systemPrompt, promptToUse);
    } catch (e) {
      const is429 = e.message.includes('429');
      const is400Json = e.message.includes('400') && e.message.includes('json_validate_failed');
      if (attempt < 3 && (is429 || is400Json)) {
        if (is429) {
          const waitMatch = e.message.match(/try again in ([\d.]+)s/);
          const wait = waitMatch ? Math.ceil(parseFloat(waitMatch[1]) * 1000) + 500 : 8000;
          console.warn(`  Rate limited. Waiting ${wait}ms before retry ${attempt + 1}/3...`);
          await delay(wait);
        } else {
          console.warn(`  Groq JSON validation error. Retrying ${attempt + 1}/3 with simplified prompt...`);
          await delay(2000);
        }
      } else {
        throw e;
      }
    }
  }
}

// â€”â€”â€”â€”â€” Entry point â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”

async function run() {
  if (!GROQ_API_KEY || !GITHUB_TOKEN || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      'RepoOwl Issue Analyzer: Missing required secrets (GROQ_API_KEY, GITHUB_TOKEN, SUPABASE_URL, SUPABASE_ANON_KEY).\n' +
      'Please configure these in your repository secrets. Skipping analysis.'
    );
    process.exit(0);
  }

  const repo = REPOSITORY;
  console.log(`RepoOwl Issue Analyzer starting for ${repo}...`);

  // Determine which issues to process
  let issuesToProcess = [];

  if (ISSUE_NUMBER) {
    // Triggered by issues.opened â€” process only the new issue
    console.log(`Triggered by new issue #${ISSUE_NUMBER}. Fetching details...`);
    try {
      const issue = await fetchIssueFromGitHub(repo, parseInt(ISSUE_NUMBER, 10));
      issuesToProcess = [issue];
    } catch (e) {
      console.error(`Failed to fetch issue #${ISSUE_NUMBER}: ${e.message}`);
      process.exit(1);
    }
  } else {
    // Triggered by schedule or workflow_dispatch â€” sweep all open issues
    console.log('Running scheduled sweep of all open issues...');
    try {
      const allOpen = await fetchAllOpenIssues(repo);
      console.log(`Found ${allOpen.length} open issues on GitHub.`);

      // Skip issues that already have a complete analysis in Supabase.
      // Issues with partial rows (failed mid-run) are re-processed.
      const analyzedSet = await getAlreadyAnalyzedIssueNumbers(repo);
      console.log(`${analyzedSet.size} issues fully analyzed in Supabase.`);

      issuesToProcess = allOpen.filter(i => !analyzedSet.has(i.number));
      console.log(`${issuesToProcess.length} issues pending analysis.`);
    } catch (e) {
      console.error(`Failed to fetch issues: ${e.message}`);
      process.exit(1);
    }
  }

  if (issuesToProcess.length === 0) {
    console.log('No issues to analyze. All caught up!');
    process.exit(0);
  }

  // Analyze each pending issue
  let analyzedCount = 0;
  let duplicateCount = 0;

  const fileTree = await fetchRepoFileTree(repo);

  for (const issue of issuesToProcess) {
    console.log(`\nAnalyzing issue #${issue.number}: "${issue.title}"...`);
    try {
      const history = await getRecentHistory(repo);
      const analysis = await analyzeIssue(issue, history, fileTree);
      await saveAnalysis(repo, issue, analysis);
      await addContextualLabels(repo, issue, analysis);
      await postAnalysisComment(repo, issue, analysis);

      analyzedCount++;
      if (analysis.is_duplicate) duplicateCount++;

      await delay(DELAY_MS);
    } catch (e) {
      console.error(`  âœ– Error analyzing issue #${issue.number}: ${e.message}`);
      // Continue with remaining issues rather than aborting the whole run
    }
  }

  // Update global registry stats
  try {
    const totalInDb = (await getAlreadyAnalyzedIssueNumbers(repo)).size;
    const historyAll = await getRecentHistory(repo);
    const totalDuplicates = historyAll.filter(h => h.is_duplicate).length;
    await updateRegistryStats(repo, totalInDb, totalDuplicates);
    console.log(`\nRegistry updated: total=${totalInDb}, duplicates=${totalDuplicates}`);
  } catch (e) {
    console.warn(`Could not update registry: ${e.message}`);
  }

  console.log(`\nIssue analysis complete. Analyzed: ${analyzedCount}, Duplicates found: ${duplicateCount}`);
}

run().catch(err => {
  console.error('Workflow failed:', err);
  process.exit(1);
});
