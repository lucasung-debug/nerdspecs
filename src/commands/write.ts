import { Command } from 'commander';

export function registerWriteCommand(program: Command): void {
  program
    .command('write')
    .description('Create docs for THIS project')
    .option('--auto', 'Auto mode (git hook trigger)')
    .action(async (_options) => {
      console.log('[NerdSpecs] write command — not yet implemented');
    });
}
