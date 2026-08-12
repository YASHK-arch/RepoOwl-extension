# 06 — GitHub Integration

> Every GitHub API call, the repoowl.json configuration contract, and the 7 GitHub Actions workflows.

---

## GitHub API Call Map

```
┌───────────────────────────────────────────────────────────────────────┐
│                     GITHUB API ENDPOINTS USED                          │
│                                                                       │
│  Source: background.js                                                │
│                                                                       │
│  GET  /repos/{owner}/{repo}                                           │
│    → Check permissions (push/admin → maintainer flag)                │
│    → Called before every sync to determine role                       │
│                                                                       │
│  GET  /user                                                           │
│    → Get current user's GitHub login (for contributor filtering)     │
│                                                                       │
│  GET  /repos/{owner}/{repo}/issues?state=open&per_page=100           │
│    → Fetch all open issues for analysis                               │
│    → Filters out pull_requests from the result                       │
│                                                                       │
│  GET  /repos/{owner}/{repo}/pulls?state=open&per_page=100            │
│    → Fetch open PRs for slop detection                                │
│                                                                       │
│  GET  /repos/{owner}/{repo}/pulls/{pr_number}/files?per_page=100     │
│    → Fetch PR diff files for slop analysis                            │
│    → Filters: no .lock, .svg, .png, .min.js, must have .patch       │
│                                                                       │
│  GET  /repos/{owner}/{repo}/contents/repoowl.json?ref=main           │
│    → Read current config file (to get SHA for update)                │
│                                                                       │
│  PUT  /repos/{owner}/{repo}/contents/repoowl.json                    │
│    → Write/update repoowl.json (base64-encoded JSON body)            │
│    → Used by: autoPublishHubConfig, savePathLabels, saveTriageConfig  │
│                                                                       │
│  PUT  /repos/{owner}/{repo}/contents/{workflow_path}                  │
│    → Install GitHub Actions workflows + templates (Installer)         │
│                                                                       │
│  POST /repos/{owner}/{repo}/issues/{pr_number}/labels                 │
│    → Auto-label PRs after slop analysis                               │
│                                                                       │
│  All calls use:                                                       │
│    Accept: application/vnd.github+json                               │
│    X-GitHub-Api-Version: 2022-11-28                                  │
│    Authorization: Bearer {githubToken}   (if PAT configured)        │
└───────────────────────────────────────────────────────────────────────┘
```

---

## repoowl.json Configuration Contract

`repoowl.json` is the central per-repository configuration file. It is:
- Written to the repo's `main` branch via GitHub API
- Read by contributors via `raw.githubusercontent.com` as a fallback
- Merged (never clobbered) — each function updates only its own keys

```jsonc
// repoowl.json — full example
{
  // Required: Maintainer's Supabase credentials (read by contributors)
  "supabaseUrl": "https://abc123.supabase.co",
  "supabaseAnonKey": "eyJhbGciO...",

  // Optional: File path → label routing rules (for auto-labeler)
  "path_labels": {
    "extension/src/**": {
      "label": "area: extension",
      "color": "#0969da"
    },
    "docs/**": {
      "label": "area: docs",
      "color": "#e4e669"
    }
  },

  // Optional: AI triage configuration
  "triage_config": {
    "repo_context": "RepoOwl is a Chrome extension for GitHub issue triage.",
    "needs_triage_threshold": 50,
    "auto_close_threshold": 90,
    "prompt_injection_guard": true,
    "possible_duplicate_threshold": 60,
    "close_duplicate_threshold": 90
  }
}
```

### Merge Strategy

Each background.js function that writes to `repoowl.json` follows this safe merge pattern:

```
1. GET existing file → decode base64 → parse JSON → get SHA
2. Deep merge: { ...existingContent, [newKey]: newValue }
3. PUT updated file (with SHA to avoid conflict errors)
```

This ensures that `savePathLabels` does not clobber `triage_config`, and vice versa.

---

## GitHub Actions Workflows (7 Total)

### 1. `issue-analyze.yml` — AI Issue Analysis

```
Trigger: issues → [opened, edited]

Steps:
  1. Checkout repo
  2. Run Node.js analysis script
       → Calls Groq API to analyze the new/edited issue
       → POSTs result to Maintainer's Supabase `issues` table
       → Comments on the issue with analysis result
  
Secrets required:
  GROQ_API_KEY
  SUPABASE_URL
  SUPABASE_ANON_KEY
```

### 2. `repoowl-analyze.yml` — PR Slop Detection

```
Trigger: pull_request → [opened, synchronize]

Steps:
  1. Checkout repo
  2. Analyze PR diff with Groq LLaMA 3.3
       → slop_detection, issue_resolution, domain_impact, labels
  3. POST comment to PR:
       "## RepoOwl PR Analysis
        🟢 Code Matches Description — ..."
       or
       "## RepoOwl PR Analysis
        🔴 Slop Detected — ..."
  4. Apply recommended labels to PR
  5. Add "repoowl-analyzed" label
  6. Store result in Supabase `pull_requests` table

Secrets required:
  GROQ_API_KEY
  SUPABASE_URL
  SUPABASE_ANON_KEY
  GITHUB_TOKEN (automatic)
```

