import type { StorageAdapter } from './adapter.js';
import { LocalFileAdapter } from './local-file-adapter.js';
import { MnemoHookAdapter } from './mnemo-hook-adapter.js';

export async function createStorageAdapter(): Promise<StorageAdapter> {
  try {
    return new MnemoHookAdapter();
  } catch {
    return new LocalFileAdapter();
  }
}
