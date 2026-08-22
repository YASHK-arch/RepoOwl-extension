import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import { DEFAULT_PROMPT_TEMPLATE, buildPromptVariables, formatHistoricalContext, renderPrompt } from '@repoowl/shared';
import { getSandboxClient, ensureAuthenticatedSession } from './lib/supabase.js';
import { initializeRepoOwl, INSTALLER_VERSION } from './background/githubInstaller.js';
const DELAY_MS = 2000;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Existing message listener for options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'open_settings') {
    chrome.runtime.openOptionsPage();
  } else if (message.action === 'force_sync_issues') {
    executeIssueSyncQueue([message.repoName]).then(() => sendResponse({ success: true })).catch(err => sendResponse({ error: err.message }));
    return true;
  } else if (message.action === 'add_repo') {
    handleNewRepoAdded(message.repoName).catch(err => console.error("Error auto-publishing config:", err));
    sendResponse({ success: true });
  } else if (message.action === 'check_mediator_status') {
    checkMediatorStatus(message.repoName).then(res => sendResponse(res)).catch(err => sendResponse({ error: err.message }));
    return true;
  } else if (message.action === 'initialize_repoowl_pr') {
    const logs = [];
    const broadcast = (msg) => {
      logs.push(msg);
      createBroadcast('pr')(msg);
    };
    chrome.storage.local.get(['repoOwlConfig'], (result) => {
      const keys = result.repoOwlConfig || {};
      initializeRepoOwl(message.repoName, message.githubPat, message.groqApiKey, broadcast, keys.supabaseUrl, keys.supabaseAnonKey)
        .then(() => sendResponse({ success: true, logs, version: INSTALLER_VERSION }))
        .catch(err => sendResponse({ error: err.message, logs }));
    });
    return true;
  } else if (message.action === 'save_path_labels') {
    savePathLabels(message.repoName, message.pathLabels)
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  } else if (message.action === 'save_triage_config') {
    saveTriageConfig(message.repoName, message.triageConfig)
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  } else if (message.action === 'check_user_role') {
    checkUserRole(message.repoName)
      .then(res => sendResponse(res))
      .catch(err => sendResponse({ isMaintainer: false, error: err.message }));
    return true;
  }
});

/**
 * Checks whether the authenticated GitHub user has push or admin access
 * to the given repository, which determines maintainer vs contributor role.
 * @param {string} repo - "owner/repo" format
 * @returns {{ isMaintainer: boolean }}
 */
async function checkUserRole(repo) {
  const storage = await chrome.storage.local.get(['repoOwlConfig']);
  const keys = storage.repoOwlConfig || {};
  const pat = keys.githubToken;

  if (!pat) return { isMaintainer: false };

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${pat}`
      }
    });
    if (!res.ok) return { isMaintainer: false };
    const data = await res.json();
    const isMaintainer = !!(data.permissions?.push || data.permissions?.admin);
    return { isMaintainer };
  } catch (e) {
    return { isMaintainer: false, error: e.message };
  }
}

async function handleNewRepoAdded(repo) {
  const storage = await chrome.storage.local.get(['repoOwlConfig']);
  const keys = storage.repoOwlConfig || {};
  
  if (!keys.githubToken || !keys.supabaseUrl || !keys.supabaseAnonKey) {
    return; // Missing credentials
  }

  try {
    const repoMetaResponse = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Authorization': `Bearer ${keys.githubToken}`
      }
    });
    
    if (!repoMetaResponse.ok) return;
    
    const repoMeta = await repoMetaResponse.json();
    const isMaintainer = repoMeta.permissions?.push === true || repoMeta.permissions?.admin === true;

    if (isMaintainer) {
      await autoPublishHubConfig(repo, keys);
      await registerWithMediator(repo, keys);
    }
  } catch (err) {
    console.error(`[${repo}] Error verifying permissions for auto-publish:`, err);
  }
}

async function autoPublishHubConfig(repo, keys) {
  const content = {
    supabaseUrl: keys.supabaseUrl,
    supabaseAnonKey: keys.supabaseAnonKey
  };
  
  const encodedContent = btoa(JSON.stringify(content, null, 2));
  
  // First, check if the file exists to get its SHA (required for updates)
  let fileSha = undefined;
  try {
    const checkResponse = await fetch(`https://api.github.com/repos/${repo}/contents/repoowl.json?ref=main`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Authorization': `Bearer ${keys.githubToken}`
      }
    });
    if (checkResponse.ok) {
      const fileData = await checkResponse.json();
      fileSha = fileData.sha;
    }
  } catch (e) {
    console.warn("Could not fetch existing repoowl.json sha", e);
  }

  await fetch(`https://api.github.com/repos/${repo}/contents/repoowl.json`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${keys.githubToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: JSON.stringify({
      message: 'chore(repoowl): auto-publish public hub configuration',
      content: encodedContent,
      branch: 'main',
      ...(fileSha && { sha: fileSha })
    })
  });
}

