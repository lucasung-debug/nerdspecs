// @TASK P2-S1-T1, P2-S2-T1, P2-S3-T1 - Write Screens Tests
// @TEST tests/write-screens.test.ts

import { rm, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn().mockResolvedValue({ selected: 'Yes', input: '' }),
  },
}));

vi.mock('../src/resources/project-config.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/resources/project-config.js')>();
  return {
    ...actual,
    deriveRepoSlug: vi.fn().mockResolvedValue('test-owner--test-repo'),
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

import { LocalFileAdapter } from '../src/storage/local-file-adapter.js';
import { runSetupCheck } from '../src/commands/write-screens/setup-check.js';
import { runOneQuestion } from '../src/commands/write-screens/one-question.js';
import { runMemoryConfirm } from '../src/commands/write-screens/memory-confirm.js';
import { getMotivation } from '../src/resources/project-motivation.js';

let tmpDir: string;
let adapter: LocalFileAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-write-screens-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(tmpDir, { recursive: true, force: true });
});

describe('runSetupCheck', () => {
  it('first run: shows prompt and creates config when user says Yes', async () => {
    const inquirer = await import('inquirer');
    vi.mocked(inquirer.default.prompt).mockResolvedValue({ selected: 'Yes' });

    const result = await runSetupCheck(adapter);

    expect(result.repo_slug).toBe('test-owner--test-repo');
    expect(result.skip).toBe(false);
    const stored = await adapter.get('project_config::test-owner--test-repo');
    expect(stored).not.toBeNull();
  });

  it('first run: returns skip=true when user says No', async () => {
    const inquirer = await import('inquirer');
    vi.mocked(inquirer.default.prompt).mockResolvedValue({ selected: 'No' });

    const result = await runSetupCheck(adapter);

    expect(result.skip).toBe(true);
    const stored = await adapter.get('project_config::test-owner--test-repo');
    expect(stored).toBeNull();
  });

  it('returning run: skips prompt entirely when config exists', async () => {
    const inquirer = await import('inquirer');
    const promptSpy = vi.mocked(inquirer.default.prompt);
    promptSpy.mockResolvedValue({ selected: 'Yes' });

    await runSetupCheck(adapter);
    promptSpy.mockClear();

    const result = await runSetupCheck(adapter);

    expect(result.skip).toBe(false);
    expect(promptSpy).not.toHaveBeenCalled();
  });
});

describe('runOneQuestion', () => {
  it('saves motivation with detected language', async () => {
    const inquirer = await import('inquirer');
    vi.mocked(inquirer.default.prompt).mockResolvedValue({ input: 'I built this to solve a real problem' });

    await runOneQuestion(adapter, 'test-owner--test-repo');

    const motivation = await getMotivation(adapter, 'test-owner--test-repo');
    expect(motivation?.answer).toBe('I built this to solve a real problem');
    expect(motivation?.language).toBe('en');
  });

  it('detects Korean language from answer', async () => {
    const inquirer = await import('inquirer');
    vi.mocked(inquirer.default.prompt).mockResolvedValue({ input: '이 프로젝트를 만든 이유는 문제를 해결하기 위해서입니다' });

    await runOneQuestion(adapter, 'test-owner--test-repo');

    const motivation = await getMotivation(adapter, 'test-owner--test-repo');
    expect(motivation?.language).toBe('ko');
  });
});

describe('runMemoryConfirm', () => {
  it('returns false when no motivation exists', async () => {
    const result = await runMemoryConfirm(adapter, 'test-owner--test-repo');
    expect(result).toBe(false);
  });

  it('returns true when user picks "Yes, use it"', async () => {
    const inquirer = await import('inquirer');
    vi.mocked(inquirer.default.prompt)
      .mockResolvedValueOnce({ input: 'This is my motivation' })
      .mockResolvedValueOnce({ selected: 'Yes, use it' });

    await runOneQuestion(adapter, 'test-owner--test-repo');
    const result = await runMemoryConfirm(adapter, 'test-owner--test-repo');

    expect(result).toBe(true);
  });

  it('returns false when user picks "No, let me answer again"', async () => {
    const inquirer = await import('inquirer');
    vi.mocked(inquirer.default.prompt)
      .mockResolvedValueOnce({ input: 'This is my motivation' })
      .mockResolvedValueOnce({ selected: 'No, let me answer again' });

    await runOneQuestion(adapter, 'test-owner--test-repo');
    const result = await runMemoryConfirm(adapter, 'test-owner--test-repo');

    expect(result).toBe(false);
  });
});
