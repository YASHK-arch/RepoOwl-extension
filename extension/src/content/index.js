import { observeIssueList } from './badgeInjector.js';
import { observeIssueDetail } from './issueDetailInjector.js';
import { fetchRepositoryInsights } from './fetchIssueInsights.js';
import { parseGitHubIssuesPage } from '../lib/githubContext.js';
import { openInsightsOverlay } from '../overlay/OverlayRoot.jsx';

import contentCss from './content.css?inline';

const STORAGE_KEY = 'trackedRepositories';
const DEFAULT_REPO = 'YASHK-arch/RepoOwl-extension';

function injectContentStyles() {
  if (document.getElementById('repoowl-content-styles')) return;
  const style = document.createElement('style');
  style.id = 'repoowl-content-styles';
  style.textContent = contentCss;
  document.head.appendChild(style);
}

function showUntrackedWarning() {
  // Only inject once
  if (document.getElementById('repoowl-untracked-warning')) return;

  const container = document.querySelector('turbo-frame#repo-content-turbo-frame') || document.querySelector('#js-repo-pjax-container') || document.querySelector('main');
  if (!container) return;

  const warningDiv = document.createElement('div');
  warningDiv.id = 'repoowl-untracked-warning';
  warningDiv.className = 'repoowl-untracked-warning';
  warningDiv.innerHTML = `
    <div style="padding: 16px; margin: 16px 0; background-color: #fff8c5; border: 1px solid #d4a72c; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <strong>RepoOwl:</strong> This repository is not tracked. We won't analyze issues here.
      </div>
      <button class="repoowl-settings-btn" style="background-color: #2da44e; color: white; border: none; padding: 5px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
        Configure Repository
      </button>
    </div>
  `;

  const btn = warningDiv.querySelector('.repoowl-settings-btn');
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'open_settings' });
  });

  container.insertBefore(warningDiv, container.firstChild);
}

async function bootstrap() {
  const page = parseGitHubIssuesPage();
  if (!page) return;

  injectContentStyles();

  // State 1: checking_storage
  let isTracked = false;
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const result = await new Promise(resolve => chrome.storage.local.get([STORAGE_KEY], resolve));
    const repos = result[STORAGE_KEY] || [DEFAULT_REPO];
    isTracked = repos.includes(page.repository.fullName);
  } else {
    isTracked = true; // Fallback outside extension context
  }

  // State 2: untracked
  if (!isTracked) {
    showUntrackedWarning();
    return;
  }

  // State 3: fetching_metrics
  // Add a loading indicator? (Optional, but could be added here if desired)
  const insightsCache = await fetchRepositoryInsights(page.repository.fullName);

  if (insightsCache.error) {
    console.warn('[RepoOwl]', insightsCache.error);
  }

  const handleBadgeClick = (issueNumber) => {
    const initialInsight = insightsCache.byNumber.get(issueNumber) ?? null;
    openInsightsOverlay({
      repositoryFullName: page.repository.fullName,
      issueNumber,
      initialInsight,
      insightsById: insightsCache.byId,
    });
  };

  // State 4: ready
  if (page.type === 'list') {
    observeIssueList(page.repository.fullName, insightsCache, handleBadgeClick);
    return;
  }

  observeIssueDetail(
    page.repository.fullName,
    page.issueNumber,
    insightsCache,
    handleBadgeClick
  );
}

// Run immediately
bootstrap().catch((err) => console.warn('[RepoOwl] bootstrap error:', err));

// Also re-run on GitHub's Turbo / pjax navigation events
document.addEventListener('turbo:load', () => {
  bootstrap().catch((err) => console.warn('[RepoOwl] turbo:load bootstrap error:', err));
});

document.addEventListener('pjax:end', () => {
  bootstrap().catch((err) => console.warn('[RepoOwl] pjax:end bootstrap error:', err));
});
