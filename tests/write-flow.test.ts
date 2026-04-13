// @TASK P2-S7-T1 - Write Flow Orchestrator Tests
// @TEST tests/write-flow.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/storage/auto-detect.js', () => ({
  createStorageAdapter: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
  }),
}));

vi.mock('../src/commands/onboarding.js', () => ({
  isOnboardingNeeded: vi.fn().mockResolvedValue(false),
  runOnboarding: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/commands/write-screens/setup-check.js', () => ({
  runSetupCheck: vi.fn().mockResolvedValue({ repo_slug: 'owner--repo', skip: false }),
}));

vi.mock('../src/commands/write-screens/one-question.js', () => ({
  runOneQuestion: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/commands/write-screens/memory-confirm.js', () => ({
  runMemoryConfirm: vi.fn().mockResolvedValue(false),
}));

vi.mock('../src/commands/write-screens/progress.js', () => ({
  runProgress: vi.fn().mockResolvedValue({
    readme_lines: 42,
    landing_page_url: undefined,
    files_analyzed: [],
  }),
}));

vi.mock('../src/commands/write-screens/success.js', () => ({
  runSuccess: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/commands/write-screens/auto-mode.js', () => ({
  runAutoMode: vi.fn().mockResolvedValue(undefined),
}));

import { Command } from 'commander';
import { createStorageAdapter } from '../src/storage/auto-detect.js';
import { registerWriteCommand } from '../src/commands/write.js';
import { isOnboardingNeeded, runOnboarding } from '../src/commands/onboarding.js';
import { runSetupCheck } from '../src/commands/write-screens/setup-check.js';
import { runOneQuestion } from '../src/commands/write-screens/one-question.js';
import { runMemoryConfirm } from '../src/commands/write-screens/memory-confirm.js';
import { runProgress } from '../src/commands/write-screens/progress.js';
import { runSuccess } from '../src/commands/write-screens/success.js';
import { runAutoMode } from '../src/commands/write-screens/auto-mode.js';

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerWriteCommand(program);
  return program;
}

async function runWrite(args: string[] = []): Promise<void> {
  const program = makeProgram();
  await program.parseAsync(['node', 'nerdspecs', 'write', ...args]);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(isOnboardingNeeded).mockResolvedValue(false);
  vi.mocked(runSetupCheck).mockResolvedValue({ repo_slug: 'owner--repo', skip: false });
  vi.mocked(runMemoryConfirm).mockResolvedValue(false);
  vi.mocked(runProgress).mockResolvedValue({ readme_lines: 42, files_analyzed: [] });
  vi.mocked(createStorageAdapter).mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
  } as any);
});

describe('write flow: new project', () => {
  it('runs setup → question → progress → success in order', async () => {
    const calls: string[] = [];
    vi.mocked(runSetupCheck).mockImplementation(async () => { calls.push('setup'); return { repo_slug: 'owner--repo', skip: false }; });
    vi.mocked(runMemoryConfirm).mockImplementation(async () => { calls.push('memconfirm'); return false; });
    vi.mocked(runOneQuestion).mockImplementation(async () => { calls.push('question'); });
    vi.mocked(runProgress).mockImplementation(async () => { calls.push('progress'); return { readme_lines: 42, files_analyzed: [] }; });
    vi.mocked(runSuccess).mockImplementation(async () => { calls.push('success'); });

    await runWrite();

    expect(calls).toEqual(['setup', 'memconfirm', 'question', 'progress', 'success']);
  });
});

describe('write flow: returning project', () => {
  it('skips question when memory-confirm returns true', async () => {
    vi.mocked(runMemoryConfirm).mockResolvedValue(true);

    await runWrite();

    expect(runOneQuestion).not.toHaveBeenCalled();
    expect(runProgress).toHaveBeenCalled();
    expect(runSuccess).toHaveBeenCalled();
  });
});

describe('write flow: auto mode', () => {
  it('calls runAutoMode directly, skips interactive screens', async () => {
    await runWrite(['--auto']);

    expect(runAutoMode).toHaveBeenCalledWith(expect.anything(), 'owner--repo', process.cwd());
    expect(runOneQuestion).not.toHaveBeenCalled();
    expect(runMemoryConfirm).not.toHaveBeenCalled();
    expect(runSuccess).not.toHaveBeenCalled();
  });
});

describe('write flow: setup skip', () => {
  it('exits early when setup-check returns skip=true', async () => {
    vi.mocked(runSetupCheck).mockResolvedValue({ repo_slug: 'owner--repo', skip: true });

    await runWrite();

    expect(runMemoryConfirm).not.toHaveBeenCalled();
    expect(runProgress).not.toHaveBeenCalled();
    expect(runSuccess).not.toHaveBeenCalled();
  });
});

describe('write flow: onboarding needed', () => {
  it('runs onboarding before write flow', async () => {
    const calls: string[] = [];
    vi.mocked(isOnboardingNeeded).mockResolvedValue(true);
    vi.mocked(runOnboarding).mockImplementation(async () => { calls.push('onboarding'); });
    vi.mocked(runSetupCheck).mockImplementation(async () => { calls.push('setup'); return { repo_slug: 'owner--repo', skip: false }; });

    await runWrite();

    expect(calls[0]).toBe('onboarding');
    expect(calls[1]).toBe('setup');
    expect(runOnboarding).toHaveBeenCalledWith(expect.anything());
  });
});
