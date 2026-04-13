import { rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runConfigCommand } from '../src/commands/config.js';
import { runStatusCommand } from '../src/commands/status.js';
import { setConfig } from '../src/resources/project-config.js';
import { LocalFileAdapter } from '../src/storage/local-file-adapter.js';

let tmpDir: string;
let adapter: LocalFileAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-status-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(tmpDir, { recursive: true, force: true });
});

describe('status command', () => {
  it('shows placeholders when project data is missing', async () => {
    await runStatusCommand(adapter, 'owner--repo');
    const output = vi.mocked(console.log).mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain('Project info');
    expect(output).toContain('—');
  });

  it('shows project and decision stats when data exists', async () => {
    await adapter.set('project_metadata::owner--repo', { display_name: 'Repo', repo_url: 'https://github.com/owner/repo' });
    const now = new Date().toISOString();
    await adapter.set('project_motivation::owner--repo', { answer: 'Need it', recorded_at: now, last_used: now, language: 'en' });
    await adapter.set('user_preferences', { language: 'both' });
    await adapter.set('decision_record::owner/repo', { repo_url: 'https://github.com/owner/repo', decision: 'adopt', reasoning: 'Need it', recorded_at: now, status: 'active', is_vague: false });

    await runStatusCommand(adapter, 'owner--repo');

    const output = vi.mocked(console.log).mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain('https://github.com/owner/repo');
    expect(output).toContain('Saved decisions');
  });
});

describe('config command', () => {
  it('updates config with validated flags', async () => {
    const config = await runConfigCommand(adapter, { language: 'ko', autoPush: 'false', landing: 'true' }, 'owner--repo');
    expect(config.language).toBe('ko');
    expect(config.auto_push).toBe(false);
    expect(config.landing_page_enabled).toBe(true);
  });

  it('prints the stored config table', async () => {
    await setConfig(adapter, 'owner--repo', { language: 'en', auto_push: false });
    await runConfigCommand(adapter, {}, 'owner--repo');
    const output = vi.mocked(console.log).mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain('language');
    expect(output).toContain('readme_sections');
  });

  it('rejects invalid language values', async () => {
    await expect(runConfigCommand(adapter, { language: 'jp' }, 'owner--repo')).rejects.toThrow('Invalid --language value. Use en, ko, or both.');
  });
});
