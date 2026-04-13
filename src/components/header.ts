import chalk from 'chalk';

export function renderHeader(version: string): void {
  console.log(chalk.yellow('🤓 NerdSpecs') + chalk.gray(` v${version}`));
  console.log(chalk.gray('Translate AI-built projects into human-readable specs.'));
}
