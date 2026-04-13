import type { StorageAdapter } from '../storage/adapter.js';
import { nowIso } from '../utils.js';

export type ComplexityLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ExplanationCache {
  repo_url: string;
  owner: string;
  repo: string;
  fetched_at: string;
  explanation_en: string;
  explanation_ko?: string;
  use_cases: string[];
  target_audience?: string;
  complexity_level: ComplexityLevel;
  nerdspecs_version?: string;
}

export type ExplanationCacheInput = Omit<ExplanationCache, 'fetched_at'> & { fetched_at?: string };

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function cacheKey(key: string): string {
  return `explanation_cache::${key}`;
}

export function isStale(cache: ExplanationCache | null): boolean {
  if (!cache) return true;
  const fetchedAt = new Date(cache.fetched_at).getTime();
  return Number.isNaN(fetchedAt) || Date.now() - fetchedAt > TTL_MS;
}

export async function getCache(storage: StorageAdapter, key: string): Promise<ExplanationCache | null> {
  return storage.get<ExplanationCache>(cacheKey(key));
}

export async function setCache(
  storage: StorageAdapter,
  key: string,
  data: ExplanationCacheInput,
): Promise<ExplanationCache> {
  const saved: ExplanationCache = { ...data, fetched_at: data.fetched_at ?? nowIso() };
  await storage.set(cacheKey(key), saved);
  return saved;
}

export async function deleteCache(storage: StorageAdapter, key: string): Promise<void> {
  await storage.delete(cacheKey(key));
}
