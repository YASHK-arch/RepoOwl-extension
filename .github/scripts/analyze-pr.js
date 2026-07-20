const fetch = require('node-fetch');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PR_NUMBER = process.env.PR_NUMBER;
const REPOSITORY = process.env.REPOSITORY; // format: owner/repo

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'llama-3.3-70b-versatile';

async function askGroq(prompt) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${errorText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

async function run() {
  if (!GROQ_API_KEY || !GITHUB_TOKEN) {
    console.error("Missing GROQ_API_KEY or GITHUB_TOKEN secret.");
    process.exit(1);
  }

  console.log(`Starting RepoOwl Map-Reduce Analysis for PR #${PR_NUMBER} in ${REPOSITORY}...`);

  // 1. Fetch PR Details
  const prResponse = await fetch(`https://api.github.com/repos/${REPOSITORY}/pulls/${PR_NUMBER}`, {
    headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
  });
  const prData = await prResponse.json();

  // 2. Fetch PR Diffs
  const diffResponse = await fetch(`https://api.github.com/repos/${REPOSITORY}/pulls/${PR_NUMBER}/files`, {
    headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
  });
  const filesData = await diffResponse.json();

  // 3. Check for Linked Issues
  let linkedIssueContext = "No linked issue detected.";
  const issueMatch = prData.body ? prData.body.match(/(?:fix|fixes|resolves|closes)\s+#(\d+)/i) : null;
  
  if (issueMatch) {
    const issueNum = issueMatch[1];
    console.log(`Detected linked issue #${issueNum}. Fetching context...`);
    const issueRes = await fetch(`https://api.github.com/repos/${REPOSITORY}/issues/${issueNum}`, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
    });
    if (issueRes.ok) {
      const issueDetails = await issueRes.json();
      linkedIssueContext = `Linked Issue Goal: ${issueDetails.title}\n${issueDetails.body}`;
    }
  }

  // 4. MAP PHASE: Summarize individual files
  const filteredFiles = filesData.filter(f => 
    !f.filename.includes('package-lock.json') && 
    !f.filename.endsWith('.svg') &&
    f.patch
  );

  console.log(`Mapping ${filteredFiles.length} files...`);
  const fileSummaries = [];
  
  for (const file of filteredFiles) {
    try {
      console.log(`Summarizing ${file.filename}...`);
      const mapPrompt = `
        Briefly summarize what this specific file diff does in 2 sentences max.
        File: ${file.filename}
        Status: ${file.status}
        Patch:
        ${file.patch.substring(0, 10000)}
      `;
      const summary = await askGroq(mapPrompt);
      fileSummaries.push(`- **${file.filename}**: ${summary}`);
      // Simple delay to avoid rate limits
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.warn(`Could not summarize ${file.filename}:`, err.message);
    }
  }

  // 5. REDUCE PHASE: Final Analysis
  console.log("Reducing summaries into final analysis...");
  const reducePrompt = `
    You are an expert, ruthless AI Code Reviewer for RepoOwl.
    
    PR Title: ${prData.title}
    PR Description: ${prData.body || "None provided."}
    
    ${linkedIssueContext}
    
    Code Changes Summaries (Map Phase):
    ${fileSummaries.length > 0 ? fileSummaries.join('\n') : "No significant code changes found."}
    
    Analyze the PR and output your response in Markdown format. Your response MUST include the following structured sections:
    
    1. **Slop Badge**: Output exactly one of these two phrases at the very beginning based on if the code genuinely matches the PR description:
       "🟢 [Code Matches Description]" or "🔴 [⚠️ AI Slop Detected]"
    2. **AI Slop Detection**: Explain your reasoning for the badge. Is the description hallucinated/inaccurate?
    3. **Issue Resolution**: Does the code actually solve the linked issue?
    4. **Domain Impact**: A brief bulleted list of which components/domains were touched (e.g., Frontend, Database).
    5. **Breaking Changes**: Are there any?
    6. **Final Verdict**: Approve or Request Changes based on code quality and accuracy.
  `;

  const analysisOutput = await askGroq(reducePrompt);

  // 6. Post the Comment back to GitHub
  console.log("Posting comment to GitHub...");
  const commentBody = `### 🦉 RepoOwl PR Analysis\n\n${analysisOutput}\n\n*Analyzed automatically via GitHub Actions*`;

  await fetch(`https://api.github.com/repos/${REPOSITORY}/issues/${PR_NUMBER}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ body: commentBody })
  });

  console.log("Analysis posted successfully!");
}

run().catch(err => {
  console.error("Workflow failed:", err);
  process.exit(1);
});
