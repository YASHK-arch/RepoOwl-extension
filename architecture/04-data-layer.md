# 04 — Data Layer

> Supabase schema, Row Level Security policies, the dual-client architecture, and the Central Mediator discovery pattern.

---

## Database Schema (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                  MAINTAINER'S SUPABASE ("HUB")                   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  issues                                               │      │
│  │  ─────────────────────────────────────────────────── │      │
│  │  id              BIGINT PK (auto-generated)           │      │
│  │  repo_name       TEXT NOT NULL    (e.g. "owner/repo") │      │
│  │  issue_number    INT NOT NULL                         │      │
│  │  is_duplicate    BOOLEAN DEFAULT false                │      │
│  │  analysis_summary TEXT                                │      │
│  │  status          TEXT DEFAULT 'open'                  │      │
│  │  created_at      TIMESTAMPTZ                          │      │
│  │                                                       │      │
│  │  UNIQUE(repo_name, issue_number)                      │      │
│  │  INDEX ON status                                      │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  pull_requests                                        │      │
│  │  ─────────────────────────────────────────────────── │      │
│  │  id              BIGINT PK (auto-generated)           │      │
│  │  repo_name       TEXT NOT NULL                        │      │
│  │  pr_number       INT NOT NULL                         │      │
│  │  slop_detection      JSONB (is_slop, reasoning)       │      │
│  │  issue_resolution    JSONB (resolves_issue, explain.) │      │
│  │  domain_impact       JSONB (areas[], severity)        │      │
│  │  recommended_labels  JSONB (string[])                 │      │
│  │  created_at      TIMESTAMPTZ                          │      │
│  │                                                       │      │
│  │  UNIQUE(repo_name, pr_number)                         │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  public_ecosystem_registry                            │      │
│  │  ─────────────────────────────────────────────────── │      │
│  │  repo_name                TEXT PK                     │      │
│  │  total_issues_analyzed    INT DEFAULT 0               │      │
│  │  duplicates_found         INT DEFAULT 0               │      │
│  │  maintainer_handle        TEXT                        │      │
│  │  last_updated             TIMESTAMPTZ                 │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              CENTRAL MEDIATOR SUPABASE (Shared)                  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  registry                                             │      │
│  │  ─────────────────────────────────────────────────── │      │
│  │  owner           TEXT NOT NULL                        │      │
│  │  repo            TEXT NOT NULL                        │      │
│  │  supabase_url    TEXT NOT NULL                        │      │
│  │  supabase_anon_key TEXT NOT NULL                      │      │
│  │  created_at      TIMESTAMPTZ                          │      │
│  │                                                       │      │
│  │  PRIMARY KEY (owner, repo)                            │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                 │
│  Also has: Edge Function `registry`                              │
│    → Accepts { owner, repo, supabase_url, anon_key, github_token}│
│    → Performs UPSERT into registry table                         │
│    → Uses service role (bypasses RLS)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Row Level Security Policy Matrix

```
TABLE: issues (Maintainer's Supabase)
┌─────────────┬──────────────────────────────────────────────────┐
│  Operation  │  Policy                                          │
├─────────────┼──────────────────────────────────────────────────┤
│  SELECT     │  Allow public read access → USING (true)         │
│             │  Anyone (incl. unauthenticated) can READ issues  │
├─────────────┼──────────────────────────────────────────────────┤
│  INSERT     │  WITH CHECK (auth.role() IN ('authenticated','anon'))│
│             │  Anonymous sign-in enabled via Supabase Auth     │
├─────────────┼──────────────────────────────────────────────────┤
│  UPDATE     │  USING + WITH CHECK (auth.role() IN ('authenticated','anon'))│
│             │  Used when closing stale issues                  │
└─────────────┴──────────────────────────────────────────────────┘

TABLE: pull_requests — same policies as `issues`

TABLE: public_ecosystem_registry
┌─────────────┬──────────────────────────────────────────────────┐
│  SELECT     │  Allow public read → USING (true)                │
│  INSERT     │  auth.role() IN ('authenticated', 'anon')        │
│  UPDATE     │  auth.role() IN ('authenticated', 'anon')        │
└─────────────┴──────────────────────────────────────────────────┘

TABLE: registry (Central Mediator)
┌─────────────┬──────────────────────────────────────────────────┐
│  SELECT     │  Allow public read → USING (true)                │
│  INSERT/UPDATE│ Handled by Edge Function using service_role key │
│             │ (bypasses RLS entirely — only trusted server code)│
└─────────────┴──────────────────────────────────────────────────┘
```

