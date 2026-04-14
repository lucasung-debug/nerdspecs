import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ERROR_REGISTRY,
  NerdSpecsError,
  renderErrorScreen,
  wrapCommand,
} from '../src/errors.js';
import { setPreferences } from '../src/resources/user-preferences.js';
import { LocalFileAdapter } from '../src/storage/local-file-adapter.js';

function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('renderErrorScreen', () => {
  it.each(Object.entries(ERROR_REGISTRY))(
    'renders friendly output for %s',
    (code, entry) => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderErrorScreen(new NerdSpecsError(code as keyof typeof ERROR_REGISTRY));

      const output = errorSpy.mock.calls.map((call) => stripAnsi(String(call[0]))).join('\n');
      expect(output).toContain(code);
      expect(output).toContain(entry.userMessage);
      expect(output).toContain(entry.suggestion);
    },
  );

  it('renders Korean copy when Korean is requested', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderErrorScreen(new NerdSpecsError('ERR_NO_MOTIVATION'), errorSpy, 'ko');

    const output = errorSpy.mock.calls.map((call) => stripAnsi(String(call[0]))).join('\n');
    expect(output).toContain(ERROR_REGISTRY.ERR_NO_MOTIVATION.userMessage_ko);
    expect(output).toContain(ERROR_REGISTRY.ERR_NO_MOTIVATION.suggestion_ko);
  });
});

describe('wrapCommand', () => {
  it('catches failures and prints the user-friendly error screen', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit');
    }) as never);
    const command = wrapCommand(async () => {
      throw new NerdSpecsError('ERR_NO_MOTIVATION');
    });

    await expect(command()).rejects.toThrow('process.exit');

    const output = errorSpy.mock.calls.map((call) => stripAnsi(String(call[0]))).join('\n');
    expect(output).toContain('ERR_NO_MOTIVATION');
    const hasEnMsg = output.includes(ERROR_REGISTRY.ERR_NO_MOTIVATION.userMessage);
    const hasKoMsg = output.includes(ERROR_REGISTRY.ERR_NO_MOTIVATION.userMessage_ko);
    expect(hasEnMsg || hasKoMsg).toBe(true);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('uses stored Korean preferences for error output', async () => {
    const originalCwd = process.cwd();
    const tmpProjectDir = await mkdtemp(join(tmpdir(), 'nerdspecs-errors-'));
    process.chdir(tmpProjectDir);

    try {
      await setPreferences(new LocalFileAdapter(), { language: 'ko' });

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
        throw new Error('process.exit');
      }) as never);
      const command = wrapCommand(async () => {
        throw new NerdSpecsError('ERR_LLM_UNAVAILABLE');
      });

      await expect(command()).rejects.toThrow('process.exit');

      const output = errorSpy.mock.calls.map((call) => stripAnsi(String(call[0]))).join('\n');
      expect(output).toContain(ERROR_REGISTRY.ERR_LLM_UNAVAILABLE.userMessage_ko);
      expect(output).toContain(ERROR_REGISTRY.ERR_LLM_UNAVAILABLE.suggestion_ko);
      expect(exitSpy).toHaveBeenCalledWith(1);
    } finally {
      process.chdir(originalCwd);
      await rm(tmpProjectDir, { recursive: true, force: true });
    }
  });
});
