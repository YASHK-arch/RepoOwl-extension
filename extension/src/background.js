import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import { DEFAULT_PROMPT_TEMPLATE, buildPromptVariables, formatHistoricalContext, renderPrompt } from '@repoowl/shared';
import { getSandboxClient, ensureAuthenticatedSession } from './lib/supabase.js';
import { fetchPullRequestsFromGitHub, processPullRequestMapReduce } from './prTriage.js';

const DELAY_MS = 2000;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Existing message listener for options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'open_settings') {
    chrome.runtime.openOptionsPage();
  } else if (message.action === 'force_sync_issues') {
    executeIssueSyncQueue([message.repoName]).then(() => sendResponse({ success: true })).catch(err => sendResponse({ error: err.message }));
    return true;
  } else if (message.action === 'force_sync_prs') {
    executePRSyncQueue([message.repoName]).then(() => sendResponse({ success: true })).catch(err => sendResponse({ error: err.message }));
    return true;
  } else if (message.action === 'add_repo') {
    handleNewRepoAdded(message.repoName).catch(err => console.error("Error auto-publishing config:", err));
    sendResponse({ success: true });
  } else if (message.action === 'check_mediator_status') {
    checkMediatorStatus(message.repoName).then(res => sendResponse(res)).catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

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

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("repoOwlHourlySync", {
    periodInMinutes: 60
  });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "repoOwlHourlySync") {
    console.log("Waking up for hourly sync...");
    await executeSyncQueue();
  }
});

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

async function callGroqAPI(issue, history, apiKey) {
  const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
  
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

  const variables = buildPromptVariables(mappedIssue, historicalContextLog);
  const prompt = renderPrompt(DEFAULT_PROMPT_TEMPLATE, variables);

  const response = await callGroqWithRetry(groq, {
    messages: [
      {
        role: 'system',
        content: 'You are an expert GitHub triage AI.\n' +
                 'The user is drafting a new issue. I am providing you with a list of currently OPEN issues in this repository.\n' +
                 'Do not assume any issues have been resolved, because they are all actively open.\n' +
                 'Your job is to determine if the user\'s draft is a DUPLICATE of one of these specific OPEN issues.\n' +
                 'If they are reporting a bug that already exists in this open list, flag it as a duplicate.\n' +
                 'You must respond in valid JSON format matching this schema:\n' +
                 '{ "is_duplicate": boolean, "analysis_summary": "string" }\n' +
                 'Ensure the JSON is well-formed.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });

  const text = response.choices[0]?.message?.content?.trim();
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
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'sync_progress', message: msg, log_type: type }).catch(() => {});
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
        const analysis = await callGroqAPI(issue, history, keys.groqApiKey);
        await saveToSupabase(repo, issue, analysis, keys);

        currentAnalyzed++;
        if (analysis.is_duplicate) {
          currentDuplicates++;
        }

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

async function executePRSyncQueue(forceRepos = null) {
  const { keys, repos } = await initSyncEnv(forceRepos);
  const broadcast = createBroadcast('pr');

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
    broadcast(`\n[${repo}] Starting PR sync...`);
    
    let isMaintainer = false;
    let currentUserLogin = null;

    try {
      const meta = await getRepoMetaAndUser(repo, keys, broadcast);
      if (!meta) continue;
      isMaintainer = meta.isMaintainer;
      currentUserLogin = meta.currentUserLogin;
    } catch (err) {
      broadcast(`[${repo}] Error checking permissions: ${err.message}`);
      continue;
    }

    let processedPRSet = new Set();
    let pendingPRs = [];
    
    try {
      const { data: processedPRs, error: fetchError } = await supabase
        .from('pull_requests')
        .select('pr_number')
        .eq('repo_name', repo);
        
      if (fetchError) {
        throw new Error(`Failed to fetch processed PRs: ${fetchError.message || JSON.stringify(fetchError)}`);
      }
      
      processedPRSet = new Set((processedPRs || []).map(r => r.pr_number));
      const allPRs = await fetchPullRequestsFromGitHub(repo, keys.githubToken);
      pendingPRs = allPRs.filter(pr => !processedPRSet.has(pr.number));
      
      if (!isMaintainer && currentUserLogin) {
        pendingPRs = pendingPRs.filter(pr => pr.user && pr.user.login === currentUserLogin);
      } else if (!isMaintainer) {
        pendingPRs = [];
      }
      
      broadcast(`[${repo}] ${processedPRSet.size} PRs already analyzed. ${pendingPRs.length} PRs need processing.`);
    } catch (err) {
      broadcast(`[${repo}] Error fetching PRs: ${err.message}`);
      continue;
    }

    for (const pr of pendingPRs) {
      try {
        broadcast(`[${repo}] Analyzing PR #${pr.number} (Slop Detection)...`);
        await processPullRequestMapReduce(repo, pr, keys);
        await delay(DELAY_MS);
      } catch (err) {
        broadcast(`[${repo}] Error processing PR #${pr.number}: ${err.message}`);
      }
    }
    
    // Refresh PR cache for instant UI loads
    try {
        const { data: updatedPRs } = await supabase.from('pull_requests').select('id, pr_number, slop_detection, issue_resolution, domain_impact, recommended_labels').eq('repo_name', repo);
        if (updatedPRs) await chrome.storage.local.set({ [`pr_hub_cache_${repo}`]: updatedPRs });
    } catch (e) {
        console.error(e);
    }
    
    broadcast(`[${repo}] PR Sync complete.`);
  }
}
