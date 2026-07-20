/**
 * RepoOwl Badge Injector — Updated for GitHub's new Primer React list view.
 *
 * Confirmed DOM structure (2024+ GitHub):
 *   UL.ListView-module__ul
 *     LI.ListItem-module__listItem          ← row container
 *       DIV.Title-module__container         ← contains H3 + trailing badges spans
 *         H3                                ← heading
 *           A[data-testid="issue-pr-title-link"]  ← title link (LEFT zone anchor)
 *         SPAN.trailingBadgesSpacer
 *         SPAN.trailingBadgesContainer
 *       DIV.LeadingContent-module__container
 *       DIV.MainContent-module__container
 *       DIV.MetadataContainer-module__container  ← RIGHT zone
 *
 * Badge states:
 *   pending   → right zone, grey, non-clickable
 *   ready     → right zone, blue, clickable
 *   duplicate → left zone (before H3), red, clickable
 */

import { parseIssueLink } from '../lib/githubContext.js';

const BADGE_ATTR = 'data-repoowl-badge';
const PROCESSED_ATTR = 'data-repoowl-processed';

const OBSERVER_ROOT_SELECTORS = [
  'turbo-frame#repo-content-turbo-frame',
  '#js-repo-pjax-container',
  'main',
  'body',
];

/* ─── Badge factory ─────────────────────────────────────────────────── */
export function createBadge(issueNumber, status, duplicateIds = []) {
  const el = document.createElement('span');
  el.setAttribute(BADGE_ATTR, String(issueNumber));

  if (status === 'duplicate') {
    el.className = 'repoowl-badge repoowl-badge--duplicate';
    el.innerHTML = `<span class="repoowl-badge__icon">⚠️</span> Duplicate`;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Duplicate issue. Click for details.`);
  } else if (status === 'duplicate_right') {
    el.className = 'repoowl-badge repoowl-badge--duplicate-right';
    el.innerHTML = `<span class="repoowl-badge__icon">⚠️</span> Duplicate`;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Duplicate issue. Click for details.`);
  } else if (status === 'ready') {
    el.className = 'repoowl-badge repoowl-badge--ready';
    el.innerHTML = `<span class="repoowl-badge__icon">✨</span> AI Insights`;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'View AI-generated insights for this issue');
  } else {
    el.className = 'repoowl-badge repoowl-badge--pending';
    el.innerHTML = `<span class="repoowl-badge__icon">⏳</span> Pending`;
    el.setAttribute('aria-label', 'Analysis pending');
  }

  return el;
}

/* ─── Row detection ─────────────────────────────────────────────────── */
function findRowFromLink(link) {
  // New GitHub (2024+): LI.ListItem-module__listItem
  let el = link;
  for (let i = 0; i < 8; i++) {
    el = el?.parentElement;
    if (!el) break;
    if (el.tagName === 'LI' && el.className.includes('ListItem-module__listItem')) {
      return el;
    }
  }

  // Fallback: old GitHub row selectors
  return (
    link.closest('[id^="issue_"]') ??
    link.closest('li[class*="IssueRow"]') ??
    link.closest('li') ??
    link.closest('[role="row"]') ??
    null
  );
}

/* ─── Injection targets ─────────────────────────────────────────────── */
function findLeftTarget(row) {
  // New GitHub: inside the subtitle timestamp line (e.g. "#4 · YASHK-arch opened 1h ago")
  const createdAtContainer = row.querySelector('[data-testid="created-at"]');
  if (createdAtContainer) {
    return { container: createdAtContainer, mode: 'append' };
  }

  // Fallback: Title container
  const titleContainer = row.querySelector('[data-listview-item-title-container="true"]') ??
                         row.querySelector('[class*="Title-module__container"]');
  if (titleContainer) {
    return { container: titleContainer, mode: 'prepend' };
  }

  // Legacy fallback: before the title link itself
  const titleLink =
    row.querySelector('a[data-testid="issue-pr-title-link"]') ??
    row.querySelector('a[data-hovercard-type="issue"]');

  if (titleLink?.parentElement) {
    return { container: titleLink.parentElement, beforeNode: titleLink, mode: 'before' };
  }

  return null;
}

function findRightTarget(row) {
  // New GitHub: MetadataContainer
  const container = row.querySelector('[class*="MetadataContainer-module__container"]');
  if (container) {
    // Insert exactly between comments and assignees by placing it before the assignees container
    const assignees = container.querySelector('[data-testid="list-row-assignees"]');
    if (assignees) {
      return { container, beforeNode: assignees, mode: 'before' };
    }
    return { container, mode: 'append' };
  }
  
  // Legacy fallback
  return (
    row.querySelector('[class*="text-right"]') ??
    row.querySelector('[class*="IssueRow-module__meta"]') ??
    null
  ) ? { container: row.querySelector('[class*="text-right"]') ?? row.querySelector('[class*="IssueRow-module__meta"]'), mode: 'append' } : null;
}

