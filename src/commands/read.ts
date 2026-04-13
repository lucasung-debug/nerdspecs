import { Command } from 'commander';

export function registerReadCommand(program: Command): void {
  program
    .command('read [url]')
    .description('Understand a GitHub project (v0.2)')
    .action(async (_url) => {
      console.log('[NerdSpecs] Coming in v0.2');
    });
}
