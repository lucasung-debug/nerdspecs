import { Command } from 'commander';
import { LocalFileAdapter } from '../storage/local-file-adapter.js';
import type { StorageAdapter } from '../storage/adapter.js';
import { runUrlInput } from './read-screens/url-input.js';
import { runReadProgress } from './read-screens/progress.js';
import { runExplanation } from './read-screens/explanation.js';
import { runThinkFlow } from './think.js';

export async function runReadFlow(storage: StorageAdapter, initialUrl?: string): Promise<void> {
  const target = await runUrlInput(storage, initialUrl);
  const cache = await runReadProgress(storage, target);
  if (await runExplanation(cache) === 'think') await runThinkFlow(storage, cache);
}

export function registerReadCommand(program: Command): void {
  program
    .command('read [url]')
    .description('Understand a GitHub project (v0.2)')
    .action(async (url) => {
      try {
        await runReadFlow(new LocalFileAdapter(), url);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`NerdSpecs error: ${message}`);
        process.exit(1);
      }
    });
}
