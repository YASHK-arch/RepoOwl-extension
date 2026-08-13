
// RepoOwl Issue Analyzer — GitHub Actions Script
// Runs server-side so it works 24/7 regardless of whether the maintainer's browser is open.
// Replicates the logic from extension/src/background.js: executeIssueSyncQueue (maintainer path only).

const GROQ_API_KEY     = process.env.GROQ_API_KEY;
const GITHUB_TOKEN     = process.env.GITHUB_TOKEN;
const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const REPOSITORY       = process.env.REPOSITORY;    // format: owner/repo
const ISSUE_NUMBER     = process.env.ISSUE_NUMBER;  // set on issues.opened; empty on schedule
const COMMENT_BODY     = process.env.COMMENT_BODY || '';
const COMMENT_AUTHOR   = process.env.COMMENT_AUTHOR || '';
const COMMENT_ISSUE_NUMBER = process.env.COMMENT_ISSUE_NUMBER || '';
const ISSUE_AUTHOR     = process.env.ISSUE_AUTHOR || '';

// ── Configurable timers ─────────────────────────────────────────────────────
// ANALYSIS_DELAY_SECONDS: buffer to allow issue author to finish editing before analysis.
// Set to 0 for immediate (testing). Increase to e.g. 300 for a 5-minute inactivity gate.
const ANALYSIS_DELAY_SECONDS = parseInt(process.env.ANALYSIS_DELAY_SECONDS || '0', 10);

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'llama-3.3-70b-versatile';
const DELAY_MS   = 2000;

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ── Helpers ─────────────────────────────────────────────────────────────────

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
  const text = data.choices[0]?.message?.content?.trim();
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

// ── Supabase REST helpers (no SDK needed — pure fetch) ───────────────────────

function supabaseHeaders() {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };
}

