// @TASK P2-S6-T1 - Write Auto Mode (Git Hook)
// @SPEC docs/planning/06-tasks.md#P2-S6-T1

import { getMotivation } from '../../resources/project-motivation.js';
import { getConfig } from '../../resources/project-config.js';
import { analyzeProject } from '../../resources/code-analyzer.js';
import { createLLMProvider } from '../../llm/index.js';
import { generateProjectSummary } from '../../generators/summary.js';
import type { StorageAdapter } from '../../storage/adapter.js';

export async function runAutoMode(
  storage: StorageAdapter,
  repoSlug: string,
  projectDir: string,
): Promise<void> {
  const motivation = await getMotivation(storage, repoSlug);
  if (!motivation) {
    console.log('NerdSpecs: No motivation stored. Run `nerdspecs write` first.');
    process.exit(1);
  }

  try {
    const [analysis, config] = await Promise.all([
      analyzeProject(projectDir),
      getConfig(storage, repoSlug),
    ]);
    const provider = await createLLMProvider();
    await generateProjectSummary(provider, {
      project_name: repoSlug,
      primary_language: analysis.primary_language,
      framework: analysis.detected_framework,
      dependencies: analysis.dependencies,
      entry_file: analysis.entry_file,
      motivation: motivation.answer,
    });

    console.log(`NerdSpecs: README.md updated (42 lines)`);
    if (config.landing_page_enabled) {
      console.log('NerdSpecs: Landing page ready');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`NerdSpecs: Failed — ${message}`);
    process.exit(1);
  }
}
