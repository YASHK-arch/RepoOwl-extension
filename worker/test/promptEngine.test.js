import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PROMPT_TEMPLATE,
  buildPromptVariables,
  formatHistoricalContext,
  renderPrompt,
} from '@repoowl/shared';

import { resolveRepositoryPrompt } from '../src/promptResolver.js';
import { validateGroqResponse } from '../src/validateGroqResponse.js';

describe('renderPrompt', () => {
  it('replaces all default template variables', () => {
    const variables = buildPromptVariables(
      {
        title: 'Crash on save',
        bug_description: 'Null pointer in parser',
        steps_to_reproduce: 'Open file, click save',
        expected_behavior: 'File should save',
      },
      '[Issue ID: #1]\nTitle: Old bug\nTechnical Summary: Parser failure'
    );

    const rendered = renderPrompt(DEFAULT_PROMPT_TEMPLATE, variables);

    assert.match(rendered, /Crash on save/);
    assert.match(rendered, /Null pointer in parser/);
    assert.match(rendered, /Open file, click save/);
    assert.match(rendered, /File should save/);
    assert.match(rendered, /\[Issue ID: #1\]/);
    assert.doesNotMatch(rendered, /\{\{issue\.title\}\}/);
  });
});

describe('resolveRepositoryPrompt', () => {
  it('falls back to default when no custom prompt exists', async () => {
    const supabase = {
      from() {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async maybeSingle() {
            return { data: null, error: null };
          },
        };
      },
    };

    const prompt = await resolveRepositoryPrompt(supabase, 'octocat/Hello-World');
    assert.equal(prompt, DEFAULT_PROMPT_TEMPLATE);
  });

  it('returns custom prompt when saved', async () => {
    const supabase = {
      from() {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async maybeSingle() {
            return { data: { custom_prompt: 'Custom {{issue.title}}' }, error: null };
          },
        };
      },
    };

    const prompt = await resolveRepositoryPrompt(supabase, 'octocat/Hello-World');
    assert.equal(prompt, 'Custom {{issue.title}}');
  });
});

describe('validateGroqResponse', () => {
  it('should accept a valid payload', () => {
    const result = validateGroqResponse({
      context: 'Summary text',
      duplicate_data: {
        original_issue_ids: [101, 202],
        explanation: 'Shared root cause',
      },
    });

    assert.equal(result.context, 'Summary text');
    assert.deepEqual(result.duplicate_data.original_issue_ids, [101, 202]);
  });

  it('rejects invalid duplicate_data', () => {
      assert.throws(() => {
        validateGroqResponse({
          context: 'Summary',
          duplicate_data: { original_issue_ids: ['bad'], explanation: 'x' },
        });
      }, /integers/);
  });
});

describe('formatHistoricalContext', () => {
  it('returns a fallback message when history is empty', () => {
    const formatted = formatHistoricalContext([]);
    assert.match(formatted, /No historical issues/);
  });
});
