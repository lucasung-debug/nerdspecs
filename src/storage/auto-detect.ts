import type { StorageAdapter } from './adapter.js';
import { NerdSpecsError } from '../errors.js';
import { LocalFileAdapter } from './local-file-adapter.js';

export function getMnemoHookConnectionState(): '[not found]' {
  return '[not found]';
}

export async function createStorageAdapter(): Promise<StorageAdapter> {
  try {
    return new LocalFileAdapter();
  } catch (cause) {
    throw new NerdSpecsError('ERR_STORAGE_UNAVAILABLE', { cause });
  }
}
