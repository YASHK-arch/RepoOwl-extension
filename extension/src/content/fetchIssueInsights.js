import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js';

const FETCH_TIMEOUT_MS = 8000;

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out.')), timeoutMs);
    }),
  ]);
}

export async function fetchRepositoryInsights(repositoryFullName) {
  const configured = await isSupabaseConfigured();
  if (!configured) {
    return {
      byNumber: new Map(),
      byId: new Map(),
      error: 'Supabase is not configured for RepoOwl.',
    };
  }

  const supabase = await getSupabaseClient();

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('issues')
        .select(
          'id, issue_number, is_duplicate, analysis_summary'
        )
        .eq('repo_name', repositoryFullName),
      FETCH_TIMEOUT_MS
    );

    if (error) {
      throw error;
    }

    const byNumber = new Map();
    const byId = new Map();

    for (const row of data ?? []) {
      // Flag 'is_processed' conceptually for the UI to know it exists
      byNumber.set(row.issue_number, { ...row, is_processed: true });
      byId.set(row.id, { ...row, is_processed: true });
    }

    return { byNumber, byId, error: null };
  } catch (error) {
    return {
      byNumber: new Map(),
      byId: new Map(),
      error: error.message ?? 'Failed to load AI insights.',
    };
  }
}

export async function fetchIssueInsight(repositoryFullName, issueNumber) {
  const configured = await isSupabaseConfigured();
  if (!configured) {
    return { data: null, error: 'Supabase is not configured for RepoOwl.' };
  }

  const supabase = await getSupabaseClient();

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('issues')
        .select(
          'id, issue_number, is_duplicate, analysis_summary'
        )
        .eq('repo_name', repositoryFullName)
        .eq('issue_number', issueNumber)
        .maybeSingle(),
      FETCH_TIMEOUT_MS
    );

    if (error) {
      throw error;
    }

    return { data: data ? { ...data, is_processed: true } : null, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.message ?? 'Failed to load issue insight.',
    };
  }
}
