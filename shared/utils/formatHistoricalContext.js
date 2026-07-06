/**
 * Formats processed historical issues into the prompt window block
 * injected at {{repository.historical_context_log}}.
 */
export function formatHistoricalContext(historicalIssues) {
  if (!historicalIssues || historicalIssues.length === 0) {
    return 'No historical issues available for comparison.';
  }

  return historicalIssues
    .map((issue) => {
      const summary = issue.context?.trim() || 'No technical summary available yet.';
      return `[Issue ID: #${issue.issue_id}]
Title: ${issue.title}
Technical Summary: ${summary}`;
    })
    .join('\n\n---\n\n');
}
