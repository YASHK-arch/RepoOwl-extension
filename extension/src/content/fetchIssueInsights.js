import { getSandboxClient, getHubClient } from '../lib/supabase.js';

const FETCH_TIMEOUT_MS = 8000;

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out.')), timeoutMs);
    }),
  ]);
}

async function fetchFromClient(client, repositoryFullName) {
  if (!client) return [];
  try {
    const { data, error } = await withTimeout(
      client
        .from('issues')
        .select('id, issue_number, is_duplicate, analysis_summary')
        .eq('repo_name', repositoryFullName),
      FETCH_TIMEOUT_MS
    );
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function fetchRepositoryInsights(repositoryFullName) {
  const sandboxClient = await getSandboxClient();
  const hubClient = await getHubClient();

  if (!sandboxClient && !hubClient) {
    return {
      byNumber: new Map(),
      byId: new Map(),
      error: 'RepoOwl is not configured.',
    };
  }

  // Dual-Layer fetch
  const [sandboxData, hubData] = await Promise.all([
    fetchFromClient(sandboxClient, repositoryFullName),
    fetchFromClient(hubClient, repositoryFullName)
  ]);

  const sandboxMap = sandboxData.reduce((acc, issue) => {
    acc[issue.issue_number] = issue;
    return acc;
  }, {});

  const hubMap = hubData.reduce((acc, issue) => {
    acc[issue.issue_number] = issue;
    return acc;
  }, {});

  // The Cascade Merge: Hub overwrites Sandbox
  const finalMergedData = { ...sandboxMap, ...hubMap };

  const byNumber = new Map();
  const byId = new Map();

  for (const row of Object.values(finalMergedData)) {
    // Flag 'is_processed' conceptually for the UI to know it exists
    byNumber.set(row.issue_number, { ...row, is_processed: true });
    byId.set(row.id, { ...row, is_processed: true });
  }

  return { byNumber, byId, error: null };
}

async function fetchSingleFromClient(client, repositoryFullName, issueNumber) {
  if (!client) return null;
  try {
    const { data, error } = await withTimeout(
      client
        .from('issues')
        .select('id, issue_number, is_duplicate, analysis_summary')
        .eq('repo_name', repositoryFullName)
        .eq('issue_number', issueNumber)
        .maybeSingle(),
      FETCH_TIMEOUT_MS
    );
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function fetchIssueInsight(repositoryFullName, issueNumber) {
  const sandboxClient = await getSandboxClient();
  const hubClient = await getHubClient();

  if (!sandboxClient && !hubClient) {
    return { data: null, error: 'RepoOwl is not configured.' };
  }

  const [sandboxData, hubData] = await Promise.all([
    fetchSingleFromClient(sandboxClient, repositoryFullName, issueNumber),
    fetchSingleFromClient(hubClient, repositoryFullName, issueNumber)
  ]);

  // The Cascade Merge for single issue: Hub overrides Sandbox
  const finalData = hubData || sandboxData;

  return { data: finalData ? { ...finalData, is_processed: true } : null, error: null };
}
