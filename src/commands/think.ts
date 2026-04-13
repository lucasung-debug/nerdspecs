import { Command } from 'commander';

export function registerThinkCommand(program: Command): void {
  program
    .command('think')
    .description('Record why you need a project (v0.2)')
    .action(async () => {
      console.log('[NerdSpecs] Coming in v0.2');
    });
}
