import { observeIssueList } from './badgeInjector.js';
import { observeIssueDetail } from './issueDetailInjector.js';
import { fetchRepositoryInsights } from './fetchIssueInsights.js';
import { parseGitHubIssuesPage } from '../lib/githubContext.js';
import { openInsightsOverlay } from '../overlay/OverlayRoot.jsx';
import Groq from 'groq-sdk';
import { DEFAULT_PROMPT_TEMPLATE, buildPromptVariables, renderPrompt } from '@repoowl/shared';
import { getSandboxClient } from '../lib/supabase.js';

import contentCss from './content.css?inline';

const STORAGE_KEY = 'trackedRepositories';
const DEFAULT_REPO = 'YASHK-arch/RepoOwl-extension';

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

async function fetchPublicRepoConfig(repoName) {
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
            content: 'You are an expert AI assistant. You must respond in valid JSON format matching this schema:\n' +
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
          content: 'You are an expert AI assistant. You must respond in valid JSON format matching this schema:\n' +
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
  } else {
    isTracked = true; // Fallback outside extension context
  }

  // Check for public repoowl.json gateway
  const publicConfig = await fetchPublicRepoConfig(page.repository.fullName);
  if (publicConfig && publicConfig.supabaseUrl && publicConfig.supabaseAnonKey) {
    const { setPublicGatewayConfig } = await import('../lib/supabase.js');
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

  // State 3: fetching_metrics
  // Add a loading indicator? (Optional, but could be added here if desired)
  const insightsCache = await fetchRepositoryInsights(page.repository.fullName);

  if (insightsCache.error) {
    console.warn('[RepoOwl]', insightsCache.error);
  }

  const handleBadgeClick = (issueNumber) => {
    const initialInsight = insightsCache.byNumber.get(issueNumber) ?? null;
    openInsightsOverlay({
      repositoryFullName: page.repository.fullName,
      issueNumber,
      initialInsight,
      insightsById: insightsCache.byId,
    });
  };

  // State 4: ready
  if (page.type === 'list') {
    observeIssueList(page.repository.fullName, insightsCache, handleBadgeClick);
    return;
  }

  observeIssueDetail(
    page.repository.fullName,
    page.issueNumber,
    insightsCache,
    handleBadgeClick
  );

  // If issue hasn't been analyzed by Hub or Sandbox yet, analyze it and save to Sandbox
  if (!insightsCache.byNumber.has(page.issueNumber) && localGroqKey) {
    await autoAnalyzeAndSaveToSandbox(page.repository.fullName, page.issueNumber, localGroqKey, insightsCache);
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
