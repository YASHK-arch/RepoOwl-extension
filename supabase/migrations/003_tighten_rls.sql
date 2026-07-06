-- Tighten RLS: issues are read-only for clients; prompt writes require authenticated role.
-- Enable "Anonymous sign-ins" in Supabase Auth before deploying the extension settings UI.

-- ---------------------------------------------------------------------------
-- Validation helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_valid_repository_full_name(name TEXT)
RETURNS BOOLEAN AS $$
  SELECT name ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$';
$$ LANGUAGE sql IMMUTABLE;

-- ---------------------------------------------------------------------------
-- Drop prototype-era permissive policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "issues_public_read" ON public.issues;
DROP POLICY IF EXISTS "repository_prompts_public_read" ON public.repository_prompts;
DROP POLICY IF EXISTS "repository_prompts_public_insert" ON public.repository_prompts;
DROP POLICY IF EXISTS "repository_prompts_public_update" ON public.repository_prompts;

-- ---------------------------------------------------------------------------
-- issues: client read-only (worker uses service_role and bypasses RLS)
-- ---------------------------------------------------------------------------
CREATE POLICY "issues_select_anon"
  ON public.issues
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "issues_select_authenticated"
  ON public.issues
  FOR SELECT
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- repository_prompts: reads open; writes restricted to authenticated sessions
-- ---------------------------------------------------------------------------
CREATE POLICY "repository_prompts_select_anon"
  ON public.repository_prompts
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "repository_prompts_select_authenticated"
  ON public.repository_prompts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "repository_prompts_insert_authenticated"
  ON public.repository_prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_valid_repository_full_name(repository_full_name)
    AND length(trim(custom_prompt)) > 0
    AND length(custom_prompt) <= 50000
  );

CREATE POLICY "repository_prompts_update_authenticated"
  ON public.repository_prompts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    public.is_valid_repository_full_name(repository_full_name)
    AND length(trim(custom_prompt)) > 0
    AND length(custom_prompt) <= 50000
  );

-- Explicitly revoke destructive client access
REVOKE INSERT, UPDATE, DELETE ON public.issues FROM anon, authenticated;
REVOKE DELETE ON public.repository_prompts FROM anon, authenticated;
