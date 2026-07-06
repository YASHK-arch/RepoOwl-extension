import { createClient } from '@supabase/supabase-js';

import { GEMINI_RESPONSE_SCHEMA } from '@repoowl/shared';

import { syncGitHubIssues } from './githubSync.js';
import { buildRenderedPrompt } from './promptResolver.js';
import {
  GEMINI_THROTTLE_MS,
  sleep,
  validateGeminiResponse,
} from './validateGeminiResponse.js';

const UNPROCESSED_BATCH_SIZE = 10;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function fetchUnprocessedIssues(supabase, repositoryFullName) {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('repository_full_name', repositoryFullName)
    .eq('is_processed', false)
    .order('created_at', { ascending: true })
    .limit(UNPROCESSED_BATCH_SIZE);

  if (error) {
    throw new Error(`Failed to fetch unprocessed issues: ${error.message}`);
  }

  return data ?? [];
}

async function fetchHistoricalContext(supabase, repositoryFullName, excludeIssueId) {
  const { data, error } = await supabase
    .from('issues')
    .select('issue_id, title, context')
    .eq('repository_full_name', repositoryFullName)
    .eq('is_processed', true)
    .neq('issue_id', excludeIssueId)
    .not('context', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch historical context: ${error.message}`);
  }

  return data ?? [];
}

async function callGemini(prompt, apiKey) {
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: GEMINI_RESPONSE_SCHEMA,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${body}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini API returned an empty response.');
  }

  return validateGeminiResponse(JSON.parse(text));
}

async function markIssueProcessed(supabase, issueId, llmResult) {
  const { error } = await supabase
    .from('issues')
    .update({
      context: llmResult.context,
      duplicate_data: llmResult.duplicate_data,
      is_processed: true,
    })
    .eq('issue_id', issueId);

  if (error) {
    throw new Error(`Failed to update issue ${issueId}: ${error.message}`);
  }
}

export async function runWorker() {
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const supabaseKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const geminiApiKey = requireEnv('GEMINI_API_KEY');
  const repositoryFullName = requireEnv('GITHUB_REPOSITORY');

  const githubToken = requireEnv('GITHUB_TOKEN');
  const supabase = createClient(supabaseUrl, supabaseKey);

  await syncGitHubIssues(supabase, repositoryFullName, githubToken);

  const unprocessedIssues = await fetchUnprocessedIssues(supabase, repositoryFullName);

  if (unprocessedIssues.length === 0) {
    console.log('No unprocessed issues found.');
    return;
  }

  console.log(`Processing ${unprocessedIssues.length} unprocessed issue(s)...`);

  for (let index = 0; index < unprocessedIssues.length; index += 1) {
    const issue = unprocessedIssues[index];
    const historicalIssues = await fetchHistoricalContext(
      supabase,
      repositoryFullName,
      issue.issue_id
    );

    const prompt = await buildRenderedPrompt(
      supabase,
      repositoryFullName,
      issue,
      historicalIssues
    );

    const llmResult = await callGemini(prompt, geminiApiKey);
    await markIssueProcessed(supabase, issue.issue_id, llmResult);

    console.log(`Processed issue #${issue.issue_id}`);

    const hasMore = index < unprocessedIssues.length - 1;
    if (hasMore) {
      await sleep(GEMINI_THROTTLE_MS);
    }
  }
}

runWorker().catch((error) => {
  console.error(error);
  process.exit(1);
});
