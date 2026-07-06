const ISSUE_LIST_PATH = /^\/([^/]+)\/([^/]+)\/issues\/?$/;
const ISSUE_DETAIL_PATH = /^\/([^/]+)\/([^/]+)\/issues\/(\d+)\/?$/;
const ISSUE_LINK_PATH = ISSUE_DETAIL_PATH;

function buildRepository(owner, repo) {
  return {
    owner,
    repo,
    fullName: `${owner}/${repo}`,
  };
}

export function parseGitHubIssuesPage(url = window.location) {
  const detailMatch = url.pathname.match(ISSUE_DETAIL_PATH);
  if (detailMatch) {
    return {
      type: 'detail',
      repository: buildRepository(detailMatch[1], detailMatch[2]),
      issueNumber: Number(detailMatch[3]),
    };
  }

  const listMatch = url.pathname.match(ISSUE_LIST_PATH);
  if (listMatch) {
    return {
      type: 'list',
      repository: buildRepository(listMatch[1], listMatch[2]),
    };
  }

  return null;
}

export function parseRepositoryFromUrl(url = window.location) {
  const page = parseGitHubIssuesPage(url);
  if (!page) {
    return null;
  }

  return page.repository;
}

export function parseIssueLink(href) {
  if (!href) {
    return null;
  }

  let pathname = href;
  if (href.startsWith('http://') || href.startsWith('https://')) {
    try {
      pathname = new URL(href).pathname;
    } catch {
      return null;
    }
  } else if (typeof window !== 'undefined' && window.location?.origin) {
    try {
      pathname = new URL(href, window.location.origin).pathname;
    } catch {
      return null;
    }
  }

  const match = pathname.match(ISSUE_LINK_PATH);
  if (!match) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2],
    issueNumber: Number(match[3]),
    fullName: `${match[1]}/${match[2]}`,
  };
}

export function isIssueListPage(url = window.location) {
  return ISSUE_LIST_PATH.test(url.pathname);
}

export function isIssueDetailPage(url = window.location) {
  return ISSUE_DETAIL_PATH.test(url.pathname);
}
