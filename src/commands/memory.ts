import { Command } from 'commander';
import { selectionPrompt } from '../components/index.js';
import { wrapCommand } from '../errors.js';
import { deleteConfig, type ProjectConfig } from '../resources/project-config.js';
import type { ProjectMetadata } from '../resources/project-metadata.js';
import { deleteMetadata } from '../resources/project-metadata.js';
import { deleteMotivation, type ProjectMotivation } from '../resources/project-motivation.js';
import type { StorageAdapter } from '../storage/adapter.js';
import { createStorageAdapter } from '../storage/auto-detect.js';
import { resolveCurrentRepoSlug } from './helpers.js';

function printRecord(label: string, value: unknown): void {
  console.log(`\n${label}`);
  if (!value) {
    console.log('[not stored]');
    return;
  }
  console.log(JSON.stringify(value, null, 2));
}

export async function runMemoryShowCommand(
  storage: StorageAdapter,
  slug?: string,
): Promise<void> {
  const currentSlug = slug ?? await resolveCurrentRepoSlug();
  const [motivation, config, metadata] = await Promise.all([
    storage.get<ProjectMotivation>(`project_motivation::${currentSlug}`),
    storage.get<ProjectConfig>(`project_config::${currentSlug}`),
    storage.get<ProjectMetadata>(`project_metadata::${currentSlug}`),
  ]);

  console.log(`Memory for ${currentSlug}`);
  printRecord('Motivation', motivation);
  printRecord('Config', config);
  printRecord('Metadata', metadata);
}

export async function runMemoryClearCommand(
  storage: StorageAdapter,
  slug?: string,
): Promise<boolean> {
  const currentSlug = slug ?? await resolveCurrentRepoSlug();
  const confirmed = await selectionPrompt(
    `Clear stored NerdSpecs memory for ${currentSlug}?`,
    ['No', 'Yes, clear it'],
  );

  if (confirmed !== 'Yes, clear it') {
    console.log('Memory clear canceled.');
    return false;
  }

  await deleteMotivation(storage, currentSlug);
  await deleteConfig(storage, currentSlug);
  await deleteMetadata(storage, currentSlug);

  console.log(`Cleared stored memory for ${currentSlug}.`);
  return true;
}

async function runMemoryShowCli(): Promise<void> {
  await runMemoryShowCommand(await createStorageAdapter());
}

async function runMemoryClearCli(): Promise<void> {
  await runMemoryClearCommand(await createStorageAdapter());
}

export function registerMemoryCommand(program: Command): void {
  const memory = program
    .command('memory')
    .description('Show or clear NerdSpecs memory for this project');

  memory
    .command('show')
    .description('Display stored data for the current project')
    .action(wrapCommand(async () => {
      await runMemoryShowCli();
    }));

  memory
    .command('clear')
    .description('Delete stored data for the current project')
    .action(wrapCommand(async () => {
      await runMemoryClearCli();
    }));
}
