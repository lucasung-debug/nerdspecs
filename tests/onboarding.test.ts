// @TASK P1-S0-T2 - Onboarding flow tests
// @TEST tests/onboarding.test.ts

import { rm, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn().mockResolvedValue({ selected: 'English' }),
  },
}));

vi.mock('ora', () => {
  const spinner = {
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
  };
  return { default: vi.fn(() => spinner) };
});

import { LocalFileAdapter } from '../src/storage/local-file-adapter.js';
import { isOnboardingNeeded, runOnboarding } from '../src/commands/onboarding.js';
import { getPreferences } from '../src/resources/user-preferences.js';

let tmpDir: string;
let adapter: LocalFileAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-onboarding-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(tmpDir, { recursive: true, force: true });
});

describe('isOnboardingNeeded', () => {
  it('returns true when no preferences exist', async () => {
    const result = await isOnboardingNeeded(adapter);
    expect(result).toBe(true);
  });

  it('returns false after onboarding completes', async () => {
    const inquirer = await import('inquirer');
    vi.mocked(inquirer.default.prompt).mockResolvedValue({ selected: 'English' });
    await runOnboarding(adapter);
    const result = await isOnboardingNeeded(adapter);
    expect(result).toBe(false);
  });
});

describe('runOnboarding', () => {
  it('saves preferences with the selected language', async () => {
    const inquirer = await import('inquirer');
    vi.mocked(inquirer.default.prompt).mockResolvedValue({ selected: '한국어' });

    await runOnboarding(adapter);

    const prefs = await getPreferences(adapter);
    expect(prefs.language).toBe('ko');
  });

  it('saves "en" when English is selected', async () => {
    const inquirer = await import('inquirer');
    vi.mocked(inquirer.default.prompt).mockResolvedValue({ selected: 'English' });

    await runOnboarding(adapter);

    const prefs = await getPreferences(adapter);
    expect(prefs.language).toBe('en');
  });

  it('saves "both" when Both is selected', async () => {
    const inquirer = await import('inquirer');
    vi.mocked(inquirer.default.prompt).mockResolvedValue({ selected: 'Both (EN + KO)' });

    await runOnboarding(adapter);

    const prefs = await getPreferences(adapter);
    expect(prefs.language).toBe('both');
  });
});
