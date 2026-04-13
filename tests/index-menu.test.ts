import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
};

vi.mock('../src/storage/auto-detect.js', () => ({
  createStorageAdapter: vi.fn().mockResolvedValue(storage),
}));

vi.mock('../src/commands/menu.js', () => ({
  MAIN_MENU_OPTIONS: [],
  runMainMenu: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('CLI root command', () => {
  it('shows the main menu when no subcommand is provided', async () => {
    const { createProgram } = await import('../src/index.js');
    const { runMainMenu } = await import('../src/commands/menu.js');

    await createProgram().parseAsync(['node', 'nerdspecs']);

    expect(runMainMenu).toHaveBeenCalledWith(
      storage,
      expect.objectContaining({
        write: expect.any(Function),
        read: expect.any(Function),
        think: expect.any(Function),
        status: expect.any(Function),
      }),
    );
  });
});
