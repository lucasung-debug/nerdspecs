// @TASK P1-R4-T1 - ProjectMotivation Resource
// @SPEC docs/planning/06-tasks.md#P1-R4-T1
import type { StorageAdapter } from '../storage/adapter.js';
import { nowIso } from '../utils.js';

export interface ProjectMotivation {
  answer: string;
  recorded_at: string;
  last_used: string;
  language: 'en' | 'ko';
}

export function detectLanguage(text: string): 'en' | 'ko' {
  const noWs = text.replace(/\s/g, '');
  if (!noWs.length) return 'en';
  const korean = noWs.split('').filter(c => c >= '\uAC00' && c <= '\uD7AF').length;
  return korean / noWs.length > 0.3 ? 'ko' : 'en';
}

const key = (slug: string) => `project_motivation::${slug}`;

export async function getMotivation(storage: StorageAdapter, repoSlug: string): Promise<ProjectMotivation | null> {
  const data = await storage.get<ProjectMotivation>(key(repoSlug));
  if (!data) return null;
  const updated = { ...data, last_used: nowIso() };
  await storage.set(key(repoSlug), updated);
  return updated;
}

export async function setMotivation(storage: StorageAdapter, repoSlug: string, answer: string): Promise<void> {
  const now = nowIso();
  const data: ProjectMotivation = {
    answer,
    recorded_at: now,
    last_used: now,
    language: detectLanguage(answer),
  };
  return storage.set(key(repoSlug), data);
}

export async function deleteMotivation(storage: StorageAdapter, repoSlug: string): Promise<void> {
  return storage.delete(key(repoSlug));
}
