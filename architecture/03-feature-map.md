# 03 — Feature Map

> A complete catalogue of every feature in RepoOwl, how each one works internally, and how they interconnect.

---

## Feature Dependency Graph

```
                     ┌─────────────────────────────────┐
                     │         CONFIGURATION CORE       │
                     │   ModelConfig.jsx (Settings UI)  │
                     │  chrome.storage.local[repoOwlConfig]│
                     └────────────┬────────────────────┘
                                  │ required by ALL features
          ┌───────────────────────┼───────────────────────────┐
          ▼                       ▼                           ▼
┌──────────────────┐  ┌──────────────────────┐  ┌────────────────────┐
│  ISSUE TRIAGE    │  │  BADGE INJECTION      │  │  PR SLOP DETECTION │
│  (background.js) │  │  (content.js)         │  │  (Actions + badge) │
└──────────────────┘  └──────────────────────┘  └────────────────────┘
         │                       │                          │
         │ writes to             │ reads from               │ reads PR
         ▼                       ▼                          │ badge via
┌──────────────────┐  ┌──────────────────────┐             │ comment parse
│  Supabase `issues│  │   hub_cache (local   │◄────────────┘
│  table (Hub)     │  │   chrome.storage)    │
└──────────────────┘  └──────────────────────┘
         │                       │
         │ read by               │ pre-populates
         ▼                       ▼
┌──────────────────┐  ┌──────────────────────┐
│  InsightsOverlay │  │  Instant Badge Paint  │
│  (React drawer)  │  │  (<50ms load time)    │
└──────────────────┘  └──────────────────────┘
         ▲
         │ opened by badge click
         │
┌──────────────────┐
│  Badge Injector  │──────────────────────────────┐
│  badgeInjector.js│                              │
└──────────────────┘                              │
                                                  ▼
                                       ┌─────────────────────┐
                                       │ Duplicate Draft      │
                                       │ Warning Banner       │
                                       │(enableContributor    │
                                       │ DraftChecker)        │
                                       └─────────────────────┘
```

---

## Feature 1 — Issue Triage (AI Duplicate Detection)

**Where:** `background.js` → `executeIssueSyncQueue()`

**Trigger:** "Force Sync" button in Settings → Tracked Repos panel

**What it does:**

```
FOR EACH tracked repository:

  1. GitHub API: GET /repos/{owner}/{repo}
     → Determine if user is Maintainer (push/admin permission)

  [Maintainer path]
     2a. Auto-publish repoowl.json to repo's main branch
     2b. Register with Central Mediator
     3.  GitHub API: GET /repos/{owner}/{repo}/issues?state=open
     4.  Supabase: SELECT issue_number from `issues` WHERE repo_name = ?
         → Build "already processed" set
     5.  Supabase: CLOSE (status='closed') any DB issues not in GitHub list
     6.  FOR EACH new (unprocessed) issue:
           a. Supabase: SELECT last 50 analysis_summaries (history)
           b. Shared: buildPromptVariables(issue, history)
           c. Shared: renderPrompt(DEFAULT_PROMPT_TEMPLATE, variables)
           d. Groq API: POST chat.completions (llama-3.3-70b-specdec)
              temperature: 0.1, response_format: json_object
           e. Parse JSON: { is_duplicate: bool, analysis_summary: string }
           f. Supabase: INSERT into `issues`
           g. Supabase: UPSERT into `public_ecosystem_registry`
           h. Wait 2000ms (rate limit buffer)

  [Contributor path]
     2a. Lookup Hub config:
           Try Central Mediator `registry` table first
           Fallback: GET raw.githubusercontent.com/{repo}/main/repoowl.json
     2b. Connect to Maintainer's Supabase (Hub)
     2c. SELECT all open issues from Hub
     2d. Write to chrome.storage.local[hub_cache_{repo}]
     3.  GitHub API: fetch contributor's own unprocessed issues
     4.  Analyze contributor's issues against sandbox Supabase
