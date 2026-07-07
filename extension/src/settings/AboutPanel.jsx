import { useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js';

export function AboutPanel() {
  const [clearing, setClearing] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  async function handleClearCache() {
    setClearing(true);
    setStatus({ type: '', message: '' });

    try {
      if (!isSupabaseConfigured()) {
        setStatus({ type: 'error', message: 'Supabase is not configured.' });
        return;
      }

      // For now, clearing means resetting the extension's local storage cache
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await new Promise((resolve, reject) => {
          chrome.storage.local.clear(() => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
      }

      setStatus({ type: 'success', message: 'Local cache cleared successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message ?? 'Failed to clear cache.' });
    } finally {
      setClearing(false);
    }
  }

  return (
    <>
      <div className="ro-panel-badge">About</div>
      <h1 className="ro-panel-title">Extension state &amp; diagnostics</h1>
      <p className="ro-panel-desc">
        Review the current configuration of the RepoOwl extension and clear any cached
        analysis data when you need a fresh run.
      </p>

      {/* Status snapshot */}
      <div className="ro-section">
        <h2 className="ro-section-title">Configuration snapshot</h2>
        <p className="ro-section-desc">
          Current values detected at extension startup.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              ['Version', '0.1.0'],
              ['Supabase', isSupabaseConfigured() ? '✅ Configured' : '⚠️ Not configured'],
              ['Provider', 'Groq'],
              ['Model', import.meta.env.VITE_GROQ_MODEL ?? 'llama-3.3-70b-versatile'],
            ].map(([key, val]) => (
              <tr
                key={key}
                style={{ borderBottom: '1px solid #d0d7de' }}
              >
                <td
                  style={{
                    padding: '10px 0',
                    fontWeight: 600,
                    fontSize: 13,
                    width: 160,
                    color: '#1f2328',
                  }}
                >
                  {key}
                </td>
                <td style={{ padding: '10px 0', fontSize: 13, color: '#656d76' }}>
                  {val}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cache management */}
      <div className="ro-section">
        <h2 className="ro-section-title">Cache management</h2>
        <p className="ro-section-desc">
          Clear the extension&apos;s local storage cache. The next time you visit a
          GitHub issues page, fresh data will be fetched from Supabase.
        </p>
        <div className="ro-actions">
          <button
            id="ro-clear-cache"
            type="button"
            className="ro-btn ro-btn--secondary"
            onClick={handleClearCache}
            disabled={clearing}
          >
            {clearing ? 'Clearing…' : 'Clear Cache'}
          </button>
        </div>
        {status.message ? (
          <p className={`ro-status ro-status--${status.type}`}>{status.message}</p>
        ) : null}
      </div>
    </>
  );
}
