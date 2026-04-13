import { freeTextInput } from '../../components/index.js';
import { getCache, isStale, type ExplanationCache } from '../../resources/explanation-cache.js';
import { parseGitHubUrl } from '../../resources/github-fetcher.js';
import type { StorageAdapter } from '../../storage/adapter.js';

export interface ReadTarget {
  repo_url: string;
  owner: string;
  repo: string;
  key: string;
  cache: ExplanationCache | null;
  stale: boolean;
}

function cacheState(cache: ExplanationCache | null): Pick<ReadTarget, 'cache' | 'stale'> {
  return { cache, stale: isStale(cache) };
}

function normalizedUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}`;
}

async function readCandidate(initialUrl?: string): Promise<string> {
  return initialUrl?.trim() || freeTextInput('Paste a GitHub URL to get a plain explanation.');
}

export async function runUrlInput(storage: StorageAdapter, initialUrl?: string): Promise<ReadTarget> {
  let candidate = initialUrl;
  while (true) {
    try {
      const { owner, repo } = parseGitHubUrl(await readCandidate(candidate));
      const cache = await getCache(storage, `${owner}/${repo}`);
      return { repo_url: normalizedUrl(owner, repo), owner, repo, key: `${owner}/${repo}`, ...cacheState(cache) };
    } catch (error) {
      if (initialUrl) throw error;
      console.log(error instanceof Error ? error.message : String(error));
      candidate = undefined;
    }
  }
}
