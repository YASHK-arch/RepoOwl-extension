import '../overlay/overlay.css';

const REPO_URL = 'https://github.com/YASHK-arch/RepoOwl-extension';

function resolveDuplicateIssueNumber(issueId, insightsById) {
  const match = insightsById?.get(issueId);
  return match?.issue_number ?? null;
}

function resolveDuplicateHref(repositoryFullName, issueId, insightsById) {
  const num = resolveDuplicateIssueNumber(issueId, insightsById);
  if (num) return `https://github.com/${repositoryFullName}/issues/${num}`;
  return null;
}

function getStatePill(insight) {
  if (!insight) return null;
  const isDuplicate =
    insight.is_processed &&
    Array.isArray(insight.duplicate_data?.original_issue_ids) &&
    insight.duplicate_data.original_issue_ids.length > 0;

  if (isDuplicate) {
    return { cls: 'repoowl-state-pill--duplicate', icon: '⚠️', label: 'Duplicate' };
  }
  if (insight.is_processed) {
    return { cls: 'repoowl-state-pill--ready', icon: '✨', label: 'AI Insights' };
  }
  return { cls: 'repoowl-state-pill--pending', icon: '⏳', label: 'Pending' };
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
  const isDuplicate = insight?.is_processed && duplicateIds.length > 0;
  const isReady = insight?.is_processed && !isDuplicate;
  const statePill = getStatePill(insight);

  const headerIcon = isDuplicate ? '⚠️' : isReady ? '✨' : '⏳';
  const headerTitle = isDuplicate
    ? `Duplicate Detected`
    : isReady
    ? `AI Insights`
    : `Analysis Pending`;

  return (
    <>
      {/* Backdrop */}
      <div className="repoowl-overlay-backdrop" onClick={onClose} />

      {/* Drawer panel */}
      <div
        className="repoowl-overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="repoowl-overlay-title"
      >
        {/* Header */}
        <header className="repoowl-overlay-header">
          <span className="repoowl-overlay-header-icon">{headerIcon}</span>
          <div className="repoowl-overlay-header-text">
            <h2 id="repoowl-overlay-title">{headerTitle}</h2>
            <p className="repoowl-overlay-issue-ref">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
              </svg>
              Issue #{issueNumber} · {repositoryFullName}
            </p>
            {statePill && (
              <span className={`repoowl-state-pill ${statePill.cls}`}>
                {statePill.icon} {statePill.label}
              </span>
            )}
          </div>
          <button
            type="button"
            className="repoowl-overlay-close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        {/* Body */}
        <div className="repoowl-overlay-body">

          {/* Loading skeleton */}
          {loading && (
            <div className="repoowl-overlay-section">
              <div className="repoowl-skeleton repoowl-skeleton--short" />
              <div className="repoowl-skeleton repoowl-skeleton--medium" />
              <div className="repoowl-skeleton" />
              <div className="repoowl-skeleton repoowl-skeleton--medium" />
              <div className="repoowl-skeleton repoowl-skeleton--short" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <p className="repoowl-overlay-status repoowl-overlay-error">
              ⚠️ {error}
            </p>
          )}

          {/* No data */}
          {!loading && !error && !insight && (
            <p className="repoowl-overlay-status">
              🔍 No insight record found for this issue yet.
            </p>
          )}

          {/* Pending */}
          {!loading && !error && insight && !insight.is_processed && (
            <p className="repoowl-overlay-status repoowl-overlay-pending">
              ⏳ This issue is queued for analysis. Run the worker to process it.
            </p>
          )}

          {/* AI Summary */}
          {!loading && !error && insight?.context && (
            <div className="repoowl-overlay-section">
              <div className="repoowl-overlay-section-header">
                <span className="repoowl-overlay-section-icon">🧠</span>
                <h3>Technical Summary</h3>
              </div>
              <p>{insight.context}</p>
            </div>
          )}

          {/* Duplicate trace */}
          {!loading && !error && insight?.is_processed && isDuplicate && (
            <div className="repoowl-overlay-section">
              <div className="repoowl-overlay-section-header">
                <span className="repoowl-overlay-section-icon">🔗</span>
                <h3>Duplicate Trace</h3>
              </div>

              <ul className="repoowl-overlay-duplicate-list">
                {duplicateIds.map((issueId) => {
                  const href = resolveDuplicateHref(repositoryFullName, issueId, insightsById);
                  const num = resolveDuplicateIssueNumber(issueId, insightsById) ?? issueId;
                  return (
                    <li className="repoowl-overlay-duplicate-item" key={issueId}>
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
                          </svg>
                          Original Issue #{num} ↗
                        </a>
                      ) : (
                        <span style={{ color: '#8b949e', fontSize: 13 }}>Issue ID {issueId}</span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {insight.duplicate_data?.explanation && (
                <div className="repoowl-overlay-explanation">
                  {insight.duplicate_data.explanation}
                </div>
              )}
            </div>
          )}

          {/* No duplicate */}
          {!loading && !error && insight?.is_processed && !isDuplicate && insight?.duplicate_data && (
            <div className="repoowl-overlay-section">
              <div className="repoowl-overlay-section-header">
                <span className="repoowl-overlay-section-icon">✅</span>
                <h3>Duplicate Check</h3>
              </div>
              <p style={{ color: '#3fb950' }}>No duplicate issues detected.</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="repoowl-overlay-footer">
          <span className="repoowl-overlay-footer-brand">
            Powered by RepoOwl · Groq LLaMA 3.3
          </span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="repoowl-overlay-footer-link"
          >
            GitHub ↗
          </a>
        </footer>
      </div>
    </>
  );
}
