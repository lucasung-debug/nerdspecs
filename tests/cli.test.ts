import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BIN = join(ROOT, 'bin', 'nerdspecs.js');

function runCLI(args: string[]): string {
  return execFileSync(process.execPath, [BIN, ...args], {
    cwd: ROOT,
    encoding: 'utf-8',
    env: { ...process.env, FORCE_COLOR: '0' },
  });
}

describe('CLI binary', () => {
  it('--version returns 0.2.0', () => {
    const output = runCLI(['--version']);
    expect(output.trim()).toBe('0.2.0');
  });

  it('--help lists all six commands', () => {
    const output = runCLI(['--help']);
    expect(output).toContain('write');
    expect(output).toContain('read');
    expect(output).toContain('think');
    expect(output).toContain('status');
    expect(output).toContain('config');
    expect(output).toContain('memory');
  });
});
