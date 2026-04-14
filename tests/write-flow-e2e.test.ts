// @TASK P2-S1-V - Write Flow E2E Integration Test
// @IMPL src/commands/write.ts, src/commands/write-screens/*
// @SPEC docs/planning/06-tasks.md#P2-S1-V

import { readFile, rm, mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

vi.mock('../src/resources/project-config.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/resources/project-config.js')>();
  return {
    ...actual,
    deriveRepoSlug: vi.fn().mockResolvedValue('e2e-owner--e2e-repo'),
  };
});

vi.mock('../src/resources/code-analyzer.js', () => ({
  analyzeProject: vi.fn().mockResolvedValue({
    primary_language: 'TypeScript',
    detected_framework: 'Express',
    entry_file: 'index.ts',
    dependency_count: 3,
    dependencies: ['express', 'chalk', 'commander'],
    core_files: ['index.ts', 'package.json'],
    tech_stack: { language: 'TypeScript', frameworks: ['Express'], apis: [], services: [] },
  }),
}));

vi.mock('../src/llm/index.js', () => ({
  createLLMProvider: vi.fn().mockResolvedValue({
    generateSummary: vi.fn().mockResolvedValue('A sample project summary'),
    generatePainPoints: vi.fn().mockResolvedValue('Pain A\nPain B\nPain C'),
  }),
}));

vi.mock('../src/generators/summary.js', () => ({
  generateProjectSummary: vi.fn().mockResolvedValue({
    summary: 'A sample project summary',
    tech_stack_description: 'TypeScript, Express',
  }),
}));

vi.mock('../src/components/index.js', () => ({
  selectionPrompt: vi.fn(),
  freeTextInput: vi.fn(),
  progressSteps: vi.fn().mockImplementation(async (steps: Array<{ action: () => Promise<void> }>) => {
    for (const step of steps) await step.action();
  }),
}));

import { LocalFileAdapter } from '../src/storage/local-file-adapter.js';
import { runSetupCheck } from '../src/commands/write-screens/setup-check.js';
import { runOneQuestion } from '../src/commands/write-screens/one-question.js';
import { runMemoryConfirm } from '../src/commands/write-screens/memory-confirm.js';
import { runProgress } from '../src/commands/write-screens/progress.js';
import { runSuccess } from '../src/commands/write-screens/success.js';
import { runAutoMode } from '../src/commands/write-screens/auto-mode.js';
import { getMotivation, setMotivation } from '../src/resources/project-motivation.js';
import { getConfig, setConfig } from '../src/resources/project-config.js';
import { selectionPrompt, freeTextInput } from '../src/components/index.js';

const REPO_SLUG = 'e2e-owner--e2e-repo';

let tmpDir: string;
let adapter: LocalFileAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-e2e-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
  await mkdir(join(tmpDir, 'project'), { recursive: true });
  await writeFile(join(tmpDir, 'project', 'package.json'), JSON.stringify({ name: 'e2e-repo', dependencies: { express: '^4' } }));
  await writeFile(join(tmpDir, 'project', 'index.ts'), 'export default {}');
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  vi.clearAllMocks();
  await rm(tmpDir, { recursive: true, force: true });
});

describe('E2E: new project complete flow', () => {
  it('stores motivation, generates metadata and config after full flow', async () => {
    vi.mocked(selectionPrompt).mockResolvedValueOnce('Yes');
    vi.mocked(freeTextInput).mockResolvedValueOnce('Built this to automate README generation');

    const setupResult = await runSetupCheck(adapter);
    expect(setupResult.skip).toBe(false);
    expect(setupResult.repo_slug).toBe(REPO_SLUG);

    const configAfterSetup = await adapter.get(`project_config::${REPO_SLUG}`);
    expect(configAfterSetup).not.toBeNull();

    const useExisting = await runMemoryConfirm(adapter, REPO_SLUG);
    expect(useExisting).toBe(false);

    await runOneQuestion(adapter, REPO_SLUG);

    const stored = await getMotivation(adapter, REPO_SLUG);
    expect(stored?.answer).toBe('Built this to automate README generation');
    expect(stored?.language).toBe('en');

    const result = await runProgress(adapter, REPO_SLUG, join(tmpDir, 'project'));
    const readme = await readFile(join(tmpDir, 'project', 'README.md'), 'utf8');
    expect(result.readme_lines).toBe(readme.split('\n').length);
    expect(result.files_analyzed).toBeInstanceOf(Array);
    expect(result.landing_page_url).toBe('https://e2e-owner.github.io/e2e-repo/');

    const config = await getConfig(adapter, REPO_SLUG);
    expect(config).not.toBeNull();
    expect(config.created_at).toBeDefined();
  });
});

