# RepoOwl 🦉

RepoOwl is an AI-powered GitHub extension that automates issue triage by identifying duplicates and surface technical insights in real-time. Designed to keep open-source repositories clean and organized.

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

## 📜 License

Distributed under the Apache-2.0 License. See `LICENSE` for more information.

