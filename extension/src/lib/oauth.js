/**
 * RepoOwl OAuth Utility
 *
 * Handles the Chrome Extension OAuth 2.0 flows for GitHub and Supabase.
 * All Client Secrets are handled server-side by Supabase Edge Functions.
 *
 * ─── SETUP REQUIRED ────────────────────────────────────────────────────────────
 * Before these flows will work, fill in the two placeholder constants below:
 *
 *  1. GITHUB_CLIENT_ID  — from github.com → Settings → Developer Settings → OAuth Apps
 *  2. SUPABASE_OAUTH_CLIENT_ID — from app.supabase.com → Account → OAuth Apps
 *
 * The HUB_EDGE_FUNCTION_BASE_URL should point to your Central Hub Supabase project's
 * Edge Function URL. It is read from the VITE_HUB_EDGE_FUNCTION_BASE_URL env var,
 * or falls back to the VITE_SUPABASE_URL + /functions/v1.
 * ───────────────────────────────────────────────────────────────────────────────
 */

// ── TODO: Replace these with your real OAuth App Client IDs ──────────────────
// These are PUBLIC values (not secrets) and are safe to store in extension code.
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'YOUR_GITHUB_OAUTH_CLIENT_ID';
const SUPABASE_OAUTH_CLIENT_ID = import.meta.env.VITE_SUPABASE_OAUTH_CLIENT_ID || 'YOUR_SUPABASE_OAUTH_CLIENT_ID';
// ─────────────────────────────────────────────────────────────────────────────

const HUB_EDGE_FUNCTION_BASE_URL =
  import.meta.env.VITE_HUB_EDGE_FUNCTION_BASE_URL ||
  (import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
    : null);

const STORAGE_KEY = 'repoOwlConfig';

/**
 * Returns the Chrome Identity redirect URL for this extension.
 * This is what you paste into the GitHub/Supabase OAuth App redirect URI field.
 */
export function getOAuthRedirectUrl() {
  if (typeof chrome !== 'undefined' && chrome.identity) {
    return chrome.identity.getRedirectURL();
  }
  return null;
}

/**
 * Reads the current config from chrome.storage.local.
 */
async function getStoredConfig() {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    return result[STORAGE_KEY] || {};
  }
  return {};
}

/**
 * Merges a partial config update into chrome.storage.local.
 */
async function mergeStoredConfig(partial) {
  const current = await getStoredConfig();
  const merged = { ...current, ...partial };
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [STORAGE_KEY]: merged });
  }
  return merged;
}

/**
 * Launches the GitHub OAuth 2.0 flow.
 * On success, saves githubToken and githubLogin to chrome.storage.local
 * and returns { githubToken, githubLogin, avatarUrl }.
 */
