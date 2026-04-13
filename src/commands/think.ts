import { Command } from 'commander';
import { wrapCommand } from '../errors.js';
import type { StorageAdapter } from '../storage/adapter.js';
import { createStorageAdapter } from '../storage/auto-detect.js';
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

export async function runThinkCommand(initialUrl?: string): Promise<void> {
  const storage = await createStorageAdapter();
  await runThinkFlow(storage, await resolveCache(storage, initialUrl));
}

export function registerThinkCommand(program: Command): void {
  program
    .command('think [url]')
    .description('Record why you need a project (v0.2)')
    .action(wrapCommand(async (url) => {
      await runThinkCommand(url as string | undefined);
    }));
}
