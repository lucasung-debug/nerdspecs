import { describe, it, expect, vi } from 'vitest';
import type { AnalysisResult } from '../src/resources/code-analyzer.js';
import type { ProjectConfig } from '../src/resources/project-config.js';
import type { ProjectMotivation } from '../src/resources/project-motivation.js';
import { buildSummaryContext, buildReadmeData, buildLandingData, buildRepoUrl } from '../src/commands/write-screens/generation.js';
import { generateProjectSummary } from '../src/generators/summary.js';
import { generateReadme } from '../src/generators/readme-template.js';
import { generateLandingPage } from '../src/generators/landing-template.js';

const analysis: AnalysisResult = {
  primary_language: 'TypeScript',
  detected_framework: 'Next.js',
  entry_file: 'src/index.ts',
  dependency_count: 4,
  dependencies: ['next', 'react', 'zod', 'vitest'],
  core_files: ['src/index.ts', 'package.json'],
  tech_stack: {
    language: 'TypeScript',
    frameworks: ['Next.js'],
    apis: ['REST'],
    services: ['S3'],
  },
};

const motivation: ProjectMotivation = {
  answer: 'Product managers need a quick explanation.',
  recorded_at: '2026-04-14T00:00:00.000Z',
  last_used: '2026-04-14T00:00:00.000Z',
  language: 'en',
};

const config: ProjectConfig = {
  language: 'en',
  auto_push: true,
  landing_page_enabled: true,
  readme_sections: {
    hero: true,
    plain_explanation: true,
    how_to_use: true,
    tech_stack: true,
    installation: true,
  },
  hook_installed: false,
  created_at: '2026-04-14T00:00:00.000Z',
  updated_at: '2026-04-14T00:00:00.000Z',
};

describe('write-screens generation builders', () => {
  it('preserves repo names that contain -- across summary, README, and landing data', async () => {
    const repoSlug = 'acme--docs--site';
    const provider = { generateSummary: vi.fn().mockResolvedValue('A generated summary.') };

    const summaryContext = buildSummaryContext(repoSlug, analysis, motivation);
    expect(summaryContext).toEqual({
      project_name: 'docs--site',
      primary_language: 'TypeScript',
      framework: 'Next.js',
      dependencies: ['next', 'react', 'zod', 'vitest'],
      entry_file: 'src/index.ts',
      motivation: 'Product managers need a quick explanation.',
    });

    const { summary } = await generateProjectSummary(provider as any, summaryContext);
    expect(provider.generateSummary).toHaveBeenCalledWith(summaryContext);
    expect(buildRepoUrl(repoSlug)).toBe('https://github.com/acme/docs--site');

    const readme = generateReadme(buildReadmeData(repoSlug, config, analysis, summary));
    expect(readme).toContain('# docs--site');
    expect(readme).toContain('## Installation');
    expect(readme).toContain('npm install');

    const landing = generateLandingPage(buildLandingData(repoSlug, config, analysis, summary, motivation));
    expect(landing).toContain('docs--site');
    expect(landing).toContain('https://github.com/acme/docs--site');
  });

  it('keeps local-directory slugs usable without inventing a GitHub repo URL', () => {
    const repoSlug = 'NerdSpecs';

    const readmeData = buildReadmeData(
      repoSlug,
      {
        ...config,
        readme_sections: { plain_explanation: false },
      },
      analysis,
    );
    expect(readmeData.project_name).toBe('NerdSpecs');
    expect(readmeData.summary).toBe('NerdSpecs is a software project documented by NerdSpecs.');
    expect(readmeData.sections).toEqual({
      hero: true,
      plain_explanation: false,
      how_to_use: true,
      tech_stack: true,
      installation: true,
    });

    const landingData = buildLandingData(repoSlug, config, analysis, undefined, motivation);
    expect(landingData.project_name).toBe('NerdSpecs');
    expect(landingData.repo_url).toBeUndefined();
    expect(landingData.pain_points[0]).toContain('NerdSpecs');
  });
});
