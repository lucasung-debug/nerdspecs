import { rm, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalFileAdapter } from '../../src/storage/local-file-adapter.js';
import { getConfig, setConfig, deleteConfig } from '../../src/resources/project-config.js';
import { parseRepoSlug } from '../../src/resources/project-config.js';

let tmpDir: string;
let adapter: LocalFileAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-cfg-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

const SLUG = 'acme--my-project';

describe('getConfig', () => {
  it('returns defaults on first call', async () => {
    const cfg = await getConfig(adapter, SLUG);
    expect(cfg.language).toBe('both');
    expect(cfg.auto_push).toBe(true);
    expect(cfg.landing_page_enabled).toBe(true);
    expect(cfg.hook_installed).toBe(false);
  });

  it('default readme_sections are all enabled', async () => {
    const cfg = await getConfig(adapter, SLUG);
    const sections = cfg.readme_sections;
    expect(sections.hero).toBe(true);
    expect(sections.plain_explanation).toBe(true);
    expect(sections.how_to_use).toBe(true);
    expect(sections.tech_stack).toBe(true);
    expect(sections.installation).toBe(true);
  });

  it('sets created_at and updated_at as ISO strings', async () => {
    const cfg = await getConfig(adapter, SLUG);
    expect(() => new Date(cfg.created_at)).not.toThrow();
    expect(() => new Date(cfg.updated_at)).not.toThrow();
  });

  it('is scoped by repoSlug — different slugs are independent', async () => {
    await getConfig(adapter, 'owner--repo-a');
    await setConfig(adapter, 'owner--repo-a', { auto_push: false });
    const b = await getConfig(adapter, 'owner--repo-b');
    expect(b.auto_push).toBe(true);
  });
});

describe('setConfig', () => {
  it('merges partial update', async () => {
    await getConfig(adapter, SLUG);
    const updated = await setConfig(adapter, SLUG, { language: 'en', hook_installed: true });
    expect(updated.language).toBe('en');
    expect(updated.hook_installed).toBe(true);
    expect(updated.auto_push).toBe(true);
  });

  it('persists the update', async () => {
    await setConfig(adapter, SLUG, { landing_page_url: 'https://example.com' });
    const fetched = await getConfig(adapter, SLUG);
    expect(fetched.landing_page_url).toBe('https://example.com');
  });

  it('updates updated_at without changing created_at', async () => {
    const original = await getConfig(adapter, SLUG);
    await new Promise((r) => setTimeout(r, 5));
    const updated = await setConfig(adapter, SLUG, { auto_push: false });
    expect(updated.created_at).toBe(original.created_at);
    expect(updated.updated_at >= original.updated_at).toBe(true);
  });
});

describe('deleteConfig', () => {
  it('removes config so next get returns fresh defaults', async () => {
    await setConfig(adapter, SLUG, { language: 'ko' });
    await deleteConfig(adapter, SLUG);
    const fresh = await getConfig(adapter, SLUG);
    expect(fresh.language).toBe('both');
  });

  it('does not throw on missing record', async () => {
    await expect(deleteConfig(adapter, 'no-such--slug')).resolves.toBeUndefined();
  });
});

describe('parseRepoSlug', () => {
  it('parses HTTPS remote URL', () => {
    expect(parseRepoSlug('https://github.com/acme/my-project.git')).toBe('acme--my-project');
  });

  it('parses SSH remote URL', () => {
    expect(parseRepoSlug('git@github.com:acme/my-project.git')).toBe('acme--my-project');
  });

  it('parses HTTPS URL without .git suffix', () => {
    expect(parseRepoSlug('https://github.com/acme/my-project')).toBe('acme--my-project');
  });

  it('throws on unparseable URL', () => {
    expect(() => parseRepoSlug('not-a-url')).toThrow();
  });
});
