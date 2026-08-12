import { useState, useEffect } from 'react';
import {
  launchGitHubOAuth,
  launchSupabaseOAuth,
  finalizeSupabaseProject,
  disconnectOAuth,
  getOAuthRedirectUrl,
} from '../lib/oauth.js';

const STORAGE_KEY = 'repoOwlConfig';

// ── Small helper components ──────────────────────────────────────────────────

function ConnectedBadge({ label, sub }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 14px',
      background: 'rgba(46, 160, 67, 0.08)',
      border: '1px solid rgba(46, 160, 67, 0.3)',
      borderRadius: '8px',
    }}>
      <span style={{ fontSize: '18px' }}>✅</span>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#2ea043' }}>{label}</div>
        {sub && <div style={{ fontSize: '11px', color: '#57606a', marginTop: '1px' }}>{sub}</div>}
      </div>
    </div>
  );
}

function OAuthButton({ icon, label, onClick, loading, disabled, variant = 'primary' }) {
  return (
    <button
      type="button"
      className={`ro-btn ro-btn--${variant}`}
      onClick={onClick}
      disabled={loading || disabled}
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      {loading
        ? <span style={{ fontSize: '14px' }}>⏳</span>
        : <span style={{ fontSize: '14px' }}>{icon}</span>
      }
      {loading ? 'Connecting...' : label}
    </button>
  );
}

// ── Project Picker Modal ─────────────────────────────────────────────────────

