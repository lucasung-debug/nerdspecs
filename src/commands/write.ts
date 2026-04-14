// @TASK P2-S7-T1 - Write Flow Orchestrator
// @SPEC docs/planning/06-tasks.md#P2-S7-T1

import { Command } from 'commander';
import { wrapCommand } from '../errors.js';
import { createStorageAdapter } from '../storage/auto-detect.js';
import { isOnboardingNeeded, runOnboarding } from './onboarding.js';
import { runSetupCheck } from './write-screens/setup-check.js';
import { runOneQuestion } from './write-screens/one-question.js';
import { runMemoryConfirm } from './write-screens/memory-confirm.js';
import { runProgress, type WriteFlowOptions } from './write-screens/progress.js';
import { runSuccess } from './write-screens/success.js';
import { runAutoMode } from './write-screens/auto-mode.js';
import type { StorageAdapter } from '../storage/adapter.js';
import type { ProjectConfig } from '../resources/project-config.js';

function parseLanguageOverride(value?: string): ProjectConfig['language'] | undefined {
  if (!value) return undefined;
  if (value === 'en' || value === 'ko' || value === 'both') return value;
  throw new Error(`Invalid --lang value "${value}". Valid values: en, ko, both.`);
}

async function maybeOnboard(storage: StorageAdapter): Promise<void> {
  if (await isOnboardingNeeded(storage)) {
    await runOnboarding(storage);
  }
}

async function runInteractiveFlow(storage: StorageAdapter, options: WriteFlowOptions): Promise<void> {
  const { repo_slug, skip } = await runSetupCheck(storage);
  if (skip) return;

  const useExisting = await runMemoryConfirm(storage, repo_slug);
  if (!useExisting) {
    await runOneQuestion(storage, repo_slug);
  }

  const result = await runProgress(storage, repo_slug, process.cwd(), options);
  await runSuccess(result, repo_slug);
}

async function runAutoFlow(storage: StorageAdapter, options: WriteFlowOptions): Promise<void> {
  const repo_slug = (await import('./helpers.js')).resolveCurrentRepoSlug();
  await runAutoMode(storage, await repo_slug, process.cwd(), options);
}

async function runSelectedFlow(storage: StorageAdapter, auto: boolean, options: WriteFlowOptions): Promise<void> {
  if (auto) return runAutoFlow(storage, options);
  await runInteractiveFlow(storage, options);
}

export async function runWriteCommand(
  options: { auto?: boolean; lang?: string; dryRun?: boolean; noPages?: boolean } = {},
): Promise<void> {
  const storage = await createStorageAdapter();
  await maybeOnboard(storage);
  await runSelectedFlow(storage, Boolean(options.auto), {
    language: parseLanguageOverride(options.lang),
    dryRun: Boolean(options.dryRun),
    noPages: Boolean(options.noPages),
  });
}

export function registerWriteCommand(program: Command): void {
  program
    .command('write')
    .description('Create docs for THIS project')
    .option('--auto', 'Auto mode (git hook trigger)')
    .option('--lang <value>', 'en | ko | both')
    .option('--dry-run', 'Generate without writing files')
    .option('--no-pages', 'Skip landing page generation')
    .action(wrapCommand(async (options) => {
      await runWriteCommand({
        auto: Boolean(options.auto),
        lang: options.lang as string | undefined,
        dryRun: Boolean(options.dryRun),
        noPages: options.pages === false || Boolean(options.noPages),
      });
    }));
}