/**
 * Merges a path_labels map into the repo's repoowl.json without clobbering
 * existing fields (supabaseUrl, supabaseAnonKey, etc.).
 * @param {string} repo - "owner/repo" format
 * @param {{ path: string; label: string }[]} pathLabelsArray - rules to persist
 */
async function savePathLabels(repo, pathLabelsArray) {
  const storage = await chrome.storage.local.get(['repoOwlConfig']);
  const keys = storage.repoOwlConfig || {};
  const pat = keys.githubToken;

  if (!pat) {
    throw new Error('GitHub PAT not found in settings. Please configure it in Model Configuration.');
  }

  // 1. Read the current repoowl.json to get its SHA and existing content
  let existingContent = {};
  let fileSha;
  try {
    const checkRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/repoowl.json?ref=main&t=${Date.now()}`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Authorization': `Bearer ${pat}`
        }
      }
    );
    if (checkRes.ok) {
      const fileData = await checkRes.json();
      fileSha = fileData.sha;
      existingContent = JSON.parse(atob(fileData.content.replace(/\n/g, '')));
    }
  } catch (e) {
    console.warn(`[${repo}] Could not read existing repoowl.json; will create fresh:`, e);
  }

  // 2. Merge path_labels, preserving all other existing fields
  const path_labels = Object.fromEntries(pathLabelsArray.map(r => [r.path, { label: r.label, color: r.color || '#0969da' }]));
  const updated = { ...existingContent, path_labels };
  const encodedContent = btoa(JSON.stringify(updated, null, 2));

  // 3. PUT the updated file back
  const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/repoowl.json`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${pat}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: JSON.stringify({
      message: 'feat(repoowl): update path-label routing rules',
      content: encodedContent,
      branch: 'main',
      ...(fileSha && { sha: fileSha })
    })
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`GitHub API error while saving path labels: ${errText}`);
  }
}

/**
 * Merges a triage_config object into the repo's repoowl.json without clobbering
 * existing fields (supabaseUrl, supabaseAnonKey, path_labels, etc.).
 * @param {string} repo - "owner/repo" format
 * @param {object} triageConfig - the triage settings object to persist
 */
async function saveTriageConfig(repo, triageConfig) {
  const storage = await chrome.storage.local.get(['repoOwlConfig']);
  const keys = storage.repoOwlConfig || {};
  const pat = keys.githubToken;

  if (!pat) {
    throw new Error('GitHub PAT not found in settings. Please configure it in Model Configuration.');
  }

  // 1. Read current repoowl.json to get SHA + existing content
  let existingContent = {};
  let fileSha;
  try {
    const checkRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/repoowl.json?ref=main&t=${Date.now()}`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Authorization': `Bearer ${pat}`
        }
      }
    );
    if (checkRes.ok) {
      const fileData = await checkRes.json();
      fileSha = fileData.sha;
      existingContent = JSON.parse(atob(fileData.content.replace(/\n/g, '')));
    }
  } catch (e) {
    console.warn(`[${repo}] Could not read existing repoowl.json; will create fresh:`, e);
  }

  // 2. Merge triage_config, preserving all other existing fields
  const updated = { ...existingContent, triage_config: triageConfig };
  const encodedContent = btoa(JSON.stringify(updated, null, 2));

  // 3. PUT the updated file back
  const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/repoowl.json`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${pat}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: JSON.stringify({
      message: 'feat(repoowl): update auto-triage configuration',
      content: encodedContent,
      branch: 'main',
      ...(fileSha && { sha: fileSha })
    })
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`GitHub API error while saving triage config: ${errText}`);
  }
}

