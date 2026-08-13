/**
 * RepoOwl Sidebar Card — standalone content script (no imports / no React).
 * Injected on every github.com/owner/repo page.
 * Credentials are baked in at build time by Vite.
 *
 * GitHub's new Primer React layout uses:
 *   - div[data-component="PageLayout.Pane"] for the right sidebar
 *   - div.BorderGrid for the rows container inside
 *   - div.BorderGrid-row for each section (first = About)
 */

const CARD_ID = 'repoowl-sidebar-card';

async function getKeys() {
  let supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
  let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  let githubToken = '';
  
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const result = await new Promise(r => chrome.storage.local.get(['repoOwlConfig'], r));
    if (result.repoOwlConfig?.supabaseUrl && result.repoOwlConfig?.supabaseAnonKey) {
      supabaseUrl = result.repoOwlConfig.supabaseUrl;
      supabaseAnonKey = result.repoOwlConfig.supabaseAnonKey;
    }
    if (result.repoOwlConfig?.githubToken) {
      githubToken = result.repoOwlConfig.githubToken;
    }
  }
  return { supabaseUrl, supabaseAnonKey, githubToken };
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const CARD_CSS = `
#repoowl-sidebar-card {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid var(--color-border-default, #d0d7de);
  border-radius: 6px;
  background: var(--color-canvas-default, #ffffff);
}
.ro-sc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.ro-sc-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-fg-default, #1f2328);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ro-sc-title svg {
  color: var(--color-accent-fg, #0969da);
  flex-shrink: 0;
}
.ro-sc-badge-active {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 20px;
  background: var(--color-success-subtle, #dafbe1);
  color: var(--color-success-fg, #1a7f37);
  border: 1px solid var(--color-success-muted, #a7d7b0);
}
.ro-sc-badge-pending {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 20px;
  background: var(--color-attention-subtle, #fff8c5);
  color: var(--color-attention-fg, #9a6700);
  border: 1px solid var(--color-attention-muted, #d4a72c);
}
.ro-sc-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.ro-sc-stat {
  flex: 1;
  background: var(--color-canvas-subtle, #f6f8fa);
  border: 1px solid var(--color-border-default, #d0d7de);
  border-radius: 6px;
  padding: 8px 6px;
  text-align: center;
}
.ro-sc-stat-num {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-fg-default, #1f2328);
  line-height: 1.2;
  display: block;
}
.ro-sc-stat-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-fg-muted, #656d76);
  margin-top: 2px;
  display: block;
}
.ro-sc-meta {
  font-size: 10px;
  color: var(--color-fg-muted, #656d76);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}
.ro-sc-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success-fg, #1a7f37);
  flex-shrink: 0;
  display: inline-block;
  animation: ro-pulse 2s ease-in-out infinite;
}
@keyframes ro-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.ro-sc-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border-default, #d0d7de);
  background: var(--color-canvas-default, #ffffff);
  color: var(--color-fg-default, #1f2328);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  box-sizing: border-box;
  transition: background 0.12s;
  margin-top: 6px;
}
.ro-sc-link:hover {
  background: var(--color-canvas-subtle, #f6f8fa);
  text-decoration: none;
  color: var(--color-fg-default, #1f2328);
}
.ro-sc-empty {
  font-size: 11px;
  color: var(--color-fg-muted, #656d76);
  text-align: center;
  padding: 6px 0 10px;
}
.ro-sc-copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-accent-muted, rgba(9,105,218,0.4));
  background: var(--color-accent-subtle, #ddf4ff);
  color: var(--color-accent-fg, #0969da);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-sizing: border-box;
  transition: background 0.12s, opacity 0.12s;
  margin-top: 6px;
  font-family: inherit;
}
.ro-sc-copy-btn:hover:not(:disabled) {
  background: var(--color-accent-emphasis, #0969da);
  color: #ffffff;
  border-color: transparent;
}
.ro-sc-copy-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
`;

/* ─── Issue page detection ──────────────────────────────────────────── */
/**
 * Returns { repoFullName, issueNumber } if we are on an issue detail page,
 * otherwise returns null.
 */
function getIssuePageContext() {
  const m = window.location.pathname.match(/^\/([^/]+)\/([^/]+)\/issues\/(\d+)\/?$/);
  if (!m) return null;
  return { repoFullName: `${m[1]}/${m[2]}`, issueNumber: parseInt(m[3], 10) };
}

/**
 * Fetches the analysis summary for the current issue from Supabase.
 */
