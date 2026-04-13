import { Command } from 'commander';
import chalk from 'chalk';
import {
  registerWriteCommand,
  registerReadCommand,
  registerThinkCommand,
  registerStatusCommand,
  registerConfigCommand,
} from './commands/index.js';

function printHeader(): void {
  console.log(chalk.yellow('  🤓 NerdSpecs v0.1.0'));
  console.log(chalk.gray('  Put on nerd glasses and the project becomes visible.\n'));
}

const program = new Command();

program
  .name('nerdspecs')
  .description('Put on nerd glasses and the project becomes visible.')
  .version('0.1.0');

program.hook('preAction', printHeader);

registerWriteCommand(program);
registerReadCommand(program);
registerThinkCommand(program);
registerStatusCommand(program);
registerConfigCommand(program);

program.parse();
