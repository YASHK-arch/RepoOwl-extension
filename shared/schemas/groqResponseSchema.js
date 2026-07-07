/**
 * Groq structured-output schema aligned with the issues table columns
 * `context` (TEXT) and `duplicate_data` (JSONB).
 */
export const GROQ_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    context: {
      type: 'STRING',
      description: 'LLM-generated technical summary of the issue.',
    },
    duplicate_data: {
      type: 'OBJECT',
      properties: {
        original_issue_ids: {
          type: 'ARRAY',
          items: { type: 'INTEGER' },
          description: 'GitHub issue IDs of structurally duplicate historical issues.',
        },
        explanation: {
          type: 'STRING',
          description: 'Technical breakdown of duplicate linkage or uniqueness justification.',
        },
      },
      required: ['original_issue_ids', 'explanation'],
    },
  },
  required: ['context', 'duplicate_data'],
};
