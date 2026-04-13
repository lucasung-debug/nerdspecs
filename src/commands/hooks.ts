import { constants } from 'node:fs';
import { access, chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NerdSpecsError } from '../errors.js';
import { setConfig, type ProjectConfig } from '../resources/project-config.js';
import type { StorageAdapter } from '../storage/adapter.js';

const HOOK_COMMAND = 'npx nerdspecs write --auto';

function gitPath(projectDir: string, ...parts: string[]): string {
  return join(projectDir, '.git', ...parts);
}

async function pathExists(path: string): Promise<boolean> {
  try { await access(path, constants.F_OK); return true; }
  catch { return false; }
}

async function ensureGitDirectory(projectDir: string): Promise<void> {
  if (await pathExists(gitPath(projectDir))) return;
  throw new NerdSpecsError('ERR_GIT_NO_REMOTE', {
    userMessage: 'This project does not have a `.git` directory yet.',
  });
}

async function readHookFile(path: string): Promise<string> {
  if (!(await pathExists(path))) return '';
  return readFile(path, 'utf-8');
}

function buildHookContent(existing: string): string {
  if (!existing) return `#!/bin/sh\n${HOOK_COMMAND}\n`;
  if (existing.includes(HOOK_COMMAND)) return existing;
  const separator = existing.endsWith('\n') ? '' : '\n';
  return `${existing}${separator}${HOOK_COMMAND}\n`;
}

async function setExecutable(path: string): Promise<void> {
  if (process.platform === 'win32') return;
  await chmod(path, 0o755);
}

export async function installPostPushHook(
  storage: StorageAdapter,
  repoSlug: string,
  projectDir: string = process.cwd(),
): Promise<ProjectConfig> {
  const path = gitPath(projectDir, 'hooks', 'post-push');
  await ensureGitDirectory(projectDir);
  await mkdir(gitPath(projectDir, 'hooks'), { recursive: true });
  await writeFile(path, buildHookContent(await readHookFile(path)), 'utf-8');
  await setExecutable(path);
  return setConfig(storage, repoSlug, {
    hook_installed: true,
    hook_installed_at: new Date().toISOString(),
  });
}
