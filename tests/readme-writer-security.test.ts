import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

vi.mock('node:child_process', () => ({
  execFile: vi.fn(),
}));

import { commitReadme } from '../src/generators/readme-writer.js';
import { validatePath } from '../src/utils.js';

describe('commitReadme', () => {
  beforeEach(() => {
    vi.mocked(execFile).mockImplementation(((file, args, options, callback) => {
      callback?.(null, '', '');
      return {} as never;
    }) as typeof execFile);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('invokes git via execFile with argument arrays', async () => {
    const message = 'docs: update README && rm -rf /';
    const result = await commitReadme('C:\\repo\\.\\project\\..', message);

    expect(result).toBe(true);
    expect(execFile).toHaveBeenCalledTimes(2);

    const addCall = vi.mocked(execFile).mock.calls[0];
    const commitCall = vi.mocked(execFile).mock.calls[1];

    expect(addCall?.[0]).toBe('git');
    expect(addCall?.[1]).toEqual(['add', 'README.md']);
    expect(addCall?.[2]).toEqual({ cwd: 'C:\\repo' });

    expect(commitCall?.[0]).toBe('git');
    expect(commitCall?.[1]).toEqual(['commit', '-m', message]);
    expect(commitCall?.[2]).toEqual({ cwd: 'C:\\repo' });
  });
});

describe('validatePath', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-path-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('throws on ../ traversal outside the base directory', () => {
    expect(() => validatePath(tmpDir, '../outside.txt')).toThrow('Path traversal detected');
  });

  it('rejects paths that escape through a symlinked directory', async () => {
    const baseDir = join(tmpDir, 'base');
    const outsideDir = join(tmpDir, 'outside');
    const linkPath = join(baseDir, 'escape');

    await mkdir(baseDir, { recursive: true });
    await mkdir(outsideDir, { recursive: true });
    await symlink(outsideDir, linkPath, process.platform === 'win32' ? 'junction' : 'dir');

    expect(() => validatePath(baseDir, join('escape', 'secret.txt'))).toThrow('Path traversal detected');
  });
});
