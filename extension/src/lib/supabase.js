import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'repoOwlConfig';
let client = null;

async function getKeysFromStorage() {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    return result[STORAGE_KEY] || {};
  }
  return {};
}

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

export async function isSupabaseConfigured() {
  const keys = await getKeysFromStorage();
  return Boolean(keys.supabaseUrl && keys.supabaseAnonKey);
}

export async function getSupabaseClient() {
  const configured = await isSupabaseConfigured();
  if (!configured) {
    return null;
  }

  if (!client) {
    const keys = await getKeysFromStorage();
    client = createClient(keys.supabaseUrl, keys.supabaseAnonKey, {
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

export async function ensureAuthenticatedSession() {
  const supabase = await getSupabaseClient();
  if (!supabase) {
    return { error: 'Supabase is not configured for RepoOwl.' };
  }

  try {
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (data.session) {
      return { error: null };
    }

    const { error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError) {
      throw new Error(signInError.message);
    }

    return { error: null };
  } catch (error) {
    return {
      error:
        error.message ??
        'Failed to establish an authenticated RepoOwl session. Enable Anonymous sign-ins in Supabase Auth.',
    };
  }
}
