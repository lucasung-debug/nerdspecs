// @TASK P2-S7-T1 - Write Flow Orchestrator
// @SPEC docs/planning/06-tasks.md#P2-S7-T1

import { Command } from 'commander';
import { wrapCommand } from '../errors.js';
import { createStorageAdapter } from '../storage/auto-detect.js';
import { isOnboardingNeeded, runOnboarding } from './onboarding.js';
import { runSetupCheck } from './write-screens/setup-check.js';
import { runOneQuestion } from './write-screens/one-question.js';
import { runMemoryConfirm } from './write-screens/memory-confirm.js';
import { runProgress } from './write-screens/progress.js';
import { runSuccess } from './write-screens/success.js';
import { runAutoMode } from './write-screens/auto-mode.js';
import type { StorageAdapter } from '../storage/adapter.js';

async function maybeOnboard(storage: StorageAdapter): Promise<void> {
  if (await isOnboardingNeeded(storage)) {
    await runOnboarding(storage);
  }
}

async function runInteractiveFlow(storage: StorageAdapter): Promise<void> {
  const { repo_slug, skip } = await runSetupCheck(storage);
  if (skip) return;

  const useExisting = await runMemoryConfirm(storage, repo_slug);
  if (!useExisting) {
    await runOneQuestion(storage, repo_slug);
  }

  const result = await runProgress(storage, repo_slug, process.cwd());
  await runSuccess(result, repo_slug);
}

async function runAutoFlow(storage: StorageAdapter): Promise<void> {
  const { repo_slug, skip } = await runSetupCheck(storage);
  if (skip) return;
  await runAutoMode(storage, repo_slug, process.cwd());
}

async function runSelectedFlow(storage: StorageAdapter, auto: boolean): Promise<void> {
  if (auto) return runAutoFlow(storage);
  await runInteractiveFlow(storage);
}

export async function runWriteCommand(options: { auto?: boolean } = {}): Promise<void> {
  const storage = await createStorageAdapter();
  await maybeOnboard(storage);
  await runSelectedFlow(storage, Boolean(options.auto));
}

export function registerWriteCommand(program: Command): void {
  program
    .command('write')
    .description('Create docs for THIS project')
    .option('--auto', 'Auto mode (git hook trigger)')
    .action(wrapCommand(async (options) => {
      await runWriteCommand({ auto: Boolean(options.auto) });
    }));
}
