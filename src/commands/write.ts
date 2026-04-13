import { Command } from 'commander';
import { createStorageAdapter } from '../storage/auto-detect.js';
import { isOnboardingNeeded, runOnboarding } from './onboarding.js';

export function registerWriteCommand(program: Command): void {
  program
    .command('write')
    .description('Create docs for THIS project')
    .option('--auto', 'Auto mode (git hook trigger)')
    .action(async (_options) => {
      const storage = await createStorageAdapter();
      if (await isOnboardingNeeded(storage)) {
        await runOnboarding(storage);
      }
      console.log('[NerdSpecs] write command — not yet implemented');
    });
}
