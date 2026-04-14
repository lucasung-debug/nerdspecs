import { Command } from 'commander';
import { formatStatusRow } from '../components/index.js';
import { wrapCommand } from '../errors.js';
import { type ProjectConfig } from '../resources/project-config.js';
import type { ProjectMetadata } from '../resources/project-metadata.js';
import type { ProjectMotivation } from '../resources/project-motivation.js';
import type { UserPreferences } from '../resources/user-preferences.js';
import type { StorageAdapter } from '../storage/adapter.js';
import { createStorageAdapter } from '../storage/auto-detect.js';
import { getMnemoHookConnectionState } from '../storage/auto-detect.js';
import { resolveCurrentRepoSlug } from './helpers.js';

async function recordCount(storage: StorageAdapter): Promise<number> {
  return (await storage.list('decision_record::')).length;
}

function printSection(title: string): void {
  console.log(`\n${title}`);
}

async function loadStatusData(storage: StorageAdapter, slug: string): Promise<[
  ProjectConfig | null,
  ProjectMetadata | null,
  ProjectMotivation | null,
  UserPreferences | null,
  number,
]> {
  return Promise.all([
    storage.get<ProjectConfig>(`project_config::${slug}`),
    storage.get<ProjectMetadata>(`project_metadata::${slug}`),
    storage.get<ProjectMotivation>(`project_motivation::${slug}`),
    storage.get<UserPreferences>('user_preferences'),
    recordCount(storage),
  ]);
}

export async function runStatusCommand(storage: StorageAdapter, slug?: string): Promise<void> {
  const currentSlug = slug ?? await resolveCurrentRepoSlug();
  const [config, metadata, motivation, preferences, decisions] = await loadStatusData(storage, currentSlug);
  printSection('Project info');
  console.log(formatStatusRow('Project', metadata?.display_name ?? currentSlug));
  console.log(formatStatusRow('Repo URL', metadata?.repo_url ?? null));
  printSection('Hook status');
  console.log(formatStatusRow('mnemo-hook', getMnemoHookConnectionState()));
  console.log(formatStatusRow('Git hook', config?.hook_installed ?? null));
  console.log(formatStatusRow('Auto push', config?.auto_push ?? null));
  printSection('Memory stats');
  console.log(formatStatusRow('Why built', motivation?.answer ?? '[not recorded]'));
  console.log(formatStatusRow('Language', preferences?.language ?? null));
  if (!motivation) console.log('Hint: run `nerdspecs write` to save why you built this project.');
  printSection('Landing page');
  console.log(formatStatusRow('Enabled', config?.landing_page_enabled ?? null));
  console.log(formatStatusRow('URL', config?.landing_page_url ?? '[not yet generated]'));
  printSection('Decision count');
  console.log(formatStatusRow('Saved decisions', String(decisions)));
}

export async function runStatusCli(): Promise<void> {
  await runStatusCommand(await createStorageAdapter());
}

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show your NerdSpecs settings')
    .action(wrapCommand(async () => {
      await runStatusCli();
    }));
}
