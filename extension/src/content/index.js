import { observeIssueList } from './badgeInjector.js';
import { observeIssueDetail } from './issueDetailInjector.js';
import { injectPRBadges } from './prDetailInjector.js';
import { fetchRepositoryInsights, fetchPullRequestInsights } from './fetchIssueInsights.js';
import { parseGitHubIssuesPage } from '../lib/githubContext.js';
import { openInsightsOverlay } from '../overlay/OverlayRoot.jsx';
import Groq from 'groq-sdk';
import { DEFAULT_PROMPT_TEMPLATE, buildPromptVariables, renderPrompt } from '@repoowl/shared';
import { getSandboxClient, setPublicGatewayConfig } from '../lib/supabase.js';

import contentCss from './content.css?inline';

const STORAGE_KEY = 'trackedRepositories';
const DEFAULT_REPO = 'YASHK-arch/RepoOwl-extension';

// Keep track of the active observer to disconnect it on turbo navigations
let currentObserver = null;

function injectContentStyles() {
  if (document.getElementById('repoowl-content-styles')) return;
  const style = document.createElement('style');
  style.id = 'repoowl-content-styles';
  style.textContent = contentCss;
  document.head.appendChild(style);
}

function showUntrackedWarning() {
  // Only inject once
  if (document.getElementById('repoowl-untracked-warning')) return;

  const container = document.querySelector('turbo-frame#repo-content-turbo-frame') || document.querySelector('#js-repo-pjax-container') || document.querySelector('main');
  if (!container) return;

  const warningDiv = document.createElement('div');
  warningDiv.id = 'repoowl-untracked-warning';
  warningDiv.className = 'repoowl-untracked-warning';
  warningDiv.innerHTML = `
    <div style="padding: 16px; margin: 16px 0; background-color: #fff8c5; border: 1px solid #d4a72c; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <strong>RepoOwl:</strong> This repository is not tracked. We won't analyze issues here.
      </div>
      <button class="repoowl-settings-btn" style="background-color: #2da44e; color: white; border: none; padding: 5px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
        Configure Repository
      </button>
    </div>
  `;

  const btn = warningDiv.querySelector('.repoowl-settings-btn');
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'open_settings' });
  });

  container.insertBefore(warningDiv, container.firstChild);
}

function isValidSupabaseUrl(url) {
  try {
    const parsed = new URL(url);
    // Reject placeholder values — must be a real HTTPS Supabase host
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname.endsWith('.supabase.co') &&
      !parsed.hostname.startsWith('your-')
    );
  } catch {
    return false;
  }
}

async function fetchPublicRepoConfig(repoName) {
  const centralUrl = import.meta.env.VITE_SUPABASE_URL;
  const centralKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (centralUrl && centralKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const centralSupabase = createClient(centralUrl, centralKey, { auth: { persistSession: false } });
      const [owner, name] = repoName.split('/');
      const { data, error } = await centralSupabase
        .from('registry')
        .select('supabase_url, supabase_anon_key')
        .eq('owner', owner)
        .eq('repo', name)
        .single();
      
      if (!error && data) {
        return { supabaseUrl: data.supabase_url, supabaseAnonKey: data.supabase_anon_key };
      }
    } catch (e) {
      console.warn('RepoOwl: Central Mediator check failed:', e);
    }
  }

  try {
    const response = await fetch(`https://raw.githubusercontent.com/${repoName}/main/repoowl.json`);
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

async function enableContributorDraftChecker(repoName, localGroqKey) {
  const issueTextArea = document.getElementById('issue_body');
  if (!issueTextArea) return;

  if (!localGroqKey) return;

  issueTextArea.addEventListener('blur', async (e) => {
    const draftContent = e.target.value;
    if (draftContent.length < 50) return;

    document.getElementById('repoowl-duplicate-warning')?.remove();

    try {
      const insightsCache = await fetchRepositoryInsights(repoName);
      if (insightsCache.error) return;
      const history = Array.from(insightsCache.byNumber.values()).slice(0, 50);

      const groq = new Groq({ apiKey: localGroqKey, dangerouslyAllowBrowser: true });
      const historicalContextLog = history.map(h => `Issue #${h.issue_number}:\n${h.analysis_summary}`).join('\n\n');
      
      const mappedIssue = {
        issue_number: 'DRAFT',
        title: document.getElementById('issue_title')?.value || 'New Issue',
        primary_description: draftContent
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
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });
      const text = response.choices[0]?.message?.content?.trim();
      if (text) {
        const analysis = JSON.parse(text);
        if (analysis.is_duplicate) {
          const warningDiv = document.createElement('div');
          warningDiv.id = 'repoowl-duplicate-warning';
          warningDiv.style.cssText = 'padding: 16px; margin: 16px 0; background-color: #ffebe9; border: 1px solid #ff8182; border-radius: 6px; color: #cf222e;';
          warningDiv.innerHTML = `<strong>RepoOwl Warning:</strong> This issue seems to be a duplicate. ${analysis.analysis_summary}`;
          issueTextArea.parentNode.insertBefore(warningDiv, issueTextArea);
        }
      }
    } catch (err) {
      console.warn('RepoOwl draft analysis failed:', err);
    }
  });
}

