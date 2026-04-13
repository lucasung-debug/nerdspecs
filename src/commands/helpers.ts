import { basename } from 'node:path';
import { deriveRepoSlug } from '../resources/project-config.js';

export async function resolveCurrentRepoSlug(): Promise<string> {
  try {
    return await deriveRepoSlug();
  } catch {
    return basename(process.cwd());
  }
}