/* ─── Badge injection ───────────────────────────────────────────────── */
export function injectBadge(row, issueNumber, insight, onBadgeClick) {
  if (row.querySelector(`[${BADGE_ATTR}="${issueNumber}"]`)) return;

  const isPullRequestList = window.location.pathname.includes('/pulls');
  if (isPullRequestList) {
    const repoowlLabel = row.querySelector('a[data-name="repoowl-analyzed"]');
    if (repoowlLabel) {
      repoowlLabel.style.display = 'none'; // hide it natively
      
      const badge = document.createElement('span');
      badge.setAttribute(BADGE_ATTR, String(issueNumber));
      badge.className = 'repoowl-badge repoowl-badge--pr-review';
      badge.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;color:#2da44e;font-weight:600;padding:2px 8px;border:1px solid #2da44e;border-radius:20px;background-color:transparent;font-size:12px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="14" height="14">
          <rect width="500" height="500" fill="#ffffff" rx="100" />
          <g stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
            <path d="M 60 280 L 70 110 L 210 200 L 250 230 L 290 200 L 430 110 L 440 280" fill="none" stroke-width="32" />
            <circle cx="150" cy="300" r="90" fill="#ffffff" stroke-width="32" />
            <circle cx="350" cy="300" r="90" fill="#ffffff" stroke-width="32" />
            <path d="M 170 255 L 120 300 L 170 345" fill="none" stroke-width="32" />
            <path d="M 330 255 L 380 300 L 330 345" fill="none" stroke-width="32" />
            <path d="M 215 320 L 285 320 L 250 385 Z" fill="#000000" stroke-width="16" />
            <line x1="275" y1="415" x2="225" y2="465" stroke-width="32" />
          </g>
        </svg> Reviewed by RepoOwl
      </span>`;
      
      const rightTarget = findRightTarget(row);
      if (rightTarget) {
        if (rightTarget.mode === 'before') {
          rightTarget.container.insertBefore(badge, rightTarget.beforeNode);
        } else {
          rightTarget.container.appendChild(badge);
        }
      }
    }
    return; // Never show pending/ready badges for PRs, we strictly rely on labels.
  }

  const isDuplicate = insight?.is_processed === true && insight?.is_duplicate === true;

  const isReady = insight?.is_processed === true && !isDuplicate;

  if (isDuplicate) {
    const leftTarget = findLeftTarget(row);
    if (leftTarget) {
      const badge = createBadge(issueNumber, 'duplicate');
      badge.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onBadgeClick(issueNumber); });
      badge.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBadgeClick(issueNumber); } });
      
      if (leftTarget.mode === 'append') {
        leftTarget.container.appendChild(badge);
      } else if (leftTarget.mode === 'prepend') {
        leftTarget.container.insertBefore(badge, leftTarget.container.firstChild);
      } else {
        leftTarget.container.insertBefore(badge, leftTarget.beforeNode);
      }
    }
    
    // Inject placeholder duplicate badge on the right so comments box doesn't shift
    const rightBadge = createBadge(issueNumber, 'duplicate_right');
    rightBadge.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onBadgeClick(issueNumber); });
    rightBadge.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBadgeClick(issueNumber); } });
    
    const rightTarget = findRightTarget(row);
    if (rightTarget) {
      if (rightTarget.mode === 'before') {
        rightTarget.container.insertBefore(rightBadge, rightTarget.beforeNode);
      } else {
        rightTarget.container.appendChild(rightBadge);
      }
    }
    
    return; // Done handling duplicates
  }

  // Right zone for ready/pending
  const status = isReady ? 'ready' : 'pending';
  const badge = createBadge(issueNumber, status);

  if (isReady) {
    badge.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onBadgeClick(issueNumber); });
    badge.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBadgeClick(issueNumber); } });
  }

  const rightTarget = findRightTarget(row);
  if (rightTarget) {
    if (rightTarget.mode === 'before') {
      rightTarget.container.insertBefore(badge, rightTarget.beforeNode);
    } else {
      rightTarget.container.appendChild(badge);
    }
  } else {
    // Last resort: append to the trailing badges container (inside title)
    const trailingContainer = row.querySelector('[class*="trailingBadgesContainer"]');
    if (trailingContainer) {
      trailingContainer.appendChild(badge);
    } else {
      row.appendChild(badge);
    }
  }
}

/* ─── Scanner ───────────────────────────────────────────────────────── */
export function scanIssueLinks(repositoryFullName, insightsCache, onBadgeClick) {
  // Primary: new GitHub data-testid — works for both issues AND pull requests
  const titleLinks = document.querySelectorAll('a[data-testid="issue-pr-title-link"]');

  // Fallback: old hovercard or href pattern (issues only)
  const fallbackLinks = document.querySelectorAll(
    'a[data-hovercard-type="issue"], a[data-hovercard-type="pull_request"]'
  );

  const allLinks = titleLinks.length > 0 ? titleLinks : fallbackLinks;

  for (const link of allLinks) {
    const href = link.getAttribute('href') ?? '';
    if (href.includes('/issues/new') || href.includes('/issues?')) continue;

    const parsed = parseIssueLink(href);
    if (!parsed || parsed.fullName !== repositoryFullName) continue;

    const row = findRowFromLink(link);
    if (!row) continue;

    // issueNumber holds either an issue number or a PR number (parseIssueLink returns it the same way)
    const insight = insightsCache.byNumber.get(parsed.issueNumber) ?? null;
    injectBadge(row, parsed.issueNumber, insight, onBadgeClick);
  }
}

/* ─── Observer ──────────────────────────────────────────────────────── */
export function observeIssueList(repositoryFullName, insightsCache, onBadgeClick) {
  const roots = OBSERVER_ROOT_SELECTORS
    .map((s) => document.querySelector(s))
    .filter(Boolean);

  const observedRoot = roots[0] ?? document.body;

  let debounceTimer = null;

  const runScan = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (observedRoot.getAttribute(PROCESSED_ATTR) === 'busy') return;
      observedRoot.setAttribute(PROCESSED_ATTR, 'busy');
      try {
        scanIssueLinks(repositoryFullName, insightsCache, onBadgeClick);
      } finally {
        observedRoot.removeAttribute(PROCESSED_ATTR);
      }
    }, 150);
  };

  runScan();

  const observer = new MutationObserver(runScan);
  observer.observe(observedRoot, { childList: true, subtree: true });

  return observer;
}
