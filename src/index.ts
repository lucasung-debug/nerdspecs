import { Command } from 'commander';
import chalk from 'chalk';
import {
  registerWriteCommand,
  registerReadCommand,
  registerThinkCommand,
  registerStatusCommand,
  registerConfigCommand,
  registerMemoryCommand,
  runWriteCommand,
  runReadCommand,
  runThinkCommand,
  runStatusCli,
  runMainMenu,
} from './commands/index.js';
import { wrapCommand } from './errors.js';
import { createStorageAdapter } from './storage/auto-detect.js';

function printHeader(): void {
  console.log(chalk.yellow('  🤓 NerdSpecs v0.2.0'));
  console.log(chalk.gray('  Put on nerd glasses and the project becomes visible.\n'));
}

async function runDefaultCommand(): Promise<void> {
  await runMainMenu(await createStorageAdapter(), {
    write: () => runWriteCommand(),
    read: () => runReadCommand(),
    think: () => runThinkCommand(),
    status: () => runStatusCli(),
  });
}

export function createProgram(): Command {
  const program = new Command();
  program
    .name('nerdspecs')
    .description('Put on nerd glasses and the project becomes visible.')
    .version('0.2.0');
  program.hook('preAction', printHeader);
  registerWriteCommand(program);
  registerReadCommand(program);
  registerThinkCommand(program);
  registerStatusCommand(program);
  registerConfigCommand(program);
  registerMemoryCommand(program);
  program.action(wrapCommand(runDefaultCommand));
  return program;
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
  await createProgram().parseAsync(argv);
}
