export function injectPRAnalysis(analysis) {
  if (document.getElementById('repoowl-pr-analysis')) return;

  // We want to insert this at the top of the Conversation tab.
  // The standard GitHub PR conversation tab has a timeline or a discussion bucket.
  const container = document.querySelector('.pull-discussion-timeline') || document.querySelector('#discussion_bucket');
  if (!container) return;

  const dashboard = document.createElement('div');
  dashboard.id = 'repoowl-pr-analysis';
  dashboard.style.cssText = `
    margin-bottom: 24px;
    padding: 16px;
    background-color: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
  `;

  // 1. Slop Badge
  const isAccurate = analysis.slop_detection?.is_accurate;
  const slopColor = isAccurate ? '#2da44e' : '#cf222e';
  const slopText = isAccurate ? '🟢 Code Matches Description' : '🔴 ⚠️ AI Slop Detected: Description Mismatch';
  
  const headerHtml = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 600;">RepoOwl PR Triage</h3>
      <span style="font-weight: 600; color: ${slopColor}; padding: 4px 12px; border: 1px solid ${slopColor}; border-radius: 20px; font-size: 14px;">
        ${slopText}
      </span>
    </div>
  `;

  // 2. Issue Resolution
  const solvesIssue = analysis.issue_resolution?.solves_linked_issue;
  const resColor = solvesIssue ? '#2da44e' : '#cf222e';
  const resolutionHtml = analysis.issue_resolution ? `
    <div style="margin-bottom: 16px;">
      <h4 style="margin: 0 0 4px 0; font-size: 14px;">Issue Resolution Status</h4>
      <p style="margin: 0; font-size: 14px; color: #57606a;">
        <strong style="color: ${resColor}">${solvesIssue ? '✓ Solves Issue' : '✗ Does Not Solve Issue'}</strong> - 
        ${analysis.issue_resolution.explanation}
      </p>
    </div>
  ` : '';

  // 3. Domain Impact Chart
  const domains = analysis.domain_impact || [];
  let chartBars = '';
  let chartLegend = '';
  const colors = ['#0969da', '#2da44e', '#bf3989', '#d4a72c', '#8250df'];
  
  domains.forEach((d, i) => {
    const color = colors[i % colors.length];
    chartBars += `<div style="width: ${d.percentage}%; background-color: ${color}; height: 100%; float: left;" title="${d.domain} (${d.percentage}%)"></div>`;
    chartLegend += `
      <div style="display: flex; align-items: center; margin-right: 16px; font-size: 12px;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; margin-right: 4px; border-radius: 2px;"></span>
        ${d.domain} (${d.percentage}%)
      </div>
    `;
  });

  const domainHtml = domains.length > 0 ? `
    <div style="margin-bottom: 16px;">
      <h4 style="margin: 0 0 8px 0; font-size: 14px;">Domain Impact</h4>
      <div style="width: 100%; height: 12px; border-radius: 6px; overflow: hidden; background-color: #ebecf0; margin-bottom: 8px;">
        ${chartBars}
      </div>
      <div style="display: flex; flex-wrap: wrap;">
        ${chartLegend}
      </div>
    </div>
  ` : '';

  // 4. Warning (if slop detected)
  const warningHtml = !isAccurate && analysis.slop_detection?.warning ? `
    <div style="margin-top: 16px; padding: 12px; background-color: #ffebe9; border: 1px solid #ff8182; border-radius: 6px; font-size: 14px; color: #cf222e;">
      <strong>Analysis Warning:</strong> ${analysis.slop_detection.warning}
    </div>
  ` : '';

  dashboard.innerHTML = headerHtml + resolutionHtml + domainHtml + warningHtml;
  
  // Insert at top
  container.insertBefore(dashboard, container.firstChild);

  // 5. Toast for Auto-labels
  if (analysis.recommended_labels && analysis.recommended_labels.length > 0) {
    showToast(`RepoOwl auto-applied labels: ${analysis.recommended_labels.join(', ')}`);
  }
}

function showToast(message) {
  if (document.getElementById('repoowl-toast')) return;
  const toast = document.createElement('div');
  toast.id = 'repoowl-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background-color: #24292f;
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: fadeInOut 5s forwards;
  `;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}
