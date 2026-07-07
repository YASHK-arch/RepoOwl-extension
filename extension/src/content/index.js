import { observeIssueList } from './badgeInjector.js';
import { observeIssueDetail } from './issueDetailInjector.js';
import { fetchRepositoryInsights } from './fetchIssueInsights.js';
import { parseGitHubIssuesPage } from '../lib/githubContext.js';
import { openInsightsOverlay } from '../overlay/OverlayRoot.jsx';

import contentCss from './content.css?inline';

function injectContentStyles() {
  if (document.getElementById('repoowl-content-styles')) return;
  const style = document.createElement('style');
  style.id = 'repoowl-content-styles';
  style.textContent = contentCss;
  document.head.appendChild(style);
}

async function bootstrap() {
  const page = parseGitHubIssuesPage();
  if (!page) return;

  injectContentStyles();

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
