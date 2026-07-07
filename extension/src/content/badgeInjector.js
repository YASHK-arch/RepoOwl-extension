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
    const ids = duplicateIds.slice(0, 2).join(', #');
    el.className = 'repoowl-badge repoowl-badge--duplicate';
    el.innerHTML = `<span class="repoowl-badge__icon">⚠️</span> Dup #${ids}`;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Duplicate of issue #${ids}. Click for details.`);
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
  // New GitHub: Title container
  const titleContainer = row.querySelector('[data-listview-item-title-container="true"]') ??
                         row.querySelector('[class*="Title-module__container"]');
  if (titleContainer) {
    return { container: titleContainer, mode: 'prepend' };
  }

  // Fallback: before the title link itself
  const titleLink =
    row.querySelector('a[data-testid="issue-pr-title-link"]') ??
    row.querySelector('a[data-hovercard-type="issue"]');

  if (titleLink?.parentElement) {
    return { container: titleLink.parentElement, beforeNode: titleLink, mode: 'before' };
  }

  return null;
}

function findRightTarget(row) {
  // New GitHub: MetadataContainer at the end of the LI
  return (
    row.querySelector('[class*="MetadataContainer-module__container"]') ??
    row.querySelector('[class*="text-right"]') ??
    row.querySelector('[class*="IssueRow-module__meta"]') ??
    null
  );
}

/* ─── Badge injection ───────────────────────────────────────────────── */
export function injectBadge(row, issueNumber, insight, onBadgeClick) {
  if (row.querySelector(`[${BADGE_ATTR}="${issueNumber}"]`)) return;

  const isDuplicate =
    insight?.is_processed === true &&
    Array.isArray(insight?.duplicate_data?.original_issue_ids) &&
    insight.duplicate_data.original_issue_ids.length > 0;

  const isReady = insight?.is_processed === true && !isDuplicate;

  if (isDuplicate) {
    const leftTarget = findLeftTarget(row);
    if (leftTarget) {
      const badge = createBadge(issueNumber, 'duplicate', insight.duplicate_data.original_issue_ids);
      badge.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onBadgeClick(issueNumber); });
      badge.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBadgeClick(issueNumber); } });
      
      if (leftTarget.mode === 'prepend') {
        leftTarget.container.insertBefore(badge, leftTarget.container.firstChild);
      } else {
        leftTarget.container.insertBefore(badge, leftTarget.beforeNode);
      }
    }
    return; // Duplicate = no right badge
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
    rightTarget.appendChild(badge);
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
  // Primary: new GitHub data-testid
  const titleLinks = document.querySelectorAll('a[data-testid="issue-pr-title-link"]');

  // Fallback: old hovercard or href pattern
  const fallbackLinks = document.querySelectorAll(
    'a[data-hovercard-type="issue"], a[href*="/issues/"]'
  );

  const allLinks = titleLinks.length > 0 ? titleLinks : fallbackLinks;

  for (const link of allLinks) {
    const href = link.getAttribute('href') ?? '';
    if (href.includes('/issues/new') || href.includes('/issues?')) continue;

    const parsed = parseIssueLink(href);
    if (!parsed || parsed.fullName !== repositoryFullName) continue;

    const row = findRowFromLink(link);
    if (!row) continue;

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
