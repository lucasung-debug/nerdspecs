import type { LandingData, ReadmeData } from '../../generators/index.js';
import type { SummaryContext } from '../../llm/index.js';
import type { AnalysisResult } from '../../resources/code-analyzer.js';
import { DEFAULT_README_SECTIONS, type ProjectConfig } from '../../resources/project-config.js';
import type { ProjectMotivation } from '../../resources/project-motivation.js';

function repoPart(repoSlug: string): string {
  return repoSlug.split('--')[1] ?? repoSlug;
}

export function buildRepoUrl(repoSlug: string): string | undefined {
  const [owner, repo] = repoSlug.split('--');
  if (!owner || !repo) return undefined;
  return `https://github.com/${owner}/${repo}`;
}

function normalizeSummary(projectName: string, summary?: string): string {
  return summary?.trim() || `${projectName} is a software project documented by NerdSpecs.`;
}

function buildPainPoints(projectName: string): string[] {
  return [
    `It can be hard to explain what ${projectName} does without walking through the code.`,
    'Keeping the README current takes time away from building the product.',
    'Non-developers can miss the key setup steps and project value at a glance.',
  ];
}

export function buildSummaryContext(
  repoSlug: string,
  analysis: AnalysisResult,
  motivation?: ProjectMotivation | null,
): SummaryContext {
  return {
    project_name: repoPart(repoSlug),
    primary_language: analysis.primary_language,
    framework: analysis.detected_framework,
    dependencies: analysis.dependencies,
    entry_file: analysis.entry_file,
    motivation: motivation?.answer,
  };
}

export function buildReadmeData(
  repoSlug: string,
  config: ProjectConfig,
  analysis: AnalysisResult,
  summary?: string,
): ReadmeData {
  const projectName = repoPart(repoSlug);
  const sections = { ...DEFAULT_README_SECTIONS, ...config.readme_sections };

  return {
    project_name: projectName,
    summary: normalizeSummary(projectName, summary),
    tech_stack: analysis.tech_stack,
    language_mode: config.language,
    sections: {
      hero: sections.hero,
      plain_explanation: sections.plain_explanation,
      how_to_use: sections.how_to_use,
      tech_stack: sections.tech_stack,
      installation: sections.installation,
    },
  };
}

export function buildLandingData(
  repoSlug: string,
  config: ProjectConfig,
  analysis: AnalysisResult,
  summary?: string,
  motivation?: ProjectMotivation | null,
): LandingData {
  const projectName = repoPart(repoSlug);

  return {
    project_name: projectName,
    summary: normalizeSummary(projectName, summary),
    motivation: motivation?.answer,
    pain_points: buildPainPoints(projectName),
    tech_stack: {
      language: analysis.tech_stack.language,
      frameworks: analysis.tech_stack.frameworks,
    },
    repo_url: buildRepoUrl(repoSlug),
    language_mode: config.language,
  };
}
