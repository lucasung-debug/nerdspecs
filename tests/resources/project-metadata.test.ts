// @TASK P1-R3-T1 - ProjectMetadata Resource Tests
// @TEST tests/resources/project-metadata.test.ts
import { rm, mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalFileAdapter } from '../../src/storage/local-file-adapter.js';
import { getMetadata, setMetadata, deleteMetadata, analyzeProject } from '../../src/resources/project-metadata.js';
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

describe('analyzeProject', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = join(tmpDir, 'sample-project');
    await mkdir(projectDir, { recursive: true });
  });

  it('detects TypeScript language from .ts files', async () => {
    await writeFile(join(projectDir, 'index.ts'), 'const x = 1;');
    await writeFile(join(projectDir, 'utils.ts'), 'export const y = 2;');
    const result = await analyzeProject(projectDir);
    expect(result.detected_language).toBe('TypeScript');
  });

  it('detects entry file index.ts', async () => {
    await writeFile(join(projectDir, 'index.ts'), '');
    const result = await analyzeProject(projectDir);
    expect(result.entry_file).toBe('index.ts');
  });

  it('detects Express framework from package.json', async () => {
    await writeFile(join(projectDir, 'package.json'), JSON.stringify({
      dependencies: { express: '^4.18.0' }
    }));
    const result = await analyzeProject(projectDir);
    expect(result.detected_framework).toBe('Express');
  });

  it('counts dependencies from package.json', async () => {
    await writeFile(join(projectDir, 'package.json'), JSON.stringify({
      dependencies: { chalk: '^5.0.0', commander: '^12.0.0' },
      devDependencies: { typescript: '^5.0.0' }
    }));
    const result = await analyzeProject(projectDir);
    expect(result.dependency_count).toBe(3);
  });

  it('sets generated_summary placeholder', async () => {
    const result = await analyzeProject(projectDir);
    expect(result.generated_summary).toBe('[Pending LLM analysis]');
  });

  it('sets last_analyzed as ISO string', async () => {
    const result = await analyzeProject(projectDir);
    expect(result.last_analyzed).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('skips node_modules during scan', async () => {
    const nmDir = join(projectDir, 'node_modules', 'some-pkg');
    await mkdir(nmDir, { recursive: true });
    await writeFile(join(nmDir, 'index.js'), '');
    await writeFile(join(projectDir, 'app.ts'), '');
    const result = await analyzeProject(projectDir);
    expect(result.core_files_analyzed?.some(f => f.includes('node_modules'))).toBe(false);
  });

  it('respects max depth of 3', async () => {
    const deep = join(projectDir, 'a', 'b', 'c', 'd');
    await mkdir(deep, { recursive: true });
    await writeFile(join(deep, 'deep.ts'), '');
    const result = await analyzeProject(projectDir);
    expect(result.core_files_analyzed?.some(f => f.includes('deep.ts'))).toBe(false);
  });
});
