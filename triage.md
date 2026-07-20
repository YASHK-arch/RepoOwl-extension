# RepoOwl PR Triage Implementation Guide

This document explains the current state of the PR Triage feature, how it works, and what it takes to achieve a "fully extension-driven" model.

## 1. The Current Implementation (GitHub Actions + Extension)

### How it works right now
Currently, the heavy lifting of analyzing Pull Requests is split between two components:
1. **The Server (GitHub Actions):** When a PR is opened or someone comments `/analyze`, a GitHub Action (`repoowl-analyze.yml`) runs on GitHub's servers. This action fetches the PR diff, runs the Map-Reduce logic using the Groq API, and posts a comment like `### 🦉 RepoOwl PR Analysis` on the PR thread.
2. **The Client (Chrome Extension):** The extension simply acts as a visual layer. It scans the PR page for the bot's comment and injects the red/green badges (🟢/🔴) into the title header.

### Does it work out-of-the-box for any user?
**No.** 
If a random user downloads the extension and goes to a random repository (like `facebook/react`), PR triage will **not** work. 
This is because `facebook/react` does not have the RepoOwl GitHub Action installed in its repository. The extension relies on that Action being present and having a `GROQ_API_KEY` configured in the repository's secrets.

---

## 2. Your Goal: Fully Extension-Driven

You mentioned:
> *"I want to make it fully run through the extension, like the extension should be working here."*

If your goal is that **any user** can install the RepoOwl extension, go to **any repository**, and have PR triage work instantly without any repository setup, we need to move the analysis logic entirely into the Extension itself (Client-Side).

### What needs to change to achieve this?

1. **Move Map-Reduce to the Background Worker:**
   We would need to bring the `analyze-pr.js` logic back into `extension/src/background.js`. The extension itself would fetch the PR diffs via the GitHub API, chunk the files, and run the Map-Reduce LLM calls directly from the browser.

2. **API Key Management:**
   Because we cannot securely hardcode a private `GROQ_API_KEY` inside a public Chrome Extension, you would need to ask users to provide their own Groq API key in the Extension Options page (or provide a central RepoOwl backend server to proxy the requests securely).

3. **Data Storage & Badges:**
   Instead of the extension reading a bot comment on the GitHub page, the extension would save the analysis result in its local `hub_cache` or Supabase database. The `prDetailInjector.js` would then read from this database to inject the badges, exactly how the Issue badges work.

### Pros and Cons of a Fully Extension-Driven Approach

**Pros:**
- **Zero-Setup for Repositories:** It works on any public GitHub repository instantly.
- **True Browser Tool:** The user's browser does all the work.

**Cons:**
- **Heavy Client Load:** Running large Map-Reduce tasks inside a Chrome extension background worker can be resource-intensive for the user's browser.
- **API Limits:** Users might hit Groq API rate limits faster if they process massive PRs from their browser.
- **Requires User API Keys:** Users will have to supply their own Groq API keys unless you build a backend proxy.

## Conclusion

Right now, the system is robust but requires **repository-level installation** (GitHub Actions). 
If you want to switch back to an **extension-only** model so that it works automatically for anyone who installs the extension, we will need to undo the GitHub Action setup and integrate the Map-Reduce logic directly into the extension's `background.js` workflow. Let me know if you would like me to start this migration!
