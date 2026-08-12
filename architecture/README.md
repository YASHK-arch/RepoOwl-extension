# RepoOwl — Architecture Documentation

This directory contains detailed architecture documentation for the **RepoOwl** Chrome Extension.
Each document covers a specific layer or domain of the system.

---

## Documents

| File | What It Covers |
|---|---|
| [01-system-overview.md](./01-system-overview.md) | Bird's-eye view: all subsystems, stakeholders, data flows |
| [02-extension-internals.md](./02-extension-internals.md) | Chrome Extension architecture (manifest, scripts, build pipeline) |
| [03-feature-map.md](./03-feature-map.md) | Every feature, how it works, and how features link to each other |
| [04-data-layer.md](./04-data-layer.md) | Supabase schema, RLS policies, dual-client strategy |
| [05-ai-pipeline.md](./05-ai-pipeline.md) | Groq LLaMA 3.3 prompt pipeline for issue triage and duplicate detection |
| [06-github-integration.md](./06-github-integration.md) | GitHub API usage, repoowl.json config file, Actions workflows |

---

## Quick Glossary

| Term | Meaning |
|---|---|
| **Sandbox** | The *current user's* Supabase instance (maintainer-owned) |
| **Hub** | The *maintainer's* Supabase, read by contributors |
| **Central Mediator** | A shared Supabase instance used as a discovery registry |
| **Hub Cache** | A local Chrome `storage.local` snapshot of Hub data for instant badge rendering |
| **Triage** | AI-powered analysis: duplicate detection + PR slop detection |
| **Slop** | AI-generated/low-quality PR code that doesn't match the linked issue |