async function registerWithMediator(repo, keys, broadcast = console.log) {
  const [owner, name] = repo.split('/');
  
  const centralUrl = import.meta.env.VITE_SUPABASE_URL;
  const centralKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!centralUrl || !centralKey) {
    broadcast(`[${repo}] Error: Central Mediator not configured in extension environment.`);
    return;
  }
  const centralSupabase = createClient(centralUrl, centralKey, { auth: { persistSession: false } });
  
  try {
    const { data, error } = await centralSupabase.functions.invoke('registry', {
      body: { 
        owner, 
        repo: name, 
        supabaseUrl: keys.supabaseUrl, 
        supabaseAnonKey: keys.supabaseAnonKey, 
        githubToken: keys.githubToken 
      }
    });

    if (error) {
      broadcast(`[${repo}] Error registering with Mediator: ${error.message || JSON.stringify(error)}`);
    } else {
      broadcast(`[${repo}] Successfully registered keys with Central Mediator.`);
    }
  } catch (e) {
    broadcast(`[${repo}] Mediator registration exception: ${e.message}`);
  }
}

async function checkMediatorStatus(repo) {
  const [owner, name] = repo.split('/');
  try {
    const centralUrl = import.meta.env.VITE_SUPABASE_URL;
    const centralKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!centralUrl || !centralKey) return { registered: false };

    const centralSupabase = createClient(centralUrl, centralKey, { auth: { persistSession: false } });
    const { data, error } = await centralSupabase
      .from('registry')
      .select('created_at')
      .eq('owner', owner)
      .eq('repo', name)
      .single();
    
    if (!error && data) {
      return { registered: true, createdAt: data.created_at };
    } else {
      return { registered: false };
    }
  } catch (e) {
    return { registered: false, error: e.message };
  }
}

// Issue analysis is now handled server-side by the RepoOwl Issue Analyzer GitHub Actions workflow
// (.github/workflows/issue-analyze.yml). The chrome.alarms-based hourly sync has been removed
// because it stopped working whenever the maintainer closed their browser.
// The extension continues to handle contributor hub-hydration (reading from the maintainer's Supabase)
// via executeIssueSyncQueue() below, which is triggered on demand via force_sync_issues.

