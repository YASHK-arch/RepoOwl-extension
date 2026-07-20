import { useState, useEffect } from 'react';

const STORAGE_KEY = 'trackedRepositories';
const DEFAULT_REPO = 'YASHK-arch/RepoOwl-extension';

export function TrackedRepos() {
  const [repos, setRepos] = useState([]);
  const [newRepo, setNewRepo] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const [syncingIssues, setSyncingIssues] = useState(null);
  const [syncingPRs, setSyncingPRs] = useState(null);
  
  const [syncLogsIssues, setSyncLogsIssues] = useState([]);
  const [syncLogsPRs, setSyncLogsPRs] = useState([]);
  
  const [mediatorStatus, setMediatorStatus] = useState({});

  const fetchStatus = (repo) => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'check_mediator_status', repoName: repo }, (response) => {
        if (response && response.registered) {
          setMediatorStatus(prev => ({ ...prev, [repo]: true }));
        } else {
          setMediatorStatus(prev => ({ ...prev, [repo]: false }));
        }
      });
    }
  };

  useEffect(() => {
    repos.forEach(fetchStatus);
  }, [repos]);


  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        let savedRepos = result[STORAGE_KEY];
        if (!Array.isArray(savedRepos)) {
          savedRepos = [DEFAULT_REPO];
          chrome.storage.local.set({ [STORAGE_KEY]: savedRepos });
        } else if (!savedRepos.includes(DEFAULT_REPO)) {
          savedRepos = [DEFAULT_REPO, ...savedRepos];
          chrome.storage.local.set({ [STORAGE_KEY]: savedRepos });
        }
        setRepos(savedRepos);
      });
    } else {
      // Fallback for local dev without extension environment
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
          // Fallback if log_type is missing
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
          setStatus({ type: 'error', message: `Issue Sync failed for ${repo}: ${response?.error || 'Unknown error'}` });
        }
        fetchStatus(repo);
      });
    } else {
      setSyncingIssues(null);
      setStatus({ type: 'error', message: 'Not in extension environment.' });
    }
  };
  
  const handleInitPRs = (repo) => {
    const pat = window.prompt(`To auto-install RepoOwl GitHub Actions in ${repo}, please enter your GitHub Personal Access Token (PAT) with 'repo' and 'workflow' scopes:`);
    if (!pat) return;

    // Fetch GROQ API key from storage to pass to background
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['repoOwlConfig'], (result) => {
        const keys = result.repoOwlConfig || {};
        if (!keys.groqApiKey && !import.meta.env.VITE_GROQ_API_KEY) {
          setStatus({ type: 'error', message: 'GROQ_API_KEY is not set in Model Configuration.' });
          return;
        }
        
        const groqApiKey = keys.groqApiKey || import.meta.env.VITE_GROQ_API_KEY;

        setStatus({ type: '', message: `Initializing PR Analyzer for ${repo}...` });
        chrome.runtime.sendMessage({ action: 'initialize_repoowl_pr', repoName: repo, githubPat: pat, groqApiKey: groqApiKey }, (response) => {
          if (response && response.success) {
            setStatus({ type: 'success', message: `Successfully installed RepoOwl PR Analyzer in ${repo}!` });
          } else {
            setStatus({ type: 'error', message: `Failed to install PR Analyzer: ${response?.error || 'Unknown error'}` });
          }
        });
      });
    }
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
        <h2 className="ro-section-title">Tracked Repositories List</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {repos.map((repo) => (
            <div key={repo} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '12px',
              border: '1px solid #d0d7de',
              borderRadius: '6px',
              backgroundColor: repo === DEFAULT_REPO ? '#f6f8fa' : 'transparent'
            }}>
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>{repo}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  {repo === DEFAULT_REPO && (
                    <span style={{ fontSize: '12px', color: '#57606a' }}>Default Baseline Repository</span>
                  )}
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="ro-btn ro-btn--secondary"
                  onClick={() => handleForceSyncIssues(repo)}
                  disabled={syncingIssues === repo}
                >
                  {syncingIssues === repo ? 'Syncing Issues...' : 'Sync Issues'}
                </button>
                
                <button
                  type="button"
                  className="ro-btn ro-btn--primary"
                  onClick={() => handleInitPRs(repo)}
                >
                  🚀 Initialize PR Analyzer
                </button>

                {repo !== DEFAULT_REPO && (
                  <button
                    type="button"
                    className="ro-btn ro-btn--secondary"
                    onClick={() => handleDelete(repo)}
                    style={{ color: '#cf222e' }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {syncLogsIssues.length > 0 && (
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

          </div>
        </div>
      )}
    </>
  );
}