function ProjectPicker({ projects, onSelect, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div style={{
        background: '#161b22', border: '1px solid #30363d', borderRadius: '12px',
        padding: '24px', width: '420px', maxHeight: '70vh', display: 'flex', flexDirection: 'column',
      }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '16px', color: '#e6edf3' }}>Select a Supabase Project</h2>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#8b949e' }}>
          RepoOwl will automatically initialize the database schema on the selected project.
        </p>
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: '2px', padding: '10px 14px', textAlign: 'left',
                background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px',
                color: '#e6edf3', cursor: 'pointer', transition: 'border-color 0.12s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#30363d'}
            >
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{p.name}</span>
              <span style={{ fontSize: '11px', color: '#8b949e', fontFamily: 'monospace' }}>
                {p.id} · {p.region}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="ro-btn ro-btn--secondary"
          onClick={onCancel}
          style={{ marginTop: '16px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function ModelConfig() {
  const [config, setConfig] = useState({
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabasePAT: '',
    groqApiKey: '',
    githubToken: '',
    githubLogin: '',
    githubAvatarUrl: '',
  });

  // Track which section is using the legacy manual-entry fallback
  const [showManualSupabase, setShowManualSupabase] = useState(false);
  const [showManualGitHub, setShowManualGitHub] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // OAuth state
  const [githubLoading, setGithubLoading] = useState(false);
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  // Project picker state
  const [projectPickerState, setProjectPickerState] = useState(null); // { accessToken, projects }

  // Status
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const isGitHubConnected = Boolean(config.githubToken);
  const isSupabaseConnected = Boolean(config.supabaseUrl && config.supabaseAnonKey);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY]) {
          setConfig(prev => ({ ...prev, ...result[STORAGE_KEY] }));
        }
      });
    }
  }, []);

  const persistConfig = async (partial) => {
    const merged = { ...config, ...partial };
    setConfig(merged);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [STORAGE_KEY]: merged });
    }
    return merged;
  };

  // ── GitHub OAuth ──────────────────────────────────────────────────────────

  const handleConnectGitHub = async () => {
    setGithubLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const { githubToken, githubLogin, avatarUrl } = await launchGitHubOAuth();
      await persistConfig({ githubToken, githubLogin, githubAvatarUrl: avatarUrl });
      setStatus({ type: 'success', message: `✅ GitHub connected as @${githubLogin}` });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: `❌ GitHub OAuth failed: ${err.message}` });
    } finally {
      setGithubLoading(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    await disconnectOAuth('github');
    await persistConfig({ githubToken: '', githubLogin: '', githubAvatarUrl: '' });
    setStatus({ type: 'success', message: 'GitHub disconnected.' });
    setTimeout(() => setStatus({ type: '', message: '' }), 2000);
  };

  // ── Supabase OAuth ────────────────────────────────────────────────────────

  const handleConnectSupabase = async () => {
    setSupabaseLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const { accessToken, projects } = await launchSupabaseOAuth();
      if (projects.length === 0) {
        throw new Error('No Supabase projects found in your account. Create a project at app.supabase.com first.');
      }
      if (projects.length === 1) {
        // Auto-select if only one project
        await handleProjectSelected({ accessToken, project: projects[0] });
      } else {
        // Show project picker
        setProjectPickerState({ accessToken, projects });
      }
    } catch (err) {
      setStatus({ type: 'error', message: `❌ Supabase OAuth failed: ${err.message}` });
    } finally {
      setSupabaseLoading(false);
    }
  };

  const handleProjectSelected = async ({ accessToken, project }) => {
    setProjectPickerState(null);
    setSupabaseLoading(true);
    setStatus({ type: '', message: `⚙️ Provisioning database on "${project.name}"...` });
    try {
      const { supabaseUrl, supabaseAnonKey } = await finalizeSupabaseProject(accessToken, project.id);
      await persistConfig({ supabaseUrl, supabaseAnonKey, supabasePAT: '' });
      setStatus({ type: 'success', message: `✅ Supabase connected & schema initialized on "${project.name}"` });
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    } catch (err) {
      setStatus({ type: 'error', message: `❌ Provisioning failed: ${err.message}` });
    } finally {
      setSupabaseLoading(false);
    }
  };

  const handleDisconnectSupabase = async () => {
    await disconnectOAuth('supabase');
    await persistConfig({ supabaseUrl: '', supabaseAnonKey: '', supabasePAT: '' });
    setStatus({ type: 'success', message: 'Supabase disconnected.' });
    setTimeout(() => setStatus({ type: '', message: '' }), 2000);
  };

  // ── Manual save (Groq key + fallback credentials) ─────────────────────────

  const handleChange = (e) => {
    setConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!config.groqApiKey.trim()) {
      setStatus({ type: 'error', message: 'Groq API Key is required.' });
      return;
    }
    if (!config.supabaseUrl.trim() || !config.supabaseAnonKey.trim()) {
      setStatus({ type: 'error', message: 'Connect Supabase via OAuth, or fill in the manual fields below.' });
      return;
    }
    setSaving(true);
    setStatus({ type: '', message: 'Saving...' });
    try {
      await persistConfig({});
      setStatus({ type: 'success', message: '✅ Configuration saved.' });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: `❌ Save failed: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const redirectUrl = getOAuthRedirectUrl();

  return (
    <>
      <div className="ro-panel-badge">Maintainer Config</div>
      <h1 className="ro-panel-title">Maintainer Configuration</h1>
      <p className="ro-panel-desc">
        Connect your services to power AI issue analysis. Your credentials are stored locally in your browser and never sent to any third party except the services they belong to.
      </p>

      {status.message && (
        <div className={`ro-status ro-status--${status.type}`} style={{ margin: '0 0 20px 0', width: '100%' }}>
          {status.message}
        </div>
      )}

      {/* ── GitHub Connection ── */}
      <div className="ro-section">
        <h2 className="ro-section-title">GitHub</h2>
        <p className="ro-section-desc">
          Required for fetching issues, PR diffs, and the repository file tree.
        </p>

        {isGitHubConnected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ConnectedBadge
              label={config.githubLogin ? `Connected as @${config.githubLogin}` : 'GitHub Connected'}
              sub="Scopes: repo, read:org, workflow"
            />
            <button
              type="button"
              className="ro-btn ro-btn--secondary"
              style={{ width: 'fit-content' }}
              onClick={handleDisconnectGitHub}
            >
              Disconnect GitHub
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <OAuthButton
              icon="🔗"
              label="Connect GitHub"
              onClick={handleConnectGitHub}
              loading={githubLoading}
            />
            <button
              type="button"
              className="ro-btn ro-btn--secondary"
              onClick={() => setShowManualGitHub(v => !v)}
              style={{ width: 'fit-content', fontSize: '12px' }}
            >
              {showManualGitHub ? 'Hide manual entry' : 'Use a PAT instead'}
            </button>
            {showManualGitHub && (
              <div className="ro-field">
                <label className="ro-label">GitHub Personal Access Token</label>
                <div className="ro-input-row">
                  <input
                    name="githubToken"
                    className="ro-input"
                    type={showKey ? 'text' : 'password'}
                    placeholder="ghp_..."
                    value={config.githubToken}
                    onChange={handleChange}
                    spellCheck={false}
                  />
                  <button type="button" className="ro-btn ro-btn--secondary ro-btn--icon"
                    onClick={() => setShowKey(!showKey)}>
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="ro-help">Requires scopes: <code>repo</code>, <code>read:org</code>, <code>workflow</code></p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Supabase Connection ── */}
      <div className="ro-section">
        <h2 className="ro-section-title">Supabase Database</h2>
        <p className="ro-section-desc">
          Stores issue analysis results. Connecting via OAuth lets RepoOwl automatically
          initialize your database schema — no manual SQL required.
        </p>

        {isSupabaseConnected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ConnectedBadge
              label="Supabase Connected"
              sub={config.supabaseUrl}
            />
            <button
              type="button"
              className="ro-btn ro-btn--secondary"
              style={{ width: 'fit-content' }}
              onClick={handleDisconnectSupabase}
            >
              Disconnect Supabase
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <OAuthButton
              icon="⚡"
              label="Connect Supabase (auto-setup)"
              onClick={handleConnectSupabase}
              loading={supabaseLoading}
            />
            <button
              type="button"
              className="ro-btn ro-btn--secondary"
              onClick={() => setShowManualSupabase(v => !v)}
              style={{ width: 'fit-content', fontSize: '12px' }}
            >
              {showManualSupabase ? 'Hide manual entry' : 'Enter credentials manually instead'}
            </button>
            {showManualSupabase && (
              <>
                <div className="ro-field">
                  <label className="ro-label">Supabase Project URL</label>
                  <input
                    name="supabaseUrl"
                    className="ro-input"
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={config.supabaseUrl}
                    onChange={handleChange}
                    spellCheck={false}
                  />
                </div>
                <div className="ro-field">
                  <label className="ro-label">Supabase Anon Key</label>
                  <input
                    name="supabaseAnonKey"
                    className="ro-input"
                    type={showKey ? 'text' : 'password'}
                    placeholder="eyJhbGciO..."
                    value={config.supabaseAnonKey}
                    onChange={handleChange}
                    spellCheck={false}
                    style={{ fontFamily: showKey ? 'monospace' : 'inherit', fontSize: showKey ? '11px' : 'inherit' }}
                  />
                </div>
                <div className="ro-field">
                  <label className="ro-label">Supabase Personal Access Token (for auto-migration)</label>
                  <input
                    name="supabasePAT"
                    className="ro-input"
                    type={showKey ? 'text' : 'password'}
                    placeholder="sbp_..."
                    value={config.supabasePAT}
                    onChange={handleChange}
                    spellCheck={false}
                    style={{ fontFamily: showKey ? 'monospace' : 'inherit', fontSize: showKey ? '11px' : 'inherit' }}
                  />
                  <p className="ro-help">Optional. Provide a PAT to automatically run the schema migration.</p>
                </div>
                <button type="button" className="ro-btn ro-btn--secondary ro-btn--icon"
                  onClick={() => setShowKey(!showKey)} style={{ width: 'fit-content' }}>
                  {showKey ? 'Hide keys' : 'Show keys'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Groq API Key ── */}
      <div className="ro-section">
        <h2 className="ro-section-title">Groq API Key</h2>
        <p className="ro-section-desc">
          Required for AI-powered issue analysis. Get a free key at{' '}
          <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com</a>.
        </p>
        <div className="ro-field">
          <label className="ro-label">Groq API Key</label>
          <div className="ro-input-row">
            <input
              name="groqApiKey"
              id="ro-groq-key"
              className="ro-input"
              type={showKey ? 'text' : 'password'}
              placeholder="gsk_..."
              value={config.groqApiKey}
              onChange={handleChange}
              spellCheck={false}
              style={{ fontFamily: showKey ? 'monospace' : 'inherit', fontSize: showKey ? '11px' : 'inherit' }}
            />
            <button type="button" className="ro-btn ro-btn--secondary ro-btn--icon"
              onClick={() => setShowKey(!showKey)}>
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Developer Info ── */}
      {redirectUrl && (
        <div className="ro-section" style={{ opacity: 0.7 }}>
          <h2 className="ro-section-title" style={{ fontSize: '12px' }}>OAuth Redirect URL (for app setup)</h2>
          <code style={{ fontSize: '11px', wordBreak: 'break-all', color: '#8b949e' }}>{redirectUrl}</code>
          <p className="ro-help">Paste this as the Authorization Callback URL in your GitHub &amp; Supabase OAuth App settings.</p>
        </div>
      )}

      {/* ── Save ── */}
      <div className="ro-actions">
        <button
          id="ro-save-config"
          type="button"
          className="ro-btn ro-btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* ── Project Picker Modal ── */}
      {projectPickerState && (
        <ProjectPicker
          projects={projectPickerState.projects}
          onSelect={(project) => handleProjectSelected({ accessToken: projectPickerState.accessToken, project })}
          onCancel={() => {
            setProjectPickerState(null);
            setSupabaseLoading(false);
          }}
        />
      )}
    </>
  );
}