async function fetchFromGitHub(repo, token) {
  const [owner, name] = repo.split('/');
  if (!owner || !name) throw new Error(`Invalid repository: ${repo}`);

  const url = new URL(`https://api.github.com/repos/${owner}/${name}/issues`);
  url.searchParams.set('state', 'open');
  url.searchParams.set('per_page', '100');
  url.searchParams.set('direction', 'asc');

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${body}`);
  }

  const batch = await response.json();
  return batch.filter((item) => !item.pull_request);
}

/**
 * Fetches the flattened file tree of a repository from GitHub.
 * Truncates to 500 paths to keep prompt sizes manageable.
 * Returns a newline-separated string of file paths, or null on failure.
 */
async function fetchRepoFileTree(repo, token) {
  try {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    // Get the default branch HEAD SHA first
    const repoRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
    if (!repoRes.ok) return null;
    const repoData = await repoRes.json();
    const branch = repoData.default_branch || 'main';

    const treeRes = await fetch(
      `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`,
      { headers }
    );
    if (!treeRes.ok) return null;

    const treeData = await treeRes.json();
    if (!treeData.tree) return null;

    // Only include blobs (files), skip trees (dirs)
    const filePaths = treeData.tree
      .filter(item => item.type === 'blob')
      .map(item => item.path)
      // Exclude lock files, binaries, and generated assets
      .filter(p => !/(node_modules|package-lock\.json|yarn\.lock|\.png|\.jpg|\.svg|\.ico|\.woff)/.test(p))
      .slice(0, 500);

    return filePaths.join('\n');
  } catch {
    return null;
  }
}

async function fetchFromSupabase(repo, keys) {
  const supabase = await getSandboxClient();
  const { data, error } = await supabase
    .from('issues')
    .select('issue_number, analysis_summary')
    .eq('repo_name', repo)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching history:", error);
    return [];
  }
  return data || [];
}

function parseIssueTemplateFields(body) {
  if (!body) return {};

  const sections = {};
  const regex = /###\s+(.+?)(?:\r?\n)+([\s\S]*?)(?=###\s+|$)/g;
  let match;
  while ((match = regex.exec(body)) !== null) {
    const header = match[1].trim();
    const content = match[2].trim();
    sections[header] = content;
  }

  const getVal = (possibleHeaders) => {
    for (const h of possibleHeaders) {
      if (sections[h]) return sections[h];
    }
    return null;
  }

  return {
    primary_description: getVal([
      "Bug Description", "Feature Description", "What documentation is missing?", 
      "Task Description", "Vulnerability Type", "Current Problem", "Missing Tests"
    ]),
    context_steps: getVal([
      "Steps to Reproduce", "Current Design", "Why is it useful?", 
      "Which page?", "Slow page", "Affected Components"
    ]),
    expected_outcome: getVal([
      "Expected Behavior", "Suggested Improvement", "Proposed Improvement", 
      "Expected Output", "Impact", "Suggested Fix", "Alternatives considered?"
    ]),
    technical_metrics: getVal([
      "CPU Usage", "Memory Usage", "Logs", "Browser", "OS", 
      "Files to modify", "Affected Files"
    ])
  };
}

async function callGroqWithRetry(groq, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await groq.chat.completions.create(options);
    } catch (e) {
      if (e.status === 429 && i < retries - 1) {
        let waitTime = 6000;
        const match = e.message?.match(/Please try again in ([\d.]+)s/);
        if (match) {
          waitTime = Math.ceil(parseFloat(match[1]) * 1000) + 500;
        }
        console.warn(`Rate limit hit. Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      } else {
        throw e;
      }
    }
  }
}

