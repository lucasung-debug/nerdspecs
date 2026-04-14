// @TASK P2-S4-T1 - Write Progress Display Screen
// @SPEC docs/planning/06-tasks.md#P2-S4-T1

import { progressSteps } from '../../components/index.js';
import { commitReadme, deployLandingPage, generateLandingPage, generateProjectSummary, generateReadme, writeReadme } from '../../generators/index.js';
import type { LLMProvider } from '../../llm/index.js';
import { createLLMProvider } from '../../llm/index.js';
import { getConfig, type ProjectConfig } from '../../resources/project-config.js';
import { getMotivation } from '../../resources/project-motivation.js';
import { analyzeProject, type AnalysisResult } from '../../resources/code-analyzer.js';
import type { StorageAdapter } from '../../storage/adapter.js';
import { buildLandingData, buildReadmeData, buildSummaryContext } from './generation.js';

export interface WriteResult {
  readme_lines: number;
  landing_page_url?: string;
  files_analyzed: string[];
  dry_run?: boolean;
  planned_files?: string[];
  first_landing_generation?: boolean;
}

export interface WriteFlowOptions {
  language?: ProjectConfig['language'];
  dryRun?: boolean;
  noPages?: boolean;
}

interface ProgressState {
  analysis?: AnalysisResult;
  summary?: string;
  readme?: { lines: number; path: string };
  landingHtml?: string;
  landing?: { path: string; url: string };
  plannedFiles: string[];
  firstLandingGeneration?: boolean;
}

function requireAnalysis(analysis?: AnalysisResult): AnalysisResult {
  if (!analysis) throw new Error('Project analysis is not available');
  return analysis;
}

function requireSummary(summary?: string): string {
  if (summary === undefined) throw new Error('Project summary is not available');
  return summary;
}

function buildAnalysisSteps(
  projectDir: string,
  repoSlug: string,
  motivation: Awaited<ReturnType<typeof getMotivation>>,
  provider: LLMProvider,
  config: ProjectConfig,
  state: ProgressState,
) {
  return [
    {
      label: 'Reading project files...',
      action: async () => { state.analysis = await analyzeProject(projectDir); },
    },
    {
      label: 'Analyzing code...',
      action: async () => {
        const result = await generateProjectSummary(
          provider,
          buildSummaryContext(repoSlug, requireAnalysis(state.analysis), motivation, config.language),
        );
        state.summary = result.summary;
      },
    },
  ];
}

function buildOutputSteps(
  storage: StorageAdapter,
  projectDir: string,
  repoSlug: string,
  config: ProjectConfig,
  motivation: Awaited<ReturnType<typeof getMotivation>>,
  provider: LLMProvider,
  options: WriteFlowOptions,
  state: ProgressState,
) {
  const steps = [
    {
      label: 'Writing README...',
      action: async () => {
        const content = generateReadme(buildReadmeData(repoSlug, config, requireAnalysis(state.analysis), requireSummary(state.summary)));
        state.plannedFiles.push('README.md');
        if (options.dryRun) {
          state.readme = { lines: content.split('\n').length, path: 'README.md' };
          return;
        }
        state.readme = await writeReadme(projectDir, content);
        if (config.auto_push) {
          await commitReadme(projectDir);
        }
      },
    },
  ];

  if (!config.landing_page_enabled) return steps;

  return [
    ...steps,
    {
      label: 'Building landing page...',
      action: async () => {
        const landingData = await buildLandingData(
          repoSlug,
          config,
          requireAnalysis(state.analysis),
          requireSummary(state.summary),
          motivation,
          provider,
        );
        state.landingHtml = generateLandingPage(landingData);
        state.plannedFiles.push('docs/index.html');
      },
    },
    {
      label: 'Publishing...',
      action: async () => {
        if (!state.landingHtml) throw new Error('Landing page HTML is not available');
        if (options.dryRun) return;
        state.landing = await deployLandingPage(projectDir, state.landingHtml, repoSlug, storage);
        state.firstLandingGeneration = !Boolean(config.landing_page_url);
      },
    },
  ];
}

export async function runProgress(
  storage: StorageAdapter,
  repoSlug: string,
  projectDir: string,
  options: WriteFlowOptions = {},
): Promise<WriteResult> {
  const [storedConfig, motivation, provider] = await Promise.all([
    getConfig(storage, repoSlug),
    getMotivation(storage, repoSlug),
    createLLMProvider(),
  ]);
  const config: ProjectConfig = {
    ...storedConfig,
    language: options.language ?? storedConfig.language,
    landing_page_enabled: options.noPages ? false : storedConfig.landing_page_enabled,
  };
  const state: ProgressState = { plannedFiles: [] };

  await progressSteps([
    ...buildAnalysisSteps(projectDir, repoSlug, motivation, provider, config, state),
    ...buildOutputSteps(storage, projectDir, repoSlug, config, motivation, provider, options, state),
  ]);

  return {
    readme_lines: state.readme?.lines ?? 0,
    landing_page_url: state.landing?.url,
    files_analyzed: state.analysis?.core_files ?? [],
    dry_run: Boolean(options.dryRun),
    planned_files: state.plannedFiles,
    first_landing_generation: state.firstLandingGeneration,
  };
}
