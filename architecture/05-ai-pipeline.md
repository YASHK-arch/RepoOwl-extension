# 05 — AI Pipeline

> How Groq's LLaMA 3.3 70B model is used: prompt construction, inference, response parsing, and rate-limiting.

---

## Overview

RepoOwl calls the Groq API in **two distinct contexts**:

```
┌───────────────────────────────────────────────────────────────────┐
│                     AI CALL SITES                                  │
│                                                                   │
│  1. background.js (Service Worker)                                │
│     ├── callGroqAPI()    — bulk issue triage (sync queue)         │
│     └── prTriage.js      — PR slop detection                      │
│                                                                   │
│  2. content/index.js (Content Script — in browser context)        │
│     ├── enableContributorDraftChecker()  — draft duplicate check  │
│     └── autoAnalyzeAndSaveToSandbox()    — single-issue analysis  │
│                                                                   │
│  All calls use:                                                   │
│    Model:   llama-3.3-70b-versatile                               │
│    Temp:    0.1 (near-deterministic for JSON output)              │
│    Format:  response_format: { type: 'json_object' }             │
└───────────────────────────────────────────────────────────────────┘
```

---

## Prompt Template System (`@repoowl/shared`)

The shared package (`shared/`) provides a **template engine** for constructing prompts:

### Template Variables

```
DEFAULT_PROMPT_TEMPLATE uses 5 variables:

  {{issue.primary_description}}    → Core Problem / Request
  {{issue.context_steps}}          → Context & Reproduction Steps
  {{issue.expected_outcome}}       → Proposed Solution / Impact
  {{issue.technical_metrics}}      → Technical Metrics & Environment
  {{repository.historical_context_log}} → History of existing issues
```

### Pipeline Flow

```
1. parseIssueTemplateFields(issue.body)
   ─────────────────────────────────────
   Parses GitHub issue markdown body using regex:
     /### (.+?)(?:\r?\n)+([\s\S]*?)(?=###|$)/g

   Maps structured headers to standard fields:
   ┌────────────────────────────────┬──────────────────────────────────┐
   │  primary_description           │  Bug Description, Feature Desc., │
   │                                │  Task Description, etc.          │
   ├────────────────────────────────┼──────────────────────────────────┤
   │  context_steps                 │  Steps to Reproduce, Current     │
   │                                │  Design, Which page?, etc.       │
   ├────────────────────────────────┼──────────────────────────────────┤
   │  expected_outcome              │  Expected Behavior, Suggested    │
   │                                │  Improvement, Impact, etc.       │
   ├────────────────────────────────┼──────────────────────────────────┤
   │  technical_metrics             │  CPU Usage, Browser, OS, Files   │
   │                                │  to modify, Affected Files, etc. │
   └────────────────────────────────┴──────────────────────────────────┘

2. buildPromptVariables(mappedIssue, historicalContextLog)
   ────────────────────────────────────────────────────────
   Creates a flat object with all template variables resolved

3. renderPrompt(DEFAULT_PROMPT_TEMPLATE, variables)
   ──────────────────────────────────────────────────
   Simple {{variable}} replacement engine (no eval, no Handlebars)

4. Assemble final API messages array:
   [
     { role: 'system', content: SYSTEM_PROMPT },
     { role: 'user',   content: rendered_prompt }
   ]
```

---

## System Prompt (Issue Triage)

```
You are an expert GitHub triage AI.
The user is drafting a new issue. I am providing you with a list of
currently OPEN issues in this repository.
Do not assume any issues have been resolved, because they are all
actively open.
Your job is to determine if the user's draft is a DUPLICATE of one
of these specific OPEN issues.
If they are reporting a bug that already exists in this open list,
flag it as a duplicate.
You must respond in valid JSON format matching this schema:
{ "is_duplicate": boolean, "analysis_summary": "string" }
Ensure the JSON is well-formed.
```

The `DEFAULT_PROMPT_TEMPLATE` (user-turn) adds:
- Issue template fields (description, steps, outcome, metrics)
- Historical context: last 50 analyzed issues and their summaries

---

## Expected AI Response Schema

```json
{
  "is_duplicate": true,
  "analysis_summary": "Thorough technical explanation of why this issue
                       is structurally linked to an existing open issue,
                       or a crisp summary of its unique scope."
}
```

---

## Rate-Limit Handling (callGroqWithRetry)

```
callGroqWithRetry(groq, options, retries = 3):

  for attempt in 0..2:
    try:
      return await groq.chat.completions.create(options)

    except HTTP 429 (Too Many Requests):
      if attempt < 2:
        waitTime = 6000ms (default)

        if error.message matches /Please try again in (\d+\.?\d*)s/:
          waitTime = ceil(seconds * 1000) + 500ms

        console.warn("Rate limit hit. Waiting {waitTime}ms...")
        await delay(waitTime)
      else:
        throw error (give up after 3 attempts)
```

Additionally, a **mandatory 2000ms delay** is inserted between every issue analysis in the sync queue:

```
for (const issue of pendingIssues) {
  await callGroqAPI(issue, history, apiKey)
  await delay(2000)  // always wait 2s between calls
}
```

---

## PR Slop Detection Prompt

For PR analysis, the Groq call evaluates the **diff content** against the PR description and linked issues:

```
Input to AI:
  - PR title + description
  - Linked issue content (if any)
  - File diff patches (filtered: no .lock, .svg, .png, .min.js, no-patch files)
  - Last 50 issue history summaries

AI evaluates:
  - slop_detection:
      is_slop: bool — is this AI-generated or low-effort code?
      reasoning: string

  - issue_resolution:
      resolves_linked_issue: bool
      explanation: string

  - domain_impact:
      areas: string[] — which code domains are affected
      severity: 'low' | 'medium' | 'high'

  - recommended_labels: string[]

Output stored in `pull_requests` table (JSONB columns)
```

---

## Groq SDK Configuration

```javascript
const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true  // Required for content script context
})

groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  temperature: 0.1,                     // Low = deterministic JSON output
  response_format: { type: 'json_object' }  // Forces JSON mode
})
```

The `dangerouslyAllowBrowser: true` flag is needed because content scripts run inside the browser page context. The API key is secured in `chrome.storage.local` and is never exposed to the page's own JavaScript context.

---

## Historical Context Construction

```
fetchFromSupabase(repo, keys):
  SELECT issue_number, analysis_summary
  FROM issues
  WHERE repo_name = ? AND status = 'open'
  ORDER BY created_at DESC
  LIMIT 50

Format for prompt:
  history.map(h =>
    `[Issue ID: #${h.issue_number}]
     Title: ${h.title || 'Unknown Title'}
     Technical Summary: ${h.analysis_summary}`
  ).join('\n\n---\n\n')

This gives the AI:
  - Issue numbers (to reference in duplicate detection)
  - Titles (for semantic matching)
  - Existing AI summaries (not raw issue bodies — reduces token usage)
```

---

## AI Accuracy Design Choices

| Design Choice | Rationale |
|---|---|
| `temperature: 0.1` | Near-deterministic. Reduces hallucination in JSON output. |
| `response_format: json_object` | Forces valid JSON; no need for markdown parsing. |
| Historical context limit = 50 | Balance between context richness and token limits. |
| System prompt explicitly says "all issues are OPEN" | Prevents AI from assuming closed issues are resolved. |
| Summaries in history (not raw body) | Summaries are already distilled; saves tokens; avoids noise. |
| 2-second delay between calls | Groq free tier rate limits; prevents 429 cascades. |
