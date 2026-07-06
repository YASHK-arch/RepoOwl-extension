const BUG_DESCRIPTION_HEADER = '### Bug Description';
const STEPS_HEADER = '### Steps to Reproduce';
const EXPECTED_BEHAVIOR_HEADER = '### Expected Behavior';

function extractSection(body, header, nextHeaders) {
  if (!body) {
    return null;
  }

  const startIndex = body.indexOf(header);
  if (startIndex === -1) {
    return null;
  }

  const contentStart = startIndex + header.length;
  let endIndex = body.length;

  for (const nextHeader of nextHeaders) {
    const nextIndex = body.indexOf(nextHeader, contentStart);
    if (nextIndex !== -1 && nextIndex < endIndex) {
      endIndex = nextIndex;
    }
  }

  const value = body.slice(contentStart, endIndex).trim();
  return value || null;
}

export function parseIssueTemplateFields(body) {
  return {
    bug_description: extractSection(body, BUG_DESCRIPTION_HEADER, [
      STEPS_HEADER,
      EXPECTED_BEHAVIOR_HEADER,
    ]),
    steps_to_reproduce: extractSection(body, STEPS_HEADER, [
      EXPECTED_BEHAVIOR_HEADER,
    ]),
    expected_behavior: extractSection(body, EXPECTED_BEHAVIOR_HEADER, []),
  };
}

export async function fetchRepositoryIssues(owner, repo, token) {
  const issues = [];
  let page = 1;

  while (true) {
    const url = new URL(`https://api.github.com/repos/${owner}/${repo}/issues`);
    url.searchParams.set('state', 'all');
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${body}`);
    }

    const batch = await response.json();
    const issueRows = batch.filter((item) => !item.pull_request);
    issues.push(...issueRows);

    if (batch.length < 100) {
      break;
    }

    page += 1;
  }

  return issues;
}

export function mapGitHubIssueToRow(issue, repositoryFullName) {
  const templateFields = parseIssueTemplateFields(issue.body ?? '');

  return {
    issue_id: issue.id,
    issue_number: issue.number,
    repository_full_name: repositoryFullName,
    title: issue.title,
    bug_description: templateFields.bug_description,
    steps_to_reproduce: templateFields.steps_to_reproduce,
    expected_behavior: templateFields.expected_behavior,
  };
}

export async function upsertIssues(supabase, rows) {
  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from('issues').upsert(rows, {
    onConflict: 'issue_id',
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(`Failed to upsert issues: ${error.message}`);
  }
}

export async function syncGitHubIssues(supabase, repositoryFullName, token) {
  const [owner, repo] = repositoryFullName.split('/');
  if (!owner || !repo) {
    throw new Error(`Invalid repository identifier: ${repositoryFullName}`);
  }

  const githubIssues = await fetchRepositoryIssues(owner, repo, token);
  const rows = githubIssues.map((issue) =>
    mapGitHubIssueToRow(issue, repositoryFullName)
  );

  await upsertIssues(supabase, rows);
  console.log(`Synced ${rows.length} issue(s) from GitHub.`);
}