async function fetchIssueSummaryFromSupabase(repoFullName, issueNumber, keys) {
  if (!keys.supabaseUrl || !keys.supabaseAnonKey) return null;
  try {
    const url = `${keys.supabaseUrl}/rest/v1/issues?repo_name=eq.${encodeURIComponent(repoFullName)}&issue_number=eq.${issueNumber}&select=analysis_summary,is_duplicate&limit=1`;
    const res = await fetch(url, {
      headers: {
        apikey: keys.supabaseAnonKey,
        Authorization: `Bearer ${keys.supabaseAnonKey}`,
      },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows && rows.length > 0 ? rows[0] : null;
  } catch {
    return null;
  }
}

/**
 * Posts the analysis report as a comment on the GitHub issue via the API.
 */
async function postAnalysisAsComment(repoFullName, issueNumber, summary, isDuplicate, pat) {
  const dupNote = isDuplicate ? '\n\n> ⚠️ **This issue was flagged as a possible duplicate.**' : '';
  const body = `<!-- repoowl-sidebar-report -->\n## 🦉 RepoOwl Analysis Report\n\n${summary}${dupNote}\n\n---\n<sub>Posted from RepoOwl sidebar · Groq LLaMA 3.3</sub>`;

  const res = await fetch(`https://api.github.com/repos/${repoFullName}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${pat}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body }),
  });
  return res.ok;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
function getRepoFromPath() {
  // Match /owner/repo exactly (not sub-paths like /issues, /pulls, etc.)
  const m = window.location.pathname.match(/^\/([^/]+)\/([^/]+)\/?$/);
  if (!m) return null;
  const excluded = ['login', 'signup', 'explore', 'topics', 'trending', 'marketplace', 'settings', 'notifications', 'dashboard'];
  if (excluded.includes(m[1].toLowerCase())) return null;
  // Exclude known GitHub special paths for second segment
  const excludedRepos = ['orgs', 'apps', 'marketplace'];
  if (excludedRepos.includes(m[2].toLowerCase())) return null;
  return `${m[1]}/${m[2]}`;
}

async function fetchStats(repoFullName, keys) {
  if (!keys.supabaseUrl || !keys.supabaseAnonKey) return null;
  const url = `${keys.supabaseUrl}/rest/v1/public_ecosystem_registry?select=total_issues_analyzed,duplicates_found&repo_name=eq.${encodeURIComponent(repoFullName)}&limit=1`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: keys.supabaseAnonKey,
        Authorization: `Bearer ${keys.supabaseAnonKey}`,
      },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return { total: 0, processed: 0, duplicates: 0 };
    
    const processed = rows[0].total_issues_analyzed || 0;
    const duplicates = rows[0].duplicates_found || 0;
    return { total: processed, processed, duplicates };
  } catch {
    return null;
  }
}

/* ─── DOM Injection ──────────────────────────────────────────────────── */
function findSidebarTarget() {
  // Strategy 1: Find "About" header and use its container
  const h2s = Array.from(document.querySelectorAll('h2'));
  const aboutH2 = h2s.find(h => h?.textContent?.trim() === 'About');
  if (aboutH2) {
    const row = aboutH2.closest('.BorderGrid-row');
    if (row && row.parentElement) {
      return { grid: row.parentElement, firstRow: row };
    }
    // If BorderGrid-row isn't used, just use the parent element of About
    if (aboutH2.parentElement && aboutH2.parentElement.parentElement) {
      return { grid: aboutH2.parentElement.parentElement, firstRow: aboutH2.parentElement };
    }
  }

  // Strategy 2: GitHub's new Primer React layout (2024+)
  const pane = document.querySelector('[data-component="PageLayout.Pane"]');
  if (pane) {
    const grid = pane.querySelector('.BorderGrid');
    if (grid && grid.firstElementChild) {
      return { grid, firstRow: grid.firstElementChild };
    }
  }

  // Strategy 3: Fallback old Layout-sidebar
  const legacySidebar = document.querySelector('.Layout-sidebar .BorderGrid');
  if (legacySidebar && legacySidebar.firstElementChild) {
    return { grid: legacySidebar, firstRow: legacySidebar.firstElementChild };
  }

  return null;
}

function buildCard(stats, repoFullName, keys) {
  const configured = !!(keys.supabaseUrl && keys.supabaseAnonKey);
  const issueCtx = getIssuePageContext();
  // Only show the copy button on issue detail pages for the same repo
  const showCopyBtn = !!(
    issueCtx &&
    issueCtx.repoFullName === repoFullName &&
    keys.githubToken
  );

  let statsHtml;
  if (!configured || stats === null) {
    statsHtml = `<div class="ro-sc-empty">${configured ? 'Connecting to RepoOwl…' : 'Configure RepoOwl to see insights.'}</div>`;
  } else if (stats.total === 0) {
    statsHtml = `<div class="ro-sc-empty">No issues tracked yet. Run the worker to begin.</div>`;
  } else {
    statsHtml = `
      <div class="ro-sc-stats">
        <div class="ro-sc-stat">
          <span class="ro-sc-stat-num">${stats.processed}</span>
          <span class="ro-sc-stat-label">Analysed</span>
        </div>
        <div class="ro-sc-stat">
          <span class="ro-sc-stat-num">${stats.duplicates}</span>
          <span class="ro-sc-stat-label">Duplicates</span>
        </div>
        <div class="ro-sc-stat">
          <span class="ro-sc-stat-num">${stats.total}</span>
          <span class="ro-sc-stat-label">Total</span>
        </div>
      </div>
      <div class="ro-sc-meta">
        <span class="ro-sc-dot"></span>
        Groq LLaMA 3.3 · ${repoFullName}
      </div>
    `;
  }

  const badge = (stats !== null && configured)
    ? `<span class="ro-sc-badge-active">Active</span>`
    : `<span class="ro-sc-badge-pending">Setup needed</span>`;

  const copyBtnHtml = showCopyBtn
    ? `<button class="ro-sc-copy-btn" id="ro-sc-copy-btn" type="button">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>
        Copy Report as GitHub Comment
      </button>`
    : '';

  const wrapper = document.createElement('div');
  wrapper.id = CARD_ID;

  wrapper.innerHTML = `
    <style>${CARD_CSS}</style>
    <div class="ro-sc-header">
      <div class="ro-sc-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
        </svg>
        RepoOwl
      </div>
      ${badge}
    </div>
    ${statsHtml}
    <a href="#" class="ro-sc-link ro-sc-settings-btn">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M7.429 1.525a6.593 6.593 0 0 1 1.142 0c.036.003.108.036.137.146l.289 1.105c.147.56.55.967.997 1.189.174.086.341.18.502.28.433.268.97.268 1.392.008l.938-.538c.098-.056.171-.06.207-.038a6.673 6.673 0 0 1 .57.498c.02.017.168.14.068.278l-.642.87a1.576 1.576 0 0 0-.173 1.463c.13.414.13.866 0 1.28a1.576 1.576 0 0 0 .173 1.463l.642.87c.1.138-.048.26-.068.278a6.662 6.662 0 0 1-.57.498.207.207 0 0 1-.207-.038l-.938-.538c-.422-.26-.959-.26-1.392.008a5.073 5.073 0 0 1-.502.28c-.447.222-.85.629-.997 1.189l-.289 1.105c-.029.11-.101.143-.137.146a6.593 6.593 0 0 1-1.142 0c-.036-.003-.108-.036-.137-.146l-.289-1.105c-.147-.56-.55-.967-.997-1.189a5.082 5.082 0 0 1-.502-.28c-.433-.268-.97-.268-1.392-.008l-.938.538a.207.207 0 0 1-.207.038 6.679 6.679 0 0 1-.57-.498c-.02-.018-.168-.14-.068-.278l.642-.87a1.576 1.576 0 0 0 .173-1.463 4.575 4.575 0 0 1 0-1.28 1.576 1.576 0 0 0-.173-1.463l-.642-.87c-.1-.138.048-.26.068-.278.185-.163.374-.315.57-.498a.207.207 0 0 1 .207.038l.938.538c.422.26.959.26 1.392-.008.161-.1.328-.194.502-.28.447-.222.85-.629.997-1.189l.289-1.105c.029-.11.101-.143.137-.146zM8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>
      </svg>
      Settings &amp; Insights &rarr;
    </a>
    ${copyBtnHtml}
  `;

  const btn = wrapper.querySelector('.ro-sc-settings-btn');
  if (btn && typeof chrome !== 'undefined' && chrome.runtime) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.sendMessage({ action: 'open_settings' });
    });
  }

  // ── Copy Report as GitHub Comment button ────────────────────────────
  const copyBtn = wrapper.querySelector('#ro-sc-copy-btn');
  if (copyBtn && issueCtx) {
    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      copyBtn.disabled = true;
      copyBtn.textContent = 'Fetching report…';

      try {
        // Re-fetch keys in case they changed
        const freshKeys = await getKeys();
        const row = await fetchIssueSummaryFromSupabase(issueCtx.repoFullName, issueCtx.issueNumber, freshKeys);

        if (!row || !row.analysis_summary) {
          copyBtn.textContent = '⚠️ No analysis yet';
          setTimeout(() => { copyBtn.disabled = false; copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg> Copy Report as GitHub Comment'; }, 3000);
          return;
        }

        if (!freshKeys.githubToken) {
          copyBtn.textContent = '⚠️ No GitHub PAT configured';
          setTimeout(() => { copyBtn.disabled = false; copyBtn.innerHTML = 'Copy Report as GitHub Comment'; }, 3000);
          return;
        }

        copyBtn.textContent = 'Posting comment…';
        const ok = await postAnalysisAsComment(
          issueCtx.repoFullName,
          issueCtx.issueNumber,
          row.analysis_summary,
          row.is_duplicate,
          freshKeys.githubToken
        );

        if (ok) {
          copyBtn.textContent = '✓ Comment posted!';
          copyBtn.style.background = 'var(--color-success-subtle, #dafbe1)';
          copyBtn.style.color = 'var(--color-success-fg, #1a7f37)';
          copyBtn.style.borderColor = 'var(--color-success-muted, #82e298)';
        } else {
          copyBtn.textContent = '✗ Failed — check PAT permissions';
        }
        setTimeout(() => {
          copyBtn.disabled = false;
          copyBtn.style.background = '';
          copyBtn.style.color = '';
          copyBtn.style.borderColor = '';
          copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg> Copy Report as GitHub Comment';
        }, 4000);
      } catch (err) {
        copyBtn.textContent = `✗ Error: ${err.message}`;
        setTimeout(() => { copyBtn.disabled = false; copyBtn.textContent = 'Copy Report as GitHub Comment'; }, 4000);
      }
    });
  }

  return wrapper;
}

async function injectCard(repoFullName, stats, keys) {
  if (document.getElementById(CARD_ID)) return;

  const target = findSidebarTarget();
  if (!target) return;

  const card = buildCard(stats, repoFullName, keys);

  // Inject as a BorderGrid-row to match GitHub's native structure
  const rowWrapper = document.createElement('div');
  rowWrapper.className = 'BorderGrid-row';
  rowWrapper.style.cssText = 'border-top: none !important;';

  const cellWrapper = document.createElement('div');
  cellWrapper.className = 'BorderGrid-cell';
  cellWrapper.appendChild(card);
  rowWrapper.appendChild(cellWrapper);

  target.grid.insertBefore(rowWrapper, target.firstRow);
}

/* ─── Retry loop ────────────────────────────────────────────────────── */
// GitHub's React renders the sidebar async, so we retry for up to 5 seconds.
let injectionAttempts = 0;
const MAX_ATTEMPTS = 20;
const RETRY_INTERVAL_MS = 250;

async function tryInject(repoFullName, stats, keys) {
  if (document.getElementById(CARD_ID)) return; // already done
  if (injectionAttempts >= MAX_ATTEMPTS) return;
  injectionAttempts++;

  const target = findSidebarTarget();
  if (!target) {
    setTimeout(() => tryInject(repoFullName, stats, keys), RETRY_INTERVAL_MS);
    return;
  }

  await injectCard(repoFullName, stats, keys);
}

/* ─── Entry ──────────────────────────────────────────────────────────── */
async function run() {
  const repo = getRepoFromPath();
  if (!repo) return;

  const keys = await getKeys();
  injectionAttempts = 0;

  // Kick off injection with loading state first (immediate)
  tryInject(repo, null, keys);

  // Fetch real data in parallel
  const stats = await fetchStats(repo, keys);

  // Remove the loading card and inject with real data
  const existing = document.getElementById(CARD_ID);
  if (existing) existing.closest('.BorderGrid-row')?.remove();

  injectionAttempts = 0;
  tryInject(repo, stats, keys);
}

// Handle GitHub's Turbo/pjax soft-navigation
let lastPath = window.location.pathname;

new MutationObserver(() => {
  const currentPath = window.location.pathname;
  if (currentPath !== lastPath) {
    lastPath = currentPath;
    const existing = document.getElementById(CARD_ID);
    if (existing) existing.closest('.BorderGrid-row')?.remove();
    run();
  }
}).observe(document.body, { childList: true, subtree: true });

run();
