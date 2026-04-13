// @TASK P2-S4-T1 - Write Progress Display Screen
// @SPEC docs/planning/06-tasks.md#P2-S4-T1

import { progressSteps } from '../../components/index.js';
import { deployLandingPage, generateLandingPage, generateProjectSummary, generateReadme, writeReadme } from '../../generators/index.js';
import { getConfig } from '../../resources/project-config.js';
import { getMotivation } from '../../resources/project-motivation.js';
import { analyzeProject, type AnalysisResult } from '../../resources/code-analyzer.js';
import { createLLMProvider } from '../../llm/index.js';
import type { StorageAdapter } from '../../storage/adapter.js';
import { buildLandingData, buildReadmeData, buildSummaryContext } from './generation.js';

export interface WriteResult {
  readme_lines: number;
  landing_page_url?: string;
  files_analyzed: string[];
}

interface ProgressState {
  analysis?: AnalysisResult;
  summary?: string;
  readme?: { lines: number; path: string };
  landingHtml?: string;
  landing?: { path: string; url: string };
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
        const provider = await createLLMProvider();
        const result = await generateProjectSummary(provider, buildSummaryContext(repoSlug, requireAnalysis(state.analysis), motivation));
        state.summary = result.summary;
      },
    },
  ];
}

function buildOutputSteps(
  storage: StorageAdapter,
  projectDir: string,
  repoSlug: string,
  config: Awaited<ReturnType<typeof getConfig>>,
  motivation: Awaited<ReturnType<typeof getMotivation>>,
  state: ProgressState,
) {
  const steps = [
    {
      label: 'Writing README...',
      action: async () => {
        const content = generateReadme(buildReadmeData(repoSlug, config, requireAnalysis(state.analysis), requireSummary(state.summary)));
        state.readme = await writeReadme(projectDir, content);
      },
    },
  ];

  if (!config.landing_page_enabled) return steps;

  return [
    ...steps,
    {
      label: 'Building landing page...',
      action: async () => {
        state.landingHtml = generateLandingPage(buildLandingData(repoSlug, config, requireAnalysis(state.analysis), requireSummary(state.summary), motivation));
      },
    },
    {
      label: 'Publishing...',
      action: async () => {
        if (!state.landingHtml) throw new Error('Landing page HTML is not available');
        state.landing = await deployLandingPage(projectDir, state.landingHtml, repoSlug, storage);
      },
    },
  ];
}

export async function runProgress(
  storage: StorageAdapter,
  repoSlug: string,
  projectDir: string,
): Promise<WriteResult> {
  const config = await getConfig(storage, repoSlug);
  const motivation = await getMotivation(storage, repoSlug);
  const state: ProgressState = {};

  await progressSteps([
    ...buildAnalysisSteps(projectDir, repoSlug, motivation, state),
    ...buildOutputSteps(storage, projectDir, repoSlug, config, motivation, state),
  ]);

  return {
    readme_lines: state.readme?.lines ?? 0,
    landing_page_url: state.landing?.url,
    files_analyzed: state.analysis?.core_files ?? [],
  };
}
