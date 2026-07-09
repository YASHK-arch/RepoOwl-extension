-- Rename repository_full_name to repo_name in issues and repository_prompts tables
ALTER TABLE public.issues RENAME COLUMN repository_full_name TO repo_name;
ALTER TABLE public.repository_prompts RENAME COLUMN repository_full_name TO repo_name;

-- Update the indexes as well
ALTER INDEX IF EXISTS idx_issues_repository RENAME TO idx_issues_repo_name;
ALTER INDEX IF EXISTS idx_issues_unprocessed RENAME TO idx_issues_unprocessed_repo;
