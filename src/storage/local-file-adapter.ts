import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { StorageAdapter } from './adapter.js';

const DEFAULT_PATH = join(process.cwd(), '.nerdspecs', 'memory.json');

async function readStore(filePath: string): Promise<Record<string, unknown>> {
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function writeStore(filePath: string, store: Record<string, unknown>): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(store, null, 2), 'utf-8');
}

export class LocalFileAdapter implements StorageAdapter {
  private readonly filePath: string;

  constructor(filePath: string = DEFAULT_PATH) {
    this.filePath = filePath;
  }

  async get<T>(key: string): Promise<T | null> {
    const store = await readStore(this.filePath);
    return key in store ? (store[key] as T) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const store = await readStore(this.filePath);
    store[key] = value;
    await writeStore(this.filePath, store);
  }

  async delete(key: string): Promise<void> {
    const store = await readStore(this.filePath);
    delete store[key];
    await writeStore(this.filePath, store);
  }

  async list(prefix: string): Promise<string[]> {
    const store = await readStore(this.filePath);
    return Object.keys(store).filter((k) => k.startsWith(prefix));
  }
}
