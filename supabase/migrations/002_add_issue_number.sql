-- GitHub UI links use issue_number (#123); API primary key remains issue_id.
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS issue_number INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS idx_issues_repo_number
  ON public.issues (repository_full_name, issue_number)
  WHERE issue_number IS NOT NULL;
