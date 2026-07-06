-- RepoOwl: initial schema
-- issues: GitHub issue store + LLM watermark queue
-- repository_prompts: per-repo custom analysis instructions

-- ---------------------------------------------------------------------------
-- issues
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.issues (
  issue_id              BIGINT PRIMARY KEY,
  repository_full_name  TEXT NOT NULL,
  title                 TEXT NOT NULL,
  bug_description       TEXT,
  steps_to_reproduce    TEXT,
  expected_behavior     TEXT,
  context               TEXT,
  duplicate_data        JSONB,
  is_processed          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT issues_duplicate_data_shape CHECK (
    duplicate_data IS NULL
    OR (
      duplicate_data ? 'original_issue_ids'
      AND duplicate_data ? 'explanation'
      AND jsonb_typeof(duplicate_data -> 'original_issue_ids') = 'array'
      AND jsonb_typeof(duplicate_data -> 'explanation') = 'string'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_issues_repository
  ON public.issues (repository_full_name);

CREATE INDEX IF NOT EXISTS idx_issues_unprocessed
  ON public.issues (repository_full_name, is_processed)
  WHERE is_processed = FALSE;

-- ---------------------------------------------------------------------------
-- repository_prompts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.repository_prompts (
  repository_full_name  TEXT PRIMARY KEY,
  custom_prompt         TEXT NOT NULL,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER issues_set_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER repository_prompts_set_updated_at
  BEFORE UPDATE ON public.repository_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Worker (service_role) bypasses RLS. Extension uses anon key for reads/writes.
-- ---------------------------------------------------------------------------
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "issues_public_read"
  ON public.issues
  FOR SELECT
  USING (true);

CREATE POLICY "repository_prompts_public_read"
  ON public.repository_prompts
  FOR SELECT
  USING (true);

CREATE POLICY "repository_prompts_public_insert"
  ON public.repository_prompts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "repository_prompts_public_update"
  ON public.repository_prompts
  FOR UPDATE
  USING (true);
