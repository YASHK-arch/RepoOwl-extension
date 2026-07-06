import { createBadge } from './badgeInjector.js';

const BADGE_ATTR = 'data-repoowl-badge';
const DETAIL_ROOT_SELECTORS = [
  '#js-repo-pjax-container',
  '.gh-header',
  'main',
];

const TITLE_SELECTORS = [
  '.gh-header-title .js-issue-title',
  'h1 .js-issue-title',
  '[data-testid="issue-title"]',
  '.js-issue-title',
  '.gh-header-title',
];

function findDetailInjectionTarget() {
  for (const selector of TITLE_SELECTORS) {
    const titleNode = document.querySelector(selector);
    if (!titleNode) {
      continue;
    }

    if (titleNode.classList?.contains('js-issue-title') && titleNode.parentElement) {
      return titleNode.parentElement;
    }

    return titleNode;
  }

  return (
    document.querySelector('.gh-header-title') ??
    document.querySelector('.gh-header') ??
    null
  );
}

export function injectIssueDetailBadge(issueNumber, status, onBadgeClick) {
  const existing = document.querySelector(`[${BADGE_ATTR}="${issueNumber}"]`);
  if (existing) {
    return;
  }

  const target = findDetailInjectionTarget();
  if (!target) {
    return;
  }

  const badge = createBadge(issueNumber, status);
  badge.classList.add('repoowl-badge--detail');
  badge.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onBadgeClick(issueNumber);
  });

  target.appendChild(badge);
}

export function observeIssueDetail(
  repositoryFullName,
  issueNumber,
  insightsCache,
  onBadgeClick
) {
  const roots = DETAIL_ROOT_SELECTORS
    .map((selector) => document.querySelector(selector))
    .filter(Boolean);

  const observedRoot = roots[0] ?? document.body;

  const runScan = () => {
    const insight = insightsCache.byNumber.get(issueNumber);
    const status = insight?.is_processed && insight?.context ? 'ready' : 'pending';
    injectIssueDetailBadge(issueNumber, status, onBadgeClick);
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
