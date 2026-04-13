import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ERROR_REGISTRY,
  NerdSpecsError,
  renderErrorScreen,
  wrapCommand,
} from '../src/errors.js';

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
    expect(output).toContain(ERROR_REGISTRY.ERR_NO_MOTIVATION.userMessage);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
