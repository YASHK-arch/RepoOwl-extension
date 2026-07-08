export function parseIssueTemplateFields(body) {
  if (!body) return {};

  const sections = {};
  const regex = /###\s+(.+?)(?:\r?\n)+([\s\S]*?)(?=###\s+|$)/g;
  let match;
  while ((match = regex.exec(body)) !== null) {
    const header = match[1].trim();
    const content = match[2].trim();
    sections[header] = content;
  }

  const getVal = (possibleHeaders) => {
    for (const h of possibleHeaders) {
      if (sections[h]) return sections[h];
    }
    return null;
  };

  return {
    primary_description: getVal([
      "Bug Description", "Feature Description", "What documentation is missing?", 
      "Task Description", "Vulnerability Type", "Current Problem", "Missing Tests"
    ]),
    context_steps: getVal([
      "Steps to Reproduce", "Current Design", "Why is it useful?", 
      "Which page?", "Slow page", "Affected Components"
    ]),
    expected_outcome: getVal([
      "Expected Behavior", "Suggested Improvement", "Proposed Improvement", 
      "Expected Output", "Impact", "Suggested Fix", "Alternatives considered?"
    ]),
    technical_metrics: getVal([
      "CPU Usage", "Memory Usage", "Logs", "Browser", "OS", 
      "Files to modify", "Affected Files"
    ])
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
    primary_description: templateFields.primary_description,
    context_steps: templateFields.context_steps,
    expected_outcome: templateFields.expected_outcome,
    technical_metrics: templateFields.technical_metrics,
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
