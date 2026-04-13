import chalk from 'chalk';

export function formatStatusRow(key: string, value: string | boolean | null): string {
  const label = chalk.bold(key);

  if (value === null || value === undefined) {
    return `${label}: —`;
  }
  if (typeof value === 'boolean') {
    const display = value ? chalk.green('ON') : chalk.red('OFF');
    return `${label}: ${display}`;
  }
  return `${label}: ${value}`;
}