```

**Linked features:**
- Writes data consumed by → **Badge Injection** (Feature 3)
- Writes data consumed by → **Insights Overlay** (Feature 4)
- Writes to → **Ecosystem Analytics** (Feature 7) via `public_ecosystem_registry`

---

## Feature 2 — Duplicate Draft Warning (Real-time)

**Where:** `content/index.js` → `enableContributorDraftChecker()`

**Trigger:** User visits `/issues/new` on a tracked repo

**What it does:**

```
User visits github.com/owner/repo/issues/new
       │
       ▼
Bootstrap detects page.type === 'new'
       │
       ▼
enableContributorDraftChecker(repoName, groqApiKey)
       │
       ▼
Attach blur listener to <textarea id="issue_body">
       │
       ▼ (fires when user clicks away from textarea)
       │
       ├── If text < 50 chars → skip (too short to analyze)
       │
       ├── fetchRepositoryInsights(repoName)
       │     → Fetch last 50 issue summaries from Sandbox/Hub Supabase
       │
       ├── Build prompt:
       │     issue = { issue_number: 'DRAFT', title: ..., primary_description: draftText }
       │     renderPrompt(DEFAULT_PROMPT_TEMPLATE, variables)
       │
       ├── Groq API call (in browser, dangerouslyAllowBrowser: true)
       │     model: llama-3.3-70b-specdec
       │
       └── If is_duplicate === true:
             Inject red warning <div id="repoowl-duplicate-warning">
             above the textarea:
             "⚠️ RepoOwl Warning: This issue seems to be a duplicate. {summary}"
```

**Linked features:**
- Reads from → **Supabase Hub/Sandbox** (same data as badge injection)
- Uses → **Shared prompt utilities** (`buildPromptVariables`, `renderPrompt`)

---

## Feature 3 — Issue/PR Badge Injection

**Where:** `content/badgeInjector.js`, `content/issueDetailInjector.js`, `content/prDetailInjector.js`

**Trigger:** Every GitHub page load; also on Turbo Drive navigation events

### Badge States

```
┌──────────────────────────────────────────────────────────────────┐
│                        BADGE STATE MACHINE                        │
│                                                                  │
│   Issue not in Supabase:                                         │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  ⏳ Pending  │ Grey, non-clickable, right zone           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Issue in Supabase, is_duplicate = false:                       │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  ✨ AI Insights │ Blue, clickable, right zone            │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Issue in Supabase, is_duplicate = true:                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  ⚠️ Duplicate  │ Red, clickable, LEFT zone (before title)│   │
│   │                │ + right zone placeholder for alignment  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   PR reviewed by RepoOwl Actions (label: repoowl-analyzed):      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  🦉 Reviewed by RepoOwl │ Green, right zone, PR lists   │   │
│   └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Two-Phase Rendering Strategy

```
Phase 1 — Instant (< 50ms):
  chrome.storage.local.get([hub_cache_{repo}])
  → Paint badges immediately from cached data
  → No network round-trip

Phase 2 — Fresh (background):
  fetchRepositoryInsights(repo)
  → Parallel query: Sandbox Supabase + Hub Supabase
  → Cascade merge: Hub data overwrites Sandbox data
  → Remove old [data-repoowl-badge] elements
  → MutationObserver re-fires → re-paints with fresh data
```

### DOM Injection Targets (GitHub 2024+ Primer React layout)

```
Issue list row:
  LI.ListItem-module__listItem
    ├── [data-testid="created-at"]       ← duplicate badge LEFT zone
    └── [class*="MetadataContainer"]     ← ready/pending badge RIGHT zone
          └── [data-testid="list-row-assignees"]  ← insert before this

Issue detail page:
  .gh-header-title .js-issue-title      ← append badge at end

PR list row:
  a[data-name="repoowl-analyzed"]       ← detect RepoOwl label link
  MetadataContainer                     ← inject "Reviewed by RepoOwl" span

PR detail page:
  .gh-header-title                      ← append slop status badge
```

**Linked features:**
- Data source: **Issue Triage** result (Supabase `issues` table)
- Click handler opens: **Insights Overlay** (Feature 4)
- Uses: **Hub Cache** written by background sync (Feature 1)