### 3. `issue-assignment.yml` — Auto-Assignment System

```
Trigger: issue_comment → [created]

When contributor comments:
  ".take" or "I'll take this" or "/assign me"
  → GitHub API: assign issue to commenter
  → Comment: "✅ Issue assigned to @{user}! Looking forward to your PR."
  → Add label: "in-progress"

When assigned user comments:
  ".done" or "/done"
  → Remove assignment
  → Add label: "needs-review"
```

### 4. `auto-label.yml` — Path-Based Label Routing

```
Trigger: pull_request → [opened, synchronize]

Uses: actions/labeler@v5
Config: .github/labeler.yml (generated from repoowl.json path_labels)

Example labeler.yml:
  "area: extension":
    - "extension/src/**"
  "area: docs":
    - "docs/**"
```

### 5. `pr-merged.yml` — Post-Merge Status Update

```
Trigger: pull_request → [closed] (merged only)

Steps:
  1. Comment: "🎉 PR merged! Thank you @{user} for your contribution."
  2. Remove "in-progress" label
  3. Close any linked issues (via "Fixes #X" detection)
  4. Update Supabase: mark linked issues as 'closed'
```

### 6. `welcome.yml` — First Contributor Welcome

```
Trigger: issues → [opened] (first-time contributors only)

Steps:
  Comment: "👋 Welcome to RepoOwl! Thank you for filing your first issue.
            Our AI is analyzing it now. You'll see a triage result shortly."
```

### 7. `stale.yml` — Stale Issue/PR Management

```
Trigger: schedule (daily cron)

Config:
  stale-issue-message: "This issue has been automatically marked as stale
                         due to 60 days of inactivity."
  stale-pr-message: similar
  days-before-stale: 60
  days-before-close: 7
  exempt-labels: ["pinned", "security", "in-progress"]
```

---

## GitHub Label Taxonomy

Labels installed by the RepoOwl GitHub Actions Installer:

```
┌──────────────────────────┬──────────────────────────────────────────┐
│  Label                   │  Purpose                                 │
├──────────────────────────┼──────────────────────────────────────────┤
│  needs-triage            │  Issue awaiting AI analysis               │
├──────────────────────────┼──────────────────────────────────────────┤
│  duplicate               │  AI flagged as duplicate                  │
├──────────────────────────┼──────────────────────────────────────────┤
│  ai-slop                 │  PR flagged as AI-generated/low-quality   │
├──────────────────────────┼──────────────────────────────────────────┤
│  repoowl-analyzed        │  PR reviewed by RepoOwl Actions           │
├──────────────────────────┼──────────────────────────────────────────┤
│  in-progress             │  Issue taken by a contributor             │
├──────────────────────────┼──────────────────────────────────────────┤
│  needs-review            │  Contributor marked as done               │
├──────────────────────────┼──────────────────────────────────────────┤
│  good first issue        │  Beginner-friendly                        │
├──────────────────────────┼──────────────────────────────────────────┤
│  area: {name}            │  Dynamic area labels from path_labels     │
└──────────────────────────┴──────────────────────────────────────────┘
```

---

## GitHub Issue Templates

The Installer creates structured issue templates in `.github/ISSUE_TEMPLATE/`:

```
ISSUE_TEMPLATE/
  bug_report.md          → Fields: Bug Description, Steps to Reproduce,
                           Expected Behavior, Browser, OS, Logs
  feature_request.md     → Fields: Feature Description, Why is it useful?,
                           Alternatives considered?, Files to modify
  performance.md         → Fields: Slow page, CPU Usage, Memory Usage
  security.md            → Fields: Vulnerability Type, Impact, Suggested Fix
  documentation.md       → Fields: Missing Tests, Proposed Improvement
  good_first_issue.md    → Fields: Task Description, Affected Files
```

All templates use `### Header` format for structured parsing by `parseIssueTemplateFields()` in the extension.

---

## Dependency Chain: repoowl.json → Extension → Actions

```
[Maintainer configures settings in Extension]
         │
         ▼
[Background writes repoowl.json to GitHub main branch]
  {
    supabaseUrl: ...,
    supabaseAnonKey: ...,
    path_labels: { ... },
    triage_config: { ... }
  }
         │
         ├──► [Contributors discover Hub via raw.githubusercontent.com]
         │         └── Content script reads Supabase credentials
         │               └── Fetches issue insights → renders badges
         │
         └──► [GitHub Actions reads triage_config]
                  └── auto-label.yml reads path_labels for labeler.yml
                  └── issue-analyze.yml reads triage thresholds
```
