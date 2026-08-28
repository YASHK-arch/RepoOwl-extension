# RepoOwl — GitHub Actions Scripts: Editing Rules

These rules apply whenever editing files under `.github/scripts/` or
`.github/workflows/`. They capture real bugs introduced in past sessions and
must be checked **before committing any change** to those paths.

---

## 0  CRITICAL: Re-configure Sync (Always Do This First)

The extension's **Re-configure** button in the Tracked Repositories panel
deploys scripts to tracked repos (e.g. `YASHK-arch/Triage-Sandbox`) by
decoding Base64 blobs embedded in `githubInstaller.js`.

**Every time `analyze-issue.js` is changed, you MUST also:**

1. Re-encode the file to Base64:
   ```powershell
   $content = Get-Content -Raw -Path ".github\scripts\analyze-issue.js"
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
   $b64 = [Convert]::ToBase64String($bytes)
   ```
2. Replace `ISSUE_SCRIPT_JS_B64` in
   `extension/src/background/githubInstaller.js` with the new Base64 string.
3. Bump `INSTALLER_VERSION` (integer) by 1 in the same file and add a comment
   describing the change. This triggers the "Update Required" / "Re-configure"
   badge on repos still running the old version.
4. Commit **both files** together.

Similarly, if `analyze-pr.js` changes → update `SCRIPT_JS_B64`.
If any workflow YAML changes → update `WORKFLOW_YAML_B64` or
`ISSUE_WORKFLOW_YAML_B64` accordingly.

**Failure to do this means Re-configure will overwrite your fix with the old code.**

---

## 1  Mixed Line-Ending (CRLF / LF) Contamination

Both `analyze-issue.js` and `analyze-pr.js` were originally written with
Windows CRLF endings. When new lines are spliced in using LF only, the mixed
result can corrupt multi-line template literals and confuse diff tools.

**Rule:** When editing these files, keep the line endings consistent with the
surrounding context. Do **not** mix `\r\n` and `\n` within the same string
literal or function block.

---

## 2  Template-Literal Prompt Construction — No Dangling Concatenations

### Known Bug (fixed 2026-08-28)
In `analyze-issue.js`, adding the `fileTree` section to `userPrompt` left the
old `historicalLog` tail dangling after it:

```js
// WRONG — historicalLog appears TWICE, fileTree line has no newline
`REPOSITORY FILE TREE\n${fileTree || 'Not available.'}` +
`HISTORICAL REPOSITORY CONTEXT\n${historicalLog}`;
```

This caused:
- The entire history block to be sent twice, bloating the prompt.
- The file tree and history to be concatenated **without a separator**,
  corrupting the prompt structure Groq was parsing.
- The issue analyzer to silently fail (Groq returned empty / token-limit error).

**Rule:** After adding or reordering any section inside a multi-part
template-literal prompt, scan the **entire** constructed string top-to-bottom
and verify:
1. Every section appears **exactly once**.
2. Each section ends with `\n\n` before the next one begins.
3. The final section has **no trailing `+`** operator.

---

## 3  `saveAnalysis` / Supabase Upsert Field Indentation

### Known Bug (fixed 2026-08-28)
`affected_files` in `saveAnalysis()` was indented with extra spaces when
spliced in, while surrounding fields used tabs. While JavaScript ignores
whitespace inside an object literal, the inconsistency signals a
copy-paste splice and should be caught during review.

**Rule:** All fields inside a `JSON.stringify({ … })` block must share the
same indentation style as the surrounding file.

---

## 4  Post-Edit Checklist for `.github/scripts/*.js`

Run this mental checklist after **every** edit to these scripts:

- [ ] **Prompt sections**: Search for each section header string (e.g.
  `HISTORICAL REPOSITORY CONTEXT`, `REPOSITORY FILE TREE`,
  `INCOMING ISSUE DATA`) — each must appear **exactly once** in the final
  concatenated prompt.
- [ ] **No dangling `+`**: The last line of any template-literal concatenation
  must **not** end with ` +`.
- [ ] **Line endings**: New lines match the CRLF/LF style of their surrounding
  context.
- [ ] **Env vars passed through**: If a new feature needs a new env var (e.g.
  `SUPABASE_SERVICE_ROLE_KEY`), verify it is declared in the corresponding
  `.github/workflows/*.yml` `env:` block too.
- [ ] **Workflow trigger coverage**: If logic is added that only applies to
  `issues.opened` (not schedule/dispatch), make sure the new `ISSUE_NUMBER`
  guard in `run()` still routes correctly for both code paths.
- [ ] **Labels created before applied**: `addContextualLabels()` must POST to
  `/labels` (create) before POST to `/issues/:id/labels` (apply). Do not
  reorder these two calls.

---

## 5  Workflow File Rules

- `issue-analyze.yml` triggers on `issues: [opened]` and cron. Any new
  secrets it needs must be added to the `env:` block — do not rely on
  GitHub's automatic secret injection.
- `repoowl-analyze.yml` uses `pull_request_target` (not `pull_request`) so
  it has write permissions. Do not downgrade this to `pull_request`.
- `auto-label.yml` uses `actions/labeler@v7` — the labeler config lives in
  `.github/labeler.yml` (not in the workflow itself). Changes to label rules
  go there, not in the workflow.
