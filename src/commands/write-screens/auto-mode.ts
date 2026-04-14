// @TASK P2-S6-T1 - Write Auto Mode (Git Hook)
// @SPEC docs/planning/06-tasks.md#P2-S6-T1

import { NerdSpecsError } from '../../errors.js';
import { commitReadme, deployLandingPage, generateLandingPage, generateProjectSummary, generateReadme, writeReadme } from '../../generators/index.js';
import type { LLMProvider } from '../../llm/index.js';
import { getMotivation } from '../../resources/project-motivation.js';
import { getConfig, type ProjectConfig } from '../../resources/project-config.js';
import { analyzeProject, type AnalysisResult } from '../../resources/code-analyzer.js';
import { createLLMProvider } from '../../llm/index.js';
import type { StorageAdapter } from '../../storage/adapter.js';
import { buildLandingData, buildReadmeData, buildSummaryContext } from './generation.js';
import type { WriteFlowOptions } from './progress.js';

async function runSilentGeneration(
  storage: StorageAdapter,
  repoSlug: string,
  projectDir: string,
  analysis: AnalysisResult,
  config: ProjectConfig,
  motivation: NonNullable<Awaited<ReturnType<typeof getMotivation>>>,
  provider: LLMProvider,
  options: WriteFlowOptions,
) {
  const { summary } = await generateProjectSummary(
    provider,
    buildSummaryContext(repoSlug, analysis, motivation, config.language),
  );
  const readmeContent = generateReadme(buildReadmeData(repoSlug, config, analysis, summary));
  const readme = options.dryRun
    ? { lines: readmeContent.split('\n').length, path: 'README.md' }
    : await writeReadme(projectDir, readmeContent);
  if (!options.dryRun) {
    await commitReadme(projectDir);
  }
  const landing = config.landing_page_enabled
    ? await (async () => {
        const html = generateLandingPage(await buildLandingData(repoSlug, config, analysis, summary, motivation, provider));
        if (options.dryRun) return { path: 'docs/index.html', url: '' };
        return deployLandingPage(projectDir, html, repoSlug, storage);
      })()
    : undefined;

  return { readme, landing };
}

export async function runAutoMode(
  storage: StorageAdapter,
  repoSlug: string,
  projectDir: string,
  options: WriteFlowOptions = {},
): Promise<void> {
  const motivation = await getMotivation(storage, repoSlug);
  if (!motivation) throw new NerdSpecsError('ERR_NO_MOTIVATION');

  const [analysis, storedConfig, provider] = await Promise.all([
    analyzeProject(projectDir),
    getConfig(storage, repoSlug),
    createLLMProvider(),
  ]);
  const config: ProjectConfig = {
    ...storedConfig,
    language: options.language ?? storedConfig.language,
    landing_page_enabled: options.noPages ? false : storedConfig.landing_page_enabled,
  };
  const result = await runSilentGeneration(storage, repoSlug, projectDir, analysis, config, motivation, provider, options);

  if (options.dryRun) {
    const outputs = ['README.md'];
    if (config.landing_page_enabled) outputs.push('docs/index.html');
    console.log(`NerdSpecs: Dry run complete (${outputs.join(', ')})`);
    return;
  }

  console.log(`NerdSpecs: README.md updated (${result.readme.lines} lines)`);
  if (result.landing) console.log(`NerdSpecs: Landing page ready (${result.landing.url})`);
}
