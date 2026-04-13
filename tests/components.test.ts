import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock ora before importing spinner
vi.mock('ora', () => {
  const spinner = {
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
  };
  return { default: vi.fn(() => spinner) };
});

import { renderHeader } from '../src/components/header.js';
import { formatStatusRow } from '../src/components/status-row.js';
import { progressSteps } from '../src/components/spinner.js';
import { selectionPrompt, freeTextInput } from '../src/components/prompt.js';

describe('renderHeader', () => {
  it('outputs version string to stdout', () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((...args) => {
      logs.push(args.join(' '));
    });
    renderHeader('1.2.3');
    spy.mockRestore();
    const output = logs.join('\n');
    expect(output).toContain('1.2.3');
  });
});

describe('formatStatusRow', () => {
  it('formats string value', () => {
    const result = formatStatusRow('name', 'claude');
    expect(result).toContain('name');
    expect(result).toContain('claude');
  });

  it('formats boolean true as ON', () => {
    const result = formatStatusRow('enabled', true);
    expect(result).toContain('ON');
  });

  it('formats boolean false as OFF', () => {
    const result = formatStatusRow('enabled', false);
    expect(result).toContain('OFF');
  });

  it('formats null as dash placeholder', () => {
    const result = formatStatusRow('model', null);
    expect(result).toContain('—');
  });
});

describe('progressSteps', () => {
  it('executes all steps sequentially', async () => {
    const order: number[] = [];
    const steps = [
      { label: 'Step 1', action: async () => { order.push(1); } },
      { label: 'Step 2', action: async () => { order.push(2); } },
      { label: 'Step 3', action: async () => { order.push(3); } },
    ];
    await progressSteps(steps);
    expect(order).toEqual([1, 2, 3]);
  });

  it('re-throws error from failing step', async () => {
    const steps = [
      { label: 'Fail', action: async () => { throw new Error('boom'); } },
    ];
    await expect(progressSteps(steps)).rejects.toThrow('boom');
  });
});

describe('prompt exports', () => {
  it('exports selectionPrompt as a function', () => {
    expect(typeof selectionPrompt).toBe('function');
  });

  it('exports freeTextInput as a function', () => {
    expect(typeof freeTextInput).toBe('function');
  });
});
