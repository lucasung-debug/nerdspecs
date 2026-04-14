// @TASK P1-R3-T1 - ProjectMetadata Resource Tests
// @TEST tests/resources/project-metadata.test.ts
import { rm, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalFileAdapter } from '../../src/storage/local-file-adapter.js';
import { deleteMetadata } from '../../src/resources/project-metadata.js';

let tmpDir: string;
let adapter: LocalFileAdapter;

const SLUG = 'owner--test-repo';

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-meta-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('ProjectMetadata', () => {
  it('deleteMetadata does not throw on missing key', async () => {
    await expect(deleteMetadata(adapter, SLUG)).resolves.not.toThrow();
  });

  it('deleteMetadata removes stored data', async () => {
    await adapter.set(`project_metadata::${SLUG}`, { repo_slug: SLUG, display_name: 'Test' });
    await deleteMetadata(adapter, SLUG);
    expect(await adapter.get(`project_metadata::${SLUG}`)).toBeNull();
  });
});
