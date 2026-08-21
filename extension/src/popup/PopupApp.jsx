import { useEffect, useState, useCallback, useMemo } from 'react';
import { launchGitHubOAuth, launchSupabaseOAuth, finalizeSupabaseProject } from '../lib/oauth.js';
import './popup.css';

function EcosystemAnalytics({ keys }) {
  const [registry, setRegistry] = useState([]);
  const [metrics, setMetrics] = useState({ totalRepos: 0, totalAnalyzed: 0, totalDupes: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchEcosystemData() {
      try {
        const response = await fetch(`${keys.supabaseUrl}/rest/v1/public_ecosystem_registry?select=*`, {
          headers: { 'apikey': keys.supabaseAnonKey }
        });
        if (!response.ok) return;
        const data = await response.json();
        
        setRegistry(data);
        
        const aggregated = data.reduce((acc, curr) => ({
          totalRepos: acc.totalRepos + 1,
          totalAnalyzed: acc.totalAnalyzed + curr.total_issues_analyzed,
          totalDupes: acc.totalDupes + curr.duplicates_found
        }), { totalRepos: 0, totalAnalyzed: 0, totalDupes: 0 });
        
        setMetrics(aggregated);
      } catch (err) {
        console.error("Failed to fetch ecosystem data", err);
      }
    }
    
    if (keys.supabaseUrl) fetchEcosystemData();
  }, [keys]);

  const filteredRegistry = registry.filter(r => r.repo_name.includes(searchTerm));

  return (
    <div className="ecosystem-container" style={{ padding: '0 16px 16px 16px' }}>
      <div className="metrics-header" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div className="metric-card" style={{ flex: 1, backgroundColor: '#f6f8fa', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '10px', color: '#57606a' }}>Repos</h4>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '16px' }}>{metrics.totalRepos}</h2>
        </div>
        <div className="metric-card" style={{ flex: 1, backgroundColor: '#f6f8fa', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '10px', color: '#57606a' }}>Analyzed</h4>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '16px' }}>{metrics.totalAnalyzed}</h2>
        </div>
        <div className="metric-card" style={{ flex: 1, backgroundColor: '#f6f8fa', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '10px', color: '#57606a' }}>Dupes Prevented</h4>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '16px' }}>{metrics.totalDupes}</h2>
        </div>
      </div>

      <input 
        type="text" 
        placeholder="Search ecosystem..." 
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
        style={{ width: '100%', padding: '6px 8px', marginBottom: '12px', border: '1px solid #d0d7de', borderRadius: '6px' }}
      />

      <div className="registry-table" style={{ maxHeight: '150px', overflowY: 'auto', borderTop: '1px solid #d0d7de' }}>
        {filteredRegistry.map(repo => (
          <div key={repo.repo_name} className="registry-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eaeef2', fontSize: '12px' }}>
            <span className="repo-name" style={{ fontWeight: 'bold' }}>{repo.repo_name}</span>
            <div style={{ display: 'flex', gap: '8px', color: '#57606a' }}>
              <span className="stats">Analysed: {repo.total_issues_analyzed}</span>
              <span className="stats">Saved: {repo.duplicates_found}</span>
            </div>
          </div>
        ))}
        {filteredRegistry.length === 0 && (
          <div style={{ padding: '8px 0', textAlign: 'center', color: '#57606a', fontSize: '12px' }}>No projects found.</div>
        )}
      </div>
    </div>
  );
}

const REPO_URL = 'https://github.com/YASHK-arch/RepoOwl-extension';

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

