// @TASK P1-R4-T1 - ProjectMotivation Resource Tests
// @TEST tests/resources/project-motivation.test.ts
import { rm, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalFileAdapter } from '../../src/storage/local-file-adapter.js';
import { getMotivation, setMotivation, deleteMotivation, detectLanguage } from '../../src/resources/project-motivation.js';

let tmpDir: string;
let adapter: LocalFileAdapter;
const SLUG = 'owner--test-repo';

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-motiv-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('detectLanguage', () => {
  it('returns en for English text', () => {
    expect(detectLanguage('This project helps non-developers understand code')).toBe('en');
  });

  it('returns ko when Korean chars > 30%', () => {
    expect(detectLanguage('개발자가 아닌 사람들도 코드를 이해할 수 있도록 돕는 도구')).toBe('ko');
  });

  it('returns en for mixed text with low Korean ratio', () => {
    expect(detectLanguage('This is mostly English with 한글 word')).toBe('en');
  });

  it('returns en for empty string', () => {
    expect(detectLanguage('')).toBe('en');
  });
});

describe('ProjectMotivation CRUD', () => {
  it('returns null for missing motivation', async () => {
    expect(await getMotivation(adapter, SLUG)).toBeNull();
  });

  it('sets and retrieves motivation', async () => {
    await setMotivation(adapter, SLUG, 'To help non-developers understand AI projects');
    const result = await getMotivation(adapter, SLUG);
    expect(result?.answer).toBe('To help non-developers understand AI projects');
  });

  it('detects English language on save', async () => {
    await setMotivation(adapter, SLUG, 'To help non-developers');
    const result = await getMotivation(adapter, SLUG);
    expect(result?.language).toBe('en');
  });

  it('detects Korean language on save', async () => {
    await setMotivation(adapter, SLUG, '비개발자들이 AI 프로젝트를 이해할 수 있도록 돕기 위해서');
    const result = await getMotivation(adapter, SLUG);
    expect(result?.language).toBe('ko');
  });

  it('sets recorded_at and last_used as ISO strings on save', async () => {
    const before = new Date().toISOString();
    await setMotivation(adapter, SLUG, 'Test motivation');
    const result = await getMotivation(adapter, SLUG);
    expect(result?.recorded_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result?.last_used >= before).toBe(true);
  });

  it('updates last_used on get', async () => {
    await setMotivation(adapter, SLUG, 'Test');
    const first = await getMotivation(adapter, SLUG);
    await new Promise(r => setTimeout(r, 10));
    const second = await getMotivation(adapter, SLUG);
    expect(second?.last_used >= first!.last_used).toBe(true);
  });

  it('recorded_at does not change on get', async () => {
    await setMotivation(adapter, SLUG, 'Test');
    const first = await getMotivation(adapter, SLUG);
    const second = await getMotivation(adapter, SLUG);
    expect(second?.recorded_at).toBe(first?.recorded_at);
  });

  it('deletes motivation', async () => {
    await setMotivation(adapter, SLUG, 'Test');
    await deleteMotivation(adapter, SLUG);
    expect(await getMotivation(adapter, SLUG)).toBeNull();
  });

  it('scopes by repo_slug', async () => {
    await setMotivation(adapter, 'repo-a', 'Answer A');
    await setMotivation(adapter, 'repo-b', 'Answer B');
    expect((await getMotivation(adapter, 'repo-b'))?.answer).toBe('Answer B');
  });
});