export async function launchGitHubOAuth() {
  if (!HUB_EDGE_FUNCTION_BASE_URL) {
    throw new Error('Hub Edge Function URL is not configured. Set VITE_HUB_EDGE_FUNCTION_BASE_URL in your .env file.');
  }
  if (GITHUB_CLIENT_ID === 'YOUR_GITHUB_OAUTH_CLIENT_ID') {
    throw new Error('GitHub Client ID is not configured. Replace GITHUB_CLIENT_ID in extension/src/lib/oauth.js or set VITE_GITHUB_CLIENT_ID in .env.');
  }

  const redirectUri = getOAuthRedirectUrl();
  if (!redirectUri) {
    throw new Error('chrome.identity.getRedirectURL() failed. Are you running in an extension context?');
  }

  // Build the GitHub authorization URL
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'repo read:org workflow');
  authUrl.searchParams.set('state', crypto.randomUUID());

  // Launch the Chrome Identity popup
  const responseUrl = await new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl.toString(), interactive: true },
      (callbackUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(callbackUrl);
        }
      }
    );
  });

  // Extract the authorization code from the callback URL
  const params = new URL(responseUrl).searchParams;
  const code = params.get('code');
  if (!code) {
    throw new Error('GitHub did not return an authorization code.');
  }

  // Exchange the code for an access token via our Edge Function
  const tokenRes = await fetch(`${HUB_EDGE_FUNCTION_BASE_URL}/github-oauth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.json().catch(() => ({ error: tokenRes.statusText }));
    throw new Error(body.error || 'GitHub OAuth token exchange failed.');
  }

  const { access_token, login, avatar_url } = await tokenRes.json();

  // Persist the token
  await mergeStoredConfig({ githubToken: access_token, githubLogin: login, githubAvatarUrl: avatar_url });

  return { githubToken: access_token, githubLogin: login, avatarUrl: avatar_url };
}

/**
 * Launches the Supabase OAuth 2.0 flow.
 * Returns { accessToken, projects } so the UI can display a project picker.
 * Call finalizeSupabaseProject() after the user picks a project.
 */
export async function launchSupabaseOAuth() {
  if (!HUB_EDGE_FUNCTION_BASE_URL) {
    throw new Error('Hub Edge Function URL is not configured. Set VITE_HUB_EDGE_FUNCTION_BASE_URL in your .env file.');
  }
  if (SUPABASE_OAUTH_CLIENT_ID === 'YOUR_SUPABASE_OAUTH_CLIENT_ID') {
    throw new Error('Supabase OAuth Client ID is not configured. Replace SUPABASE_OAUTH_CLIENT_ID in extension/src/lib/oauth.js or set VITE_SUPABASE_OAUTH_CLIENT_ID in .env.');
  }

  const redirectUri = getOAuthRedirectUrl();
  if (!redirectUri) {
    throw new Error('chrome.identity.getRedirectURL() failed. Are you running in an extension context?');
  }

  // Build the Supabase authorization URL
  const authUrl = new URL('https://api.supabase.com/v1/oauth/authorize');
  authUrl.searchParams.set('client_id', SUPABASE_OAUTH_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', crypto.randomUUID());

  // Launch the Chrome Identity popup
  const responseUrl = await new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl.toString(), interactive: true },
      (callbackUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(callbackUrl);
        }
      }
    );
  });

  const params = new URL(responseUrl).searchParams;
  const code = params.get('code');
  if (!code) {
    throw new Error('Supabase did not return an authorization code.');
  }

  // Exchange the code for an access token + project list via our Edge Function
  const tokenRes = await fetch(`${HUB_EDGE_FUNCTION_BASE_URL}/supabase-oauth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.json().catch(() => ({ error: tokenRes.statusText }));
    throw new Error(body.error || 'Supabase OAuth token exchange failed.');
  }

  const { access_token, projects } = await tokenRes.json();

  // Return the list so the UI can show a project picker.
  // The access_token is kept in memory — it should NOT be persisted long-term
  // because we only need it for the /supabase-provision step.
  return { accessToken: access_token, projects };
}

/**
 * After the user picks a project from the list returned by launchSupabaseOAuth(),
 * call this function to provision the database and save credentials.
 *
 * @param {string} accessToken - The short-lived Management API token from launchSupabaseOAuth()
 * @param {string} projectRef  - The project ID (e.g. 'abcdefghijk') the user selected
 * @returns {{ supabaseUrl, supabaseAnonKey }}
 */
export async function finalizeSupabaseProject(accessToken, projectRef) {
  if (!HUB_EDGE_FUNCTION_BASE_URL) {
    throw new Error('Hub Edge Function URL is not configured.');
  }

  const provisionRes = await fetch(`${HUB_EDGE_FUNCTION_BASE_URL}/supabase-provision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken, project_ref: projectRef }),
  });

  if (!provisionRes.ok) {
    const body = await provisionRes.json().catch(() => ({ error: provisionRes.statusText }));
    throw new Error(body.error || 'Supabase project provisioning failed.');
  }

  const { supabaseUrl, supabaseAnonKey } = await provisionRes.json();

  // Persist the automatically-fetched credentials
  await mergeStoredConfig({ supabaseUrl, supabaseAnonKey, supabasePAT: '' });

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Disconnects a specific OAuth connection by clearing its keys from storage.
 * @param {'github' | 'supabase'} provider
 */
export async function disconnectOAuth(provider) {
  if (provider === 'github') {
    await mergeStoredConfig({ githubToken: '', githubLogin: '', githubAvatarUrl: '' });
  } else if (provider === 'supabase') {
    await mergeStoredConfig({ supabaseUrl: '', supabaseAnonKey: '', supabasePAT: '' });
  }
}