---

## Feature 4 — Insights Overlay (React Drawer)

**Where:** `overlay/InsightsOverlay.jsx`, `overlay/OverlayRoot.jsx`

**Trigger:** User clicks a `✨ AI Insights` or `⚠️ Duplicate` badge

**What it does:**

```
Badge click
  │
  ▼
openInsightsOverlay({ repositoryFullName, issueNumber, initialInsight, insightsById })
  │
  ▼
OverlayRoot.jsx mounts a React root into a shadow DOM element
  │
  ▼
InsightsOverlay renders a sliding panel (drawer) with:
  ├── Header: { icon, title, issue ref, state pill }
  ├── Body:
  │   ├── Loading skeleton (while fetching)
  │   ├── "🧠 Technical Summary" section → analysis_summary text
  │   ├── "🔗 Duplicate Trace" section (if is_duplicate)
  │   └── "✅ Duplicate Check: None detected" (if not duplicate)
  └── Footer: "Powered by RepoOwl · Groq LLaMA 3.3" + GitHub link

Panel states:
  ⏳ Pending  → "This issue is queued for analysis."
  ✨ Ready    → Shows analysis_summary
  ⚠️ Duplicate → Shows duplicate trace explanation
```

**Linked features:**
- Receives data from: **Badge Injector** (click handler passes `initialInsight`)
- Data ultimately from: **Issue Triage** → Supabase

---

## Feature 5 — Repo Sidebar Card

**Where:** `content/sidebarCard.js` (standalone IIFE content script)

**Trigger:** Every GitHub repo page load (`github.com/owner/repo`)

**What it does:**

```
Injected into every github.com page at document_idle
  │
  ▼
Reads Supabase keys from chrome.storage or Vite env baked-in
  │
  ▼
Fetches stats from `public_ecosystem_registry` for current repo:
  - total_issues_analyzed
  - duplicates_found
  │
  ▼
Finds GitHub sidebar (div[data-component="PageLayout.Pane"])
  │
  ▼
Injects a RepoOwl card showing:
  ┌─────────────────────────────────────┐
  │  🦉 REPOOWL          [Active]       │
  │                                     │
  │  Issues Analysed: 42                │
  │  Duplicates Prevented: 7            │
  │  [View Issues] [Settings]           │
  └─────────────────────────────────────┘
```

**Linked features:**
- Reads from: **Supabase** `public_ecosystem_registry` (written by Issue Triage)

---

## Feature 6 — Popup UI

**Where:** `popup/PopupApp.jsx`

**Trigger:** User clicks extension icon in Chrome toolbar

**What it does:**

```
Opens a 340px popup showing:

Tab 1: "Current Repo"
  ├── Detect active tab URL → extract owner/repo
  ├── Fetch stats from Supabase `public_ecosystem_registry`
  └── Display: Analysed | Duplicates | Total + AI provider info
               Provider: Groq  Model: LLaMA 3.3

Tab 2: "Ecosystem"
  ├── Fetch all rows from `public_ecosystem_registry`
  ├── Show aggregate: Total Repos | Total Analyzed | Dupes Prevented
  └── Searchable table of all tracked repos with per-repo stats

Footer buttons:
  [GitHub/Issues] → Opens repo issues page (or RepoOwl's own repo)
  [Settings]      → Opens options page (chrome.runtime.openOptionsPage)
```

**Linked features:**
- Reads from: **Supabase** `public_ecosystem_registry`
- [Settings] button → **Options/Settings UI** (Feature 8)

---

## Feature 7 — Settings / Options UI (5 Panels)

**Where:** `options/main.jsx` + `settings/` panel components