async function autoAnalyzeAndSaveToSandbox(repoName, issueNumber, localGroqKey, insightsCache) {
  try {
    const sandboxClient = await getSandboxClient();
    if (!sandboxClient) return;

    const titleEl = document.querySelector('.js-issue-title');
    const bodyEl = document.querySelector('.comment-body');
    if (!titleEl || !bodyEl) return;

    const mappedIssue = {
      issue_number: issueNumber,
      title: titleEl.textContent.trim(),
      primary_description: bodyEl.textContent.trim()
    };

    const history = Array.from(insightsCache.byNumber.values()).slice(0, 50);
    const groq = new Groq({ apiKey: localGroqKey, dangerouslyAllowBrowser: true });
    const historicalContextLog = history.map(h => `Issue #${h.issue_number}:\n${h.analysis_summary}`).join('\n\n');
    
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
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (text) {
      const analysis = JSON.parse(text);
      await sandboxClient.from('issues').insert({
        repo_name: repoName,
        issue_number: issueNumber,
        is_duplicate: analysis.is_duplicate,
        analysis_summary: analysis.analysis_summary
      });
      // Optionally we could update the insightsCache here to reflect immediately, but refresh is fine.
    }
  } catch (err) {
    console.warn('RepoOwl auto-sandbox analysis failed:', err);
  }
}

