import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/components/index.js', () => ({
  selectionPrompt: vi.fn(),
}));

vi.mock('../src/commands/onboarding.js', () => ({
  isOnboardingNeeded: vi.fn().mockResolvedValue(false),
  runOnboarding: vi.fn().mockResolvedValue(undefined),
}));

import { selectionPrompt } from '../src/components/index.js';
import { isOnboardingNeeded, runOnboarding } from '../src/commands/onboarding.js';
import { MAIN_MENU_OPTIONS, runMainMenu } from '../src/commands/menu.js';
import type { StorageAdapter } from '../src/storage/adapter.js';

const storage = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
} satisfies StorageAdapter;

function createHandlers() {
  return {
    write: vi.fn().mockResolvedValue(undefined),
    read: vi.fn().mockResolvedValue(undefined),
    think: vi.fn().mockResolvedValue(undefined),
    status: vi.fn().mockResolvedValue(undefined),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(isOnboardingNeeded).mockResolvedValue(false);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('runMainMenu', () => {
  it.each(MAIN_MENU_OPTIONS)('routes %s to the matching handler', async ({ action, label }) => {
    const handlers = createHandlers();
    vi.mocked(selectionPrompt).mockResolvedValue(label);

    await runMainMenu(storage, handlers);

    expect(handlers[action]).toHaveBeenCalledTimes(1);
  });

  it('shows the v0.2 info message when Read is selected', async () => {
    const handlers = createHandlers();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(selectionPrompt).mockResolvedValue(MAIN_MENU_OPTIONS[1]!.label);

    await runMainMenu(storage, handlers);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('coming in v0.2'));
    expect(handlers.read).toHaveBeenCalledTimes(1);
  });

  it('redirects first-run users to onboarding', async () => {
    const handlers = createHandlers();
    vi.mocked(isOnboardingNeeded).mockResolvedValue(true);

    await runMainMenu(storage, handlers);

    expect(runOnboarding).toHaveBeenCalledWith(storage);
    expect(selectionPrompt).not.toHaveBeenCalled();
    expect(handlers.write).not.toHaveBeenCalled();
  });
});