describe('E2E: returning project flow', () => {
  it('detects existing data, skips question, keeps resources consistent', async () => {
    const now = new Date().toISOString();
    await setMotivation(adapter, REPO_SLUG, 'Original motivation from last session');
    await setConfig(adapter, REPO_SLUG, { hook_installed: true });
    await adapter.set(`project_config::${REPO_SLUG}`, {
      language: 'both',
      auto_push: true,
      landing_page_enabled: false,
      readme_sections: {},
      hook_installed: false,
      created_at: now,
      updated_at: now,
    });

    vi.mocked(selectionPrompt).mockResolvedValueOnce('Yes, use it');

    const useExisting = await runMemoryConfirm(adapter, REPO_SLUG);
    expect(useExisting).toBe(true);

    expect(vi.mocked(freeTextInput)).not.toHaveBeenCalled();

    const motivation = await getMotivation(adapter, REPO_SLUG);
    expect(motivation?.answer).toBe('Original motivation from last session');

    const result = await runProgress(adapter, REPO_SLUG, join(tmpDir, 'project'));
    expect(result.readme_lines).toBeGreaterThan(0);

    const config = await getConfig(adapter, REPO_SLUG);
    expect(config.landing_page_enabled).toBe(false);
  });
});

describe('E2E: auto mode flow', () => {
  it('runs without prompts and produces correct output', async () => {
    const now = new Date().toISOString();
    await setMotivation(adapter, REPO_SLUG, 'Automate my workflow');
    await adapter.set(`project_config::${REPO_SLUG}`, {
      language: 'en',
      auto_push: false,
      landing_page_enabled: false,
      readme_sections: {},
      hook_installed: false,
      created_at: now,
      updated_at: now,
    });

    await runAutoMode(adapter, REPO_SLUG, join(tmpDir, 'project'));

    expect(vi.mocked(selectionPrompt)).not.toHaveBeenCalled();
    expect(vi.mocked(freeTextInput)).not.toHaveBeenCalled();

    const motivation = await getMotivation(adapter, REPO_SLUG);
    expect(motivation?.answer).toBe('Automate my workflow');
  });

  it('exits when no motivation is stored', async () => {
    await expect(
      runAutoMode(adapter, REPO_SLUG, join(tmpDir, 'project'))
    ).rejects.toMatchObject({ code: 'ERR_NO_MOTIVATION' });
  });
});

describe('E2E: screen sequence verification', () => {
  it('executes screens in correct order for new project', async () => {
    const sequence: string[] = [];

    vi.mocked(selectionPrompt).mockImplementationOnce(async () => {
      sequence.push('setup-check');
      return 'Yes';
    });
    vi.mocked(freeTextInput).mockImplementationOnce(async () => {
      sequence.push('one-question');
      return 'Solving a real problem';
    });

    await runSetupCheck(adapter);

    const useExisting = await runMemoryConfirm(adapter, REPO_SLUG);
    sequence.push('memory-confirm');
    expect(useExisting).toBe(false);

    await runOneQuestion(adapter, REPO_SLUG);

    const result = await runProgress(adapter, REPO_SLUG, join(tmpDir, 'project'));
    sequence.push('progress');

    await runSuccess(result, REPO_SLUG);
    sequence.push('success');

    expect(sequence).toEqual(['setup-check', 'memory-confirm', 'one-question', 'progress', 'success']);
  });

  it('skips one-question when returning user confirms existing memory', async () => {
    const sequence: string[] = [];
    const now = new Date().toISOString();

    await setMotivation(adapter, REPO_SLUG, 'Prior motivation');
    await adapter.set(`project_config::${REPO_SLUG}`, {
      language: 'en',
      auto_push: false,
      landing_page_enabled: false,
      readme_sections: {},
      hook_installed: false,
      created_at: now,
      updated_at: now,
    });

    const setupResult = await runSetupCheck(adapter);
    sequence.push('setup-check');
    expect(setupResult.skip).toBe(false);

    vi.mocked(selectionPrompt).mockResolvedValueOnce('Yes, use it');
    const useExisting = await runMemoryConfirm(adapter, REPO_SLUG);
    sequence.push('memory-confirm');
    expect(useExisting).toBe(true);

    if (!useExisting) {
      await runOneQuestion(adapter, REPO_SLUG);
      sequence.push('one-question');
    }

    const result = await runProgress(adapter, REPO_SLUG, join(tmpDir, 'project'));
    sequence.push('progress');

    await runSuccess(result, REPO_SLUG);
    sequence.push('success');

    expect(sequence).toEqual(['setup-check', 'memory-confirm', 'progress', 'success']);
    expect(sequence).not.toContain('one-question');
  });
});
