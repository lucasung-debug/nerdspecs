import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchRepoInfo, parseGitHubUrl } from '../../src/resources/github-fetcher.js';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('github-fetcher', () => {
  it('parses GitHub URLs and rejects non-GitHub URLs', () => {
    expect(parseGitHubUrl('https://github.com/openai/gpt-5')).toEqual({ owner: 'openai', repo: 'gpt-5' });
    expect(() => parseGitHubUrl('https://example.com/openai/gpt-5')).toThrow('Only GitHub URLs are supported.');
  });

  it('fetches repo metadata and decodes README content', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({
        html_url: 'https://github.com/openai/gpt-5',
        full_name: 'openai/gpt-5',
        description: 'Model repo',
        stargazers_count: 10,
        language: 'TypeScript',
        topics: ['ai', 'sdk'],
        homepage: null,
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        encoding: 'base64',
        content: Buffer.from('# Hello\nA README').toString('base64'),
      }), { status: 200 }));

    const info = await fetchRepoInfo('openai', 'gpt-5');
    expect(info.full_name).toBe('openai/gpt-5');
    expect(info.readme).toContain('A README');
  });

  it('turns rate limits into a user-friendly error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 403 }));
    await expect(fetchRepoInfo('openai', 'gpt-5')).rejects.toThrow('GitHub API rate limit reached. Please try again later.');
  });
});
