# RepoOwl Setup Guide 🦉

This guide provides a comprehensive walkthrough to get RepoOwl running locally and connected to your repositories.

> [!IMPORTANT]
> **Dual-Layer Architecture:** RepoOwl uses a Hub (Maintainer) and Sandbox (Contributor) architecture. **Both Maintainers and Contributors** must set up their own personal Supabase project (the Sandbox) to store their local analysis!

---

## 1. Prerequisites

Before you begin, ensure you have the following installed and set up:
- **Node.js** (v18 or higher)
- **Git**
- **Google Chrome** (for the browser extension)
- A **[Supabase](https://supabase.com/)** account
- A **[Groq](https://console.groq.com/)** account (for fast LLM inference)
- A **GitHub Personal Access Token** (Classic or Fine-grained) with access to read repository issues.

---

## 2. Supabase Configuration (Required for All Users)

RepoOwl uses Supabase for database storage. Since there is no central Node.js backend, you must create your own database to store your issue analysis (your Sandbox).

### 2.1 Create a Project
1. Go to your Supabase Dashboard and create a new project.
2. Under **Project Settings > API**, retrieve your `Project URL` and `anon / public` key. 

*(Maintainers: You will also need the `service_role` key to run the CLI worker).*

### 2.2 Enable Anonymous Sign-ins
The extension securely connects to your Supabase instance using Anonymous Authentication so it can read/write your data.
1. Navigate to **Authentication > Providers** in Supabase.
2. Scroll down to **Anonymous sign-ins** and toggle it **ON**.
3. Save your changes.

### 2.3 Initialize the Database Schema
You must apply the database schema so your Sandbox can save your analysis, track open vs. closed status (to prevent regression false positives), and participate in ecosystem analytics.
1. Navigate to the **SQL Editor** in your Supabase dashboard.
2. Open `database-schema.sql` from this repository, copy the contents, and run it. This will create the `issues` and `public_ecosystem_registry` tables with all necessary Row Level Security (RLS) policies.

---

## 3. Environment Setup

Copy the example environment file and fill in your credentials.

```bash
cp .env.example .env
```

Open `.env` in your editor and provide the keys:
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Maintainers only

# Groq
GROQ_API_KEY=gsk_...

# GitHub Actions worker
GITHUB_TOKEN=your-github-token # Maintainers only
```

---

## 4. Install Dependencies & Build

Install the workspace dependencies from the root of the project:

```bash
npm install
```

Now, build the extension so it's ready to be loaded into Chrome:

```bash
npm run build:extension
```
This command compiles the React code, bundles the content scripts, and creates the `extension/dist/` directory.

---

## 5. Load the Extension into Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** ON (in the top right corner).
3. Click the **Load unpacked** button.
4. Select the `extension/` folder inside the `RepoOwl-extension` directory.
5. The RepoOwl icon should now appear in your browser toolbar! Open it and ensure your Groq key is saved in the extension settings.

---

## 6. Usage Guide: Role-Based Workflows

RepoOwl behaves intelligently depending on your role in a repository.

### For Maintainers (The Hub)

If you are a repository **Maintainer**, you need to build the official database for your repository (The Hub).

1. **Sync Issues:** Run the CLI worker to fetch and classify all open issues in your repository:
   ```bash
   npm run start:worker
   ```
   *Note: This script automatically detects when issues are closed and updates your database to prevent false positives on regression bugs.*

2. **Open the Gateway:** To allow your contributors to read your official "Hub" data, create a `repoowl.json` file in the root of your repository's `main` branch with your public keys:
   ```json
   {
     "supabaseUrl": "https://your-project.supabase.co",
     "supabaseAnonKey": "your-anon-key"
   }
   ```
   
*(Optional)* **Real-time Webhooks:** To process new issues automatically, you can deploy the Supabase Edge Function:
```bash
supabase link --project-ref your-project-ref
supabase secrets set GROQ_API_KEY=gsk_...
supabase functions deploy github-webhook
```
Then configure a GitHub Webhook pointing to `https://your-project-ref.supabase.co/functions/v1/github-webhook` for Issue events.

### For Contributors (The Sandbox)

If you are a **Contributor**, you are completely done! You don't need to run any background workers or webhooks. Simply browse GitHub as normal.

- **Sandbox Analysis:** When you visit an existing issue that the Maintainer hasn't analyzed yet, your extension will analyze it locally using your Groq key and save it securely to your personal **Sandbox** database.
- **Draft Protection:** When you draft a new issue, the extension checks your text against the Hub's history of OPEN issues and warns you if you are submitting a duplicate.
- **The Cascade Merge:** Whenever the Maintainer analyzes an issue, their official "Hub" analysis will automatically cascade over your Sandbox data in the UI so you stay perfectly in sync with the ecosystem.

---

🎉 **You're all set!** Navigate to your GitHub repository and open the right sidebar to see RepoOwl's AI issue insights.
