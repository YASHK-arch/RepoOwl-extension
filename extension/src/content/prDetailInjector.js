export function injectPRBadges() {
  const headerTitle = document.querySelector('.gh-header-title');
  if (!headerTitle || headerTitle.querySelector('.repoowl-pr-badge')) return;

  let slopStatus = 'Pending / Running';
  let badgeColor = '#d0d7de'; // Gray for pending
  let icon = 'ℹ️';

  // Search comments for RepoOwl PR Analysis
  const comments = document.querySelectorAll('.timeline-comment');
  for (const comment of comments) {
    const body = comment.querySelector('.comment-body')?.textContent;
    
    if (body && body.includes('RepoOwl PR Analysis')) {
      if (body.includes('🔴') || body.includes('Slop Detected')) {
        slopStatus = 'AI Slop Detected';
        badgeColor = '#cf222e'; // Red
        icon = '🔴';
      } else if (body.includes('🟢') || body.includes('Code Matches Description')) {
        slopStatus = 'Code Matches Description';
        badgeColor = '#2da44e'; // Green
        icon = '🟢';
      }
      break;
    }
  }

  const badge = document.createElement('span');
  badge.className = 'repoowl-pr-badge';
  badge.style.cssText = `
    display: inline-flex;
    align-items: center;
    margin-left: 12px;
    padding: 4px 10px;
    font-size: 14px;
    font-weight: 600;
    color: ${badgeColor};
    border: 1px solid ${badgeColor};
    border-radius: 20px;
    vertical-align: middle;
    background-color: transparent;
  `;
  badge.innerHTML = `${icon} RepoOwl: ${slopStatus}`;

  const prNumberSpan = headerTitle.querySelector('.gh-header-number');
  if (prNumberSpan) {
    prNumberSpan.insertAdjacentElement('afterend', badge);
  } else {
    headerTitle.appendChild(badge);
  }
}
