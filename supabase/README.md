# Supabase setup

Apply migrations in order:

```bash
supabase db push
```

Or run each file in the Supabase SQL editor:

1. `migrations/001_initial_schema.sql`
2. `migrations/002_add_issue_number.sql`
3. `migrations/003_tighten_rls.sql`

## Auth requirement

Migration `003` restricts `repository_prompts` writes to the `authenticated` role.

Before using the extension settings page:

1. Open Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Anonymous sign-ins**

The extension calls `signInAnonymously()` on first save, which issues a scoped JWT without requiring maintainer signup.

## Role matrix

| Table | anon | authenticated | service_role |
|-------|------|---------------|--------------|
| `issues` | SELECT | SELECT | ALL (bypasses RLS) |
| `repository_prompts` | SELECT | SELECT, INSERT, UPDATE | ALL |

The GitHub Actions worker always uses `SUPABASE_SERVICE_ROLE_KEY`.
