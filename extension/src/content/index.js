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
    <div style="padding: 16px; margin: 16px; background-color: var(--color-attention-subtle, #fff8c5); border: 1px solid var(--color-attention-muted, rgba(212,167,44,0.4)); border-radius: 6px; display: flex; align-items: center; justify-content: space-between; color: var(--color-fg-default, #24292f); position: relative;">
      <button class="repoowl-close-btn" style="position: absolute; top: 8px; left: 8px; background: none; border: none; cursor: pointer; color: var(--color-fg-muted, #57606a); padding: 4px; display: flex; align-items: center; justify-content: center;" aria-label="Close" title="Close">
        <svg aria-hidden="true" height="14" viewBox="0 0 16 16" version="1.1" width="14" data-view-component="true" fill="currentColor">
            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
        </svg>
      </button>
      <div style="margin-left: 20px;">
        <strong>RepoOwl:</strong> This repository is not tracked. We won't analyze issues here.
      </div>
      <button class="repoowl-settings-btn" style="background-color: var(--color-success-emphasis, #2da44e); color: var(--color-fg-on-emphasis, #ffffff); border: none; padding: 5px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
        Configure Repository
      </button>
    </div>
  `;

  const btn = warningDiv.querySelector('.repoowl-settings-btn');
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'open_settings' });
  });

  const closeBtn = warningDiv.querySelector('.repoowl-close-btn');
  closeBtn.addEventListener('click', () => {
    warningDiv.remove();
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

      const DRAFT_SYSTEM_PROMPT = 'You are an expert GitHub triage AI.\n' +
        'The user is drafting a new issue. Review it against existing OPEN issues.\n' +
        'DUPLICATE RULES (CRITICAL):\n' +
        '  - Only set is_duplicate=true if the draft targets the EXACT same root cause or feature as a specific existing open issue.\n' +
        '  - Do NOT mark as duplicate because the issues share a topic, domain, or keyword overlap.\n' +
        '  - Do NOT label any issue as spam, noise, or invalid.\n' +
        '  - Default to is_duplicate=false when uncertain.\n' +
        'You must respond in valid JSON format matching this schema:\n' +
        '{ "is_duplicate": boolean, "analysis_summary": "string", "affected_files": ["string"] }\n' +
        'Ensure the JSON is well-formed.';

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: DRAFT_SYSTEM_PROMPT },
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

    // Attempt to fetch the repo file tree for better affected-files prediction
    let fileTree = null;
    try {
      const treeRes = await fetch(`https://api.github.com/repos/${repoName}/git/trees/HEAD?recursive=1`);
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        if (treeData.tree) {
          fileTree = treeData.tree
            .filter(item => item.type === 'blob')
            .map(item => item.path)
            .filter(p => !/(node_modules|package-lock\.json|yarn\.lock|\.png|\.jpg|\.svg|\.ico|\.woff)/.test(p))
            .slice(0, 500)
            .join('\n');
        }
      }
    } catch { /* file tree is optional */ }
    
    const variables = buildPromptVariables(mappedIssue, historicalContextLog, fileTree);
    const prompt = renderPrompt(DEFAULT_PROMPT_TEMPLATE, variables);

    const STRICT_SYSTEM_PROMPT = 'You are an expert GitHub triage AI and systems architect.\n' +
      'Analyze the incoming GitHub issue against the repository file tree and historical issue context.\n' +
      'DUPLICATE RULES (CRITICAL):\n' +
      '  - Only set is_duplicate=true if the issue targets the EXACT same root cause or feature as a specific existing open issue.\n' +
      '  - You MUST cite the matching issue number in analysis_summary when marking as duplicate.\n' +
      '  - Do NOT mark as duplicate because issues share a topic area or keyword overlap.\n' +
      '  - Do NOT label any issue as spam, noise, or invalid. Assume all submissions are legitimate.\n' +
      '  - Default to is_duplicate=false when uncertain.\n' +
      'AFFECTED FILES: Based on the repository file tree, identify up to 8 specific source files most likely to need changes.\n' +
      'You must respond in valid JSON format matching this schema:\n' +
      '{ "is_duplicate": boolean, "analysis_summary": "string", "affected_files": ["string"] }\n' +
      'Ensure the JSON is well-formed.';

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: STRICT_SYSTEM_PROMPT },
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
        analysis_summary: analysis.analysis_summary,
        affected_files: analysis.affected_files ?? null
      });
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
