const fs = require('fs');
const path = require('path');

const pairs = [
  ['WORKFLOW_YAML_B64', '../.github/workflows/repoowl-analyze.yml'],
  ['SCRIPT_JS_B64', '../.github/scripts/analyze-pr.js'],
  ['ISSUE_WORKFLOW_YAML_B64', '../.github/workflows/issue-analyze.yml'],
  ['ISSUE_SCRIPT_JS_B64', '../.github/scripts/analyze-issue.js'],
];

const installerPath = path.join(__dirname, 'src/background/githubInstaller.js');
let installerContent = fs.readFileSync(installerPath, 'utf8');

for (const [constName, relPath] of pairs) {
  const content = fs.readFileSync(path.join(__dirname, relPath), 'utf8');
  const base64 = Buffer.from(content).toString('base64');
  const re = new RegExp(`const ${constName} = ".*";`);
  if (!re.test(installerContent)) {
    throw new Error(`Constant ${constName} not found in githubInstaller.js`);
  }
  installerContent = installerContent.replace(re, `const ${constName} = "${base64}";`);
}

fs.writeFileSync(installerPath, installerContent);
console.log('Successfully updated githubInstaller.js with the latest base64 encoded scripts.');
