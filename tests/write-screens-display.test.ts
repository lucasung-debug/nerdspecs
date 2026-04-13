// @TASK P2-S4-T1, P2-S5-T1, P2-S6-T1 - Write Screens Display Tests
// @TEST tests/write-screens-display.test.ts

import { rm, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/resources/code-analyzer.js', () => ({
  analyzeProject: vi.fn().mockResolvedValue({
    primary_language: 'TypeScript',
    detected_framework: 'Express',
    entry_file: 'index.ts',
    dependency_count: 3,
    dependencies: ['express', 'chalk', 'ora'],
    core_files: ['index.ts', 'package.json', 'tsconfig.json'],
    tech_stack: { language: 'TypeScript', frameworks: ['Express'], apis: ['REST'], services: [] },
  }),
}));

vi.mock('../src/llm/index.js', () => ({
  createLLMProvider: vi.fn().mockResolvedValue({
    generateSummary: vi.fn().mockResolvedValue('A mock summary.'),
    generatePainPoints: vi.fn().mockResolvedValue([]),
  }),
}));

vi.mock('../src/generators/summary.js', () => ({
  generateProjectSummary: vi.fn().mockResolvedValue({
    summary: 'A mock summary.',
    tech_stack_description: 'TypeScript, Express',
  }),
}));

const oraInstance = { start: () => oraInstance, succeed: () => oraInstance, fail: () => oraInstance };
vi.mock('ora', () => ({ default: () => oraInstance }));

import { LocalFileAdapter } from '../src/storage/local-file-adapter.js';
import { setMotivation } from '../src/resources/project-motivation.js';
import { setConfig } from '../src/resources/project-config.js';
import { runProgress } from '../src/commands/write-screens/progress.js';
import { runSuccess } from '../src/commands/write-screens/success.js';
import { runAutoMode } from '../src/commands/write-screens/auto-mode.js';

const REPO_SLUG = 'owner--test-repo';
let tmpDir: string;
let adapter: LocalFileAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-display-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  vi.clearAllMocks();
  await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
});

describe('runProgress', () => {
  it('runs all 5 steps when landing_page_enabled=true', async () => {
    await setConfig(adapter, REPO_SLUG, {
      landing_page_enabled: true,
      landing_page_url: 'https://owner.github.io/test-repo',
    });
    const { analyzeProject } = await import('../src/resources/code-analyzer.js');
    const { generateProjectSummary } = await import('../src/generators/summary.js');

    const result = await runProgress(adapter, REPO_SLUG, tmpDir);

    expect(analyzeProject).toHaveBeenCalledWith(tmpDir);
    expect(generateProjectSummary).toHaveBeenCalled();
    expect(result.files_analyzed).toEqual(['index.ts', 'package.json', 'tsconfig.json']);
    expect(result.readme_lines).toBeGreaterThan(0);
    expect(result.landing_page_url).toBe('https://owner.github.io/test-repo');
  });

  it('skips landing steps when landing_page_enabled=false', async () => {
    await setConfig(adapter, REPO_SLUG, { landing_page_enabled: false });
    const { analyzeProject } = await import('../src/resources/code-analyzer.js');

    const result = await runProgress(adapter, REPO_SLUG, tmpDir);

    expect(analyzeProject).toHaveBeenCalled();
    expect(result.landing_page_url).toBeUndefined();
  });
});

describe('runSuccess', () => {
  it('displays readme line count', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    await runSuccess({ readme_lines: 55, files_analyzed: [] }, REPO_SLUG);
    const output = consoleSpy.mock.calls.map(c => String(c[0])).join('\n');
    expect(output).toContain('55 lines');
  });

  it('shows landing page URL when present', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    await runSuccess(
      { readme_lines: 10, landing_page_url: 'https://example.com', files_analyzed: [] },
      REPO_SLUG,
    );
    const output = consoleSpy.mock.calls.map(c => String(c[0])).join('\n');
    expect(output).toContain('https://example.com');
    expect(output).toContain('GitHub Pages');
  });

  it('hides landing section when URL is undefined', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    await runSuccess({ readme_lines: 10, files_analyzed: [] }, REPO_SLUG);
    const output = consoleSpy.mock.calls.map(c => String(c[0])).join('\n');
    expect(output).not.toContain('Landing page');
    expect(output).not.toContain('GitHub Pages');
  });

  it('shows first 5 files and ellipsis for more', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const files = ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts', 'f.ts', 'g.ts'];
    await runSuccess({ readme_lines: 10, files_analyzed: files }, REPO_SLUG);
    const output = consoleSpy.mock.calls.map(c => String(c[0])).join('\n');
    expect(output).toContain('a.ts');
    expect(output).toContain('... and 2 more');
    expect(output).not.toContain('f.ts');
  });
});

describe('runAutoMode', () => {
  it('exits with code 1 and prints message when no motivation stored', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    const consoleSpy = vi.spyOn(console, 'log');

    await runAutoMode(adapter, REPO_SLUG, tmpDir);

    expect(consoleSpy).toHaveBeenCalledWith(
      'NerdSpecs: No motivation stored. Run `nerdspecs write` first.',
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('prints exactly 2 lines on success with landing enabled', async () => {
    await setMotivation(adapter, REPO_SLUG, 'I built this to help users.');
    await setConfig(adapter, REPO_SLUG, { landing_page_enabled: true });
    const consoleSpy = vi.spyOn(console, 'log');

    await runAutoMode(adapter, REPO_SLUG, tmpDir);

    const lines = consoleSpy.mock.calls.map(c => String(c[0]));
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('README.md updated');
    expect(lines[1]).toContain('Landing page ready');
  });

  it('prints 1 line on success when landing disabled', async () => {
    await setMotivation(adapter, REPO_SLUG, 'I built this to help users.');
    await setConfig(adapter, REPO_SLUG, { landing_page_enabled: false });
    const consoleSpy = vi.spyOn(console, 'log');

    await runAutoMode(adapter, REPO_SLUG, tmpDir);

    const lines = consoleSpy.mock.calls.map(c => String(c[0]));
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('README.md updated');
  });

  it('exits with code 1 and single error line on exception', async () => {
    await setMotivation(adapter, REPO_SLUG, 'test motivation');
    const { analyzeProject } = await import('../src/resources/code-analyzer.js');
    vi.mocked(analyzeProject).mockRejectedValueOnce(new Error('disk error'));

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
    const consoleSpy = vi.spyOn(console, 'log');

    await runAutoMode(adapter, REPO_SLUG, tmpDir);

    const lines = consoleSpy.mock.calls.map(c => String(c[0]));
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('NerdSpecs: Failed — disk error');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
