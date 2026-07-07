import { useState, useEffect } from 'react';

const STORAGE_KEYS = {
  supabaseUrl: 'roSupabaseUrl',
  supabaseAnonKey: 'roSupabaseAnonKey',
  configured: 'roConfigured',
  provider: 'roProvider',
};

export function ModelConfig() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get([STORAGE_KEYS.supabaseUrl, STORAGE_KEYS.supabaseAnonKey], (result) => {
        if (result[STORAGE_KEYS.supabaseUrl]) setSupabaseUrl(result[STORAGE_KEYS.supabaseUrl]);
        if (result[STORAGE_KEYS.supabaseAnonKey]) setSupabaseAnonKey(result[STORAGE_KEYS.supabaseAnonKey]);
      });
    }
  }, []);

  async function handleSave() {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setStatus({ type: 'error', message: 'Both fields are required.' });
      return;
    }

    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      // Validate the URL by doing a quick test fetch
      const testUrl = `${supabaseUrl.trim()}/rest/v1/issues?select=issue_id&limit=1`;
      const res = await fetch(testUrl, {
        headers: {
          apikey: supabaseAnonKey.trim(),
          Authorization: `Bearer ${supabaseAnonKey.trim()}`,
        },
      });

      if (!res.ok && res.status !== 404) {
        throw new Error(`Supabase returned status ${res.status}. Check your URL and key.`);
      }

      if (typeof chrome !== 'undefined' && chrome.storage) {
        await new Promise((resolve, reject) => {
          chrome.storage.sync.set({
            [STORAGE_KEYS.supabaseUrl]: supabaseUrl.trim(),
            [STORAGE_KEYS.supabaseAnonKey]: supabaseAnonKey.trim(),
            [STORAGE_KEYS.configured]: true,
            [STORAGE_KEYS.provider]: 'Groq',
          }, () => {
            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
            else resolve();
          });
        });
      }

      setStatus({ type: 'success', message: '✅ Configuration saved! Reload any GitHub tabs to see RepoOwl.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message ?? 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="ro-panel-badge">Model Config</div>
      <h1 className="ro-panel-title">Configure the model pipeline</h1>
      <p className="ro-panel-desc">
        Connect a provider, authorize its origin, and choose the model used by RepoOwl.
      </p>

      {/* Provider & endpoint */}
      <div className="ro-section">
        <h2 className="ro-section-title">Provider &amp; endpoint</h2>
        <p className="ro-section-desc">
          Choose the backend and authorise the origin that will receive extension requests.
        </p>

        <div className="ro-field">
          <label className="ro-label">Provider</label>
          <div className="ro-select-wrapper">
            <select className="ro-select" defaultValue="groq" disabled>
              <option value="groq">Groq (LLaMA 3.3 70B)</option>
            </select>
          </div>
          <p className="ro-help">Processing happens server-side in the background worker, not in the browser.</p>
        </div>

        <div className="ro-field">
          <label htmlFor="ro-supabase-url" className="ro-label">Supabase Base URL</label>
          <input
            id="ro-supabase-url"
            className="ro-input"
            type="url"
            placeholder="https://your-project.supabase.co"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            spellCheck={false}
          />
          <p className="ro-help">Your Supabase project URL — find it in Project Settings → API.</p>
        </div>
      </div>

      {/* Authentication */}
      <div className="ro-section">
        <h2 className="ro-section-title">Authentication &amp; model</h2>
        <p className="ro-section-desc">
          Keep credentials and model selection grouped so the request stack reads cleanly.
        </p>

        <div className="ro-field">
          <label htmlFor="ro-anon-key" className="ro-label">Supabase Anon Key</label>
          <div className="ro-input-row">
            <input
              id="ro-anon-key"
              className="ro-input"
              type={showKey ? 'text' : 'password'}
              placeholder="eyJhbGciO..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              spellCheck={false}
              style={{ fontFamily: showKey ? 'monospace' : 'inherit', fontSize: showKey ? '11px' : 'inherit' }}
            />
            <button
              type="button"
              className="ro-btn ro-btn--secondary ro-btn--icon"
              onClick={() => setShowKey(!showKey)}
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.143 2.31a.75.75 0 0 1 1.047-.167l14.5 10.5a.75.75 0 1 1-.88 1.214l-2.248-1.628C11.346 12.68 9.792 13 8 13c-3.154 0-5.823-1.427-7.53-3.501a1.75 1.75 0 0 1 0-2.002A12.63 12.63 0 0 1 2.529 5.5L.31 3.357A.75.75 0 0 1 .143 2.31zm3.5 4.498-.92-.666A11.129 11.129 0 0 0 1.708 7.5c-.41.477-.708 1.017-.708 1.5s.298 1.023.708 1.5C3.12 12.073 5.333 13 8 13c1.318 0 2.563-.264 3.667-.735l-.918-.664A5.5 5.5 0 0 1 8 11.5c-3.038 0-5.5-2.462-5.5-5.5 0-.332.03-.658.089-.972zm7.172 5.208 1.38.999A11.13 11.13 0 0 0 14.292 9.5c.41-.477.708-1.017.708-1.5s-.298-1.023-.708-1.5C12.88 4.427 10.667 3 8 3c-1.318 0-2.563.264-3.667.735l1.38.999A3.75 3.75 0 0 1 8 4.5c2.071 0 3.75 1.679 3.75 3.75 0 .578-.131 1.125-.362 1.614z"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z"/>
                </svg>
              )}
            </button>
          </div>
          <p className="ro-help">The public anon key — safe to use in the browser extension.</p>
        </div>

        <div className="ro-field">
          <label className="ro-label">Model</label>
          <input
            className="ro-input"
            type="text"
            value="llama-3.3-70b-versatile"
            readOnly
            style={{ opacity: 0.7 }}
          />
          <p className="ro-help">Processed server-side by the worker. Change in <code>worker/src/callGroq.js</code>.</p>
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
          {saving ? 'Saving…' : 'Save & Validate'}
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
