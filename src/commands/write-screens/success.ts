// @TASK P2-S5-T1 - Write Success Screen
// @SPEC docs/planning/06-tasks.md#P2-S5-T1

import chalk from 'chalk';
import type { WriteResult } from './progress.js';

const MAX_FILES_SHOWN = 5;

function buildGithubPagesSettingsUrl(repoSlug: string): string | undefined {
  const sep = repoSlug.indexOf('--');
  if (sep === -1) return undefined;

  const owner = repoSlug.slice(0, sep);
  const repo = repoSlug.slice(sep + 2);
  if (!owner || !repo) return undefined;
  return `https://github.com/${owner}/${repo}/settings/pages`;
}

function printAnalyzedFiles(files: string[]): void {
  const shown = files.slice(0, MAX_FILES_SHOWN);
  shown.forEach(f => console.log(`    ${f}`));
  if (files.length > MAX_FILES_SHOWN) {
    console.log(`    ... and ${files.length - MAX_FILES_SHOWN} more`);
  }
}

export async function runSuccess(result: WriteResult, repoSlug: string): Promise<void> {
  console.log('');
  if (result.dry_run) {
    console.log(chalk.yellow(`✓ Dry run complete (${result.readme_lines} generated README lines)`));
    result.planned_files?.forEach((file) => console.log(chalk.dim(`  Would write: ${file}`)));
  } else {
  console.log(chalk.green(`✓ README.md generated (${result.readme_lines} lines)`));
  }

  if (result.landing_page_url) {
    console.log(chalk.green(`✓ Landing page: ${result.landing_page_url}`));
    console.log(chalk.dim('  GitHub Pages may take 2-3 minutes to update'));
    if (result.first_landing_generation) {
      const settingsUrl = buildGithubPagesSettingsUrl(repoSlug);
      if (settingsUrl) {
        console.log(`📋 To enable GitHub Pages: Go to ${settingsUrl}`);
        console.log(`   Select 'Deploy from a branch' → 'main' → '/docs' folder`);
      }
    }
  }

  if (result.files_analyzed.length > 0) {
    console.log('');
    console.log(chalk.dim(`Analyzed files for ${repoSlug}:`));
    printAnalyzedFiles(result.files_analyzed);
  }
}
