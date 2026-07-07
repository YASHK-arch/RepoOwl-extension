/** Mandatory delay between sequential API calls. */
export const GROQ_THROTTLE_MS = 4500; // Increased to 4.5s for safety margin

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validates that a structured-output payload matches the DB contract.
 */
export function validateGroqResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Groq response is not an object. Received: ' + typeof payload);
  }

  if (typeof payload.context !== 'string' || !payload.context.trim()) {
    throw new Error('Groq response missing a non-empty context string.');
  }

  const duplicateData = payload.duplicate_data;
  if (!duplicateData || typeof duplicateData !== 'object') {
    throw new Error('Groq response missing duplicate_data object.');
  }

  if (!Array.isArray(duplicateData.original_issue_ids)) {
    throw new Error('duplicate_data.original_issue_ids must be an array.');
  }

  for (const id of duplicateData.original_issue_ids) {
    if (!Number.isInteger(id)) {
      throw new Error('duplicate_data.original_issue_ids must contain integers.');
    }
  }

  if (typeof duplicateData.explanation !== 'string') {
    throw new Error('duplicate_data.explanation must be a string.');
  }

  return {
    context: payload.context.trim(),
    duplicate_data: {
      original_issue_ids: duplicateData.original_issue_ids,
      explanation: duplicateData.explanation.trim(),
    },
  };
}