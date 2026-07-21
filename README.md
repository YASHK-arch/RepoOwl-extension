# RepoOwl 🦉

RepoOwl is an AI-powered GitHub extension that automates issue triage by identifying duplicates and surface technical insights in real-time. Designed to keep open-source repositories clean and organized.

---

## ✨ What's New in v0.1.1 (Client-Side Overhaul)

* **3-Layer Central Mediator Architecture:** Completely eliminated manual environment configuration for contributors.
* **Zero-Config Contributor Discovery:** Contributors no longer need to ask for or paste manual keys; the extension automatically discovers the maintainer's Supabase connection via the central mediator registry.
* **Maintainer Live Sync Tracking:** Maintainers can force sync their keys to the mediator and track real-time registration status directly from the extension UI.
* **Idempotent SQL Schema & Secure RLS:** Enhanced database configurations with robust Row-Level Security ensuring seamless and secure read/write capabilities across roles.

---

## 🎯 Why RepoOwl?

Managing large-scale repositories often leads to a deluge of duplicate issues and complex technical debt. RepoOwl acts as your first-line triager:

* **Semantic Analysis:** Uses Llama 3 to understand the *meaning* of issues, not just keywords.
* **Non-Destructive UI:** Injected directly into the GitHub native DOM—looks and feels like a first-party GitHub feature.
* **Automated Workflow:** Uses Supabase Webhooks to process issues the moment they are opened.

---

## 🛠 Tech Stack

* **Inference:** Groq API (Llama 3.3 Versatile)
* **Backend:** Supabase Edge Functions & PostgreSQL
* **Frontend:** Chrome Extension (Manifest V3, Vite, React)

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* A Supabase Project
* A Groq API Key

### Extension Setup

1. Clone the repository:
```bash
git clone https://github.com/YASHK-arch/RepoOwl-extension.git
cd RepoOwl-extension

```


2. Install dependencies:
```bash
npm install

```


3. Load the `extension/` folder into Chrome:
* Navigate to `chrome://extensions/`
* Enable **Developer mode**
* Click **Load unpacked** and select the `/extension` directory.



### Backend Setup

1. Deploy the Edge Function:
```bash
supabase functions deploy github-webhook

```


2. Configure your GitHub Webhook to point to your new Supabase function URL.

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](https://www.google.com/search?q=link-to-file) for guidelines.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feat/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing feature'`).
4. Push to the branch (`git push origin feat/amazing-feature`).
5. Open a **Pull Request**.

---

## Contributors

Thanks to everyone who has helped build RepoOwl. Want to see your avatar here? Pick a [good first issue](https://github.com/YASHK-arch/RepoOwl-extension/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) and join in.

<div align="center">

<a href="https://github.com/YASHK-arch/RepoOwl-extension/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YASHK-arch/RepoOwl-extension" alt="RepoOwl contributors" />
</a>

</div>

---

## 📜 License

Distributed under the Apache-2.0 License. See `LICENSE` for more information.

