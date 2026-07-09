import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import { DEFAULT_PROMPT_TEMPLATE, buildPromptVariables, formatHistoricalContext, renderPrompt } from '@repoowl/shared';
import { getSandboxClient, ensureAuthenticatedSession } from './lib/supabase.js';

const DELAY_MS = 2000;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Existing message listener for options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'open_settings') {
    chrome.runtime.openOptionsPage();
  } else if (message.action === 'force_sync') {
    executeSyncQueue([message.repoName]).then(() => sendResponse({ success: true })).catch(err => sendResponse({ error: err.message }));
    return true; // Keep message channel open for async
  }
});

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

  const response = await groq.chat.completions.create({
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

async function executeSyncQueue(forceRepos = null) {
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

  const broadcast = (msg) => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'sync_progress', message: msg }).catch(() => {});
    }
    console.log(msg);
  };

  if (!keys.groqApiKey || !keys.supabaseUrl) {
    broadcast("RepoOwl: API Keys not configured. Skipping sync.");
    return;
  }

  // Pre-fetch all processed issues to avoid re-processing
  const authResult = await ensureAuthenticatedSession();
  if (authResult.error) {
    broadcast(`RepoOwl: Could not authenticate with Supabase: ${authResult.error}`);
    return;
  }
  const supabase = await getSandboxClient();

  for (const repo of repos) {
    broadcast(`\n[${repo}] Starting sync...`);
    
    try {
      // 1. Verify Native GitHub Permissions
      const repoMetaResponse = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Authorization': `Bearer ${keys.githubToken}`
        }
      });
      
      if (!repoMetaResponse.ok) {
        broadcast(`[${repo}] Failed to fetch repo meta. Check token/permissions.`);
        continue;
      }
      
      const repoMeta = await repoMetaResponse.json();
      const isMaintainer = repoMeta.permissions?.push === true || repoMeta.permissions?.admin === true;

      if (!isMaintainer) {
        broadcast(`[${repo}] Contributor detected. Aborting global sync.`);
        continue; // Skip global background sync for contributors
      }
      broadcast(`[${repo}] Confirmed Maintainer. Fetching issues...`);
    } catch (err) {
      broadcast(`[${repo}] Error checking permissions: ${err.message}`);
      continue;
    }

    // Check which issues are already processed
    const { data: processedIssues } = await supabase
      .from('issues')
      .select('issue_number, is_duplicate')
      .eq('repo_name', repo);
      
    const processedSet = new Set((processedIssues || []).map(r => r.issue_number));
    let currentAnalyzed = processedSet.size;
    let currentDuplicates = (processedIssues || []).filter(r => r.is_duplicate).length;

    const newIssues = await fetchFromGitHub(repo, keys.githubToken);
    broadcast(`[${repo}] Found ${newIssues.length} open issues on GitHub.`);

    // Update statuses for issues that were closed since last sync
    await closeMissingOpenIssues(repo, supabase, newIssues);

    let pendingIssues = newIssues.filter(i => !processedSet.has(i.number));
    broadcast(`[${repo}] ${processedSet.size} already processed. ${pendingIssues.length} issues need processing.`);

    for (const issue of newIssues) {
      if (processedSet.has(issue.number)) continue; // Skip already processed

      try {
        broadcast(`[${repo}] Processing issue #${issue.number}...`);
        const history = await fetchFromSupabase(repo, keys);
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

    // 3. Broadcast updated stats to the Global Registry
    await updateGlobalRegistry(repo, currentAnalyzed, currentDuplicates, keys);
    broadcast(`[${repo}] Sync complete. Total Analyzed: ${currentAnalyzed}, Duplicates: ${currentDuplicates}`);
  }
}
