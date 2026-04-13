// @TASK P1-R3-T1 - ProjectMetadata Resource Tests
// @TEST tests/resources/project-metadata.test.ts
import { rm, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalFileAdapter } from '../../src/storage/local-file-adapter.js';
import { getMetadata, setMetadata, deleteMetadata } from '../../src/resources/project-metadata.js';
import type { ProjectMetadata } from '../../src/resources/project-metadata.js';

let tmpDir: string;
let adapter: LocalFileAdapter;

const SLUG = 'owner--test-repo';

const sampleMeta = (): ProjectMetadata => ({
  repo_slug: SLUG,
  display_name: 'Test Repo',
  generated_summary: 'A test project',
  last_analyzed: new Date().toISOString(),
});

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-meta-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('ProjectMetadata CRUD', () => {
  it('returns null for missing metadata', async () => {
    expect(await getMetadata(adapter, SLUG)).toBeNull();
  });

  it('sets and retrieves metadata', async () => {
    const data = sampleMeta();
    await setMetadata(adapter, SLUG, data);
    expect(await getMetadata(adapter, SLUG)).toEqual(data);
  });

  it('scopes by repo_slug key', async () => {
    await setMetadata(adapter, 'a--repo', { ...sampleMeta(), repo_slug: 'a--repo' });
    await setMetadata(adapter, 'b--repo', { ...sampleMeta(), repo_slug: 'b--repo', display_name: 'B Repo' });
    expect((await getMetadata(adapter, 'b--repo'))?.display_name).toBe('B Repo');
  });

  it('deletes metadata', async () => {
    await setMetadata(adapter, SLUG, sampleMeta());
    await deleteMetadata(adapter, SLUG);
    expect(await getMetadata(adapter, SLUG)).toBeNull();
  });

  it('overwrites existing metadata', async () => {
    await setMetadata(adapter, SLUG, sampleMeta());
    await setMetadata(adapter, SLUG, { ...sampleMeta(), display_name: 'Updated' });
    expect((await getMetadata(adapter, SLUG))?.display_name).toBe('Updated');
  });
});
