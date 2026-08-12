/**
 * Replaces {{dot.notation}} placeholders in a prompt template.
 * Missing keys resolve to an empty string rather than leaving raw tokens.
 */
export function renderPrompt(template, variables) {
  return template.replace(/\{\{([^}]+)\}\}/g, (_match, rawKey) => {
    const key = rawKey.trim();
    const parts = key.split('.');
    let value = variables;

    for (const part of parts) {
      if (value == null || typeof value !== 'object') {
        return '';
      }
      value = value[part];
    }

    if (value == null) {
      return '';
    }

    return String(value);
  });
}

/**
 * Builds the variable map for the default prompt template from an issue row,
 * a pre-formatted historical context string, and an optional repository file tree.
 *
 * @param {object} issue - The issue object with fields like title, primary_description, etc.
 * @param {string} historicalContextLog - Pre-formatted string of past issue summaries.
 * @param {string} [fileTree] - Optional flattened list of repo file paths (newline-separated).
 */
export function buildPromptVariables(issue, historicalContextLog, fileTree) {
  return {
    issue: {
      title: issue.title ?? '',
      primary_description: issue.primary_description ?? '',
      context_steps: issue.context_steps ?? '',
      expected_outcome: issue.expected_outcome ?? '',
      technical_metrics: issue.technical_metrics ?? '',
    },
    repository: {
      historical_context_log: historicalContextLog ?? '',
      file_tree: fileTree ?? 'Repository file tree not available.',
    },
  };
}
