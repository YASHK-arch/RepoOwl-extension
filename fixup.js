const fs = require('fs');

let content = fs.readFileSync('clean_analyze-issue.js', 'utf8');

const fetchRepoFileTreeFn = `
async function fetchRepoFileTree(repo) {
  try {
    const res = await fetch(\`https://api.github.com/repos/\${repo}/git/trees/main?recursive=1\`, { headers: ghHeaders() });
    if (!res.ok) return '';
    const data = await res.json();
    return data.tree.filter(t => t.type === 'blob').map(t => t.path).join('\\n');
  } catch (e) {
    return '';
  }
}
`;

content = content.replace(
  /async function analyzeIssue\(issue, history\) \{/,
  fetchRepoFileTreeFn + '\nasync function analyzeIssue(issue, history, fileTree) {'
);

const addContextualLabelsFn = `
async function addContextualLabels(repo, issue, analysis) {
  if (!analysis.contextual_labels || !Array.isArray(analysis.contextual_labels) || analysis.contextual_labels.length === 0) {
    return;
  }
  const url = \`https://api.github.com/repos/\${repo}/issues/\${issue.number}/labels\`;
  const res = await fetch(url, {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify({
      labels: analysis.contextual_labels
    })
  });
  if (!res.ok) {
    console.warn(\`  - Failed to add labels to issue #\${issue.number}: \${await res.text()}\`);
  } else {
    console.log(\`  - Added labels: \${analysis.contextual_labels.join(', ')}\`);
  }
}
`;

content = content.replace(
  /async function updateRegistryStats/,
  addContextualLabelsFn + '\nasync function updateRegistryStats'
);

const oldPrompt = /\s*const systemPrompt =[\s\S]*?const userPrompt =/m;

const newPrompt = `
  const systemPrompt =
    \`You are an expert GitHub triage AI.\\n\` +
    \`Your task is to analyze a GitHub issue and produce a structured triage report.\\n\\n\` +
    \`DUPLICATE RULES:\\n\` +
    \`  - Only set is_duplicate=true if the issue targets the EXACT same root cause or feature as a specific existing open issue.\\n\` +
    \`  - You MUST cite the matching issue number (e.g. "duplicate of #42") in analysis_summary when marking as duplicate.\\n\` +
    \`  - Do NOT mark as duplicate because issues share a topic area or keyword overlap.\\n\` +
    \`  - Do NOT label any issue as spam, noise, or invalid. Assume all submissions are legitimate.\\n\` +
    \`  - Default to is_duplicate=false when uncertain.\\n\\n\` +
    \`CONTEXTUAL LABELS:\\n\` +
    \`  - Generate exactly 3 meaningful, contextually appropriate labels for this issue.\\n\` +
    \`  - Labels must describe the functional area, severity, or domain of the problem NOT just keywords extracted from the text.\\n\` +
    \`  - Examples of GOOD labels: "authentication", "performance-regression", "data-integrity", "ux-feedback", "api-contract".\\n\` +
    \`  - Examples of BAD labels: "issue", "bug", "problem", "fix", "error" these are too generic.\\n\` +
    \`  - Labels should be lowercase, hyphen-separated, and 1-3 words max.\\n\\n\` +
    \`AFFECTED FILES:\\n\` +
    \`  - Based on the repository file tree, identify up to 8 specific source files most likely to need changes to resolve this issue.\\n\` +
    \`  - Return their paths exactly as they appear in the file tree.\\n\\n\` +
    \`You must respond in valid JSON format matching this schema:\\n\` +
    \`{ "is_duplicate": boolean, "analysis_summary": "string", "contextual_labels": ["string"], "affected_files": ["string"] }\\n\` +
    \`Ensure the JSON is well-formed.\`;

  const userPrompt =`;

content = content.replace(oldPrompt, newPrompt);

content = content.replace(
  /const historicalLog = history[\s\S]*?\|\| 'No historical issues to compare against\.';/,
  `const historicalLog = history
    .filter(h => h.issue_number !== issue.number)
    .map(h => \`[Issue ID: #\${h.issue_number}]\\nTechnical Summary: \${h.analysis_summary}\`)
    .join('\\n\\n---\\n\\n') || 'No historical issues to compare against.';`
);

content = content.replace(
  /INCOMING ISSUE DATA[\s\S]*?\`4\. Technical Metrics \& Environment:\\n\$\{fields\.technical_metrics \|\| 'N\/A'}\\n\\n\`/m,
  `INCOMING ISSUE DATA\\n\` +
    \`Issue #\${issue.number}: \${issue.title}\\n\\n\` +
    \`1. Core Problem / Request:\\n\${fields.primary_description || issue.body || 'No description provided.'}\\n\\n\` +
    \`2. Context & Reproduction:\\n\${fields.context_steps || 'N/A'}\\n\\n\` +
    \`3. Proposed Solution / Impact:\\n\${fields.expected_outcome || 'N/A'}\\n\\n\` +
    \`4. Technical Metrics & Environment:\\n\${fields.technical_metrics || 'N/A'}\\n\\n\` +
    \`HISTORICAL REPOSITORY CONTEXT\\n\${historicalLog}\\n\\n\` +
    \`REPOSITORY FILE TREE\\n\${fileTree || 'Not available.'}\``
);

// Update saveAnalysis
content = content.replace(
  /analysis_summary: analysis\.analysis_summary,/g,
  `analysis_summary: analysis.analysis_summary,
        affected_files: analysis.affected_files ?? null,`
);

// Update run()
content = content.replace(
  /let duplicateCount = 0;[\s\S]*?for \(const issue of issuesToProcess\)/m,
  `let duplicateCount = 0;

  const fileTree = await fetchRepoFileTree(repo);

  for (const issue of issuesToProcess)`
);

content = content.replace(
  /const analysis = await analyzeIssue\(issue, history\);\s*await saveAnalysis\(repo, issue, analysis\);/m,
  `const analysis = await analyzeIssue(issue, history, fileTree);
      await saveAnalysis(repo, issue, analysis);
      await addContextualLabels(repo, issue, analysis);`
);


fs.writeFileSync('.github/scripts/analyze-issue.js', content, 'utf8');
console.log('Fixed analyze-issue.js');
