import type { StorageAdapter } from './adapter.js';
import { NerdSpecsError } from '../errors.js';
import { LocalFileAdapter } from './local-file-adapter.js';
import { MnemoHookAdapter } from './mnemo-hook-adapter.js';

function isMnemoHookFailure(error: unknown): boolean {
  return error instanceof Error && /mnemo-hook/i.test(error.message);
}

export async function createStorageAdapter(): Promise<StorageAdapter> {
  try {
    return new MnemoHookAdapter();
  } catch (error) {
    if (!isMnemoHookFailure(error)) throw error;
    try {
      return new LocalFileAdapter();
    } catch (cause) {
      throw new NerdSpecsError('ERR_STORAGE_UNAVAILABLE', { cause });
    }
  }
}
