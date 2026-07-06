import { observeIssueList } from './badgeInjector.js';
import { observeIssueDetail } from './issueDetailInjector.js';
import { fetchRepositoryInsights } from './fetchIssueInsights.js';
import { parseGitHubIssuesPage } from '../lib/githubContext.js';
import { openInsightsOverlay } from '../overlay/OverlayRoot.jsx';

import contentCss from './content.css?inline';

function injectContentStyles() {
  if (document.getElementById('repoowl-content-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'repoowl-content-styles';
  style.textContent = contentCss;
  document.head.appendChild(style);
}

async function bootstrap() {
  const page = parseGitHubIssuesPage();
  if (!page) {
    return;
  }

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

bootstrap().catch((error) => {
  console.warn('[RepoOwl] Failed to initialize content script:', error);
});
