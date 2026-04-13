import { rm, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalFileAdapter } from '../../src/storage/local-file-adapter.js';
import { getPreferences, setPreferences, deletePreferences } from '../../src/resources/user-preferences.js';

let tmpDir: string;
let adapter: LocalFileAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-prefs-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('getPreferences', () => {
  it('returns defaults on first call', async () => {
    const prefs = await getPreferences(adapter);
    expect(prefs.language).toBe('both');
    expect(prefs.ask_why_built).toBe(true);
    expect(prefs.ask_why_need).toBe(true);
    expect(prefs.auto_deploy_pages).toBe(true);
    expect(prefs.show_progress).toBe(true);
    expect(prefs.timezone).toBe('Asia/Seoul');
  });

  it('sets created_at and updated_at on creation', async () => {
    const prefs = await getPreferences(adapter);
    expect(prefs.created_at).toBeDefined();
    expect(prefs.updated_at).toBeDefined();
    expect(() => new Date(prefs.created_at)).not.toThrow();
  });

  it('is singleton — same data on repeated calls', async () => {
    const first = await getPreferences(adapter);
    const second = await getPreferences(adapter);
    expect(first.created_at).toBe(second.created_at);
  });
});

describe('setPreferences', () => {
  it('merges partial update with existing preferences', async () => {
    await getPreferences(adapter);
    const updated = await setPreferences(adapter, { language: 'ko' });
    expect(updated.language).toBe('ko');
    expect(updated.timezone).toBe('Asia/Seoul');
  });

  it('updates updated_at without changing created_at', async () => {
    const original = await getPreferences(adapter);
    await new Promise((r) => setTimeout(r, 5));
    const updated = await setPreferences(adapter, { show_progress: false });
    expect(updated.created_at).toBe(original.created_at);
    expect(updated.updated_at >= original.updated_at).toBe(true);
  });

  it('persists the updated value', async () => {
    await setPreferences(adapter, { language: 'en' });
    const fetched = await getPreferences(adapter);
    expect(fetched.language).toBe('en');
  });
});

describe('deletePreferences', () => {
  it('removes stored preferences', async () => {
    await getPreferences(adapter);
    await deletePreferences(adapter);
    // Next call should return fresh defaults
    const fresh = await getPreferences(adapter);
    expect(fresh.language).toBe('both');
  });

  it('does not throw on missing record', async () => {
    await expect(deletePreferences(adapter)).resolves.toBeUndefined();
  });
});
