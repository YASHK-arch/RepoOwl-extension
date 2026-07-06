import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { mapGitHubIssueToRow } from '../src/githubSync.js';

describe('mapGitHubIssueToRow', () => {
  it('stores both GitHub id and issue number', () => {
    const row = mapGitHubIssueToRow(
      {
        id: 2847462837,
        number: 42,
        title: 'Parser crash',
        body: '### Bug Description\nNull pointer\n',
      },
      'octocat/Hello-World'
    );

    assert.equal(row.issue_id, 2847462837);
    assert.equal(row.issue_number, 42);
    assert.equal(row.repository_full_name, 'octocat/Hello-World');
  });
});
