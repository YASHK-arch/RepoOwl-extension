import { useState, useEffect, useCallback } from 'react';
import { INSTALLER_VERSION } from '../background/githubInstaller.js';
const STORAGE_KEY = 'trackedRepositories';
const DEFAULT_REPO = 'YASHK-arch/Triage-Sandbox';

export function TrackedRepos() {
  const [repos, setRepos] = useState([]);
  const [newRepo, setNewRepo] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const [syncingIssues, setSyncingIssues] = useState(null);
  const [syncingPRs, setSyncingPRs] = useState(null);
  
  const [syncLogsIssues, setSyncLogsIssues] = useState([]);
  const [syncLogsPRs, setSyncLogsPRs] = useState([]);
  
  const [mediatorStatus, setMediatorStatus] = useState({});
  // { [repo]: { isMaintainer: boolean } }
  const [roleStatus, setRoleStatus] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [installerVersions, setInstallerVersions] = useState({});

  // ── Hover tooltip state ────────────────────────────────────────────────
  const [hoveredNotAvail, setHoveredNotAvail] = useState(null);

  const fetchStatus = useCallback((repo) => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'check_mediator_status', repoName: repo }, (response) => {
        setMediatorStatus(prev => ({ ...prev, [repo]: !!(response && response.registered) }));
      });
    }
  }, []);

  const fetchRole = useCallback((repo) => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'check_user_role', repoName: repo }, (response) => {
        setRoleStatus(prev => ({ ...prev, [repo]: { isMaintainer: !!(response && response.isMaintainer) } }));
      });
    }
  }, []);

  useEffect(() => {
    repos.forEach(repo => {
      fetchStatus(repo);
      fetchRole(repo);
    });
  }, [repos, fetchStatus, fetchRole]);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEY, 'repoOwlInstallerVersions'], (result) => {
        let savedRepos = result[STORAGE_KEY];
        if (!Array.isArray(savedRepos)) {
          savedRepos = [DEFAULT_REPO];
          chrome.storage.local.set({ [STORAGE_KEY]: savedRepos });
        } else if (!savedRepos.includes(DEFAULT_REPO)) {
          savedRepos = [DEFAULT_REPO, ...savedRepos];
          chrome.storage.local.set({ [STORAGE_KEY]: savedRepos });
        }
        setRepos(savedRepos);
        setInstallerVersions(result.repoOwlInstallerVersions || {});
      });
    } else {
      setRepos([DEFAULT_REPO]);
    }
  }, []);

  useEffect(() => {
    const logListener = (msg) => {
      if (msg.action === 'sync_progress' && msg.message) {
        if (msg.log_type === 'issue') {
          setSyncLogsIssues(prev => {
            const newLogs = [...prev, msg.message];
            return newLogs.length > 50 ? newLogs.slice(newLogs.length - 50) : newLogs;
          });
        } else if (msg.log_type === 'pr') {
          setSyncLogsPRs(prev => {
            const newLogs = [...prev, msg.message];
            return newLogs.length > 50 ? newLogs.slice(newLogs.length - 50) : newLogs;
          });
        } else {
          setSyncLogsIssues(prev => {
            const newLogs = [...prev, msg.message];
            return newLogs.length > 50 ? newLogs.slice(newLogs.length - 50) : newLogs;
          });
        }
      }
    };
    
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(logListener);
    }
    
    return () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.removeListener(logListener);
      }
    };
  }, []);

  const saveRepos = (newRepos) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [STORAGE_KEY]: newRepos }, () => {
        setRepos(newRepos);
      });
    } else {
      setRepos(newRepos);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const repo = newRepo.trim();
    if (!repo) return;
    
    if (!repo.includes('/') || repo.split('/').length !== 2) {
      setStatus({ type: 'error', message: 'Repository must be in owner/repo format.' });
      return;
    }

    if (repos.includes(repo)) {
      setStatus({ type: 'error', message: 'Repository is already tracked.' });
      return;
    }

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'add_repo', repoName: repo });
    }

    const updatedRepos = [...repos, repo];
    saveRepos(updatedRepos);
    setNewRepo('');
    setStatus({ type: 'success', message: `Added ${repo} to tracked repositories.` });
  };

  const handleDelete = (repo) => {
    if (repo === DEFAULT_REPO) {
      setStatus({ type: 'error', message: 'Cannot delete the default baseline repository.' });
      return;
    }
    const updatedRepos = repos.filter((r) => r !== repo);
    saveRepos(updatedRepos);
    setStatus({ type: 'success', message: `Removed ${repo}.` });
  };

  // "Manual Sync" — maintainer-only force sync
  const handleForceSyncIssues = (repo) => {
    setSyncingIssues(repo);
    setStatus({ type: '', message: '' });
    setSyncLogsIssues([`--- Initiated Issue Sync for ${repo} ---`]);
    
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'force_sync_issues', repoName: repo }, (response) => {
        setSyncingIssues(null);
        if (response && response.success) {
          setStatus({ type: 'success', message: `Successfully synced issues for ${repo}.` });
        } else {
          setStatus({ type: 'error', message: `Sync failed for ${repo}: ${response?.error || 'Unknown error'}` });
        }
        fetchStatus(repo);
      });
    } else {
      setSyncingIssues(null);
      setStatus({ type: 'error', message: 'Not in extension environment.' });
    }
  };

  // "Configure" — installs GitHub Actions into the repo
  const handleConfigure = (repo) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['repoOwlConfig'], (result) => {
        const keys = result.repoOwlConfig || {};
        
        let pat = keys.githubToken;
        if (!pat) {
          pat = window.prompt(`To configure RepoOwl in ${repo}, please enter your GitHub Personal Access Token (PAT) with 'repo' and 'workflow' scopes:`);
          if (!pat) return;
        }

        if (!keys.groqApiKey && !import.meta.env.VITE_GROQ_API_KEY) {
          setStatus({ type: 'error', message: 'GROQ_API_KEY is not set in Model Configuration.' });
          return;
        }
        
        const groqApiKey = keys.groqApiKey || import.meta.env.VITE_GROQ_API_KEY;
        try {
          setStatus({ type: '', message: `Configuring RepoOwl for ${repo}...` });
          setSyncLogsPRs([`--- Initiated RepoOwl Setup for ${repo} ---`]);
          
          chrome.runtime.sendMessage({ action: 'initialize_repoowl_pr', repoName: repo, githubPat: pat, groqApiKey: groqApiKey }, (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              setStatus({ type: 'error', message: `Connection error: ${chrome.runtime.lastError.message}. Try refreshing the page.` });
              return;
            }
            if (response && response.success) {
              setStatus({ type: 'success', message: `Successfully configured RepoOwl in ${repo}!` });
              if (response.version !== undefined) {
                chrome.storage.local.get(['repoOwlInstallerVersions'], (res) => {
                  const versions = res.repoOwlInstallerVersions || {};
                  versions[repo] = response.version;
                  chrome.storage.local.set({ repoOwlInstallerVersions: versions });
                  setInstallerVersions(versions);
                });
              }
              if (response.logs) {
                setSyncLogsPRs(prev => {
                  const newLogs = [...prev];
                  response.logs.forEach(l => { if (!newLogs.includes(l)) newLogs.push(l); });
                  return newLogs;
                });
              }
              // Refresh role & mediator status after configuration
              fetchRole(repo);
              fetchStatus(repo);
            } else {
              setStatus({ type: 'error', message: `Failed to configure: ${response?.error || 'Unknown error'}` });
              if (response?.logs) {
                setSyncLogsPRs(prev => {
                  const newLogs = [...prev];
                  response.logs.forEach(l => { if (!newLogs.includes(l)) newLogs.push(l); });
                  return newLogs;
                });
              }
            }
          });
        } catch (err) {
          setStatus({ type: 'error', message: `Extension error: ${err.message}. Please refresh this page.` });
        }
      });
    }
  };

  // ── Per-repo badge & button rendering ────────────────────────────────
  const renderRepoActions = (repo) => {
    const isMaintainer = roleStatus[repo]?.isMaintainer;
    const inMediator   = mediatorStatus[repo];
    const isConfigured = (installerVersions[repo] || 0) >= INSTALLER_VERSION;
    const needsUpdate  = (installerVersions[repo] || 0) < INSTALLER_VERSION && (installerVersions[repo] || 0) > 0;
    const roleResolved = repo in roleStatus; // have we received the API response yet?

    // ── Maintainer path ──────────────────────────────────────────────
    if (isMaintainer) {
      return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
          {/* Update Required alert */}
          {needsUpdate && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#ffebe9', color: '#cf222e',
              border: '1px solid rgba(207,34,46,0.15)',
              padding: '4px 8px', borderRadius: '100px',
              fontSize: '12px', fontWeight: '600'
            }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM8 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 5zm0 8a1 1 0 100-2 1 1 0 000 2z"></path>
              </svg>
              Update Required
            </div>
          )}

          {/* Configured badge (shown once installer has been run at current version) */}
          {isConfigured && !needsUpdate && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: '#dafbe1', color: '#1a7f37',
              border: '1px solid #82e298',
              padding: '4px 10px', borderRadius: '100px',
              fontSize: '12px', fontWeight: '600'
            }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
              </svg>
              Configured
            </div>
          )}

          {/* Manual Sync — only shown for maintainers after configuration */}
          {isConfigured && (
            <button
              type="button"
              className="ro-btn ro-btn--secondary"
              onClick={() => handleForceSyncIssues(repo)}
              disabled={syncingIssues === repo}
            >
              {syncingIssues === repo ? 'Syncing…' : '🔄 Manual Sync'}
            </button>
          )}

          {/* Configure / Re-configure button */}
          <button
            type="button"
            className="ro-btn ro-btn--primary"
            onClick={() => handleConfigure(repo)}
          >
            {needsUpdate ? '🚀 Re-configure' : isConfigured ? '⚙️ Re-configure' : '⚙️ Configure'}
          </button>
        </div>
      );
    }

    // ── Contributor path ─────────────────────────────────────────────
    if (!roleResolved) {
      // Still fetching role — show a neutral skeleton
      return (
        <div style={{ fontSize: '12px', color: '#8c959f' }}>Checking access…</div>
      );
    }

    if (inMediator) {
      // Repo IS in central database — contributor can see triage badges
      return (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: '#dafbe1', color: '#1a7f37',
          border: '1px solid #82e298',
          padding: '4px 10px', borderRadius: '100px',
          fontSize: '12px', fontWeight: '600',
          userSelect: 'none'
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
          </svg>
          Configured
        </div>
      );
    }

    // Not in mediator — show grey not_available badge with tooltip
    return (
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: '#f6f8fa', color: '#8c959f',
            border: '1px solid #d0d7de',
            padding: '4px 10px', borderRadius: '100px',
            fontSize: '12px', fontWeight: '600',
            cursor: 'not-allowed', userSelect: 'none'
          }}
          onMouseEnter={() => setHoveredNotAvail(repo)}
          onMouseLeave={() => setHoveredNotAvail(null)}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.72 3.22a.75.75 0 011.06 1.06L5.06 5l.72.72a.75.75 0 11-1.06 1.06L4 6.06l-.72.72a.75.75 0 01-1.06-1.06L2.94 5l-.72-.72a.75.75 0 011.06-1.06L4 3.94l.72-.72zm7 0a.75.75 0 011.06 1.06L12.06 5l.72.72a.75.75 0 11-1.06 1.06L11 6.06l-.72.72a.75.75 0 01-1.06-1.06L9.94 5l-.72-.72a.75.75 0 011.06-1.06L11 3.94l.72-.72zM5.5 9.5a.5.5 0 01.5-.5h4a.5.5 0 010 1H6a.5.5 0 01-.5-.5z"></path>
          </svg>
          not_available
        </div>
        {hoveredNotAvail === repo && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 6px)', right: 0,
            background: '#1f2328', color: '#e6edf3',
            fontSize: '11px', fontWeight: 400, lineHeight: '1.5',
            padding: '6px 10px', borderRadius: '6px',
            whiteSpace: 'nowrap', zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            pointerEvents: 'none'
          }}>
            This repo is not configured using RepoOwl,<br />try contacting the owner.
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="ro-panel-badge">Multi-Tenant</div>
      <h1 className="ro-panel-title">Tracked Repositories</h1>
      <p className="ro-panel-desc">
        Add repositories you want RepoOwl to analyze. The extension will only fetch data for repositories in this list.
      </p>

      <div className="ro-section">
        <h2 className="ro-section-title">Add Repository</h2>
        <form onSubmit={handleAdd} className="ro-field" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              className="ro-input"
              placeholder="owner/repo (e.g. facebook/react)"
              value={newRepo}
              onChange={(e) => setNewRepo(e.target.value)}
              spellCheck={false}
            />
          </div>
          <button type="submit" className="ro-btn ro-btn--primary" style={{ marginTop: '0' }}>
            Add
          </button>
        </form>
        {status.message && (
          <p className={`ro-status ro-status--${status.type}`} style={{ marginTop: '12px' }}>
            {status.message}
          </p>
        )}
      </div>

      <div className="ro-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="ro-section-title" style={{ marginBottom: 0 }}>Tracked Repositories List</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={isEditMode} 
              onChange={(e) => setIsEditMode(e.target.checked)} 
            />
            Edit List
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {repos.map((repo) => {
            return (
              <div key={repo} style={{
                border: '1px solid #d0d7de',
                borderRadius: '6px',
                backgroundColor: repo === DEFAULT_REPO ? '#f6f8fa' : 'transparent',
                overflow: 'visible'
              }}>
                {/* --- Repo header row --- */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px'
                }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px' }}>{repo}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      {repo === DEFAULT_REPO && (
                        <span style={{ fontSize: '12px', color: '#57606a' }}>Default Baseline Repository</span>
                      )}
                      {/* Mediator sync status indicator */}
                      {mediatorStatus[repo] === true && (
                        <span style={{ fontSize: '12px', color: '#2da44e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>
                          Mediator Synced
                        </span>
                      )}
                      {mediatorStatus[repo] === false && (
                        <span style={{ fontSize: '12px', color: '#bf8700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM9 11a1 1 0 11-2 0 1 1 0 012 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"></path></svg>
                          Not in Mediator
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {renderRepoActions(repo)}
                    
                    {isEditMode && repo !== DEFAULT_REPO && (
                      <button
                        type="button"
                        className="ro-btn ro-btn--secondary"
                        style={{ color: '#cf222e', borderColor: 'rgba(207,34,46,0.3)', backgroundColor: '#ffebe9' }}
                        onClick={() => handleDelete(repo)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {(syncLogsIssues.length > 0 || syncLogsPRs.length > 0) && (
        <div className="ro-section" style={{ marginTop: '20px' }}>
          <h2 className="ro-section-title">Live Sync Logs</h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            {syncLogsIssues.length > 0 && (
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '13px', marginBottom: '8px', color: '#57606a' }}>Issue Sync</h3>
                <div style={{
                  background: '#1f2328',
                  color: '#e6edf3',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                  fontSize: '11px',
                  padding: '12px',
                  borderRadius: '6px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5'
                }}>
                  {syncLogsIssues.map((log, index) => (
                    <div key={index} style={{ marginBottom: '4px' }}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            {syncLogsPRs.length > 0 && (
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '13px', marginBottom: '8px', color: '#57606a' }}>Setup Logs</h3>
                <div style={{
                  background: '#1f2328',
                  color: '#e6edf3',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                  fontSize: '11px',
                  padding: '12px',
                  borderRadius: '6px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5'
                }}>
                  {syncLogsPRs.map((log, index) => (
                    <div key={index} style={{ marginBottom: '4px' }}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