async function getAlreadyAnalyzedIssueNumbers(repo) {
  const url = `${SUPABASE_URL}/rest/v1/issues?repo_name=eq.${encodeURIComponent(repo)}&select=issue_number`;
  const res = await fetch(url, { headers: supabaseHeaders() });
  if (!res.ok) {
    console.warn(`Could not fetch analyzed issues from Supabase: ${await res.text()}`);
    return new Set();
  }
  const rows = await res.json();
  return new Set(rows.map(r => r.issue_number));
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
  const url = `${SUPABASE_URL}/rest/v1/issues`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...supabaseHeaders(), 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({
      repo_name: repo,
      issue_number: issue.number,
      is_duplicate: analysis.is_duplicate,
      analysis_summary: analysis.analysis_summary,
      status: 'open'
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase insert failed (${res.status}): ${err}`);
  }
  console.log(`  ✓ Saved analysis for issue #${issue.number} (is_duplicate=${analysis.is_duplicate})`);
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

// ── GitHub helpers ───────────────────────────────────────────────────────────

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

/**
 * Checks if a user has already used /analyze on this issue (for throttling contributors).
 */
async function hasUserAlreadyUsedAnalyze(repo, issueNumber, username) {
  const url = `https://api.github.com/repos/${repo}/issues/${issueNumber}/comments?per_page=100`;
  const res = await fetch(url, { headers: ghHeaders() });
  if (!res.ok) return false;
  const comments = await res.json();
  return comments.some(c =>
    c.user?.login === username &&
    c.body?.trim().startsWith('/analyze') &&
    c.id !== parseInt(process.env.COMMENT_ID || '0', 10)
  );
}

/**
 * Checks if the user is a collaborator/maintainer on the repo.
 */
async function isRepoMaintainer(repo, username) {
  const res = await fetch(`https://api.github.com/repos/${repo}/collaborators/${username}/permission`, {
    headers: ghHeaders()
  });
  if (!res.ok) return false;
  const data = await res.json();
  return ['admin', 'maintain', 'write'].includes(data.permission);
}

// ── Post-analysis GitHub actions ────────────────────────────────────────────

/**
 * Posts the AI analysis report as a comment on the issue.
 */
async function postAnalysisComment(repo, issue, analysis) {
  const [owner, repoName] = repo.split('/');
  const dupNote = analysis.is_duplicate
    ? '\n\n> ⚠️ **Duplicate detected.** See duplicate notice below.'
    : '';

  const body = `<!-- repoowl-analysis -->
## 🦉 RepoOwl Analysis Report

${analysis.analysis_summary}${dupNote}

---
<sub>Powered by RepoOwl · Groq LLaMA 3.3 · <code>llama-3.3-70b-versatile</code></sub>`;

  const res = await fetch(`https://api.github.com/repos/${repo}/issues/${issue.number}/comments`, {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify({ body })
  });

  if (!res.ok) {
    console.warn(`Could not post analysis comment: ${await res.text()}`);
  } else {
    console.log(`  ✓ Posted analysis comment on issue #${issue.number}`);
  }
}

/**
 * Posts a duplicate-specific bot comment.
 */
async function postDuplicateComment(repo, issue, analysis) {
  // Try to extract a referenced issue number like "#42" from the summary
  const refMatch = analysis.analysis_summary?.match(/#(\d+)/);
  const refIssue = refMatch ? `#${refMatch[1]}` : 'an existing issue';

  const body = `<!-- repoowl-duplicate -->
> 🔁 **It appears to be a duplicate of ${refIssue}.** Wait for the maintainer's review.
>
> After the issue gets assigned, only then start working on it.`;

  const res = await fetch(`https://api.github.com/repos/${repo}/issues/${issue.number}/comments`, {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify({ body })
  });

  if (!res.ok) {
    console.warn(`Could not post duplicate comment: ${await res.text()}`);
  } else {
    console.log(`  ✓ Posted duplicate notice on issue #${issue.number}`);
  }
}

/**
 * Assigns the issue to its original author.
 */
async function assignIssueToAuthor(repo, issue) {
  const author = issue.user?.login;
  if (!author) return;

  const res = await fetch(`https://api.github.com/repos/${repo}/issues/${issue.number}/assignees`, {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify({ assignees: [author] })
  });

  if (!res.ok) {
    console.warn(`Could not assign issue #${issue.number} to @${author}: ${await res.text()}`);
  } else {
    console.log(`  ✓ Assigned issue #${issue.number} to @${author}`);
  }
}

/**
 * Posts a confirmation comment for authentic, non-duplicate issues.
 */
async function postAuthenticComment(repo, issue) {
  const author = issue.user?.login || 'contributor';
  const body = `<!-- repoowl-authentic -->
> ✅ **Authentic issue confirmed.** @${author}, this has been verified as a genuine issue and has been assigned to you.
>
> You have **7 days** to work on this issue before it may be reassigned. Good luck! 🚀`;

  const res = await fetch(`https://api.github.com/repos/${repo}/issues/${issue.number}/comments`, {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify({ body })
  });

  if (!res.ok) {
    console.warn(`Could not post authentic comment: ${await res.text()}`);
  } else {
    console.log(`  ✓ Posted authentic confirmation on issue #${issue.number}`);
  }
}

/**
 * Ensures a GitHub label exists (creates it if not), using a deterministic
 * color derived from the label name so the same label always gets the same color.
 */
async function ensureLabelExists(repo, labelName) {
  // Check if label exists
  const checkRes = await fetch(
    `https://api.github.com/repos/${repo}/labels/${encodeURIComponent(labelName)}`,
    { headers: ghHeaders() }
  );

  if (checkRes.ok) {
    const existing = await checkRes.json();
    return existing.color; // label exists, return its color
  }

  // Generate a deterministic HSL-based hex color from the label name
  let hash = 0;
  for (let i = 0; i < labelName.length; i++) {
    hash = labelName.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  // Convert HSL(hue, 60%, 60%) to hex
  const h = hue / 360, s = 0.6, l = 0.6;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const toHex = (t) => {
    const c = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    const val = c < 1/6 ? p + (q - p) * 6 * c
      : c < 1/2 ? q
      : c < 2/3 ? p + (q - p) * (2/3 - c) * 6
      : p;
    return Math.round(val * 255).toString(16).padStart(2, '0');
  };
  const color = `${toHex(h + 1/3)}${toHex(h)}${toHex(h - 1/3)}`;

  // Create the label
  const createRes = await fetch(`https://api.github.com/repos/${repo}/labels`, {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify({ name: labelName, color, description: `RepoOwl contextual label` })
  });

  if (!createRes.ok) {
    console.warn(`Could not create label "${labelName}": ${await createRes.text()}`);
  } else {
    console.log(`  ✓ Created label "${labelName}" (#${color})`);
  }
  return color;
}

/**
 * Adds contextual labels to an issue. Creates labels if they don't exist.
 * Labels are AI-generated based on the issue context, not keyword extraction.
 */
async function addContextualLabels(repo, issue, analysis) {
  const labels = analysis.contextual_labels;
  if (!Array.isArray(labels) || labels.length === 0) return;

  const validLabels = labels
    .filter(l => typeof l === 'string' && l.trim().length > 0)
    .slice(0, 3) // max 3 contextual labels
    .map(l => l.trim().toLowerCase());

  if (validLabels.length === 0) return;

  // Ensure all labels exist in the repo
  for (const label of validLabels) {
    await ensureLabelExists(repo, label);
  }

  // Apply labels to the issue
  const res = await fetch(`https://api.github.com/repos/${repo}/issues/${issue.number}/labels`, {
    method: 'POST',
    headers: ghHeaders(),
    body: JSON.stringify({ labels: validLabels })
  });

  if (!res.ok) {
    console.warn(`Could not apply labels to issue #${issue.number}: ${await res.text()}`);
  } else {
    console.log(`  ✓ Applied contextual labels [${validLabels.join(', ')}] to issue #${issue.number}`);
  }
}

// ── Core analysis logic ──────────────────────────────────────────────────────

async function analyzeIssue(issue, history) {
  const fields = parseIssueTemplateFields(issue.body || '');

  const historicalLog = history
    .filter(h => h.issue_number !== issue.number) // exclude self
    .map(h => `[Issue ID: #${h.issue_number}]\nTechnical Summary: ${h.analysis_summary}`)
    .join('\n\n---\n\n') || 'No historical issues to compare against.';

  const systemPrompt =
    `You are an expert GitHub triage AI.\n` +
    `Your task is to analyze a GitHub issue and produce a structured triage report.\n\n` +
    `DUPLICATE RULES (CRITICAL):\n` +
    `  - Only set is_duplicate=true if the issue targets the EXACT same root cause or feature as a specific existing open issue.\n` +
    `  - You MUST cite the matching issue number (e.g. "duplicate of #42") in analysis_summary when marking as duplicate.\n` +
    `  - Do NOT mark as duplicate because issues share a topic area or keyword overlap.\n` +
    `  - Do NOT label any issue as spam, noise, or invalid. Assume all submissions are legitimate.\n` +
    `  - Default to is_duplicate=false when uncertain.\n\n` +
    `CONTEXTUAL LABELS (CRITICAL):\n` +
    `  - Generate exactly 3 meaningful, contextually appropriate labels for this issue.\n` +
    `  - Labels must describe the functional area, severity, or domain of the problem — NOT just keywords extracted from the text.\n` +
    `  - Examples of GOOD labels: "authentication", "performance-regression", "data-integrity", "ux-feedback", "api-contract".\n` +
    `  - Examples of BAD labels: "issue", "bug", "problem", "fix", "error" — these are too generic.\n` +
    `  - Labels should be lowercase, hyphen-separated, and 1-3 words max.\n\n` +
    `You must respond in valid JSON format matching this schema:\n` +
    `{ "is_duplicate": boolean, "analysis_summary": "string", "contextual_labels": ["string", "string", "string"] }\n` +
    `Ensure the JSON is well-formed.`;

  const userPrompt =
    `INCOMING ISSUE DATA\n` +
    `Issue #${issue.number}: ${issue.title}\n\n` +
    `1. Core Problem / Request:\n${fields.primary_description || issue.body || 'No description provided.'}\n\n` +
    `2. Context & Reproduction:\n${fields.context_steps || 'N/A'}\n\n` +
    `3. Proposed Solution / Impact:\n${fields.expected_outcome || 'N/A'}\n\n` +
    `4. Technical Metrics & Environment:\n${fields.technical_metrics || 'N/A'}\n\n` +
    `HISTORICAL REPOSITORY CONTEXT\n${historicalLog}`;

  // Retry up to 3 times on rate limit
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await askGroq(systemPrompt, userPrompt);
    } catch (e) {
      if (attempt < 3 && e.message.includes('429')) {
        const waitMatch = e.message.match(/try again in ([\d.]+)s/);
        const wait = waitMatch ? Math.ceil(parseFloat(waitMatch[1]) * 1000) + 500 : 8000;
        console.warn(`  Rate limited. Waiting ${wait}ms before retry ${attempt + 1}/3...`);
        await delay(wait);
      } else {
        throw e;
      }
    }
  }
}

// ── Entry point ──────────────────────────────────────────────────────────────

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

  // ── Optional inactivity delay (configurable via ANALYSIS_DELAY_SECONDS) ──
  if (ANALYSIS_DELAY_SECONDS > 0) {
    console.log(`Waiting ${ANALYSIS_DELAY_SECONDS}s for issue author to finish editing...`);
    await delay(ANALYSIS_DELAY_SECONDS * 1000);
  }

  // ── Determine trigger type ───────────────────────────────────────────────
  const isCommentTrigger = COMMENT_BODY.trim().startsWith('/analyze');
  let issuesToProcess = [];

  if (isCommentTrigger) {
    // /analyze comment trigger — any user can trigger, but contributors are limited to once per issue
    const issueNum = parseInt(COMMENT_ISSUE_NUMBER, 10);
    if (!issueNum) {
      console.warn('Could not determine issue number from comment trigger. Skipping.');
      process.exit(0);
    }

    const isMaintainer = await isRepoMaintainer(repo, COMMENT_AUTHOR);

    if (!isMaintainer) {
      // Contributors: check if they have already used /analyze on this issue
      const alreadyUsed = await hasUserAlreadyUsedAnalyze(repo, issueNum, COMMENT_AUTHOR);
      if (alreadyUsed) {
        console.log(`@${COMMENT_AUTHOR} has already used /analyze on issue #${issueNum}. Skipping (contributor limit).`);
        // Post a polite notice
        await fetch(`https://api.github.com/repos/${repo}/issues/${issueNum}/comments`, {
          method: 'POST',
          headers: ghHeaders(),
          body: JSON.stringify({
            body: `> ℹ️ @${COMMENT_AUTHOR}, you have already triggered \`/analyze\` on this issue. Contributors can only use this command once per issue. A maintainer may re-run analysis at any time.`
          })
        });
        process.exit(0);
      }
    }

    console.log(`Triggered by /analyze comment from @${COMMENT_AUTHOR} on issue #${issueNum} (isMaintainer=${isMaintainer})`);
    try {
      const issue = await fetchIssueFromGitHub(repo, issueNum);
      issuesToProcess = [issue];
    } catch (e) {
      console.error(`Failed to fetch issue #${issueNum}: ${e.message}`);
      process.exit(1);
    }
  } else if (ISSUE_NUMBER) {
    // Triggered by issues.opened — process only the new issue
    console.log(`Triggered by new issue #${ISSUE_NUMBER}. Fetching details...`);
    try {
      const issue = await fetchIssueFromGitHub(repo, parseInt(ISSUE_NUMBER, 10));
      issuesToProcess = [issue];
    } catch (e) {
      console.error(`Failed to fetch issue #${ISSUE_NUMBER}: ${e.message}`);
      process.exit(1);
    }
  } else {
    // Triggered by schedule or workflow_dispatch — sweep all open issues
    console.log('Running scheduled sweep of all open issues...');
    try {
      const allOpen = await fetchAllOpenIssues(repo);
      console.log(`Found ${allOpen.length} open issues on GitHub.`);

      const analyzedSet = await getAlreadyAnalyzedIssueNumbers(repo);
      console.log(`${analyzedSet.size} issues already analyzed in Supabase.`);

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

  // ── Analyze each pending issue ───────────────────────────────────────────
  let analyzedCount = 0;
  let duplicateCount = 0;

  for (const issue of issuesToProcess) {
    console.log(`\nAnalyzing issue #${issue.number}: "${issue.title}"...`);
    try {
      const history = await getRecentHistory(repo);
      const analysis = await analyzeIssue(issue, history);

      // Save to Supabase (idempotent — resolution=ignore-duplicates)
      await saveAnalysis(repo, issue, analysis);

      analyzedCount++;
      if (analysis.is_duplicate) duplicateCount++;

      // ── Post analysis report comment ──────────────────────────────
      await postAnalysisComment(repo, issue, analysis);

      // ── Branch on duplicate vs authentic ─────────────────────────
      if (analysis.is_duplicate) {
        await postDuplicateComment(repo, issue, analysis);
      } else {
        // Authentic issue: assign to author, confirm, add contextual labels
        await assignIssueToAuthor(repo, issue);
        await postAuthenticComment(repo, issue);
        await addContextualLabels(repo, issue, analysis);
      }

      await delay(DELAY_MS);
    } catch (e) {
      console.error(`  ✗ Error analyzing issue #${issue.number}: ${e.message}`);
      // Continue with remaining issues rather than aborting the whole run
    }
  }

  // ── Update global registry stats ──────────────────────────────────────────
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
