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

    if (!isSupabaseConfigured()) {
      setStatus({
        type: 'error',
        message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      });
      return;
    }

    const supabase = getSupabaseClient();
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

    if (!isSupabaseConfigured()) {
      setStatus({
        type: 'error',
        message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
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

      const supabase = getSupabaseClient();
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
    <div className="prompt-settings">
      <h1>RepoOwl Prompt Settings</h1>
      <p>
        Configure repository-specific LLM analysis instructions. The background worker
        uses this prompt when processing issues; if none is saved, it falls back to the
        default template below.
      </p>

      <label htmlFor="repository">Repository (owner/repo)</label>
      <input
        id="repository"
        className="repo-input"
        type="text"
        placeholder="e.g. octocat/Hello-World"
        value={repositoryFullName}
        onChange={(event) => setRepositoryFullName(event.target.value)}
      />

      <label htmlFor="prompt-template">Analysis Prompt Template</label>
      <textarea
        id="prompt-template"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        disabled={isLoading}
        spellCheck={false}
      />

      <div className="actions">
        <button type="button" className="primary" onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? 'Saving...' : 'Save Prompt'}
        </button>
        <button type="button" onClick={handleResetToDefault} disabled={isLoading}>
          Reset to Default
        </button>
      </div>

      {status.message ? (
        <p className={`status ${status.type}`}>{status.message}</p>
      ) : null}
    </div>
  );
}
