/**
 * Groq structured-output schema aligned with the issues table columns
 * `context` (TEXT) and `duplicate_data` (JSONB).
 */
export const GROQ_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    is_duplicate: {
      type: 'BOOLEAN',
      description: 'True if the issue is a duplicate of a previously logged issue, otherwise false.',
    },
    analysis_summary: {
      type: 'STRING',
      description: 'LLM-generated technical summary and duplicate linkage explanation.',
    },
  },
  required: ['is_duplicate', 'analysis_summary'],
};
