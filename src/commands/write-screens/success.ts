// @TASK P2-S5-T1 - Write Success Screen
// @SPEC docs/planning/06-tasks.md#P2-S5-T1

import chalk from 'chalk';
import type { WriteResult } from './progress.js';

const MAX_FILES_SHOWN = 5;

function printAnalyzedFiles(files: string[]): void {
  const shown = files.slice(0, MAX_FILES_SHOWN);
  shown.forEach(f => console.log(`    ${f}`));
  if (files.length > MAX_FILES_SHOWN) {
    console.log(`    ... and ${files.length - MAX_FILES_SHOWN} more`);
  }
}

export async function runSuccess(result: WriteResult, repoSlug: string): Promise<void> {
  console.log('');
  console.log(chalk.green(`✓ README.md generated (${result.readme_lines} lines)`));

  if (result.landing_page_url) {
    console.log(chalk.green(`✓ Landing page: ${result.landing_page_url}`));
    console.log(chalk.dim('  GitHub Pages may take 2-3 minutes to update'));
  }

  if (result.files_analyzed.length > 0) {
    console.log('');
    console.log(chalk.dim(`Analyzed files for ${repoSlug}:`));
    printAnalyzedFiles(result.files_analyzed);
  }
}
