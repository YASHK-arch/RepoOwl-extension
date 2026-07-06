import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

let client = null;
let authInitialization = null;

function createAuthStorage() {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return {
      getItem: async (key) => {
        const result = await chrome.storage.local.get([key]);
        return result[key] ?? null;
      },
      setItem: async (key, value) => {
        await chrome.storage.local.set({ [key]: value });
      },
      removeItem: async (key) => {
        await chrome.storage.local.remove([key]);
      },
    };
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  return undefined;
}

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: createAuthStorage(),
      },
    });
  }

  return client;
}

/**
 * Prompt saves require the authenticated role under tightened RLS.
 * Anonymous sign-in gives the extension a scoped JWT without maintainer signup.
 */
export async function ensureAuthenticatedSession() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: 'Supabase is not configured for RepoOwl.' };
  }

  if (!authInitialization) {
    authInitialization = (async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw new Error(sessionError.message);
      }

      if (data.session) {
        return;
      }

      const { error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) {
        throw new Error(signInError.message);
      }
    })().catch((error) => {
      authInitialization = null;
      throw error;
    });
  }

  try {
    await authInitialization;
    return { error: null };
  } catch (error) {
    return {
      error:
        error.message ??
        'Failed to establish an authenticated RepoOwl session. Enable Anonymous sign-ins in Supabase Auth.',
    };
  }
}
