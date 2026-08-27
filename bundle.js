const fs = require('fs');

const path = 'extension/src/background/githubInstaller.js';
let content = fs.readFileSync(path, 'utf8');

const mappings = {
  'WORKFLOW_YAML_B64': '.github/workflows/repoowl-analyze.yml',
  'SCRIPT_JS_B64': '.github/scripts/analyze-pr.js',
  'ISSUE_WORKFLOW_YAML_B64': '.github/workflows/issue-analyze.yml',
  'ISSUE_SCRIPT_JS_B64': '.github/scripts/analyze-issue.js',
  'WELCOME_WORKFLOW_YAML_B64': '.github/workflows/welcome.yml',
  'ISSUE_ASSIGNMENT_WORKFLOW_YAML_B64': '.github/workflows/issue-assignment.yml',
  'AUTO_LABEL_WORKFLOW_YAML_B64': '.github/workflows/auto-label.yml',
  'PR_MERGED_WORKFLOW_YAML_B64': '.github/workflows/pr-merged.yml',
  'STALE_WORKFLOW_YAML_B64': '.github/workflows/stale.yml',
  'LABELER_YML_B64': '.github/labeler.yml'
};

for (const [varName, filePath] of Object.entries(mappings)) {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const b64 = Buffer.from(fileContent, 'utf8').toString('base64');
    const regex = new RegExp(`const ${varName} = ".*?";`);
    content = content.replace(regex, `const ${varName} = "${b64}";`);
    console.log(`Updated ${varName} from ${filePath}`);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated githubInstaller.js!');
