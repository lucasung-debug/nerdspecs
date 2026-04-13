import { Command } from 'commander';

const program = new Command();

program
  .name('nerdspecs')
  .description('Put on nerd glasses and the project becomes visible.')
  .version('0.1.0');

program
  .command('write')
  .description('Create docs for THIS project')
  .option('--auto', 'Auto mode (git hook trigger)')
  .action(async (options) => {
    // TODO: P2-S7-T1 Write Flow Orchestrator
    console.log('[NerdSpecs] write command — not yet implemented');
  });

program
  .command('read [url]')
  .description('Understand a GitHub project (v0.2)')
  .action(async (url) => {
    console.log('[NerdSpecs] Coming in v0.2');
  });

program
  .command('think')
  .description('Record why you need a project (v0.2)')
  .action(async () => {
    console.log('[NerdSpecs] Coming in v0.2');
  });

program
  .command('status')
  .description('Show your NerdSpecs settings')
  .action(async () => {
    // TODO: P4-S12-T1 Status Screen
    console.log('[NerdSpecs] status command — not yet implemented');
  });

program
  .command('config')
  .description('View and edit NerdSpecs configuration')
  .action(async () => {
    // TODO: P4-S13-T1 Config Screen
    console.log('[NerdSpecs] config command — not yet implemented');
  });

program.parse();