---

## Dual-Client Architecture

RepoOwl maintains up to **two Supabase clients** simultaneously per content script session:

```
┌──────────────────────────────────────────────────────────────────┐
│                     SUPABASE CLIENT HIERARCHY                    │
│                                                                  │
│  Sandbox Client (getSandboxClient())                             │
│  ─────────────────────────────────────────────────────────────── │
│  • URL/Key from chrome.storage.local["repoOwlConfig"]            │
│  • Or VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars        │
│  • Used for: INSERT/UPDATE operations (writes)                   │
│  • Auth: anonymous session (signInAnonymously)                   │
│  • Session persisted in chrome.storage (custom auth storage)     │
│                                                                  │
│  Hub Client (getHubClient())                                     │
│  ─────────────────────────────────────────────────────────────── │
│  • URL/Key from publicGatewayConfig (set by setPublicGateway...) │
│  • Source: Central Mediator `registry` or repoowl.json           │
│  • Used for: SELECT operations (reads) from Maintainer's DB      │
│  • Auth: no session (persistSession: false, storage: dummyStorage)│
│                                                                  │
│  Optimization:                                                   │
│  If sandbox URL === hub URL (user IS the maintainer), hub client │
│  simply reuses the sandbox client to avoid duplicate GoTrueClient│
│  warnings.                                                       │
└──────────────────────────────────────────────────────────────────┘

Cascade Merge (fetchRepositoryInsights):
  sandboxData + hubData fetched in parallel via Promise.all()
  Result: { ...sandboxMap, ...hubMap }
  → Hub data OVERWRITES sandbox data for same issue_number
  → This ensures the maintainer's authoritative analysis wins
```

---

## Hub Cache (Local Storage)

To achieve sub-50ms badge rendering on page load (without waiting for a network round-trip):

```
Background Sync writes:
  chrome.storage.local.set({
    [`hub_cache_${repo}`]: [{ id, issue_number, is_duplicate, analysis_summary }, ...]
  })

Content Script reads (Phase 1 — instant):
  chrome.storage.local.get([`hub_cache_${repo}`])
  → Paints badges immediately

Content Script fetches fresh (Phase 2 — async background):
  fetchRepositoryInsights(repo)
  → Merges with cache
  → Removes [data-repoowl-badge] elements
  → MutationObserver re-fires → repaints with fresh data

Cache Keys:
  hub_cache_{owner/repo}     → issue badges
  pr_hub_cache_{owner/repo}  → PR badges
```

---

## Config Discovery Waterfall

When a contributor visits a tracked repo page, the extension needs to find the maintainer's Supabase credentials:

```
fetchPublicRepoConfig(repoName)

  Step 1: Central Mediator
  ─────────────────────────
  Supabase client (Central Mediator URL + key baked in via Vite env)
  Query: SELECT supabase_url, supabase_anon_key
         FROM registry
         WHERE owner = ? AND repo = ?
  → If found: return { supabaseUrl, supabaseAnonKey }

  Step 2: Raw GitHub File (fallback)
  ──────────────────────────────────
  GET https://raw.githubusercontent.com/{owner}/{repo}/main/repoowl.json
  → If found and valid: return parsed JSON

  Step 3: Validation
  ──────────────────
  URL must be a real HTTPS Supabase host:
    parsed.hostname.endsWith('.supabase.co')
    !parsed.hostname.startsWith('your-')
  Anon key must not start with 'your-'
  → If invalid: reject (prevents placeholder values poisoning the client)
```

---

## Authentication Flow (Anonymous Sessions)

RepoOwl does not require user login. Instead it uses Supabase's anonymous sign-in:

```
ensureAuthenticatedSession():
  1. getSandboxClient() — get/create Supabase client
  2. supabase.auth.getSession() — check existing session
  3. If no session → supabase.auth.signInAnonymously()
  4. Anonymous session token stored in chrome.storage.local
     (via custom createAuthStorage() adapter)
  
  Why anonymous? RLS policies require auth.role() ≠ 'public'
  for INSERT/UPDATE. Anonymous sign-in satisfies this without
  requiring the maintainer to create user accounts.
```
