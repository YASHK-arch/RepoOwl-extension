// flowchart TD

// subgraph group_browser["Chrome extension"]
//   node_manifest["Extension manifest<br/>MV3 entrypoint<br/>[manifest.json]"]
//   node_content["Content runtime<br/>content scripts<br/>[index.js]"]
//   node_github_context["GitHub context<br/>page identity boundary<br/>[githubContext.js]"]
//   node_issue_pr_injectors["Issue and PR injectors<br/>DOM integration"]
//   node_insight_fetch["Insight reader<br/>analysis fetch"]
//   node_page_ui["Badges, cards, overlay<br/>in-page React UI<br/>[badgeInjector.js]"]
//   node_background["Background worker<br/>service worker<br/>[background.js]"]
//   node_installer["GitHub installer<br/>installation integration<br/>[githubInstaller.js]"]
//   node_settings["Popup and settings<br/>configuration UI<br/>[PopupApp.jsx]"]
//   node_supabase_client["Supabase client<br/>backend access<br/>[supabase.js]"]
// end

// subgraph group_backend["Supabase backend"]
//   node_registry{{"Tenant registry<br/>Supabase Edge Function<br/>[index.ts]"}}
//   node_tenant_schema["Tenant and RLS schema<br/>database migrations"]
//   node_issue_store[("Issue analysis store<br/>Supabase PostgreSQL")]
//   node_webhook_processor{{"Webhook analysis processor<br/>deployment boundary"}}
// end

// subgraph group_shared["Shared AI contract"]
//   node_prompts["Prompt composition<br/>shared prompting<br/>[defaultPrompt.js]"]
//   node_response_schema["Groq response contract<br/>shared schema"]
// end

// subgraph group_external["External platforms"]
//   node_github(("GitHub<br/>issue and PR platform"))
//   node_groq(("Groq / Llama 3.3<br/>inference API"))
// end

// node_manifest -->|"launches"| node_background
// node_manifest -->|"injects on GitHub"| node_content
// node_github -->|"page DOM"| node_content
// node_content -->|"derives context"| node_github_context
// node_content -->|"routes by page"| node_issue_pr_injectors
// node_github_context -->|"issue identity"| node_insight_fetch
// node_issue_pr_injectors -->|"injection points"| node_page_ui
// node_insight_fetch -->|"persisted insights"| node_page_ui
// node_insight_fetch -->|"reads through"| node_supabase_client
// node_background -->|"orchestrates"| node_installer
// node_settings -->|"invokes actions"| node_background
// node_settings -->|"configures workflow"| node_supabase_client
// node_supabase_client -->|"resolves tenant"| node_registry
// node_registry -->|"enforces ownership"| node_tenant_schema
// node_supabase_client -->|"reads analysis"| node_issue_store
// node_github -.->|"issue-open webhook"| node_webhook_processor
// node_webhook_processor -->|"persists issue and analysis"| node_issue_store
// node_webhook_processor -->|"builds request"| node_prompts
// node_prompts -->|"inference prompt"| node_groq
// node_groq -->|"structured output"| node_response_schema
// node_response_schema -->|"validated analysis"| node_webhook_processor

// click node_manifest "https://github.com/yashk-arch/repoowl-extension/blob/main/extension/manifest.json"
// click node_content "https://github.com/yashk-arch/repoowl-extension/blob/main/extension/src/content/index.js"
// click node_github_context "https://github.com/yashk-arch/repoowl-extension/blob/main/extension/src/lib/githubContext.js"
// click node_issue_pr_injectors "https://github.com/yashk-arch/repoowl-extension/blob/main/extension/src/content/issueDetailInjector.js"
// click node_insight_fetch "https://github.com/yashk-arch/repoowl-extension/blob/main/extension/src/content/fetchIssueInsights.js"
// click node_page_ui "https://github.com/yashk-arch/repoowl-extension/blob/main/extension/src/content/badgeInjector.js"
// click node_background "https://github.com/yashk-arch/repoowl-extension/blob/main/extension/src/background.js"
// click node_installer "https://github.com/yashk-arch/repoowl-extension/blob/main/extension/src/background/githubInstaller.js"
// click node_settings "https://github.com/yashk-arch/repoowl-extension/blob/main/extension/src/popup/PopupApp.jsx"
// click node_supabase_client "https://github.com/yashk-arch/repoowl-extension/blob/main/extension/src/lib/supabase.js"
// click node_registry "https://github.com/yashk-arch/repoowl-extension/blob/main/supabase/functions/registry/index.ts"
// click node_tenant_schema "https://github.com/yashk-arch/repoowl-extension/blob/main/supabase/migrations/004_multi_tenant.sql"
// click node_issue_store "https://github.com/yashk-arch/repoowl-extension/blob/main/database-schema.sql"
// click node_prompts "https://github.com/yashk-arch/repoowl-extension/blob/main/shared/prompts/defaultPrompt.js"
// click node_response_schema "https://github.com/yashk-arch/repoowl-extension/blob/main/shared/schemas/groqResponseSchema.js"

// classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a
// classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
// classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f
// classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d
// classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337
// classDef toneIndigo fill:#e0e7ff,stroke:#4f46e5,stroke-width:1.5px,color:#312e81
// classDef toneTeal fill:#ccfbf1,stroke:#0f766e,stroke-width:1.5px,color:#134e4a
// class node_manifest,node_content,node_github_context,node_issue_pr_injectors,node_insight_fetch,node_page_ui,node_background,node_installer,node_settings,node_supabase_client toneBlue
// class node_registry,node_tenant_schema,node_issue_store,node_webhook_processor toneAmber
// class node_prompts,node_response_schema toneMint
// class node_github,node_groq toneRose