import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import { DEFAULT_PROMPT_TEMPLATE, buildPromptVariables, formatHistoricalContext, renderPrompt } from '@repoowl/shared';

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
  url.searchParams.set('state', 'all');
  url.searchParams.set('per_page', '100');

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
  const supabase = createClient(keys.supabaseUrl, keys.supabaseAnonKey);
  const { data, error } = await supabase
    .from('issues')
    .select('issue_number, analysis_summary')
    .eq('repo_name', repo)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching history:", error);
    return [];
  }
  return data || [];
}

async function callGroqAPI(issue, history, apiKey) {
  const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
  
  // Format history to mimic the old schema structure for the shared prompt variables
  const historicalContextLog = history.map(h => `Issue #${h.issue_number}:\n${h.analysis_summary}`).join('\n\n');
  
  // Create an issue object that matches what buildPromptVariables expects
  const mappedIssue = {
    issue_number: issue.number,
    title: issue.title,
    primary_description: issue.body || 'No description provided.'
  };

  const variables = buildPromptVariables(mappedIssue, historicalContextLog);
  const prompt = renderPrompt(DEFAULT_PROMPT_TEMPLATE, variables);

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert AI assistant. You must respond in valid JSON format matching this schema:\n' +
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
  const supabase = createClient(keys.supabaseUrl, keys.supabaseAnonKey);
  const { error } = await supabase
    .from('issues')
    .insert({
      repo_name: repo,
      issue_number: issue.number,
      is_duplicate: analysis.is_duplicate,
      analysis_summary: analysis.analysis_summary
    });
    
  if (error) {
    console.error("Supabase insert error:", error);
  }
}

async function executeSyncQueue(forceRepos = null) {
  const storage = await chrome.storage.local.get(['repoOwlConfig', 'trackedRepositories']);
  const keys = storage.repoOwlConfig;
  const repos = forceRepos || storage.trackedRepositories || [];

  if (!keys || !keys.groqApiKey || !keys.supabaseUrl) {
    console.warn("RepoOwl: API Keys not configured. Skipping sync.");
    return;
  }

  // Pre-fetch all processed issues to avoid re-processing
  const supabase = createClient(keys.supabaseUrl, keys.supabaseAnonKey);

  for (const repo of repos) {
    console.log(`Syncing repository: ${repo}`);
    
    // Check which issues are already processed
    const { data: processedIssues } = await supabase
      .from('issues')
      .select('issue_number')
      .eq('repo_name', repo);
      
    const processedSet = new Set((processedIssues || []).map(r => r.issue_number));

    const newIssues = await fetchFromGitHub(repo, keys.githubToken);

    for (const issue of newIssues) {
      if (processedSet.has(issue.number)) continue; // Skip already processed

      try {
        console.log(`Processing issue #${issue.number} for ${repo}`);
        const history = await fetchFromSupabase(repo, keys);
        const analysis = await callGroqAPI(issue, history, keys.groqApiKey);
        await saveToSupabase(repo, issue, analysis, keys);

        // Mandatory 2-second delay
        await delay(DELAY_MS);
      } catch (error) {
        console.error(`Error processing issue ${issue.number}:`, error);
        continue;
      }
    }
  }
}
