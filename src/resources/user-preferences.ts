// @TASK P1-R1-T1 - UserPreferences resource
// @SPEC docs/planning/06-tasks.md#P1-R1-T1

import type { StorageAdapter } from '../storage/adapter.js';

export interface UserPreferences {
  language: 'en' | 'ko' | 'both';
  ask_why_built: boolean;
  ask_why_need: boolean;
  auto_deploy_pages: boolean;
  show_progress: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
}

const KEY = 'user_preferences';

const DEFAULTS: Omit<UserPreferences, 'created_at' | 'updated_at'> = {
  language: 'both',
  ask_why_built: true,
  ask_why_need: true,
  auto_deploy_pages: true,
  show_progress: true,
  timezone: 'Asia/Seoul',
};

export async function getPreferences(storage: StorageAdapter): Promise<UserPreferences> {
  const existing = await storage.get<UserPreferences>(KEY);
  if (existing) return existing;

  const now = new Date().toISOString();
  const prefs: UserPreferences = { ...DEFAULTS, created_at: now, updated_at: now };
  await storage.set(KEY, prefs);
  return prefs;
}

export async function setPreferences(
  storage: StorageAdapter,
  partial: Partial<Omit<UserPreferences, 'created_at' | 'updated_at'>>,
): Promise<UserPreferences> {
  const existing = await getPreferences(storage);
  const updated: UserPreferences = {
    ...existing,
    ...partial,
    updated_at: new Date().toISOString(),
  };
  await storage.set(KEY, updated);
  return updated;
}

export async function deletePreferences(storage: StorageAdapter): Promise<void> {
  await storage.delete(KEY);
}
