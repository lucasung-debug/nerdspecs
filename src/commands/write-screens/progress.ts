// @TASK P2-S4-T1 - Write Progress Display Screen
// @SPEC docs/planning/06-tasks.md#P2-S4-T1

import { progressSteps } from '../../components/index.js';
import { getConfig } from '../../resources/project-config.js';
import { getMotivation } from '../../resources/project-motivation.js';
import { analyzeProject } from '../../resources/code-analyzer.js';
import { createLLMProvider } from '../../llm/index.js';
import { generateProjectSummary } from '../../generators/summary.js';
import type { StorageAdapter } from '../../storage/adapter.js';

export interface WriteResult {
  readme_lines: number;
  landing_page_url?: string;
  files_analyzed: string[];
}

export async function runProgress(
  storage: StorageAdapter,
  repoSlug: string,
  projectDir: string,
): Promise<WriteResult> {
  const config = await getConfig(storage, repoSlug);
  const motivation = await getMotivation(storage, repoSlug);
  let analysisResult: Awaited<ReturnType<typeof analyzeProject>> | undefined;

  const baseSteps = [
    {
      label: 'Reading project files...',
      action: async () => { analysisResult = await analyzeProject(projectDir); },
    },
    {
      label: 'Analyzing code...',
      action: async () => {
        const provider = await createLLMProvider();
        await generateProjectSummary(provider, {
          project_name: repoSlug,
          primary_language: analysisResult?.primary_language ?? 'Unknown',
          framework: analysisResult?.detected_framework,
          dependencies: analysisResult?.dependencies ?? [],
          entry_file: analysisResult?.entry_file,
          motivation: motivation?.answer,
        });
      },
    },
    {
      label: 'Writing README...',
      action: async () => { /* stub: P3 will implement */ },
    },
  ];

  const landingSteps = config.landing_page_enabled
    ? [
        { label: 'Building landing page...', action: async () => { /* stub */ } },
        { label: 'Publishing...', action: async () => { /* stub */ } },
      ]
    : [];

  await progressSteps([...baseSteps, ...landingSteps]);

  return {
    readme_lines: 42,
    landing_page_url: config.landing_page_enabled ? config.landing_page_url : undefined,
    files_analyzed: analysisResult ? analysisResult.core_files : [],
  };
}
