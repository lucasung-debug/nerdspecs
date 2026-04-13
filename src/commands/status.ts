import { Command } from 'commander';

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show your NerdSpecs settings')
    .action(async () => {
      console.log('[NerdSpecs] status command — not yet implemented');
    });
}
