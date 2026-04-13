import { rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/components/index.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/components/index.js')>();
  return {
    ...actual,
    selectionPrompt: vi.fn(),
    freeTextInput: vi.fn(),
  };
});

import { freeTextInput, selectionPrompt } from '../src/components/index.js';
import { runReadFlow } from '../src/commands/read.js';
import { getDecision } from '../src/resources/decision-record.js';
import { getCache, setCache } from '../src/resources/explanation-cache.js';
import { LocalFileAdapter } from '../src/storage/local-file-adapter.js';

let tmpDir: string;
let adapter: LocalFileAdapter;

function repoResponse(): Response {
  return new Response(JSON.stringify({
    html_url: 'https://github.com/openai/nerdspecs',
    full_name: 'openai/nerdspecs',
    description: 'Turn repositories into plain-English project summaries.',
    stargazers_count: 99,
    language: 'TypeScript',
    topics: ['docs', 'cli'],
    homepage: null,
  }), { status: 200 });
}

function readmeResponse(): Response {
  return new Response(JSON.stringify({
    encoding: 'base64',
    content: Buffer.from('# NerdSpecs\nTurn repositories into plain-English project summaries for non-developers.').toString('base64'),
  }), { status: 200 });
}

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-read-think-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(repoResponse()).mockResolvedValueOnce(readmeResponse()));
});

afterEach(async () => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  await rm(tmpDir, { recursive: true, force: true });
});

describe('read + think e2e', () => {
  it('stores explanation cache and decision record for the full flow', async () => {
    vi.mocked(selectionPrompt)
      .mockResolvedValueOnce('Yes, record why')
      .mockResolvedValueOnce('adopt');
    vi.mocked(freeTextInput).mockResolvedValueOnce('I need a faster way to explain repos to clients.');

    await runReadFlow(adapter, 'https://github.com/openai/nerdspecs');

    const cache = await getCache(adapter, 'openai/nerdspecs');
    const decision = await getDecision(adapter, 'openai/nerdspecs');
    expect(cache?.repo).toBe('nerdspecs');
    expect(cache?.explanation_en).toContain('nerdspecs');
    expect(decision?.decision).toBe('adopt');
    expect(decision?.reasoning).toContain('clients');
  });

  it('takes the vague-answer path and stores the follow-up answer', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(repoResponse()).mockResolvedValueOnce(readmeResponse());
    vi.mocked(selectionPrompt)
      .mockResolvedValueOnce('Yes, record why')
      .mockResolvedValueOnce('watch');
    vi.mocked(freeTextInput)
      .mockResolvedValueOnce('maybe')
      .mockResolvedValueOnce('When a teammate sends me a repo before a client call.');

    await runReadFlow(adapter, 'https://github.com/openai/nerdspecs');

    const decision = await getDecision(adapter, 'openai/nerdspecs');
    expect(decision?.follow_up_answer).toContain('client call');
    expect(decision?.is_vague).toBe(false);
  });

  it('uses a fresh cache hit without calling GitHub', async () => {
    await setCache(adapter, 'openai/nerdspecs', {
      repo_url: 'https://github.com/openai/nerdspecs',
      owner: 'openai',
      repo: 'nerdspecs',
      fetched_at: new Date().toISOString(),
      explanation_en: 'Cached explanation.',
      explanation_ko: '캐시 설명.',
      use_cases: ['Evaluate fit'],
      target_audience: 'developers',
      complexity_level: 'intermediate',
    });
    vi.mocked(fetch).mockReset();
    vi.mocked(selectionPrompt).mockResolvedValueOnce('No');

    await runReadFlow(adapter, 'https://github.com/openai/nerdspecs');

    expect(fetch).not.toHaveBeenCalled();
  });
});
