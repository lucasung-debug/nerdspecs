import { rm, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalFileAdapter } from '../src/storage/local-file-adapter.js';
import { createStorageAdapter } from '../src/storage/auto-detect.js';

let tmpDir: string;
let adapter: LocalFileAdapter;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-test-'));
  adapter = new LocalFileAdapter(join(tmpDir, 'memory.json'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('LocalFileAdapter', () => {
  it('returns null for missing key', async () => {
    expect(await adapter.get('missing')).toBeNull();
  });

  it('stores and retrieves a value', async () => {
    await adapter.set('foo', { bar: 42 });
    expect(await adapter.get('foo')).toEqual({ bar: 42 });
  });

  it('overwrites existing value', async () => {
    await adapter.set('key', 'first');
    await adapter.set('key', 'second');
    expect(await adapter.get('key')).toBe('second');
  });

  it('deletes a key', async () => {
    await adapter.set('key', 'value');
    await adapter.delete('key');
    expect(await adapter.get('key')).toBeNull();
  });

  it('delete on missing key does not throw', async () => {
    await expect(adapter.delete('nonexistent')).resolves.toBeUndefined();
  });

  it('lists keys by prefix', async () => {
    await adapter.set('ns:a', 1);
    await adapter.set('ns:b', 2);
    await adapter.set('other:c', 3);
    const result = await adapter.list('ns:');
    expect(result.sort()).toEqual(['ns:a', 'ns:b']);
  });

  it('list returns empty array when no keys match', async () => {
    expect(await adapter.list('nope:')).toEqual([]);
  });

  it('persists data across adapter instances', async () => {
    const filePath = join(tmpDir, 'memory.json');
    const a1 = new LocalFileAdapter(filePath);
    await a1.set('persistent', true);
    const a2 = new LocalFileAdapter(filePath);
    expect(await a2.get('persistent')).toBe(true);
  });
});

describe('createStorageAdapter', () => {
  it('falls back to LocalFileAdapter when mnemo-hook is unavailable', async () => {
    const storage = await createStorageAdapter();
    expect(storage).toBeInstanceOf(LocalFileAdapter);
  });
});