```
┌─────────────────────────────────────────────────────────────────┐
│                       SETTINGS PANELS                           │
│                                                                 │
│  1. Model Configuration  (ModelConfig.jsx)                      │
│     ├── Supabase URL + Anon Key (validates connection)          │
│     ├── Groq API Key                                            │
│     └── GitHub PAT (for auto-publishing)                        │
│                                                                 │
│  2. Tracked Repositories  (TrackedRepos.jsx)                    │
│     ├── Add/remove repos from the tracked list                  │
│     ├── "Force Sync Issues" → background sync                   │
│     ├── "Force Sync PRs" → background PR triage                 │
│     ├── Live log output (broadcast from background)             │
│     ├── Check Central Mediator registration status per repo     │
│     └── "Initialize RepoOwl" → install GitHub Actions          │
│                                                                 │
│  3. Auto-Triage Config  (AutoTriagePanel.jsx)                   │
│     ├── Sub-tab: Triage Thresholds                              │
│     │    ├── needs_triage_threshold (0-100%)                    │
│     │    ├── auto_close_threshold (0-100%)                      │
│     │    ├── possible_duplicate_threshold (0-100%)              │
│     │    ├── close_duplicate_threshold (0-100%)                 │
│     │    └── prompt_injection_guard (toggle)                    │
│     └── Sub-tab: Label Routing Rules                            │
│          ├── View/add path → label rules                        │
│          └── Saves to repoowl.json via background message       │
│                                                                 │
│  4. Prompt Settings  (PromptSettings.jsx)                       │
│     └── (Custom prompt template configuration)                  │
│                                                                 │
│  5. About  (AboutPanel.jsx)                                     │
│     └── Version info + links                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature 8 — PR Triage & Slop Detection

**Where:** `src/prTriage.js` (called from `background.js`), `content/prDetailInjector.js`

**Trigger:** "Force Sync PRs" button in Settings → Tracked Repos

```
For each tracked repo:
  1. GitHub API: GET /repos/{owner}/{repo}/pulls?state=open
  2. For each PR not in Supabase `pull_requests` table:
       a. GitHub API: GET /pulls/{pr}/files → filter noise files
       b. Build slop detection prompt with diff content
       c. Groq API: analyze for:
            - slop_detection: { is_slop, reasoning }
            - issue_resolution: { resolves_linked_issue, explanation }
            - domain_impact: { areas[], severity }
            - recommended_labels: string[]
       d. Supabase: INSERT into `pull_requests`
       e. If recommended_labels → GitHub API: POST labels to PR
       f. Wait 2000ms (rate limit buffer)

PR Detail page injection (prDetailInjector.js):
  Scans GitHub timeline comments for "RepoOwl PR Analysis"
  Parses emoji indicators: 🔴 → Slop, 🟢 → Clean
  Injects colored badge next to PR title:
    🔴 AI Slop Detected
    🟢 Code Matches Description
    ℹ️ Pending / Running
```

**Linked features:**
- Data source: GitHub API + Groq LLaMA 3.3
- Stores to: Supabase `pull_requests` table
- Displayed by: `prDetailInjector.js` + `badgeInjector.js` on PR lists

---

## Feature 9 — GitHub Actions Installer

**Where:** `background/githubInstaller.js`

**Trigger:** "Initialize RepoOwl" button in Tracked Repos settings

**What it installs via GitHub Contents API:**

```
Installed into target repo via PUT /repos/{owner}/{repo}/contents/{path}:

  .github/workflows/
    ├── issue-analyze.yml      (Groq AI analysis on issue open/edit)
    ├── repoowl-analyze.yml    (PR slop detection + labeling)
    ├── issue-assignment.yml   (auto-assign contributors via comment)
    ├── auto-label.yml         (path-based label routing via labeler.yml)
    ├── pr-merged.yml          (post-merge status)
    ├── welcome.yml            (first-time contributor welcome)
    └── stale.yml              (stale issue management)

  .github/
    ├── labeler.yml            (path → label mapping rules)
    └── ISSUE_TEMPLATE/        (structured issue templates)

Also creates GitHub Labels:
    - needs-triage, duplicate, ai-slop, repoowl-analyzed, etc.
```

**Linked features:**
- Relies on: **GitHub PAT** (from ModelConfig)
- Installed workflows feed data back to: **Supabase** (via Actions scripts)
- Slop detection results read by: **PR Badge Injector** via comment parsing
