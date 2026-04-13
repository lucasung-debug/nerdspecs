import { Command } from 'commander';
import { LocalFileAdapter } from '../storage/local-file-adapter.js';
import type { StorageAdapter } from '../storage/adapter.js';
import { isVagueAnswer } from '../resources/decision-record.js';
import type { ExplanationCache } from '../resources/explanation-cache.js';
import { runUrlInput } from './read-screens/url-input.js';
import { runReadProgress } from './read-screens/progress.js';
import { runWhyNeed } from './think-screens/why-need.js';
import { runFollowUp } from './think-screens/follow-up.js';
import { runDecisionSaved } from './think-screens/decision-saved.js';

async function resolveCache(storage: StorageAdapter, initialUrl?: string): Promise<ExplanationCache> {
  const target = await runUrlInput(storage, initialUrl);
  return runReadProgress(storage, target);
}

export async function runThinkFlow(storage: StorageAdapter, cache: ExplanationCache): Promise<void> {
  const reasoning = await runWhyNeed(cache);
  const followUpAnswer = isVagueAnswer(reasoning) ? await runFollowUp(reasoning) : undefined;
  await runDecisionSaved(storage, cache, reasoning, followUpAnswer);
}

export function registerThinkCommand(program: Command): void {
  program
    .command('think [url]')
    .description('Record why you need a project (v0.2)')
    .action(async (url) => {
      try {
        const storage = new LocalFileAdapter();
        await runThinkFlow(storage, await resolveCache(storage, url));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`NerdSpecs error: ${message}`);
        process.exit(1);
      }
    });
}
