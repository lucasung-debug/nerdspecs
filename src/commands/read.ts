import { Command } from 'commander';
import { wrapCommand } from '../errors.js';
import type { StorageAdapter } from '../storage/adapter.js';
import { createStorageAdapter } from '../storage/auto-detect.js';
import { runUrlInput } from './read-screens/url-input.js';
import { runReadProgress } from './read-screens/progress.js';
import { runExplanation } from './read-screens/explanation.js';
import { runThinkFlow } from './think.js';

export async function runReadFlow(storage: StorageAdapter, initialUrl?: string): Promise<void> {
  const target = await runUrlInput(storage, initialUrl);
  const cache = await runReadProgress(storage, target);
  if (await runExplanation(cache) === 'think') await runThinkFlow(storage, cache);
}

export async function runReadCommand(initialUrl?: string): Promise<void> {
  await runReadFlow(await createStorageAdapter(), initialUrl);
}

export function registerReadCommand(program: Command): void {
  program
    .command('read [url]')
    .description('Understand a GitHub project (v0.2)')
    .action(wrapCommand(async (url) => {
      await runReadCommand(url as string | undefined);
    }));
}
