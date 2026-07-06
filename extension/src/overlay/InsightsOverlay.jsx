import '../overlay/overlay.css';

function resolveDuplicateLink(repositoryFullName, issueId, insightsById) {
  const match = insightsById.get(issueId);
  if (match?.issue_number) {
    return `https://github.com/${repositoryFullName}/issues/${match.issue_number}`;
  }

  return null;
}

export function InsightsOverlay({
  repositoryFullName,
  issueNumber,
  insight,
  insightsById,
  loading,
  error,
  onClose,
}) {
  const duplicateIds = insight?.duplicate_data?.original_issue_ids ?? [];

  return (
    <>
      <div className="repoowl-overlay-backdrop" onClick={onClose} />
      <div
        className="repoowl-overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="repoowl-overlay-title"
      >
        <header className="repoowl-overlay-header">
          <h2 id="repoowl-overlay-title">
            AI Insights {issueNumber ? `#${issueNumber}` : ''}
          </h2>
          <button
            type="button"
            className="repoowl-overlay-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="repoowl-overlay-body">
          {loading ? (
            <p className="repoowl-overlay-status">Loading insights...</p>
          ) : null}

          {!loading && error ? (
            <p className="repoowl-overlay-status repoowl-overlay-error">{error}</p>
          ) : null}

          {!loading && !error && !insight ? (
            <p className="repoowl-overlay-status">
              No insight record found for this issue yet.
            </p>
          ) : null}

          {!loading && !error && insight && !insight.is_processed ? (
            <p className="repoowl-overlay-status repoowl-overlay-pending">
              This issue is queued for analysis. Check back after the next hourly sync.
            </p>
          ) : null}

          {!loading && !error && insight?.context ? (
            <section className="repoowl-overlay-section">
              <h3>Technical Summary</h3>
              <p>{insight.context}</p>
            </section>
          ) : null}

          {!loading && !error && insight?.duplicate_data ? (
            <section className="repoowl-overlay-section">
              <h3>Duplicate Trace</h3>
              {duplicateIds.length > 0 ? (
                <ul className="repoowl-overlay-duplicate-list">
                  {duplicateIds.map((issueId) => {
                    const href = resolveDuplicateLink(
                      repositoryFullName,
                      issueId,
                      insightsById
                    );

                    if (href) {
                      const label = insightsById.get(issueId)?.issue_number ?? issueId;
                      return (
                        <li key={issueId}>
                          <a href={href} target="_blank" rel="noreferrer">
                            Issue #{label}
                          </a>
                        </li>
                      );
                    }

                    return <li key={issueId}>Issue ID {issueId}</li>;
                  })}
                </ul>
              ) : (
                <p className="repoowl-overlay-status">No duplicate issues detected.</p>
              )}
              {insight.duplicate_data.explanation ? (
                <p>{insight.duplicate_data.explanation}</p>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
