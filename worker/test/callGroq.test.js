import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { assertGroqApiKey } from '../src/callGroq.js';

describe('assertGroqApiKey', () => {
  it('does not throw for valid keys', () => {
    assert.doesNotThrow(() => {
      assertGroqApiKey('gsk_valid_key_example');
    });
  });

  it('accepts legacy AIza standard keys', () => {
    assert.doesNotThrow(() => {
      assertGroqApiKey('gsk_another_key');
    });
  });

  it('throws for empty keys', () => {
    assert.throws(() => assertGroqApiKey('   '), /empty/i);
  });
});