async function fetchStatsForRepo(repo, supabaseUrl, supabaseAnonKey) {
  if (!supabaseUrl || !supabaseAnonKey || !repo) return null;
  try {
    const url = `${supabaseUrl}/rest/v1/public_ecosystem_registry?select=total_issues_analyzed,duplicates_found&repo_name=eq.${encodeURIComponent(repo)}&limit=1`;
    const res = await fetch(url, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
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

// ── Step metadata ────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    label: 'GitHub',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    ),
  },
  {
    id: 2,
    label: 'Supabase',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.36 13.49.601 15.5 2.418 15.5h8.682l.8 7.464c.015.985 1.26 1.41 1.874.637l9.262-11.653c1.125-1.438.163-3.448-1.654-3.448h-8.682l-.8-7.464z"/>
      </svg>
    ),
  },
  {
    id: 3,
    label: 'Groq AI',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V15a1 1 0 0 0-2 0v1.93A8 8 0 0 1 4.07 11H6a1 1 0 0 0 0-2H4.07A8 8 0 0 1 11 4.07V6a1 1 0 0 0 2 0V4.07A8 8 0 0 1 19.93 11H18a1 1 0 0 0 0 2h1.93A8 8 0 0 1 13 16.93z"/>
      </svg>
    ),
  },
];

