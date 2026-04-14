import { rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/components/index.js', () => ({
  selectionPrompt: vi.fn(),
}));

import { selectionPrompt } from '../src/components/index.js';
import { runMemoryClearCommand, runMemoryShowCommand } from '../src/commands/memory.js';
import { LocalFileAdapter } from '../src/storage/local-file-adapter.js';

let tmpDir: string;
let adapter: LocalFileAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-memory-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(tmpDir, { recursive: true, force: true });
});

describe('memory show', () => {
  it('prints stored motivation, config, and metadata for the current project', async () => {
    const now = new Date().toISOString();
    await adapter.set('project_motivation::owner--repo', {
      answer: 'Explain the product to non-developers.',
      recorded_at: now,
      last_used: now,
      language: 'en',
    });
    await adapter.set('project_config::owner--repo', {
      language: 'both',
      auto_push: true,
      landing_page_enabled: true,
      readme_sections: { hero: true },
      hook_installed: false,
      created_at: now,
      updated_at: now,
    });
    await adapter.set('project_metadata::owner--repo', {
      repo_slug: 'owner--repo',
      display_name: 'Repo',
      generated_summary: 'A friendly summary.',
      last_analyzed: now,
    });

    await runMemoryShowCommand(adapter, 'owner--repo');

    const output = vi.mocked(console.log).mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain('Memory for owner--repo');
    expect(output).toContain('"answer": "Explain the product to non-developers."');
    expect(output).toContain('"auto_push": true');
    expect(output).toContain('"display_name": "Repo"');
  });

  it('shows placeholders when no project memory is stored', async () => {
    await runMemoryShowCommand(adapter, 'owner--repo');

    const output = vi.mocked(console.log).mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain('Memory for owner--repo');
    expect(output).toContain('[not stored]');
  });
});

describe('memory clear', () => {
  it('keeps stored data when the user cancels', async () => {
    vi.mocked(selectionPrompt).mockResolvedValue('No');
    await adapter.set('project_motivation::owner--repo', { answer: 'Keep me', language: 'en' });

    const cleared = await runMemoryClearCommand(adapter, 'owner--repo');

    expect(cleared).toBe(false);
    expect(await adapter.get('project_motivation::owner--repo')).toEqual({ answer: 'Keep me', language: 'en' });
  });

  it('deletes stored project memory after confirmation', async () => {
    vi.mocked(selectionPrompt).mockResolvedValue('Yes, clear it');
    await adapter.set('project_motivation::owner--repo', { answer: 'Remove me' });
    await adapter.set('project_config::owner--repo', { language: 'en' });
    await adapter.set('project_metadata::owner--repo', { display_name: 'Repo' });

    const cleared = await runMemoryClearCommand(adapter, 'owner--repo');

    expect(cleared).toBe(true);
    expect(await adapter.get('project_motivation::owner--repo')).toBeNull();
    expect(await adapter.get('project_config::owner--repo')).toBeNull();
    expect(await adapter.get('project_metadata::owner--repo')).toBeNull();
  });
});