async function callGroqAPI(issue, history, apiKey, repo, githubToken) {
  const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
  
  // Fetch the repository file tree so the LLM can reason about affected files
  const fileTree = await fetchRepoFileTree(repo, githubToken);

  // Format history to mimic the old schema structure for the shared prompt variables
  const historicalContextLog = history.map(h => `[Issue ID: #${h.issue_number}]\nTitle: ${h.title || 'Unknown Title'}\nTechnical Summary: ${h.analysis_summary}`).join('\n\n---\n\n');
  
  const templateFields = parseIssueTemplateFields(issue.body || '');

  // Create an issue object that matches what buildPromptVariables expects
  const mappedIssue = {
    issue_number: issue.number,
    title: issue.title,
    primary_description: templateFields.primary_description || issue.body || 'No description provided.',
    context_steps: templateFields.context_steps,
    expected_outcome: templateFields.expected_outcome,
    technical_metrics: templateFields.technical_metrics
  };

  const variables = buildPromptVariables(mappedIssue, historicalContextLog, fileTree);
  const prompt = renderPrompt(DEFAULT_PROMPT_TEMPLATE, variables);

  const STRICT_SYSTEM_PROMPT = 'You are an expert GitHub triage AI and systems architect.\n' +
    'Analyze the incoming GitHub issue against the repository file tree and historical issue context.\n' +
    'DUPLICATE RULES (CRITICAL):\n' +
    '  - Only set is_duplicate=true if the issue targets the EXACT same root cause or feature as a specific existing open issue.\n' +
    '  - You MUST cite the matching issue number (e.g. "duplicate of #42") in analysis_summary when marking as duplicate.\n' +
    '  - Do NOT mark as duplicate because issues share a topic area, feature domain, or keyword overlap.\n' +
    '  - Do NOT label any issue as spam, noise, or invalid. Assume all submissions are legitimate.\n' +
    '  - Default to is_duplicate=false when uncertain.\n' +
    'AFFECTED FILES: Based on the repository file tree, identify up to 8 specific source files most likely to need changes.\n' +
    'You must respond in valid JSON format matching this schema:\n' +
    '{ "is_duplicate": boolean, "analysis_summary": "string", "affected_files": ["string"] }\n' +
    'Ensure the JSON is well-formed.';

  const response = await callGroqWithRetry(groq, {
    messages: [
      { role: 'system', content: STRICT_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    model: import.meta.env.VITE_GROQ_MODEL || 'qwen/qwen3.6-27b',
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });

  const text = response.choices[0]?.message?.content?.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  if (!text) {
    throw new Error('Groq API returned an empty response.');
  }

  return JSON.parse(text);
}

async function saveToSupabase(repo, issue, analysis, keys) {
  const supabase = await getSandboxClient();
  const { error } = await supabase
    .from('issues')
    .insert({
      repo_name: repo,
      issue_number: issue.number,
      is_duplicate: analysis.is_duplicate,
      analysis_summary: analysis.analysis_summary,
      affected_files: analysis.affected_files ?? null,
      status: 'open'
    });
    
  if (error) {
    const errStr = JSON.stringify(error) || String(error);
    console.error("Supabase insert error details:", errStr);
    throw new Error(`Supabase insert failed: ${errStr}`);
  }
}

async function updateGlobalRegistry(repo, totalAnalyzed, duplicatesFound, keys) {
  const supabase = await getSandboxClient();
  const { error } = await supabase
    .from('public_ecosystem_registry')
    .upsert({
      repo_name: repo,
      total_issues_analyzed: totalAnalyzed,
      duplicates_found: duplicatesFound,
      last_updated: new Date().toISOString()
    }, { onConflict: 'repo_name' });
    
  if (error) {
    const errStr = JSON.stringify(error) || String(error);
    console.error("Supabase registry update error details:", errStr);
    throw new Error(`Registry update failed: ${errStr}`);
  }
}

async function closeMissingOpenIssues(repo, supabase, newGithubOpenIssues) {
  // Get all issues currently tracked as 'open' in Supabase
  const { data: dbOpenIssues, error } = await supabase
    .from('issues')
    .select('issue_number')
    .eq('repo_name', repo)
    .eq('status', 'open');

  if (error || !dbOpenIssues) return;

  const githubOpenSet = new Set(newGithubOpenIssues.map(i => i.number));
  const toClose = dbOpenIssues
    .map(i => i.issue_number)
    .filter(num => !githubOpenSet.has(num));

  if (toClose.length > 0) {
    console.log(`RepoOwl: Found ${toClose.length} issues that are no longer open. Updating...`);
    // Supabase JS doesn't have a simple 'where in array' for update without looping or using .in()
    // We can do it in batches or a single query
    const { error: updateError } = await supabase
      .from('issues')
      .update({ status: 'closed' })
      .eq('repo_name', repo)
      .in('issue_number', toClose);
      
    if (updateError) {

      console.error("Error closing issues in Supabase:", updateError);
    }
  }
}


async function initSyncEnv(forceRepos) {
  const storage = await chrome.storage.local.get(['repoOwlConfig', 'trackedRepositories']);
  let keys = storage.repoOwlConfig || {};
  const repos = forceRepos || storage.trackedRepositories || [];
  
  if (!keys.groqApiKey && import.meta.env.VITE_GROQ_API_KEY) {
    keys.groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  }
  if (!keys.supabaseUrl && import.meta.env.VITE_SUPABASE_URL) {
    keys.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  }
  if (!keys.supabaseAnonKey && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    keys.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  return { keys, repos };
}

function createBroadcast(type) {
  return (msg) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const res = chrome.runtime.sendMessage({ action: 'sync_progress', message: msg, log_type: type });
        if (res && typeof res.catch === 'function') {
          res.catch(() => {});
        }
      }
    } catch (e) {
      console.error("Broadcast error:", e);
    }
    console.log(`[${type}] ${msg}`);
  };
}

async function getRepoMetaAndUser(repo, keys, broadcast) {
  let isMaintainer = false;
  let currentUserLogin = null;
  const repoMetaResponse = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Authorization': `Bearer ${keys.githubToken}`
    }
  });
  
  if (!repoMetaResponse.ok) {
    broadcast(`[${repo}] Failed to fetch repo meta. Check token/permissions.`);
    return null;
  }
  
  const repoMeta = await repoMetaResponse.json();
  isMaintainer = repoMeta.permissions?.push === true || repoMeta.permissions?.admin === true;

  if (!isMaintainer) {
    try {
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Authorization': `Bearer ${keys.githubToken}`
        }
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        currentUserLogin = userData.login;
      }
    } catch (e) {
      broadcast(`[${repo}] Error fetching your GitHub username: ${e.message}`);
    }
  }

  return { isMaintainer, currentUserLogin };
}

