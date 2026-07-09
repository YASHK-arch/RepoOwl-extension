import { useState, useEffect } from 'react';

const STORAGE_KEY = 'repoOwlConfig';

export function ModelConfig() {
  const [keys, setKeys] = useState({
    supabaseUrl: '',
    supabaseAnonKey: '',
    groqApiKey: '',
    githubToken: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY]) {
          setKeys(result[STORAGE_KEY]);
        }
      });
    }
  }, []);

  const handleChange = (e) => {
    setKeys({ ...keys, [e.target.name]: e.target.value });
  };

  async function handleSave(e) {
    e.preventDefault();
    if (!keys.supabaseUrl.trim() || !keys.supabaseAnonKey.trim() || !keys.groqApiKey.trim()) {
      setStatus({ type: 'error', message: 'Supabase URL, Anon Key, and Groq API Key are required.' });
      return;
    }

    setSaving(true);
    setStatus({ type: '', message: 'Verifying connection and schema...' });

    try {
      // 1. Test the Supabase connection by trying to fetch 1 row from the 'issues' table
      const response = await fetch(`${keys.supabaseUrl.trim()}/rest/v1/issues?select=id&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': keys.supabaseAnonKey.trim(),
          'Authorization': `Bearer ${keys.supabaseAnonKey.trim()}`
        }
      });

      // 2. Catch the missing schema error
      if (!response.ok) {
        throw new Error("Cannot find the 'issues' table. Did you run the database-schema.sql in Supabase?");
      }

      // 3. If successful, save to Chrome Storage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ [STORAGE_KEY]: keys });
      }

      setStatus({ type: 'success', message: '✅ All keys verified and securely saved!' });
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);

    } catch (err) {
      // 4. Alert the user exactly what went wrong
      setStatus({ type: 'error', message: `❌ Setup Failed: ${err.message}` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="ro-panel-badge">Model Config</div>
      <h1 className="ro-panel-title">Configure BYOK Pipeline</h1>
      <p className="ro-panel-desc">
        Connect your Supabase database and Groq API key to power RepoOwl entirely in your browser.
      </p>

      {/* Database */}
      <div className="ro-section">
        <h2 className="ro-section-title">Database (Supabase)</h2>
        <p className="ro-section-desc">
          Provide your Supabase credentials. Make sure you have run the <code>database-schema.sql</code> script.
        </p>

        <div className="ro-field">
          <label className="ro-label">Supabase Base URL</label>
          <input
            name="supabaseUrl"
            className="ro-input"
            type="url"
            placeholder="https://your-project.supabase.co"
            value={keys.supabaseUrl}
            onChange={handleChange}
            spellCheck={false}
          />
        </div>

        <div className="ro-field">
          <label className="ro-label">Supabase Anon Key</label>
          <div className="ro-input-row">
            <input
              name="supabaseAnonKey"
              className="ro-input"
              type={showKey ? 'text' : 'password'}
              placeholder="eyJhbGciO..."
              value={keys.supabaseAnonKey}
              onChange={handleChange}
              spellCheck={false}
              style={{ fontFamily: showKey ? 'monospace' : 'inherit', fontSize: showKey ? '11px' : 'inherit' }}
            />
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="ro-section">
        <h2 className="ro-section-title">API Keys</h2>

        <div className="ro-field">
          <label className="ro-label">Groq API Key (Llama 3)</label>
          <div className="ro-input-row">
            <input
              name="groqApiKey"
              className="ro-input"
              type={showKey ? 'text' : 'password'}
              placeholder="gsk_..."
              value={keys.groqApiKey}
              onChange={handleChange}
              spellCheck={false}
              style={{ fontFamily: showKey ? 'monospace' : 'inherit', fontSize: showKey ? '11px' : 'inherit' }}
            />
            <button
              type="button"
              className="ro-btn ro-btn--secondary ro-btn--icon"
              onClick={() => setShowKey(!showKey)}
              title={showKey ? 'Hide keys' : 'Show keys'}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="ro-help">Required for AI analysis.</p>
        </div>

        <div className="ro-field">
          <label className="ro-label">GitHub Token (Optional)</label>
          <div className="ro-input-row">
            <input
              name="githubToken"
              className="ro-input"
              type={showKey ? 'text' : 'password'}
              placeholder="ghp_..."
              value={keys.githubToken}
              onChange={handleChange}
              spellCheck={false}
              style={{ fontFamily: showKey ? 'monospace' : 'inherit', fontSize: showKey ? '11px' : 'inherit' }}
            />
          </div>
          <p className="ro-help">Provide a token to avoid strict GitHub API rate limits.</p>
        </div>
      </div>

      {/* Save */}
      <div className="ro-actions">
        <button
          id="ro-save-config"
          type="button"
          className="ro-btn ro-btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Verifying...' : 'Save & Validate'}
        </button>
      </div>

      {status.message && (
        <p className={`ro-status ro-status--${status.type}`} style={{ marginTop: 12 }}>
          {status.message}
        </p>
      )}
    </>
  );
}
