# 01 — System Overview

> A complete bird's-eye map of RepoOwl: every actor, every subsystem, and every data flow.

---

## What Is RepoOwl?

RepoOwl is a **Chrome Extension** that overlays AI-powered intelligence directly on GitHub's issue and pull-request pages. It uses **Groq's LLaMA 3.3 70B** model to:

1. Detect duplicate issues before they are filed
2. Provide AI summaries of analysed issues on the issues list
3. Detect AI-generated ("slop") or off-topic pull requests
4. Auto-label PRs via GitHub Actions workflows

---

## Stakeholders & Roles

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          ACTORS IN THE SYSTEM                            │
├─────────────────┬────────────────────────────────────────────────────────┤
│  Maintainer     │ Repository owner. Has push/admin GitHub permission.     │
│                 │ Owns the Supabase "Hub" database. Configures AI keys.  │
├─────────────────┼────────────────────────────────────────────────────────┤
│  Contributor    │ External developer. Read-only access to Hub Supabase.  │
│                 │ Can file issues; sees duplicate warnings in real-time.  │
├─────────────────┼────────────────────────────────────────────────────────┤
│  Central        │ A shared Supabase instance operated by RepoOwl.        │
│  Mediator       │ Stores registry (owner → supabase_url) for discovery.  │
└─────────────────┴────────────────────────────────────────────────────────┘
```

---

## Top-Level Component Map

```
                        ┌─────────────────────────────────────┐
                        │       USER'S BROWSER (Chrome)        │
                        │                                      │
                        │   ┌──────────────────────────────┐   │
                        │   │      RepoOwl Extension        │   │
                        │   │                              │   │
                        │   │  ┌────────────┐             │   │
                        │   │  │  Popup UI  │             │   │
                        │   │  │ (React JSX)│             │   │
                        │   │  └────────────┘             │   │
                        │   │                              │   │
                        │   │  ┌────────────────────────┐ │   │
                        │   │  │   Options/Settings UI   │ │   │
                        │   │  │     (React JSX)         │ │   │
                        │   │  └────────────────────────┘ │   │
                        │   │                              │   │
                        │   │  ┌────────────────────────┐ │   │
                        │   │  │  Background Service     │ │   │
                        │   │  │  Worker (background.js) │ │   │
                        │   │  └────────────────────────┘ │   │
                        │   │                              │   │
                        │   │  ┌────────────────────────┐ │   │
                        │   │  │  Content Scripts        │ │   │
                        │   │  │  content.js             │ │   │
                        │   │  │  sidebarCard.js         │ │   │
                        │   │  └────────────────────────┘ │   │
                        │   └──────────────────────────────┘   │
                        │                                      │
                        └─────────────────────────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              ▼                          ▼                          ▼
   ┌──────────────────┐     ┌───────────────────────┐   ┌────────────────────┐
   │   GitHub API     │     │   Groq API (LLaMA 3.3)│   │  Supabase          │
   │  api.github.com  │     │  api.groq.com         │   │  (Multiple tenants)│
   └──────────────────┘     └───────────────────────┘   └────────────────────┘
```

---

## Full Data Flow Diagram

```
MAINTAINER FLOW (first-time setup):

  1. Maintainer installs extension
  2. Opens Settings → Model Config tab
  3. Enters: Supabase URL, Anon Key, Groq API Key, GitHub PAT
  4. Settings saved to chrome.storage.local["repoOwlConfig"]
  5. Adds a tracked repository in Settings → Tracked Repos
  6. Background.js detects "add_repo" message:
       ├── Checks GitHub permissions → confirms maintainer
       ├── Writes repoowl.json to repo's main branch (GitHub API PUT)
       └── Calls Central Mediator registry Edge Function
             └── Stores (owner, repo, supabase_url, anon_key) in
                 Central Mediator's `registry` table


ISSUE SYNC FLOW (triggered by "Force Sync" button):

  force_sync_issues message
       │
       ▼
  background.js: executeIssueSyncQueue()
       │
       ├──[if Maintainer]──────────────────────────────────────────────┐
       │   Fetch all open issues via GitHub API                        │
       │   For each NEW (not in Supabase) issue:                       │
       │     1. Fetch analysis history from Supabase                   │
       │     2. Build prompt → call Groq LLaMA 3.3                     │
       │     3. Parse JSON response → { is_duplicate, analysis_summary }│
       │     4. INSERT into Supabase `issues` table                    │
       │     5. UPSERT into `public_ecosystem_registry`                │
       │   Close stale issues (no longer open on GitHub)              │
       │                                                               │
       └──[if Contributor]─────────────────────────────────────────────┘
           Try Central Mediator → fetch hub Supabase credentials
           Fallback to raw.githubusercontent.com/repo/main/repoowl.json
           Connect to Hub Supabase → read issues for the repo
           Write hub_cache to chrome.storage.local


BADGE RENDERING FLOW (every GitHub page load):

  User navigates to github.com/owner/repo/issues
       │
       ▼
  content.js bootstrap()
       │
       ├── Parse page type (list | detail | new | pr_list | pr_detail)
       ├── Read chrome.storage.local[hub_cache_owner/repo]  ← Phase 1 (instant)
       ├── Inject badges immediately from cache (<50ms)
       └── Fetch fresh data from Supabase in background    ← Phase 2 (async)
             └── Merge with cache, remove old badges, re-paint


DUPLICATE DRAFT DETECTION (new issue page):

  User opens /issues/new
       │
       ▼
  enableContributorDraftChecker() attaches blur listener to #issue_body
       │
       ▼
  On blur (if > 50 chars typed):
       ├── Fetch issue history from Supabase/Hub
       ├── Build prompt with draft + history
       ├── Call Groq in browser (dangerouslyAllowBrowser: true)
       └── If is_duplicate → inject red warning banner above textarea
```

---

## Deployment Environment

```
┌─────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT TOPOLOGY                     │
│                                                             │
│  Chrome Web Store (or local unpacked)                       │
│  └── Extension (.crx / unpacked dist/)                      │
│       ├── Communicates with: github.com (content scripts)   │
│       ├── Communicates with: api.github.com (background)    │
│       ├── Communicates with: *.supabase.co (both scripts)   │
│       └── Communicates with: api.groq.com (background + cs) │
│                                                             │
│  Supabase (Maintainer's project)                            │
│  └── Tables: issues, pull_requests, public_ecosystem_registry│
│                                                             │
│  Supabase (Central Mediator — shared)                       │
│  └── Tables: registry                                       │
│  └── Edge Function: registry (upsert endpoint)              │
│                                                             │
│  GitHub Actions (per repo)                                  │
│  └── issue-analyze.yml     – AI analysis on issue open/edit │
│  └── repoowl-analyze.yml   – PR slop detection on PR open   │
│  └── issue-assignment.yml  – Auto-assign contributors        │
│  └── auto-label.yml        – File-path based label routing  │
│  └── pr-merged.yml         – Post-merge status updates      │
│  └── welcome.yml           – Welcomes new contributors       │
│  └── stale.yml             – Marks stale issues/PRs         │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Extension Runtime | Chrome Manifest V3, Service Worker |
| UI | React 18, JSX, Vite |
| AI Model | Groq Cloud — `llama-3.3-70b-specdec` |
| Database | Supabase (PostgreSQL), Row Level Security |
| Shared Utilities | `@repoowl/shared` (local workspace package) |
| Build Tool | Vite (4 separate build configs) |
| CI / Automation | GitHub Actions (7 workflows) |
| Config Discovery | `repoowl.json` on GitHub + Central Mediator Supabase |
