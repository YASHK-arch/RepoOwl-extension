# 🧠 AI Triage Workflows

RepoOwl's core capability is its AI-powered issue and pull request analysis. Rather than relying on complex vector embeddings and separate vector databases, RepoOwl achieves highly accurate triage using a **Direct Prompt-Context Injection** strategy powered by modern large-context LLMs (specifically Qwen 3.6 27B via Groq).

This document outlines how both the Issue Triage and PR Triage workflows operate under the hood.

---

## 🐞 Issue Triage Workflow

The issue triage system is designed to automatically detect duplicate issues, summarize technical requirements, and predict which files will need to be modified.

### 1. Trigger
The workflow is triggered via GitHub Actions (`issue-analyze.yml`) whenever a new issue is `opened`, or during a scheduled 6-hour cron sweep for missed issues.

### 2. Context Gathering
Instead of using semantic search (vectorization) to compare issues, the workflow gathers raw context:
- **Current Issue**: Fetches the full body and title of the newly opened issue.
- **Historical Context**: Pulls the last 50 open issues directly from the maintainer's Supabase database (`issues` table).
- **Repository State**: Retrieves up to 500 file paths from the repository's current file tree.

### 3. Context Construction
The application flattens the historical issues into a structured text string.
```text
[Issue ID: #123]
Title: Bug in Auth
Technical Summary: The OAuth token fails to refresh after 1 hour.
```

### 4. Single-Shot LLM Analysis
All gathered context—the new issue, the historical context string, and the file tree—is injected into a single prompt. The LLM acts as a system architect, analyzing the entire context window in one shot to determine:
- **`is_duplicate`**: A boolean flag if the issue matches a historical issue.
- **`analysis_summary`**: A concise technical summary of the problem.
- **`affected_files`**: A predicted array of file paths that will need modification.

### 5. Persistence and Action
The resulting JSON payload is written to the Supabase `issues` table. Based on the `is_duplicate` flag, the GitHub Action automatically applies labels like `duplicate` or `needs-triage`.

---

## 🔀 Pull Request Triage Workflow

The PR triage system acts as an automated code reviewer, focusing on detecting AI-generated "slop", evaluating issue resolution, and summarizing domain impact.

### 1. Trigger
The workflow is triggered via GitHub Actions (`repoowl-analyze.yml`) when a PR is opened (`pull_request_target`), marked as ready for review, or when a maintainer comments `/analyze`.

### 2. Context Gathering
The workflow collects comprehensive metadata about the PR:
- **Diff Data**: Fetches the raw code diff (additions and deletions).
- **PR Metadata**: Retrieves the PR title and description body.
- **Linked Issues**: Identifies and fetches any issues linked to the PR (e.g., "Fixes #45").

### 3. Single-Shot LLM Analysis
The diff and metadata are injected into a specialized prompt. The LLM evaluates the PR against strict criteria:
- **Slop Detection**: Analyzes the code for signs of low-effort AI generation (e.g., hallucinated imports, overly generic error handling, unused variables). It assigns a "slop score".
- **Issue Resolution**: If an issue is linked, the LLM verifies whether the PR's code actually solves the described problem.
- **Domain Impact**: Summarizes the architectural areas affected by the PR (e.g., "Database", "Frontend UI", "Authentication").

### 4. Path-Based Label Recommendation
The system cross-references the changed files in the PR against the maintainer's `repoowl.json` configuration file to recommend appropriate labels (e.g., adding an `auth` label if `src/auth/**` files were changed).

### 5. Persistence and Action
The analysis results are written to the Supabase `pull_requests` table. Finally, the GitHub Action posts a beautifully formatted, structured triage comment directly on the PR timeline, providing maintainers with an immediate at-a-glance health check of the submission.
