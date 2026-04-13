import { Command } from 'commander';

export function registerConfigCommand(program: Command): void {
  program
    .command('config')
    .description('View and edit NerdSpecs configuration')
    .action(async () => {
      console.log('[NerdSpecs] config command — not yet implemented');
    });
}
