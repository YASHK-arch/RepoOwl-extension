const fs = require('fs');
let content = fs.readFileSync('.github/scripts/analyze-issue.js', 'utf8');

const commentFn = `
async function postAnalysisComment(repo, issue, analysis) {
  const url = \`https://api.github.com/repos/\${repo}/issues/\${issue.number}/comments\`;
  
  const yamlContent = \`is_duplicate: \${analysis.is_duplicate}
analysis_summary: |
  \${analysis.analysis_summary.replace(/\\n/g, '\\n  ')}
contextual_labels:
\${(analysis.contextual_labels || []).slice(0, 3).map(l => \`  - \${l}\`).join('\\n')}
affected_files:
\${(analysis.affected_files || []).map(f => \`  - \${f}\`).join('\\n')}
\`;

  const body = \`<img src="https://raw.githubusercontent.com/YASHK-arch/RepoOwl-extension/main/icons/icon128.png" width="30" height="30" /> **RepoOwl Issue Analysis**\\n\\n\\\`\\\`\\\`yaml\\n\${yamlContent}\\n\\\`\\\`\\\`\`;

  const res = await fetch(url, {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify({ body })
  });

  if (!res.ok) {
    console.warn(\`  - Failed to post comment to issue #\${issue.number}: \${await res.text()}\`);
  } else {
    console.log(\`  - Posted analysis comment to issue #\${issue.number}\`);
  }
}
`;

content = content.replace('async function updateRegistryStats', commentFn + '\nasync function updateRegistryStats');
content = content.replace('await addContextualLabels(repo, issue, analysis);', 'await addContextualLabels(repo, issue, analysis);\n      await postAnalysisComment(repo, issue, analysis);');

fs.writeFileSync('.github/scripts/analyze-issue.js', content);
console.log('Successfully injected postAnalysisComment');
