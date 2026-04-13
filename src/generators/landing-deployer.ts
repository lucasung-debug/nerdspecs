// @TASK P3-R7-T2 - Landing Page Deployer
// @SPEC docs/planning/06-tasks.md#landing-deployer

import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { StorageAdapter } from '../storage/adapter.js';
import { setConfig } from '../resources/project-config.js';
import { validatePath } from '../utils.js';

function parseOwnerRepo(repoSlug: string): { owner: string; repo: string } {
  const sep = repoSlug.indexOf('--');
  if (sep === -1) return { owner: repoSlug, repo: repoSlug };

  const owner = repoSlug.slice(0, sep);
  const repo = repoSlug.slice(sep + 2);
  if (!owner || !repo) return { owner: repoSlug, repo: repoSlug };

  return { owner, repo };
}

function deriveUrl(repoSlug: string): string {
  const { owner, repo } = parseOwnerRepo(repoSlug);
  return `https://${owner}.github.io/${repo}/`;
}

export async function deployLandingPage(
  projectDir: string,
  html: string,
  repoSlug: string,
  storage?: StorageAdapter,
): Promise<{ path: string; url: string }> {
  const projectRoot = validatePath(projectDir, '.');
  const docsDir = validatePath(projectRoot, 'docs');
  await mkdir(docsDir, { recursive: true });
  const path = validatePath(projectRoot, join('docs', 'index.html'));
  await writeFile(path, html, 'utf8');
  const url = deriveUrl(repoSlug);
  if (storage) {
    await setConfig(storage, repoSlug, { landing_page_url: url });
  }
  return { path, url };
}
