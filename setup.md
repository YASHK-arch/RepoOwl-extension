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

## 2. Supabase Configuration

RepoOwl uses Supabase for database storage, edge functions, and anonymous authentication (for storing user-defined prompts locally).

### 2.1 Create a Project
1. Go to your Supabase Dashboard and create a new project.
2. Under **Project Settings > API**, retrieve your `Project URL`, `anon / public` key, and `service_role` key.

### 2.2 Enable Anonymous Sign-ins
The extension needs anonymous authentication to allow users to save settings safely.
1. Navigate to **Authentication > Providers**.
2. Scroll down to **Anonymous sign-ins** and toggle it **ON**.
3. Save your changes.

### 2.3 Initialize the Database Schema
You must apply the database schema so your Sandbox can save your analysis.
1. Navigate to the **SQL Editor** in your Supabase dashboard.
2. Open `database-schema.sql` from this repository, copy the contents, and run it. This will create the `issues` and `public_ecosystem_registry` tables with Row Level Security (RLS) configured.

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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Extension
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Groq
GROQ_API_KEY=gsk_...

# GitHub Actions worker
GITHUB_TOKEN=your-github-token
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
5. The RepoOwl icon should now appear in your browser toolbar!

---

## 6. Maintainer: Running the Background Worker

If you are a repository **Maintainer** and want to retroactively analyze historical issues in your repository, run the CLI worker. The worker fetches all existing issues, classifies them, and saves them to your Hub.

Ensure your `GITHUB_TOKEN` is set in the `.env` file, then run:

```bash
npm run start:worker
```
The worker will sync all issues and begin processing them.

---

## 7. Contributor: Analyzing Issues

If you are a **Contributor**, you don't need to run any background workers! Simply browse the repository. 
- When you visit an existing issue that hasn't been analyzed by the Maintainer, RepoOwl will analyze it locally using your Groq key and save it to your Sandbox.
- When the Maintainer's Hub eventually analyzes that issue, their official analysis will seamlessly override your Sandbox analysis in the UI.

---

## 7. Supabase Webhooks (Optional for Real-time)

To process new issues as soon as they are opened on GitHub, you need to deploy the Supabase Edge Function and configure a GitHub webhook.

### 7.1 Deploy the Function
If you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed:
```bash
supabase link --project-ref your-project-ref
supabase secrets set GROQ_API_KEY=gsk_...
supabase functions deploy github-webhook
```

### 7.2 Configure GitHub Webhook
1. Go to your GitHub Repository **Settings > Webhooks > Add webhook**.
2. **Payload URL**: `https://your-project-ref.supabase.co/functions/v1/github-webhook`
3. **Content type**: `application/json`
4. Select **Let me select individual events** and check **Issues**.
5. Save the webhook.

---

🎉 **You're all set!** Navigate to your GitHub repository and open the right sidebar to see RepoOwl's AI issue insights.