function ConfigurationModal({ onClose, onComplete, initialConfig }) {
  // step: 1=GitHub, 2=Supabase, 3=Groq, 4=Success
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Local config state for the modal
  const [modalConfig, setModalConfig] = useState(initialConfig);
  
  // Project picker state
  const [projectPickerState, setProjectPickerState] = useState(null); // { accessToken, projects }

  const persistConfig = async (partial) => {
    const merged = { ...modalConfig, ...partial };
    setModalConfig(merged);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ repoOwlConfig: merged });
    }
    return merged;
  };

  const handleConnectGitHub = async () => {
    setLoading(true);
    setError('');
    try {
      const { githubToken, githubLogin, avatarUrl } = await launchGitHubOAuth();
      await persistConfig({ githubToken, githubLogin, githubAvatarUrl: avatarUrl });
      setStep(2);
    } catch (err) {
      setError(`GitHub OAuth failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSupabase = async () => {
    setLoading(true);
    setError('');
    try {
      const { accessToken, projects } = await launchSupabaseOAuth();
      if (projects.length === 0) {
        throw new Error('No Supabase projects found in your account.');
      }
      if (projects.length === 1) {
        await handleProjectSelected({ accessToken, project: projects[0] });
      } else {
        setProjectPickerState({ accessToken, projects });
        setLoading(false); // Wait for user to pick
      }
    } catch (err) {
      setError(`Supabase OAuth failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handleProjectSelected = async ({ accessToken, project }) => {
    setProjectPickerState(null);
    setLoading(true);
    setError('');
    try {
      const { supabaseUrl, supabaseAnonKey } = await finalizeSupabaseProject(accessToken, project.id);
      await persistConfig({ supabaseUrl, supabaseAnonKey, supabasePAT: '' });
      setStep(3);
    } catch (err) {
      setError(`Provisioning failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGroq = async () => {
    if (!modalConfig.groqApiKey?.trim()) {
      setError('Groq API Key is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const finalConfig = await persistConfig({});
      // Show the success screen
      setStep(4);
      // Auto-close after 2.5 s and pass the config upward
      setTimeout(() => {
        onComplete(finalConfig);
      }, 2500);
    } catch (err) {
      setError(`Save failed: ${err.message}`);
      setLoading(false);
    }
  };

  // Derive visual step index (1-3) for the stepper; step 4 means all done
  const visualStep = Math.min(step, 3);

  return (
    <div className="ro-modal-overlay">
      <div className="ro-modal-card">
        <div className="ro-modal-header">
          <h2 className="ro-modal-title">
            {step === 4 ? 'Setup Complete' : 'Initial Setup'}
          </h2>
          {step !== 4 && (
            <button className="ro-modal-close" onClick={onClose} aria-label="Close">✕</button>
          )}
        </div>

        {/* ── Stepper ───────────────────────────────────────────── */}
        {step !== 4 && (
          <div className="ro-stepper">
            {STEPS.map((s, idx) => {
              const isCompleted = visualStep > s.id;
              const isActive = visualStep === s.id;
              return (
                <div key={s.id} className="ro-stepper-item">
                  <div
                    className={`ro-step-bubble ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}
                    aria-label={`Step ${s.id}: ${s.label}`}
                  >
                    {isCompleted ? (
                      // Checkmark for completed steps
                      <svg viewBox="0 0 12 12" fill="currentColor" width="12" height="12" aria-hidden="true">
                        <path d="M1 6l3.5 3.5L11 2" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      s.icon
                    )}
                  </div>
                  <span className={`ro-step-label ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                    {s.label}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <div className={`ro-step-connector ${isCompleted ? 'completed' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="ro-modal-content">
          {/* ── Error banner ─────────────────────────────────────── */}
          {error && (
            <div className="ro-modal-error">
              <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13" style={{ flexShrink: 0, marginTop: '1px' }} aria-hidden="true">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 4a.75.75 0 0 1 1.5 0v3.25a.75.75 0 0 1-1.5 0V5zm.75 6.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              {error}
            </div>
          )}

          {/* ── Step 1: GitHub ───────────────────────────────────── */}
          {step === 1 && (
            <div className="ro-step-content">
              <div className="ro-step-hero">
                <div className="ro-step-hero-icon" style={{ background: '#24292f' }}>
                  <svg viewBox="0 0 16 16" fill="white" width="22" height="22" aria-hidden="true">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="ro-step-title">Connect GitHub</h3>
                  <p className="ro-modal-text">
                    Authorise RepoOwl to read issues and PRs via GitHub OAuth. No write access is requested.
                  </p>
                </div>
              </div>
              <div className="ro-modal-actions">
                <button className="ro-btn ro-btn--primary" onClick={handleConnectGitHub} disabled={loading}>
                  {loading ? (
                    <><span className="ro-spinner" />Connecting…</>
                  ) : (
                    <><GitHubIcon />Connect GitHub</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Supabase project selector ────────────────── */}
          {step === 2 && !projectPickerState && (
            <div className="ro-step-content">
              <div className="ro-step-hero">
                <div className="ro-step-hero-icon" style={{ background: '#1c1c1c' }}>
                  <svg viewBox="0 0 24 24" fill="#3ecf8e" width="22" height="22" aria-hidden="true">
                    <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.36 13.49.601 15.5 2.418 15.5h8.682l.8 7.464c.015.985 1.26 1.41 1.874.637l9.262-11.653c1.125-1.438.163-3.448-1.654-3.448h-8.682l-.8-7.464z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="ro-step-title">Connect Supabase</h3>
                  <p className="ro-modal-text">
                    Link your Supabase project to store analysis data. The database schema is initialised automatically.
                  </p>
                </div>
              </div>
              <div className="ro-modal-actions">
                <button className="ro-btn ro-btn--primary" onClick={handleConnectSupabase} disabled={loading}>
                  {loading ? (
                    <><span className="ro-spinner" />Connecting…</>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
                        <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.36 13.49.601 15.5 2.418 15.5h8.682l.8 7.464c.015.985 1.26 1.41 1.874.637l9.262-11.653c1.125-1.438.163-3.448-1.654-3.448h-8.682l-.8-7.464z"/>
                      </svg>
                      Connect Supabase
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Project picker ────────────────────────────── */}
          {step === 2 && projectPickerState && (
            <div className="ro-step-content" style={{ gap: '8px' }}>
              <p className="ro-modal-text">Select a Supabase project to initialise:</p>
              <div className="ro-project-list">
                {projectPickerState.projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProjectSelected({ accessToken: projectPickerState.accessToken, project: p })}
                    className="ro-project-item"
                  >
                    <span className="ro-project-name">{p.name}</span>
                    <span className="ro-project-id">{p.id}</span>
                  </button>
                ))}
              </div>
              <button className="ro-btn ro-btn--ghost" onClick={() => setProjectPickerState(null)}>Cancel</button>
            </div>
          )}

          {/* ── Step 3: Groq ─────────────────────────────────────── */}
          {step === 3 && (
            <div className="ro-step-content">
              <div className="ro-step-hero">
                <div className="ro-step-hero-icon" style={{ background: '#f55036' }}>
                  <svg viewBox="0 0 24 24" fill="white" width="22" height="22" aria-hidden="true">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V15a1 1 0 0 0-2 0v1.93A8 8 0 0 1 4.07 11H6a1 1 0 0 0 0-2H4.07A8 8 0 0 1 11 4.07V6a1 1 0 0 0 2 0V4.07A8 8 0 0 1 19.93 11H18a1 1 0 0 0 0 2h1.93A8 8 0 0 1 13 16.93z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="ro-step-title">Add Groq API Key</h3>
                  <p className="ro-modal-text">
                    Enter your Groq API key to enable AI-powered issue analysis. Get a free key at{' '}
                    <a
                      href="https://console.groq.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ro-link"
                    >
                      console.groq.com
                    </a>.
                  </p>
                </div>
              </div>
              <input
                type="password"
                placeholder="gsk_…"
                className="ro-input"
                value={modalConfig.groqApiKey || ''}
                onChange={e => setModalConfig({ ...modalConfig, groqApiKey: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveGroq(); }}
              />
              <div className="ro-modal-actions">
                <button className="ro-btn ro-btn--primary" onClick={handleSaveGroq} disabled={loading}>
                  {loading ? (
                    <><span className="ro-spinner" />Saving…</>
                  ) : (
                    'Save & Finish'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Success ───────────────────────────────────── */}
          {step === 4 && (
            <div className="ro-success-screen">
              <div className="ro-success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1a7f37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="ro-success-title">You're all set!</h3>
              <p className="ro-success-text">
                GitHub, Supabase, and Groq are connected. RepoOwl is now active and will analyse issues as you browse GitHub.
              </p>
              <div className="ro-success-connections">
                {[
                  { label: 'GitHub', color: '#24292f' },
                  { label: 'Supabase', color: '#3ecf8e' },
                  { label: 'Groq AI', color: '#f55036' },
                ].map(c => (
                  <div key={c.label} className="ro-success-badge">
                    <span className="ro-success-dot" style={{ background: c.color }} />
                    {c.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PopupApp() {
  const [currentRepo, setCurrentRepo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [config, setConfig] = useState({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  // Track whether we've finished the initial storage read
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['repoOwlConfig'], (result) => {
        if (result.repoOwlConfig) {
          setConfig(prev => ({ ...prev, ...result.repoOwlConfig }));
        }
        setConfigLoaded(true);
      });
    } else {
      setConfigLoaded(true);
    }
  }, []);

  const configured = !!(config.supabaseUrl && config.supabaseAnonKey && config.githubToken && config.groqApiKey);

  // Auto-open the setup modal on first launch when nothing is configured
  useEffect(() => {
    if (configLoaded && !configured) {
      setShowConfigModal(true);
    }
  }, [configLoaded, configured]);
  
  const ecosystemKeys = useMemo(() => ({ supabaseUrl: config.supabaseUrl, supabaseAnonKey: config.supabaseAnonKey }), [config.supabaseUrl, config.supabaseAnonKey]);

  // Detect the active tab's repo
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? '';
      const m = url.match(/https:\/\/github\.com\/([^/]+\/[^/?#]+)/);
      if (m) {
        setCurrentRepo(m[1]);
      }
    });
  }, []);

  // Fetch stats when repo is detected
  const loadStats = useCallback(async () => {
    if (!currentRepo || !configured) return;
    setLoadingStats(true);
    const result = await fetchStatsForRepo(currentRepo, config.supabaseUrl, config.supabaseAnonKey);
    setStats(result);
    setLoadingStats(false);
  }, [currentRepo, configured, config.supabaseUrl, config.supabaseAnonKey]);

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

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #d0d7de', margin: '0 -16px 16px -16px', padding: '0 16px' }}>
        <button 
          onClick={() => setActiveTab('current')} 
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'current' ? '2px solid #0969da' : 'none', fontWeight: activeTab === 'current' ? 'bold' : 'normal', cursor: 'pointer', color: activeTab === 'current' ? '#24292f' : '#57606a' }}
        >
          Current Repo
        </button>
        <button 
          onClick={() => setActiveTab('ecosystem')} 
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'ecosystem' ? '2px solid #0969da' : 'none', fontWeight: activeTab === 'ecosystem' ? 'bold' : 'normal', cursor: 'pointer', color: activeTab === 'ecosystem' ? '#24292f' : '#57606a' }}
        >
          Ecosystem
        </button>
      </div>

      {activeTab === 'current' ? (
        <>
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
        </>
      ) : (
        <EcosystemAnalytics keys={ecosystemKeys} />
      )}

      <div className="ro-divider" />

      {/* Action buttons */}
      <div className="ro-actions">
        {!configured && (
          <button
            type="button"
            id="ro-btn-configure"
            className="ro-btn ro-btn--primary"
            style={{ width: '100%', marginBottom: '8px', justifyContent: 'center' }}
            onClick={() => setShowConfigModal(true)}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" aria-hidden="true">
              <path d="M7.429 1.525a6.593 6.593 0 0 1 1.142 0c.036.003.108.036.137.146l.289 1.105c.147.56.55.967.997 1.189.174.086.341.18.502.28.433.268.97.268 1.392.008l.938-.538c.098-.056.171-.06.207-.038a6.673 6.673 0 0 1 .57.498c.02.017.168.14.068.278l-.642.87a1.576 1.576 0 0 0-.173 1.463c.13.414.13.866 0 1.28a1.576 1.576 0 0 0 .173 1.463l.642.87c.1.138-.048.26-.068.278a6.662 6.662 0 0 1-.57.498.207.207 0 0 1-.207-.038l-.938-.538c-.422-.26-.959-.26-1.392.008a5.073 5.073 0 0 1-.502.28c-.447.222-.85.629-.997 1.189l-.289 1.105c-.029.11-.101.143-.137.146a6.593 6.593 0 0 1-1.142 0c-.036-.003-.108-.036-.137-.146l-.289-1.105c-.147-.56-.55-.967-.997-1.189a5.082 5.082 0 0 1-.502-.28c-.433-.268-.97-.268-1.392-.008l-.938.538a.207.207 0 0 1-.207.038 6.679 6.679 0 0 1-.57-.498c-.02-.018-.168-.14-.068-.278l.642-.87a1.576 1.576 0 0 0 .173-1.463 4.575 4.575 0 0 1 0-1.28 1.576 1.576 0 0 0-.173-1.463l-.642-.87c-.1-.138.048-.26.068-.278.185-.163.374-.315.57-.498a.207.207 0 0 1 .207.038l.938.538c.422.26.959.26 1.392-.008.161-.1.328-.194.502-.28.447-.222.85-.629.997-1.189l.289-1.105c.029-.11.101-.143.137-.146zM8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
            </svg>
            Configure Extension
          </button>
        )}
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <button
            id="ro-btn-github"
            type="button"
            className="ro-btn ro-btn--primary"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={openGitHub}
          >
            <GitHubIcon />
            {currentRepo ? 'Issues' : 'GitHub'}
          </button>
          <button
            id="ro-btn-settings"
            type="button"
            className="ro-btn ro-btn--ghost"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={openSettings}
          >
            <SettingsIcon />
            Settings
          </button>
        </div>
      </div>

      {showConfigModal && (
        <ConfigurationModal 
          initialConfig={config}
          onClose={() => setShowConfigModal(false)}
          onComplete={(newConfig) => {
            setConfig(newConfig);
            setShowConfigModal(false);
          }}
        />
      )}
    </div>
  );
}
