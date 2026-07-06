import { parseIssueLink } from '../lib/githubContext.js';

const BADGE_ATTR = 'data-repoowl-badge';
const PROCESSED_ATTR = 'data-repoowl-processed';
const OBSERVER_ROOT_SELECTORS = ['#js-repo-pjax-container', 'main', '#react-issue-list'];

export function createBadge(issueNumber, status) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `repoowl-badge repoowl-badge--${status}`;
  button.setAttribute(BADGE_ATTR, String(issueNumber));
  button.setAttribute('aria-label', 'Open RepoOwl AI insights');
  button.textContent = status === 'ready' ? 'AI Insights' : 'Pending';
  return button;
}

function findIssueRowAnchor(link) {
  return (
    link.closest('[id^="issue_"]') ??
    link.closest('li') ??
    link.closest('[role="row"]') ??
    link.closest('div[class*="IssueRow"]') ??
    link.parentElement
  );
}

function resolveInjectionTarget(rowContainer, link) {
  const titleNode =
    rowContainer.querySelector('a[id^="issue_"]') ??
    rowContainer.querySelector('a[data-hovercard-type="issue"]') ??
    link;

  if (titleNode?.parentElement) {
    return titleNode.parentElement;
  }

  return rowContainer;
}

export function injectBadge(link, issueNumber, status, onBadgeClick) {
  const existing = document.querySelector(`[${BADGE_ATTR}="${issueNumber}"]`);
  if (existing) {
    return;
  }

  const rowContainer = findIssueRowAnchor(link);
  if (!rowContainer) {
    return;
  }

  const target = resolveInjectionTarget(rowContainer, link);
  const badge = createBadge(issueNumber, status);
  badge.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onBadgeClick(issueNumber);
  });

  target.appendChild(badge);
}

export function scanIssueLinks(repositoryFullName, insightsCache, onBadgeClick) {
  const links = document.querySelectorAll(
    'a[data-hovercard-type="issue"], a[id^="issue_"], a[href*="/issues/"]'
  );

  for (const link of links) {
    const parsed = parseIssueLinkFromElement(link, repositoryFullName);
    if (!parsed) {
      continue;
    }

    const insight = insightsCache.byNumber.get(parsed.issueNumber);
    const status = insight?.is_processed && insight?.context ? 'ready' : 'pending';
    injectBadge(link, parsed.issueNumber, status, onBadgeClick);
  }
}

function parseIssueLinkFromElement(link, expectedRepositoryFullName) {
  const href = link.getAttribute('href');
  if (!href || href.includes('/issues/new') || href.includes('/issues?q=')) {
    return null;
  }

  const parsed = parseIssueLink(href);
  if (!parsed || parsed.fullName !== expectedRepositoryFullName) {
    return null;
  }

  return parsed;
}

export function observeIssueList(repositoryFullName, insightsCache, onBadgeClick) {
  const roots = OBSERVER_ROOT_SELECTORS
    .map((selector) => document.querySelector(selector))
    .filter(Boolean);

  const observedRoot = roots[0] ?? document.body;

  const runScan = () => {
    if (observedRoot.getAttribute(PROCESSED_ATTR) === 'busy') {
      return;
    }

    observedRoot.setAttribute(PROCESSED_ATTR, 'busy');
    try {
      scanIssueLinks(repositoryFullName, insightsCache, onBadgeClick);
    } finally {
      observedRoot.removeAttribute(PROCESSED_ATTR);
    }
  };

  runScan();

  const observer = new MutationObserver(() => {
    runScan();
  });

  observer.observe(observedRoot, {
    childList: true,
    subtree: true,
  });

  return observer;
}
