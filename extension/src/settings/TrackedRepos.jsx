import { useState, useEffect } from 'react';

const STORAGE_KEY = 'trackedRepositories';
const DEFAULT_REPO = 'YASHK-arch/RepoOwl-extension';

export function TrackedRepos() {
  const [repos, setRepos] = useState([]);
  const [newRepo, setNewRepo] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [syncing, setSyncing] = useState(false);

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
    
    // Basic validation for owner/repo
    if (!repo.includes('/') || repo.split('/').length !== 2) {
      setStatus({ type: 'error', message: 'Repository must be in owner/repo format.' });
      return;
    }

    if (repos.includes(repo)) {
      setStatus({ type: 'error', message: 'Repository is already tracked.' });
      return;
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

  const handleForceSync = (repo) => {
    setSyncing(repo);
    setStatus({ type: '', message: '' });
    
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'force_sync', repoName: repo }, (response) => {
        setSyncing(null);
        if (response && response.success) {
          setStatus({ type: 'success', message: `Successfully synced ${repo}.` });
        } else {
          setStatus({ type: 'error', message: `Sync failed for ${repo}: ${response?.error || 'Unknown error'}` });
        }
      });
    } else {
      setSyncing(null);
      setStatus({ type: 'error', message: 'Not in extension environment.' });
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
                {repo === DEFAULT_REPO && (
                  <span style={{ fontSize: '12px', color: '#57606a' }}>Default Baseline Repository</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="ro-btn ro-btn--secondary"
                  onClick={() => handleForceSync(repo)}
                  disabled={syncing === repo}
                >
                  {syncing === repo ? 'Syncing...' : 'Force Sync'}
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
    </>
  );
}
