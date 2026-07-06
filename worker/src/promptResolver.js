import {
  DEFAULT_PROMPT_TEMPLATE,
  buildPromptVariables,
  formatHistoricalContext,
  renderPrompt,
} from '@repoowl/shared';

/**
 * Fetches a repository's custom prompt from Supabase.
 * Falls back to the hardcoded default when none is saved or the value is blank.
 */
export async function resolveRepositoryPrompt(supabase, repositoryFullName) {
  const { data, error } = await supabase
    .from('repository_prompts')
    .select('custom_prompt')
    .eq('repository_full_name', repositoryFullName)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to fetch prompt for ${repositoryFullName}: ${error.message}`
    );
  }

  const customPrompt = data?.custom_prompt?.trim();
  if (customPrompt) {
    return customPrompt;
  }

  return DEFAULT_PROMPT_TEMPLATE;
}

/**
 * Resolves the prompt template (custom or default) and injects issue variables.
 */
export async function buildRenderedPrompt(
  supabase,
  repositoryFullName,
  issue,
  historicalIssues
) {
  const template = await resolveRepositoryPrompt(supabase, repositoryFullName);
  const historicalContextLog = formatHistoricalContext(historicalIssues);
  const variables = buildPromptVariables(issue, historicalContextLog);
  return renderPrompt(template, variables);
}
