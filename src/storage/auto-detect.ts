import type { StorageAdapter } from './adapter.js';
import { NerdSpecsError } from '../errors.js';
import { LocalFileAdapter } from './local-file-adapter.js';
import { MnemoHookAdapter } from './mnemo-hook-adapter.js';

function isMnemoHookFailure(error: unknown): boolean {
  return error instanceof Error && /mnemo-hook/i.test(error.message);
}

export function getMnemoHookConnectionState(storage?: StorageAdapter): '[connected]' | '[not found]' {
  if (storage instanceof MnemoHookAdapter) return '[connected]';

  try {
    new MnemoHookAdapter();
    return '[connected]';
  } catch (error) {
    if (isMnemoHookFailure(error)) return '[not found]';
    throw error;
  }
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
