import { basename } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { parseRepoSlug } from '../resources/project-config.js';

const execAsync = promisify(exec);

export async function resolveCurrentRepoSlug(cwd?: string): Promise<string> {
  try {
    const { stdout } = await execAsync('git remote get-url origin', { cwd: cwd ?? process.cwd() });
    return parseRepoSlug(stdout.trim());
  } catch {
    return basename(cwd ?? process.cwd());
  }
}
