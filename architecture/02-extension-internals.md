# 02 — Extension Internals

> Deep-dive into the Chrome Extension architecture: manifest, script contexts, build pipeline, and inter-script communication.

---

## Manifest V3 Structure

The extension is defined in `extension/manifest.json` and registers the following entry points:

```
manifest.json
├── action.default_popup   → src/popup/index.html        (Popup UI)
├── options_ui.page        → src/options/index.html       (Settings Page)
├── background.service_worker → background.js            (Service Worker)
└── content_scripts
    ├── sidebarCard.js     → every github.com/*/*          (Repo Sidebar)
    └── content.js         → every github.com/*/*          (Issue/PR Badges)
```

### Permissions

```
permissions:
  - storage      → chrome.storage.local for keys, cache, config
  - activeTab    → read current tab URL for popup repo detection
  - identity     → future OAuth support

host_permissions:
  - https://github.com/*       → content script injection
  - https://*.supabase.co/*    → direct API calls from content/bg scripts
```

---

## Execution Contexts & Isolation

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CHROME EXTENSION CONTEXTS                         │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  SERVICE WORKER CONTEXT  (background.js)                     │   │
│  │  - Persists across page navigations                          │   │
│  │  - Has access to chrome.* APIs                               │   │
│  │  - Makes GitHub + Groq + Supabase API calls                  │   │
│  │  - Manages long-running issue sync                           │   │
│  │  - NO access to DOM                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ▲  │                                   │
│                    messages  │  │  sendResponse                     │
│                              │  ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  CONTENT SCRIPT CONTEXT  (content.js + sidebarCard.js)       │   │
│  │  - Injected into github.com pages                            │   │
│  │  - Can read and modify GitHub's DOM                          │   │
│  │  - Isolated JS scope (cannot touch page's own JS)            │   │
│  │  - Direct Supabase + Groq calls (baked-in keys via Vite env) │   │
│  │  - Listens for turbo:load and pjax:end navigation events     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  POPUP CONTEXT  (src/popup/PopupApp.jsx)                     │   │
│  │  - React SPA rendered in the extension popup                 │   │
│  │  - Reads chrome.storage.local for config and stats           │   │
│  │  - Can send messages to background or open options page      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  OPTIONS CONTEXT  (src/options/ → settings panels)           │   │
│  │  - React SPA rendered in a full browser tab                  │   │
│  │  - 5 sub-panels: ModelConfig, TrackedRepos, AutoTriagePanel, │   │
│  │    PromptSettings, AboutPanel                                │   │
│  │  - Sends messages to background for slow operations          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Build Pipeline (4 Vite Configs)

The extension uses **4 separate Vite builds** because each Chrome script context has strict output format requirements:

```
extension/
├── vite.config.js            → Popup + Options (React SPA → ESM)
├── vite.content.config.js    → content.js      (IIFE, bundled React)
├── vite.background.config.js → background.js   (ESM Service Worker)
└── vite.sidebar.config.js    → sidebarCard.js  (IIFE, no-import bundle)

Output: extension/dist/
  ├── background.js          ← Service Worker
  ├── content.js             ← Issue/PR badges content script
  ├── sidebarCard.js         ← Repo sidebar stats content script
  ├── src/popup/             ← Popup UI (index.html + assets)
  ├── src/options/           ← Settings UI (index.html + assets)
  └── icons/                 ← Logo icons (16, 48, 128px)
```

### Why IIFE for Content Scripts?

Content scripts run in an isolated environment that does not have `import()` support at runtime. IIFE (Immediately Invoked Function Expression) bundles the entire dependency tree (including React, Supabase SDK, and Groq SDK) into a single self-contained file.

```
Content scripts can NOT use:
  ❌ Dynamic import()
  ❌ ES module bare specifiers at runtime
  ✅ Bundled IIFE from Vite
```

---

## chrome.storage.local Key Map

```
┌────────────────────────────────┬────────────────────────────────────────────┐
│  Storage Key                   │  Value Description                          │
├────────────────────────────────┼────────────────────────────────────────────┤
│  repoOwlConfig                 │  { supabaseUrl, supabaseAnonKey,            │
│                                │    groqApiKey, githubToken }               │
├────────────────────────────────┼────────────────────────────────────────────┤
│  trackedRepositories           │  string[] — e.g. ["owner/repo", ...]       │
├────────────────────────────────┼────────────────────────────────────────────┤
│  hub_cache_{owner/repo}        │  Array of issue rows from Hub Supabase      │
│                                │  (written by background, read by content)  │
├────────────────────────────────┼────────────────────────────────────────────┤
│  pr_hub_cache_{owner/repo}     │  Array of PR rows from Hub Supabase         │
├────────────────────────────────┼────────────────────────────────────────────┤
│  repoOwlTriageConfig           │  Triage threshold settings (local UI state) │
├────────────────────────────────┼────────────────────────────────────────────┤
│  repoOwlInstallerVersions      │  Map of repo → installer version string     │
│                                │  (tracks which repos have GitHub Actions)  │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## Inter-Script Message Protocol

All communication between the Options/Popup pages and the background service worker uses `chrome.runtime.sendMessage`. Messages use an `action` string key:

```
┌──────────────────────────────────────────────────────────────────────┐
│                    MESSAGE DISPATCH TABLE                            │
├──────────────────────────┬───────────────────────────────────────────┤
│  action                  │  What background.js does                  │
├──────────────────────────┼───────────────────────────────────────────┤
│  open_settings           │  chrome.runtime.openOptionsPage()         │
├──────────────────────────┼───────────────────────────────────────────┤
│  force_sync_issues       │  executeIssueSyncQueue([repoName])         │
├──────────────────────────┼───────────────────────────────────────────┤
│  add_repo                │  handleNewRepoAdded(repoName)              │
│                          │  → autoPublishHubConfig()                 │
│                          │  → registerWithMediator()                 │
├──────────────────────────┼───────────────────────────────────────────┤
│  check_mediator_status   │  checkMediatorStatus(repoName)            │
│                          │  → queries Central Mediator `registry`    │
├──────────────────────────┼───────────────────────────────────────────┤
│  initialize_repoowl_pr   │  initializeRepoOwl() — installs GitHub    │
│                          │  Actions workflows, labels, issue templates│
├──────────────────────────┼───────────────────────────────────────────┤
│  save_path_labels        │  savePathLabels() — merges path_labels    │
│                          │  into repoowl.json on GitHub             │
├──────────────────────────┼───────────────────────────────────────────┤
│  save_triage_config      │  saveTriageConfig() — merges triage_config│
│                          │  into repoowl.json on GitHub             │
└──────────────────────────┴───────────────────────────────────────────┘

Background → Options/Popup (broadcast):
  { action: 'sync_progress', message: string, log_type: 'issue' | 'pr' }
  → TrackedRepos.jsx listens and appends to live log view
```

---

## Content Script Bootstrap Flow

When Chrome injects `content.js` into a GitHub page:

```
document_idle trigger
       │
       ▼
bootstrap()
  │
  ├── [1] Disconnect any previous MutationObserver (Turbo navigation)
  │
  ├── [2] parseGitHubIssuesPage(window.location)
  │         Detects page type:
  │         ┌───────────┬──────────────────────────────────────────┐
  │         │  list     │  /owner/repo/issues                      │
  │         │  detail   │  /owner/repo/issues/123                  │
  │         │  new      │  /owner/repo/issues/new                  │
  │         │  pr_list  │  /owner/repo/pulls                       │
  │         │  pr_detail│  /owner/repo/pull/123                    │
  │         └───────────┴──────────────────────────────────────────┘
  │
  ├── [3] Check if repo is tracked (chrome.storage) or has public config
  │         fetchPublicRepoConfig() → Central Mediator first, then
  │         raw.githubusercontent.com/repo/main/repoowl.json fallback
  │
  ├── [4] If untracked → showUntrackedWarning() banner → STOP
  │
  ├── [5] If page type = 'new' → enableContributorDraftChecker() → STOP
  │
  ├── [6] If page type = 'pr_detail' → injectPRBadges() → STOP
  │
  ├── [7] Read hub_cache from chrome.storage.local (Phase 1 - instant)
  │
  ├── [8] Inject badges immediately with cached data
  │
  └── [9] Fetch live Supabase data in background (Phase 2 - async)
            Merge with cache → remove old badges → re-paint
```

GitHub uses Turbo Drive (formerly Pjax) for SPA-style navigation.
RepoOwl re-runs `bootstrap()` on every `turbo:load` and `pjax:end` event.
