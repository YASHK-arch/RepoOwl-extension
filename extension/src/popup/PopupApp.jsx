import { useEffect, useState, useCallback } from 'react';
import './popup.css';

const REPO_URL = 'https://github.com/YASHK-arch/RepoOwl-extension';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M7.429 1.525a6.593 6.593 0 0 1 1.142 0c.036.003.108.036.137.146l.289 1.105c.147.56.55.967.997 1.189.174.086.341.18.502.28.433.268.97.268 1.392.008l.938-.538c.098-.056.171-.06.207-.038a6.673 6.673 0 0 1 .57.498c.02.017.168.14.068.278l-.642.87a1.576 1.576 0 0 0-.173 1.463c.13.414.13.866 0 1.28a1.576 1.576 0 0 0 .173 1.463l.642.87c.1.138-.048.26-.068.278a6.662 6.662 0 0 1-.57.498.207.207 0 0 1-.207-.038l-.938-.538c-.422-.26-.959-.26-1.392.008a5.073 5.073 0 0 1-.502.28c-.447.222-.85.629-.997 1.189l-.289 1.105c-.029.11-.101.143-.137.146a6.593 6.593 0 0 1-1.142 0c-.036-.003-.108-.036-.137-.146l-.289-1.105c-.147-.56-.55-.967-.997-1.189a5.082 5.082 0 0 1-.502-.28c-.433-.268-.97-.268-1.392-.008l-.938.538a.207.207 0 0 1-.207.038 6.679 6.679 0 0 1-.57-.498c-.02-.018-.168-.14-.068-.278l.642-.87a1.576 1.576 0 0 0 .173-1.463 4.575 4.575 0 0 1 0-1.28 1.576 1.576 0 0 0-.173-1.463l-.642-.87c-.1-.138.048-.26.068-.278.185-.163.374-.315.57-.498a.207.207 0 0 1 .207.038l.938.538c.422.26.959.26 1.392-.008.161-.1.328-.194.502-.28.447-.222.85-.629.997-1.189l.289-1.105c.029-.11.101-.143.137-.146zM8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
    </svg>
  );
}

function getIconUrl(name) {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    return chrome.runtime.getURL(`icons/${name}`);
  }
  return '';
}

async function fetchStatsForRepo(repo) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !repo) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/issues?select=is_processed,duplicate_data&repository_full_name=eq.${encodeURIComponent(repo)}&limit=200`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    const processed = rows.filter((r) => r.is_processed).length;
    const duplicates = rows.filter((r) => {
      try {
        const d = typeof r.duplicate_data === 'string' ? JSON.parse(r.duplicate_data) : r.duplicate_data;
        return Array.isArray(d?.original_issue_ids) && d.original_issue_ids.length > 0;
      } catch { return false; }
    }).length;
    return { total: rows.length, processed, duplicates };
  } catch {
    return null;
  }
}

export function PopupApp() {
  const [currentRepo, setCurrentRepo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const configured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

  // Detect the active tab's repo
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? '';
      const m = url.match(/https:\/\/github\.com\/([^/]+\/[^/]+)/);
      if (m) {
        const repo = m[1].replace(/[/?#].*$/, '');
        setCurrentRepo(repo);
      }
    });
  }, []);

  // Fetch stats when repo is detected
  const loadStats = useCallback(async () => {
    if (!currentRepo || !configured) return;
    setLoadingStats(true);
    const result = await fetchStatsForRepo(currentRepo);
    setStats(result);
    setLoadingStats(false);
  }, [currentRepo, configured]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  function openSettings() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.openOptionsPage();
    }
  }

  function openGitHub() {
    const url = currentRepo ? `https://github.com/${currentRepo}/issues` : REPO_URL;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="ro-card">
      {/* Header */}
      <div className="ro-header">
        <div className="ro-icon">
          <img
            src={getIconUrl('logo48.png')}
            width={32}
            height={32}
            alt="RepoOwl"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
          <span style={{ display: 'none', fontSize: 18 }}>🦉</span>
        </div>
        <div className="ro-title-group">
          <div className="ro-name-row">
            <span className="ro-name">RepoOwl</span>
            <span className={`ro-badge ${configured ? 'ro-badge--configured' : 'ro-badge--unconfigured'}`}>
              {configured ? 'Active' : 'Not Configured'}
            </span>
          </div>
          <p className="ro-tagline">
            {currentRepo ? `Monitoring ${currentRepo}` : 'AI insights and duplicate detection for GitHub issues.'}
          </p>
        </div>
      </div>

      <div className="ro-divider" />

      {/* Stats grid */}
      {configured && (
        <div className="ro-stats">
          {loadingStats ? (
            <div className="ro-stats-loading">Fetching insights…</div>
          ) : stats ? (
            <>
              <div className="ro-stat">
                <span className="ro-stat__num">{stats.processed}</span>
                <span className="ro-stat__label">Analysed</span>
              </div>
              <div className="ro-stat">
                <span className="ro-stat__num">{stats.duplicates}</span>
                <span className="ro-stat__label">Duplicates</span>
              </div>
              <div className="ro-stat">
                <span className="ro-stat__num">{stats.total}</span>
                <span className="ro-stat__label">Total</span>
              </div>
            </>
          ) : (
            <div className="ro-stats-empty">
              {currentRepo ? 'No issues tracked yet.' : 'Visit a GitHub repo to see stats.'}
            </div>
          )}
        </div>
      )}

      {/* Pill row */}
      <div className="ro-pills">
        <div className="ro-pill">
          <span className="ro-pill__label">Provider</span>
          <span className="ro-pill__value">Groq</span>
        </div>
        <div className="ro-pill">
          <span className="ro-pill__label">Model</span>
          <span className="ro-pill__value">LLaMA 3.3</span>
        </div>
      </div>

      <div className="ro-divider" />

      {/* Action buttons */}
      <div className="ro-actions">
        <button
          id="ro-btn-github"
          type="button"
          className="ro-btn ro-btn--primary"
          onClick={openGitHub}
        >
          <GitHubIcon />
          {currentRepo ? 'Issues' : 'GitHub'}
        </button>
        <button
          id="ro-btn-settings"
          type="button"
          className="ro-btn ro-btn--ghost"
          onClick={openSettings}
        >
          <SettingsIcon />
          Settings
        </button>
      </div>
    </div>
  );
}