async function executeIssueSyncQueue(forceRepos = null) {
  const { keys, repos } = await initSyncEnv(forceRepos);
  const broadcast = createBroadcast('issue');

  if (!keys.groqApiKey || !keys.supabaseUrl) {
    broadcast("RepoOwl: API Keys not configured. Skipping sync.");
    return;
  }

  const authResult = await ensureAuthenticatedSession();
  if (authResult.error) {
    broadcast(`RepoOwl: Could not authenticate with Supabase: ${authResult.error}`);
    return;
  }
  const supabase = await getSandboxClient();

  for (const repo of repos) {
    broadcast(`\n[${repo}] Starting issue sync...`);
    
    let isMaintainer = false;
    let currentUserLogin = null;

    try {
      const meta = await getRepoMetaAndUser(repo, keys, broadcast);
      if (!meta) continue;
      isMaintainer = meta.isMaintainer;
      currentUserLogin = meta.currentUserLogin;

      if (!isMaintainer) {
        broadcast(`[${repo}] Contributor detected. Starting Sandbox sync...`);
        // Phase 1: Hub Hydration
        try {
          const [owner, name] = repo.split('/');
          
          const centralUrl = import.meta.env.VITE_SUPABASE_URL;
          const centralKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          let centralSupabase = null;
          if (centralUrl && centralKey) {
            centralSupabase = createClient(centralUrl, centralKey, { auth: { persistSession: false } });
          }

          let hubConfig = null;

          // 1. Try Central Mediator Registry
          if (centralSupabase) {
            const { data: registryData, error: registryError } = await centralSupabase
              .from('registry')
              .select('supabase_url, supabase_anon_key')
              .eq('owner', owner)
              .eq('repo', name)
              .single();

            if (!registryError && registryData) {
              hubConfig = {
                supabaseUrl: registryData.supabase_url,
                supabaseAnonKey: registryData.supabase_anon_key
              };
              broadcast(`[${repo}] Discovered Hub config from Central Mediator.`);
            }
          }

          if (!hubConfig) {
            // 2. Fallback to repoowl.json
            broadcast(`[${repo}] Central Mediator returned no config. Falling back to repoowl.json...`);
            const configResponse = await fetch(`https://raw.githubusercontent.com/${repo}/main/repoowl.json`);
            if (configResponse.ok) {
              hubConfig = await configResponse.json();
              broadcast(`[${repo}] Discovered Hub config from repoowl.json.`);
            }
          }

          if (hubConfig) {
            const hubSupabase = createClient(hubConfig.supabaseUrl, hubConfig.supabaseAnonKey, {
              auth: { persistSession: false }
            });
            
            const { data: hubIssues, error: hubError } = await hubSupabase
              .from('issues')
              .select('id, issue_number, is_duplicate, analysis_summary')
              .eq('repo_name', repo)
              .eq('status', 'open');
              
            if (!hubError && hubIssues) {
              await chrome.storage.local.set({ [`hub_cache_${repo}`]: hubIssues });
              broadcast(`[${repo}] Hydrated UI with ${hubIssues.length} issues from Maintainer's Hub.`);
            }
          } else {
             broadcast(`[${repo}] No public Hub found for this repository.`);
          }
        } catch (e) {
           broadcast(`[${repo}] Error hydrating Hub data: ${e.message}`);
        }
      } else {
        broadcast(`[${repo}] Confirmed Maintainer. Fetching issues...`);
        try {
          await autoPublishHubConfig(repo, keys);
          await registerWithMediator(repo, keys, broadcast);
        } catch (e) {
          broadcast(`[${repo}] Warning: Failed to auto-publish Hub config: ${e.message}`);
        }
      }
    } catch (err) {
      broadcast(`[${repo}] Error checking permissions: ${err.message}`);
      continue;
    }

    let newIssues;
    let processedSet;
    let currentAnalyzed;
    let currentDuplicates;
    
    try {
      // Check which issues are already processed
      const { data: processedIssues, error: fetchError } = await supabase
        .from('issues')
        .select('issue_number, is_duplicate')
        .eq('repo_name', repo);
        
      if (fetchError) {
        throw new Error(`Failed to fetch processed issues: ${fetchError.message || JSON.stringify(fetchError)}`);
      }
        
      processedSet = new Set((processedIssues || []).map(r => r.issue_number));
      currentAnalyzed = processedSet.size;
      currentDuplicates = (processedIssues || []).filter(r => r.is_duplicate).length;

      newIssues = await fetchFromGitHub(repo, keys.githubToken);
    } catch (err) {
      broadcast(`[${repo}] Error during issue fetching: ${err.message}`);
      continue;
    }
    
    // Only close missing issues if we are a maintainer processing the whole repo
    if (isMaintainer) {
      await closeMissingOpenIssues(repo, supabase, newIssues);
    }

    let pendingIssues = newIssues.filter(i => !processedSet.has(i.number));
    
    if (!isMaintainer) {
      if (currentUserLogin) {
        pendingIssues = pendingIssues.filter(i => i.user && i.user.login === currentUserLogin);
        broadcast(`[${repo}] Found ${pendingIssues.length} unprocessed issues authored by you.`);
      } else {
        broadcast(`[${repo}] Could not determine your GitHub username, skipping sandbox processing.`);
        pendingIssues = [];
      }
    } else {
      broadcast(`[${repo}] ${processedSet.size} already processed. ${pendingIssues.length} issues need processing.`);
    }

    for (const issue of pendingIssues) {
      try {
        broadcast(`[${repo}] Processing issue #${issue.number}...`);
        const history = await fetchFromSupabase(repo, keys);
        history.forEach(h => {
          const matchingIssue = newIssues.find(ni => ni.number === h.issue_number);
          if (matchingIssue) {
            h.title = matchingIssue.title;
          }
        });
        const analysis = await callGroqAPI(issue, history, keys.groqApiKey, repo, keys.githubToken);
        await saveToSupabase(repo, issue, analysis, keys);

        currentAnalyzed++;
        if (analysis.is_duplicate) {
          currentDuplicates++;
        }
        processedSet.add(issue.number);

        // Mandatory 2-second delay
        await delay(DELAY_MS);
      } catch (error) {
        const errStr = error.message || String(error);
        broadcast(`[${repo}] Error processing issue #${issue.number}: ${errStr}`);
        continue;
      }
    }

    // Check if we have hub cache to show accurate total in popup
    let totalHubAndSandbox = currentAnalyzed;
    let totalDuplicates = currentDuplicates;
    if (!isMaintainer) {
        const hubCacheResult = await chrome.storage.local.get([`hub_cache_${repo}`]);
        const hubIssues = hubCacheResult[`hub_cache_${repo}`] || [];
        // Approximate total by adding Hub (preventing double counting if overlapping, though unlikely)
        const hubSet = new Set(hubIssues.map(i => i.issue_number));
        processedSet.forEach(num => hubSet.add(num));
        totalHubAndSandbox = hubSet.size;
        totalDuplicates = currentDuplicates + hubIssues.filter(i => i.is_duplicate).length;
    } else {
        // Maintainers are the Hub: refresh the cache for instant UI loads
        try {
            const { data: updatedIssues } = await supabase.from('issues').select('id, issue_number, is_duplicate, analysis_summary').eq('repo_name', repo).eq('status', 'open');
            if (updatedIssues) await chrome.storage.local.set({ [`hub_cache_${repo}`]: updatedIssues });
        } catch (e) {
            console.error(e);
        }
    }
    
    // 3. Broadcast updated stats to the Global Registry
    await updateGlobalRegistry(repo, totalHubAndSandbox, totalDuplicates, keys);
    
    broadcast(`[${repo}] Issue Sync complete. Total Analyzed: ${totalHubAndSandbox}, Duplicates: ${totalDuplicates}`);
  }
}
