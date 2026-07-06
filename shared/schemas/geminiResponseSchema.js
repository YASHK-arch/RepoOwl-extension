/**
 * Gemini structured-output schema aligned with the issues table columns
 * `context` (TEXT) and `duplicate_data` (JSONB).
 */
export const GEMINI_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    context: {
      type: 'string',
      description: 'LLM-generated technical summary of the issue.',
    },
    duplicate_data: {
      type: 'object',
      properties: {
        original_issue_ids: {
          type: 'array',
          items: { type: 'integer' },
          description: 'GitHub issue IDs of structurally duplicate historical issues.',
        },
        explanation: {
          type: 'string',
          description: 'Technical breakdown of duplicate linkage or uniqueness justification.',
        },
      },
      required: ['original_issue_ids', 'explanation'],
    },
  },
  required: ['context', 'duplicate_data'],
};
