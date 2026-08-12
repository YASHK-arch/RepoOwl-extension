import '../overlay/overlay.css';

const REPO_URL = 'https://github.com/YASHK-arch/RepoOwl-extension';

// ── Keyword highlighting ─────────────────────────────────────────────────────
const HIGHLIGHT_KEYWORDS = [
  { pattern: /\b(breaking change|breaking)\b/gi, cls: 'ro-hl-danger' },
  { pattern: /\b(security|vulnerability|CVE)\b/gi, cls: 'ro-hl-danger' },
  { pattern: /\b(performance|latency|timeout|slow)\b/gi, cls: 'ro-hl-warn' },
  { pattern: /\b(refactor|cleanup|migrate|migration)\b/gi, cls: 'ro-hl-info' },
  { pattern: /\b(bug|error|crash|exception|failure)\b/gi, cls: 'ro-hl-danger' },
  { pattern: /\b(feature|enhancement|improvement)\b/gi, cls: 'ro-hl-success' },
  { pattern: /\b(duplicate of|closes|fixes|resolves)\b/gi, cls: 'ro-hl-warn' },
];

/**
 * Converts a plain analysis_summary string into rich HTML with:
 * - `code` backtick spans highlighted
 * - #123 issue references as clickable chips
 * - keyword phrases colour-coded
 */
function renderSummaryHtml(text, repositoryFullName) {
  if (!text) return '';

  // 1. Escape HTML entities first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Inline code: `something`
  html = html.replace(/`([^`]+)`/g, '<code class="ro-inline-code">$1</code>');

  // 3. File paths (heuristic: contains / or . without spaces)
  html = html.replace(
    /(?<![`\w])((?:[\w.-]+\/)+[\w.-]+\.(js|jsx|ts|tsx|css|json|md|sql|py|go|rs|sh|yml|yaml))(?![\w`])/g,
    '<code class="ro-filepath">$1</code>'
  );

  // 4. Issue references #NNN
  html = html.replace(
    /#(\d+)/g,
    `<a href="https://github.com/${repositoryFullName}/issues/$1" target="_blank" rel="noreferrer" class="ro-issue-chip">#$1</a>`
  );

  // 5. Keyword highlights (skip inside existing tags)
  for (const { pattern, cls } of HIGHLIGHT_KEYWORDS) {
    html = html.replace(pattern, (match) => {
      // Avoid double-wrapping inside HTML tags
      return `<mark class="ro-keyword ${cls}">${match}</mark>`;
    });
  }

  // 6. Line breaks
  html = html.replace(/\n/g, '<br>');

  return html;
}

function getStatePill(insight) {
  if (!insight) return null;
  const isDuplicate = insight.is_processed && insight.is_duplicate === true;

  if (isDuplicate) {
    return { cls: 'repoowl-state-pill--duplicate', icon: '⚠️', label: 'Duplicate' };
  }
  if (insight.is_processed) {
    return { cls: 'repoowl-state-pill--ready', icon: '✨', label: 'AI Insights' };
  }
  return { cls: 'repoowl-state-pill--pending', icon: '⏳', label: 'Pending' };
}

// ── File icon helper ─────────────────────────────────────────────────────────
function getFileIcon(path) {
  const ext = path.split('.').pop()?.toLowerCase();
  const iconMap = {
    js: '🟨', jsx: '⚛️', ts: '🔷', tsx: '⚛️',
    css: '🎨', json: '📋', md: '📄', sql: '🗄️',
    py: '🐍', go: '🔵', rs: '🦀', sh: '⚙️',
    yml: '⚙️', yaml: '⚙️', html: '🌐', vue: '💚',
  };
  return iconMap[ext] || '📁';
}

export function InsightsOverlay({
  repositoryFullName,
  issueNumber,
  insight,
  loading,
  error,
  onClose,
}) {
  const isDuplicate = insight?.is_processed && insight?.is_duplicate === true;
  const isReady = insight?.is_processed && !isDuplicate;
  const statePill = getStatePill(insight);

  const headerIcon = isDuplicate ? '⚠️' : isReady ? '✨' : '⏳';
  const headerTitle = isDuplicate
    ? `Duplicate Detected`
    : isReady
    ? `AI Insights`
    : `Analysis Pending`;

  // Parse affected_files — handle both array and JSON string formats
  let affectedFiles = [];
  if (insight?.affected_files) {
    if (Array.isArray(insight.affected_files)) {
      affectedFiles = insight.affected_files;
    } else if (typeof insight.affected_files === 'string') {
      try { affectedFiles = JSON.parse(insight.affected_files); } catch { affectedFiles = []; }
    }
  }

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

          {/* AI Summary — rich highlighted rendering */}
          {!loading && !error && insight?.analysis_summary && (
            <div className="repoowl-overlay-section">
              <div className="repoowl-overlay-section-header">
                <span className="repoowl-overlay-section-icon">🧠</span>
                <h3>Technical Summary</h3>
              </div>
              <p
                className="ro-summary-rich"
                dangerouslySetInnerHTML={{
                  __html: renderSummaryHtml(insight.analysis_summary, repositoryFullName)
                }}
              />
            </div>
          )}

          {/* Affected Files */}
          {!loading && !error && affectedFiles.length > 0 && (
            <div className="repoowl-overlay-section">
              <div className="repoowl-overlay-section-header">
                <span className="repoowl-overlay-section-icon">📂</span>
                <h3>Predicted Affected Files</h3>
                <span className="ro-files-count">{affectedFiles.length}</span>
              </div>
              <ul className="ro-file-list">
                {affectedFiles.map((filePath, idx) => (
                  <li key={idx} className="ro-file-item">
                    <span className="ro-file-icon">{getFileIcon(filePath)}</span>
                    <code className="ro-file-path">{filePath}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Duplicate trace */}
          {!loading && !error && insight?.is_processed && isDuplicate && (
            <div className="repoowl-overlay-section">
              <div className="repoowl-overlay-section-header">
                <span className="repoowl-overlay-section-icon">🔗</span>
                <h3>Duplicate Trace</h3>
              </div>
              <div className="repoowl-overlay-explanation">
                This issue has been flagged as a duplicate by RepoOwl AI. See the Technical Summary above for the specific matching issue reference.
              </div>
            </div>
          )}

          {/* No duplicate */}
          {!loading && !error && insight?.is_processed && !isDuplicate && (
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
