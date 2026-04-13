import { rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deleteCache, getCache, isStale, setCache } from '../../src/resources/explanation-cache.js';
import { LocalFileAdapter } from '../../src/storage/local-file-adapter.js';

let tmpDir: string;
let adapter: LocalFileAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-cache-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('explanation-cache', () => {
  it('stores and retrieves cache entries by owner/repo key', async () => {
    await setCache(adapter, 'owner/repo', {
      repo_url: 'https://github.com/owner/repo',
      owner: 'owner',
      repo: 'repo',
      explanation_en: 'English explanation.',
      explanation_ko: '한국어 설명.',
      use_cases: ['Evaluate fit'],
      target_audience: 'developers',
      complexity_level: 'intermediate',
      nerdspecs_version: '0.2.0',
    });

    const cache = await getCache(adapter, 'owner/repo');
    expect(cache?.repo).toBe('repo');
    expect(cache?.explanation_en).toContain('English');
  });

  it('marks entries older than 7 days as stale', () => {
    expect(isStale({
      repo_url: 'https://github.com/owner/repo',
      owner: 'owner',
      repo: 'repo',
      fetched_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      explanation_en: 'Old',
      use_cases: [],
      complexity_level: 'beginner',
    })).toBe(true);
  });

  it('keeps recent entries fresh', () => {
    expect(isStale({
      repo_url: 'https://github.com/owner/repo',
      owner: 'owner',
      repo: 'repo',
      fetched_at: new Date().toISOString(),
      explanation_en: 'Fresh',
      use_cases: [],
      complexity_level: 'advanced',
    })).toBe(false);
  });

  it('deletes cached entries', async () => {
    await setCache(adapter, 'owner/repo', {
      repo_url: 'https://github.com/owner/repo',
      owner: 'owner',
      repo: 'repo',
      explanation_en: 'Temp',
      use_cases: [],
      complexity_level: 'intermediate',
    });

    await deleteCache(adapter, 'owner/repo');
    expect(await getCache(adapter, 'owner/repo')).toBeNull();
  });
});
