import { createClient } from '@supabase/supabase-js';

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

const STORAGE_KEY = 'repoOwlConfig';
let sandboxClient = null;
let hubClient = null;
let publicGatewayConfig = null;

export function setPublicGatewayConfig(url, anonKey) {
  if (publicGatewayConfig?.supabaseUrl === url && publicGatewayConfig?.supabaseAnonKey === anonKey) {
    return;
  }
  publicGatewayConfig = { supabaseUrl: url, supabaseAnonKey: anonKey };
  hubClient = null; // Force client recreation
}

export function getPublicGatewayConfig() {
  return publicGatewayConfig;
}

async function getKeysFromStorage() {
  let keys = {};
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    keys = result[STORAGE_KEY] || {};
  }
  
  if (!keys.supabaseUrl && import.meta.env.VITE_SUPABASE_URL) {
    keys.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  }
  if (!keys.supabaseAnonKey && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    keys.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  
  return keys;
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

export async function isSandboxConfigured() {
  const keys = await getKeysFromStorage();
  return Boolean(keys.supabaseUrl && keys.supabaseAnonKey);
}

export async function getSandboxClient() {
  const configured = await isSandboxConfigured();
  if (!configured) return null;

  if (!sandboxClient) {
    const keys = await getKeysFromStorage();
    sandboxClient = createClient(keys.supabaseUrl, keys.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: dummyStorage
      },
    });
  }
  return sandboxClient;
}

export async function getHubClient() {
  const keys = await getKeysFromStorage();
  
  // If the user has a Sandbox configured, and the Hub is the same URL, OR
  // if they are the maintainer (meaning their keys are the source of truth),
  // just reuse the Sandbox client. This prevents "Multiple GoTrueClient instances" warnings
  // and completely bypasses the 5-minute raw.githubusercontent.com cache delay.
  if (keys.supabaseUrl && keys.supabaseAnonKey) {
    if (!publicGatewayConfig || keys.supabaseUrl === publicGatewayConfig.supabaseUrl) {
      return await getSandboxClient();
    }
  }

  if (!publicGatewayConfig) return null;

  if (!hubClient) {
    hubClient = createClient(publicGatewayConfig.supabaseUrl, publicGatewayConfig.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: dummyStorage,
        storageKey: 'repoowl-hub-auth-token',
      }
    });
  }
  return hubClient;
}

// Fallback for backwards compatibility
export async function getSupabaseClient() {
  return (await getSandboxClient()) || (await getHubClient());
}

export async function isSupabaseConfigured() {
  return (await isSandboxConfigured()) || Boolean(publicGatewayConfig);
}

export async function ensureAuthenticatedSession() {
  const supabase = await getSandboxClient();
  if (!supabase) {
    return { error: 'Sandbox Supabase is not configured for RepoOwl.' };
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
