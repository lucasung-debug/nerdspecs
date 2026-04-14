import { mkdtemp, readFile, rm, stat, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runConfigCommand } from '../src/commands/config.js';
import { LocalFileAdapter } from '../src/storage/local-file-adapter.js';

let tmpDir: string;
let projectDir: string;
let adapter: LocalFileAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-hooks-'));
  projectDir = join(tmpDir, 'repo');
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
  await mkdir(join(projectDir, '.git', 'hooks'), { recursive: true });
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(tmpDir, { recursive: true, force: true });
});

describe('config --install-hook', () => {
  it('creates a post-push hook and updates config metadata', async () => {
    const config = await runConfigCommand(adapter, { installHook: true }, 'owner--repo', projectDir);
    const hookPath = join(projectDir, '.git', 'hooks', 'post-push');
    const gitignorePath = join(projectDir, '.gitignore');
    const content = await readFile(hookPath, 'utf-8');
    const gitignore = await readFile(gitignorePath, 'utf-8');

    expect(content).toContain('#!/bin/sh');
    expect(content).toContain('npx nerdspecs write --auto');
    expect(gitignore).toContain('.nerdspecs/');
    expect(config.hook_installed).toBe(true);
    expect(config.hook_installed_at).toBeTruthy();

    if (process.platform !== 'win32') {
      expect((await stat(hookPath)).mode & 0o111).toBeGreaterThan(0);
    }
  });

  it('appends NerdSpecs to an existing post-push hook', async () => {
    const hookPath = join(projectDir, '.git', 'hooks', 'post-push');
    await writeFile(hookPath, '#!/bin/sh\necho existing-hook\n', 'utf-8');

    await runConfigCommand(adapter, { installHook: true }, 'owner--repo', projectDir);

    const content = await readFile(hookPath, 'utf-8');
    expect(content).toContain('echo existing-hook');
    expect(content).toMatch(/echo existing-hook[\s\S]*npx nerdspecs write --auto/);
  });

  it('appends .nerdspecs/ to an existing .gitignore once', async () => {
    const gitignorePath = join(projectDir, '.gitignore');
    await writeFile(gitignorePath, 'node_modules/\ndist/\n', 'utf-8');

    await runConfigCommand(adapter, { installHook: true }, 'owner--repo', projectDir);
    await runConfigCommand(adapter, { installHook: true }, 'owner--repo', projectDir);

    const content = await readFile(gitignorePath, 'utf-8');
    expect(content).toContain('node_modules/');
    expect(content).toContain('dist/');
    expect(content.match(/\.nerdspecs\//g)).toHaveLength(1);
  });
});
