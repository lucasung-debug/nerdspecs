import type { LandingData, ReadmeData } from '../../generators/index.js';
import type { LLMProvider, OutputLanguage, SummaryContext } from '../../llm/index.js';
import type { AnalysisResult } from '../../resources/code-analyzer.js';
import { DEFAULT_README_SECTIONS, type ProjectConfig } from '../../resources/project-config.js';
import type { ProjectMotivation } from '../../resources/project-motivation.js';

function splitRepoSlug(repoSlug: string): { owner?: string; repo: string } {
  const sep = repoSlug.indexOf('--');
  if (sep === -1) return { repo: repoSlug };
  return { owner: repoSlug.slice(0, sep), repo: repoSlug.slice(sep + 2) };
}

function repoPart(repoSlug: string): string {
  return splitRepoSlug(repoSlug).repo;
}

export function buildRepoUrl(repoSlug: string): string | undefined {
  const { owner, repo } = splitRepoSlug(repoSlug);
  if (!owner || !repo) return undefined;
  return `https://github.com/${owner}/${repo}`;
}

function normalizeSummary(projectName: string, summary?: string): string {
  return summary?.trim() || `${projectName} is a software project documented by NerdSpecs.`;
}

function buildFallbackPainPoints(projectName: string): string[] {
  return [
    `It can be hard to explain what ${projectName} does without walking through the code.`,
    'Keeping the README current takes time away from building the product.',
    'Non-developers can miss the key setup steps and project value at a glance.',
  ];
}

function cleanPainPoint(value: string): string {
  return value
    .trim()
    .replace(/^[-*•]\s*/, '')
    .replace(/^\d+[.)]\s*/, '')
    .replace(/^["']|["']$/g, '')
    .trim();
}

function stripCodeFence(value: string): string {
  return value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

function parsePainPointsResponse(response: string): string[] {
  const cleaned = stripCodeFence(response.trim());
  if (!cleaned) return [];

  try {
    const parsed = JSON.parse(cleaned) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === 'string' ? cleanPainPoint(item) : ''))
        .filter(Boolean)
        .slice(0, 3);
    }
  } catch {
    // Fall back to line-based parsing.
  }

  return cleaned
    .split(/\r?\n/)
    .map(cleanPainPoint)
    .filter(Boolean)
    .slice(0, 3);
}

function isMockProvider(provider?: LLMProvider): boolean {
  return provider?.constructor?.name === 'MockProvider';
}

export async function buildPainPoints(
  projectName: string,
  motivation?: ProjectMotivation | null,
  provider?: LLMProvider,
): Promise<string[]> {
  if (!motivation || !provider?.generatePainPoints || isMockProvider(provider)) {
    return buildFallbackPainPoints(projectName);
  }

  try {
    const parsed = parsePainPointsResponse(await provider.generatePainPoints(motivation.answer));
    return parsed.length === 3 ? parsed : buildFallbackPainPoints(projectName);
  } catch {
    return buildFallbackPainPoints(projectName);
  }
}

export function buildSummaryContext(
  repoSlug: string,
  analysis: AnalysisResult,
  motivation?: ProjectMotivation | null,
  language?: OutputLanguage,
): SummaryContext {
  return {
    project_name: repoPart(repoSlug),
    primary_language: analysis.primary_language,
    framework: analysis.detected_framework,
    dependencies: analysis.dependencies,
    entry_file: analysis.entry_file,
    motivation: motivation?.answer,
    language,
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

export async function buildLandingData(
  repoSlug: string,
  config: ProjectConfig,
  analysis: AnalysisResult,
  summary?: string,
  motivation?: ProjectMotivation | null,
  provider?: LLMProvider,
): Promise<LandingData> {
  const projectName = repoPart(repoSlug);

  return {
    project_name: projectName,
    summary: normalizeSummary(projectName, summary),
    motivation: motivation?.answer,
    pain_points: await buildPainPoints(projectName, motivation, provider),
    tech_stack: {
      language: analysis.tech_stack.language,
      frameworks: analysis.tech_stack.frameworks,
    },
    repo_url: buildRepoUrl(repoSlug),
    language_mode: config.language,
  };
}
