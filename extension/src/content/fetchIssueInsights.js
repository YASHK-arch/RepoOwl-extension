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
  if (!isSupabaseConfigured()) {
    return {
      byNumber: new Map(),
      byId: new Map(),
      error: 'Supabase is not configured for RepoOwl.',
    };
  }

  const supabase = getSupabaseClient();

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('issues')
        .select(
          'issue_id, issue_number, title, context, duplicate_data, is_processed'
        )
        .eq('repository_full_name', repositoryFullName),
      FETCH_TIMEOUT_MS
    );

    if (error) {
      throw error;
    }

    const byNumber = new Map();
    const byId = new Map();

    for (const row of data ?? []) {
      byNumber.set(row.issue_number, row);
      byId.set(row.issue_id, row);
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
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase is not configured for RepoOwl.' };
  }

  const supabase = getSupabaseClient();

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('issues')
        .select(
          'issue_id, issue_number, title, context, duplicate_data, is_processed'
        )
        .eq('repository_full_name', repositoryFullName)
        .eq('issue_number', issueNumber)
        .maybeSingle(),
      FETCH_TIMEOUT_MS
    );

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.message ?? 'Failed to load issue insight.',
    };
  }
}
