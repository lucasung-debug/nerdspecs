import { rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deleteDecision, getDecision, isVagueAnswer, setDecision } from '../../src/resources/decision-record.js';
import { LocalFileAdapter } from '../../src/storage/local-file-adapter.js';

let tmpDir: string;
let adapter: LocalFileAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-decision-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('decision-record', () => {
  it('detects short and abstract answers as vague', () => {
    expect(isVagueAnswer('maybe')).toBe(true);
    expect(isVagueAnswer('seems useful')).toBe(true);
    expect(isVagueAnswer('I need it to compare output quality for onboarding docs')).toBe(false);
  });

  it('stores decision records with is_vague metadata', async () => {
    const record = await setDecision(adapter, 'owner/repo', {
      repo_url: 'https://github.com/owner/repo',
      decision: 'watch',
      reasoning: 'interesting',
    });

    expect(record.is_vague).toBe(true);
    expect((await getDecision(adapter, 'owner/repo'))?.decision).toBe('watch');
  });

  it('deletes stored decisions', async () => {
    await setDecision(adapter, 'owner/repo', {
      repo_url: 'https://github.com/owner/repo',
      decision: 'adopt',
      reasoning: 'I need it for a client-facing landing page generator.',
    });

    await deleteDecision(adapter, 'owner/repo');
    expect(await getDecision(adapter, 'owner/repo')).toBeNull();
  });
});
