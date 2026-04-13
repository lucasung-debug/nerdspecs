import type { StorageAdapter } from './adapter.js';

// TODO: Replace stub with real mnemo-hook integration once the package is available.
export class MnemoHookAdapter implements StorageAdapter {
  constructor() {
    throw new Error('mnemo-hook is not yet available');
  }

  async get<T>(_key: string): Promise<T | null> {
    return null;
  }

  async set<T>(_key: string, _value: T): Promise<void> {}

  async delete(_key: string): Promise<void> {}

  async list(_prefix: string): Promise<string[]> {
    return [];
  }
}
