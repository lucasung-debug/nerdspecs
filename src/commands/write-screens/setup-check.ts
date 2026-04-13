// @TASK P2-S1-T1 - Write Setup Check Screen
// @SPEC docs/planning/06-tasks.md#P2-S1-T1

import { getConfig } from '../../resources/project-config.js';
import { analyzeProject } from '../../resources/code-analyzer.js';
import { selectionPrompt } from '../../components/index.js';
import type { StorageAdapter } from '../../storage/adapter.js';
import { resolveCurrentRepoSlug } from '../helpers.js';

async function showFirstRunPrompt(info: Awaited<ReturnType<typeof analyzeProject>>): Promise<boolean> {
  console.log(`  Language : ${info?.primary_language ?? 'unknown'}`);
  console.log(`  Framework: ${info?.detected_framework ?? 'unknown'}`);
  console.log(`  Entry    : ${info?.entry_file ?? 'unknown'}`);
  const answer = await selectionPrompt('Continue?', ['Yes', 'No']);
  return answer === 'Yes';
}

export async function runSetupCheck(storage: StorageAdapter): Promise<{ repo_slug: string; skip: boolean }> {
  const repo_slug = await resolveCurrentRepoSlug();
  const existing = await storage.get(`project_config::${repo_slug}`);
  if (existing) return { repo_slug, skip: false };

  const info = await analyzeProject(process.cwd());
  const proceed = await showFirstRunPrompt(info);
  if (!proceed) return { repo_slug, skip: true };

  await getConfig(storage, repo_slug);
  return { repo_slug, skip: false };
}
