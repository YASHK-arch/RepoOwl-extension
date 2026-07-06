import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseGitHubIssuesPage,
  parseIssueLink,
  parseRepositoryFromUrl,
} from '../src/lib/githubContext.js';

describe('parseGitHubIssuesPage', () => {
  it('parses the issues list route', () => {
    const page = parseGitHubIssuesPage({
      pathname: '/octocat/Hello-World/issues',
    });

    assert.deepEqual(page, {
      type: 'list',
      repository: {
        owner: 'octocat',
        repo: 'Hello-World',
        fullName: 'octocat/Hello-World',
      },
    });
  });

  it('parses a single issue detail route', () => {
    const page = parseGitHubIssuesPage({
      pathname: '/octocat/Hello-World/issues/42',
    });

    assert.deepEqual(page, {
      type: 'detail',
      repository: {
        owner: 'octocat',
        repo: 'Hello-World',
        fullName: 'octocat/Hello-World',
      },
      issueNumber: 42,
    });
  });

  it('ignores unsupported routes', () => {
    assert.equal(
      parseGitHubIssuesPage({ pathname: '/octocat/Hello-World/pulls' }),
      null
    );
  });
});

describe('parseRepositoryFromUrl', () => {
  it('parses owner/repo from the issues list path', () => {
    const repository = parseRepositoryFromUrl({
      pathname: '/octocat/Hello-World/issues',
    });

    assert.deepEqual(repository, {
      owner: 'octocat',
      repo: 'Hello-World',
      fullName: 'octocat/Hello-World',
    });
  });
});

describe('parseIssueLink', () => {
  it('extracts issue number from GitHub issue links', () => {
    const parsed = parseIssueLink('/octocat/Hello-World/issues/42');

    assert.deepEqual(parsed, {
      owner: 'octocat',
      repo: 'Hello-World',
      issueNumber: 42,
      fullName: 'octocat/Hello-World',
    });
  });

  it('ignores non-issue paths', () => {
    assert.equal(parseIssueLink('/octocat/Hello-World/issues/new'), null);
  });
});
