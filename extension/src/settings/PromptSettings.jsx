import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_PROMPT_TEMPLATE } from '@repoowl/shared';
import {
  ensureAuthenticatedSession,
  getSupabaseClient,
  isSupabaseConfigured,
} from '../lib/supabase.js';

export function PromptSettings() {
  const [repositoryFullName, setRepositoryFullName] = useState('');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT_TEMPLATE);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSavedPrompt = useCallback(async () => {
    const trimmedRepo = repositoryFullName.trim();
    if (!trimmedRepo) {
      setPrompt(DEFAULT_PROMPT_TEMPLATE);
      return;
    }

    if (!(await isSupabaseConfigured())) {
      setStatus({
        type: 'error',
        message: 'Supabase is not configured. Please set up your connection in Model Config.',
      });
      return;
    }

    const supabase = await getSupabaseClient();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const { data, error } = await supabase
        .from('repository_prompts')
        .select('custom_prompt')
        .eq('repository_full_name', trimmedRepo)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const savedPrompt = data?.custom_prompt?.trim();
      setPrompt(savedPrompt || DEFAULT_PROMPT_TEMPLATE);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message ?? 'Failed to load saved prompt.',
      });
      setPrompt(DEFAULT_PROMPT_TEMPLATE);
    } finally {
      setIsLoading(false);
    }
  }, [repositoryFullName]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSavedPrompt();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [loadSavedPrompt]);

  function handleResetToDefault() {
    setPrompt(DEFAULT_PROMPT_TEMPLATE);
    setStatus({ type: 'success', message: 'Restored the default prompt template.' });
  }

  async function handleSave() {
    const trimmedRepo = repositoryFullName.trim();
    if (!trimmedRepo) {
      setStatus({ type: 'error', message: 'Enter a repository (owner/repo) before saving.' });
      return;
    }

    if (!(await isSupabaseConfigured())) {
      setStatus({
        type: 'error',
        message: 'Supabase is not configured. Please set up your connection in Model Config.',
      });
      return;
    }

    setIsSaving(true);
    setStatus({ type: '', message: '' });

    try {
      const authResult = await ensureAuthenticatedSession();
      if (authResult.error) {
        throw new Error(authResult.error);
      }

      const supabase = await getSupabaseClient();
      const { error } = await supabase.from('repository_prompts').upsert(
        {
          repository_full_name: trimmedRepo,
          custom_prompt: prompt,
        },
        { onConflict: 'repository_full_name' }
      );

      if (error) {
        throw error;
      }

      setStatus({ type: 'success', message: `Saved prompt for ${trimmedRepo}.` });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message ?? 'Failed to save prompt.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Under Development overlay ───────────────────────────────────── */}
      {/* "Under Development" pill — top-right corner, always on top */}
      <span style={{
        position: 'absolute',
        top: 0,
        right: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        background: '#fff8e1',
        color: '#b45309',
        border: '1px solid #f59e0b',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        zIndex: 10,
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        🚧 Under Development
      </span>

      {/* Freeze layer — blocks all interaction, dims the content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        cursor: 'not-allowed',
        borderRadius: '6px',
      }} aria-hidden="true" />

      {/* Actual panel content — visible but frozen */}
      <div style={{
        opacity: 0.45,
        pointerEvents: 'none',
        userSelect: 'none',
        filter: 'grayscale(40%)',
      }}>
        <div className="ro-panel-badge">Maintainer Config</div>
        <h1 className="ro-panel-title">Configure the model pipeline</h1>
        <p className="ro-panel-desc">
          Maintainers: Set repository-specific LLM analysis instructions. The background worker uses this
          prompt when processing issues; if none is saved, it falls back to the default
          template below.
        </p>

        {/* Repository field */}
        <div className="ro-section">
          <h2 className="ro-section-title">Repository</h2>
          <p className="ro-section-desc">
            Enter the repository in <code>owner/repo</code> format to load or save a
            custom prompt.
          </p>
          <div className="ro-field">
            <label htmlFor="ro-repository" className="ro-label">
              Repository (owner/repo)
            </label>
            <input
              id="ro-repository"
              className="ro-input"
              type="text"
              placeholder="e.g. octocat/Hello-World"
              value={repositoryFullName}
              readOnly
            />
          </div>
        </div>

        {/* Prompt template */}
        <div className="ro-section">
          <h2 className="ro-section-title">Analysis Prompt Template</h2>
          <p className="ro-section-desc">
            Customise the instructions sent to the LLM for each issue. Use the default
            template as a starting point.
          </p>
          <div className="ro-field">
            <label htmlFor="ro-prompt-template" className="ro-label">
              Prompt Template
            </label>
            <textarea
              id="ro-prompt-template"
              className="ro-textarea"
              value={prompt}
              readOnly
              spellCheck={false}
            />
          </div>

          <div className="ro-actions">
            <button
              id="ro-save-prompt"
              type="button"
              className="ro-btn ro-btn--primary"
              disabled
            >
              Save Prompt
            </button>
            <button
              id="ro-reset-prompt"
              type="button"
              className="ro-btn ro-btn--secondary"
              disabled
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