async function bootstrap() {
  if (currentObserver) {
    currentObserver.disconnect();
    currentObserver = null;
  }

  const page = parseGitHubIssuesPage();
  if (!page) return;

  injectContentStyles();

  // State 1: checking_storage
  let isTracked = false;
  let localGroqKey = null;
  if (typeof chrome !== 'undefined' && chrome.storage) {
    const result = await new Promise(resolve => chrome.storage.local.get([STORAGE_KEY, 'repoOwlConfig'], resolve));
    const repos = result[STORAGE_KEY] || [DEFAULT_REPO];
    isTracked = repos.includes(page.repository.fullName);
    localGroqKey = result.repoOwlConfig?.groqApiKey;
    if (!localGroqKey && import.meta.env.VITE_GROQ_API_KEY) {
      localGroqKey = import.meta.env.VITE_GROQ_API_KEY;
    }
  } else {
    isTracked = true; // Fallback outside extension context
  }

  // Check for public repoowl.json gateway — validate URL is real before using it
  // (Placeholder values like "https://your-maintainer-project.supabase.co" must be rejected
  //  otherwise they poison the Hub Supabase client causing 8s timeouts on every page load)
  const publicConfig = await fetchPublicRepoConfig(page.repository.fullName);
  if (
    publicConfig &&
    isValidSupabaseUrl(publicConfig.supabaseUrl) &&
    publicConfig.supabaseAnonKey &&
    !publicConfig.supabaseAnonKey.startsWith('your-')
  ) {
    setPublicGatewayConfig(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey);
    isTracked = true;
  }

  // State 2: untracked
  if (!isTracked) {
    showUntrackedWarning();
    return;
  }
  
  if (page.type === 'new') {
    await enableContributorDraftChecker(page.repository.fullName, localGroqKey);
    return;
  }

  if (page.type === 'pr_detail') {
    injectPRBadges();
    return;
  }

  // State 3: Two-phase rendering
  // Phase 1 (INSTANT): Paint badges immediately from the local hub_cache written by background.js.
  // This makes badges appear in <50ms instead of waiting for the Supabase round-trip.
  let cachedInsights = { byNumber: new Map(), byId: new Map(), error: null };
  try {
    const cacheKey = page.type === 'pr_list' ? `pr_hub_cache_${page.repository.fullName}` : `hub_cache_${page.repository.fullName}`;
    const cacheResult = await chrome.storage.local.get([cacheKey]);
    const cachedRows = cacheResult[cacheKey] || [];
    if (cachedRows.length > 0) {
      for (const row of cachedRows) {
        // PR cache rows use pr_number, issue cache rows use issue_number
        const num = row.pr_number ?? row.issue_number;
        cachedInsights.byNumber.set(num, { ...row, is_processed: true });
        if (row.id) cachedInsights.byId.set(row.id, { ...row, is_processed: true });
      }
    }
  } catch (e) {
    console.warn('[RepoOwl] Could not read hub_cache from storage:', e);
  }

  // Hold a mutable reference so the click handler always sees the latest data
  let liveInsights = cachedInsights;

  const handleBadgeClick = (issueNumber) => {
    const initialInsight = liveInsights.byNumber.get(issueNumber) ?? null;
    openInsightsOverlay({
      repositoryFullName: page.repository.fullName,
      issueNumber,
      initialInsight,
      insightsById: liveInsights.byId,
    });
  };

  // State 4: Paint immediately with cached data
  if (page.type === 'list' || page.type === 'pr_list') {
    const fetchFunc = page.type === 'pr_list' ? fetchPullRequestInsights : fetchRepositoryInsights;
    currentObserver = observeIssueList(page.repository.fullName, cachedInsights, handleBadgeClick);

    // Phase 2 (ASYNC): Fetch fresh data from Supabase in the background.
    // When it arrives, update badges in-place without any blocking.
    fetchFunc(page.repository.fullName).then((freshInsights) => {
      if (freshInsights.error) {
        console.warn('[RepoOwl]', freshInsights.error);
        return;
      }
      // Merge cached insights with fresh insights to prevent flickering or data loss on fallback
      const mergedByNumber = new Map(cachedInsights.byNumber);
      for (const [k, v] of freshInsights.byNumber) mergedByNumber.set(k, v);
      
      const mergedById = new Map(cachedInsights.byId);
      for (const [k, v] of freshInsights.byId) mergedById.set(k, v);

      liveInsights.byNumber = mergedByNumber;
      liveInsights.byId = mergedById;
      liveInsights.error = freshInsights.error;
      
      // Remove old badges so the observer re-paints them with fresh data
      // This triggers the existing MutationObserver to automatically re-scan.
      document.querySelectorAll('[data-repoowl-badge]').forEach(el => el.remove());
    }).catch((err) => console.warn('[RepoOwl] Background fetch error:', err));

    return;
  }

  // Detail page: also use two-phase approach
  currentObserver = observeIssueDetail(
    page.repository.fullName,
    page.issueNumber,
    cachedInsights,
    handleBadgeClick
  );

  // Fetch live data and update if the badge changes state
  fetchRepositoryInsights(page.repository.fullName).then((freshInsights) => {
    if (!freshInsights.error) {
      // Merge cached insights with fresh insights to prevent flickering or data loss on fallback
      const mergedByNumber = new Map(cachedInsights.byNumber);
      for (const [k, v] of freshInsights.byNumber) mergedByNumber.set(k, v);
      
      const mergedById = new Map(cachedInsights.byId);
      for (const [k, v] of freshInsights.byId) mergedById.set(k, v);

      liveInsights.byNumber = mergedByNumber;
      liveInsights.byId = mergedById;
      liveInsights.error = freshInsights.error;
      
      // Remove old badges so the observer re-paints them with fresh data
      // This triggers the existing MutationObserver to automatically re-scan.
      document.querySelectorAll('[data-repoowl-badge]').forEach(el => el.remove());
    }
  }).catch(() => {});

  // If issue hasn't been analyzed by Hub or Sandbox yet, analyze it and save to Sandbox
  if (!cachedInsights.byNumber.has(page.issueNumber) && localGroqKey) {
    await autoAnalyzeAndSaveToSandbox(page.repository.fullName, page.issueNumber, localGroqKey, cachedInsights);
  }
}

// Run immediately
bootstrap().catch((err) => console.warn('[RepoOwl] bootstrap error:', err));

// Also re-run on GitHub's Turbo / pjax navigation events
document.addEventListener('turbo:load', () => {
  bootstrap().catch((err) => console.warn('[RepoOwl] turbo:load bootstrap error:', err));
});

document.addEventListener('pjax:end', () => {
  bootstrap().catch((err) => console.warn('[RepoOwl] pjax:end bootstrap error:', err));
});
