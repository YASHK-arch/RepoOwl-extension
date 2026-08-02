const fs = require('fs');
const path = require('path');

const workflowPath = path.join(__dirname, '../.github/workflows/repoowl-analyze.yml');
const scriptPath = path.join(__dirname, '../.github/scripts/analyze-pr.js');
const installerPath = path.join(__dirname, 'src/background/githubInstaller.js');

const workflowContent = fs.readFileSync(workflowPath, 'utf8');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

const workflowBase64 = Buffer.from(workflowContent).toString('base64');
const scriptBase64 = Buffer.from(scriptContent).toString('base64');

let installerContent = fs.readFileSync(installerPath, 'utf8');

// Replace the constants
installerContent = installerContent.replace(/const WORKFLOW_YAML_B64 = ".*";/, `const WORKFLOW_YAML_B64 = "${workflowBase64}";`);
installerContent = installerContent.replace(/const SCRIPT_JS_B64 = ".*";/, `const SCRIPT_JS_B64 = "${scriptBase64}";`);

fs.writeFileSync(installerPath, installerContent);
console.log('Successfully updated githubInstaller.js with the latest base64 encoded scripts.');
