// @TASK P2-S6-T1 - Write Auto Mode (Git Hook)
// @SPEC docs/planning/06-tasks.md#P2-S6-T1

import { NerdSpecsError } from '../../errors.js';
import { deployLandingPage, generateLandingPage, generateProjectSummary, generateReadme, writeReadme } from '../../generators/index.js';
import { getMotivation } from '../../resources/project-motivation.js';
import { getConfig, type ProjectConfig } from '../../resources/project-config.js';
import { analyzeProject, type AnalysisResult } from '../../resources/code-analyzer.js';
import { createLLMProvider } from '../../llm/index.js';
import type { StorageAdapter } from '../../storage/adapter.js';
import { buildLandingData, buildReadmeData, buildSummaryContext } from './generation.js';

async function runSilentGeneration(
  storage: StorageAdapter,
  repoSlug: string,
  projectDir: string,
  analysis: AnalysisResult,
  config: ProjectConfig,
  motivation: NonNullable<Awaited<ReturnType<typeof getMotivation>>>,
) {
  const provider = await createLLMProvider();
  const { summary } = await generateProjectSummary(provider, buildSummaryContext(repoSlug, analysis, motivation));
  const readme = await writeReadme(projectDir, generateReadme(buildReadmeData(repoSlug, config, analysis, summary)));
  const landing = config.landing_page_enabled
    ? await deployLandingPage(projectDir, generateLandingPage(buildLandingData(repoSlug, config, analysis, summary, motivation)), repoSlug, storage)
    : undefined;

  return { readme, landing };
}

export async function runAutoMode(
  storage: StorageAdapter,
  repoSlug: string,
  projectDir: string,
): Promise<void> {
  const motivation = await getMotivation(storage, repoSlug);
  if (!motivation) throw new NerdSpecsError('ERR_NO_MOTIVATION');

  const [analysis, config] = await Promise.all([
    analyzeProject(projectDir),
    getConfig(storage, repoSlug),
  ]);
  const result = await runSilentGeneration(storage, repoSlug, projectDir, analysis, config, motivation);

  console.log(`NerdSpecs: README.md updated (${result.readme.lines} lines)`);
  if (result.landing) console.log(`NerdSpecs: Landing page ready (${result.landing.url})`);
}
