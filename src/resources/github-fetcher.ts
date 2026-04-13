import { NerdSpecsError } from '../errors.js';

const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);

export interface RepoInfo {
  repo_url: string;
  owner: string;
  repo: string;
  full_name: string;
  description: string;
  readme: string;
  stars: number;
  language: string | null;
  topics: string[];
  homepage: string | null;
}

interface GitHubRepoResponse {
  html_url: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  topics?: string[];
  homepage: string | null;
}

interface GitHubReadmeResponse {
  content?: string;
  encoding?: string;
}

function apiUrl(path: string): string {
  return `https://api.github.com${path}`;
}

function fetchHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN?.trim();
  return token ? { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` } : { Accept: 'application/vnd.github+json' };
}

function ensureGitHubUrl(url: string): URL {
  const parsed = new URL(url);
  if (!GITHUB_HOSTS.has(parsed.hostname)) throw new Error('Only GitHub URLs are supported.');
  return parsed;
}

function cleanRepo(value: string | undefined): string {
  return (value ?? '').replace(/\.git$/i, '');
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } {
  const parsed = ensureGitHubUrl(url);
  const [owner, rawRepo] = parsed.pathname.split('/').filter(Boolean);
  const repo = cleanRepo(rawRepo);
  if (!owner || !repo) throw new Error('Please enter a GitHub repository URL like https://github.com/owner/repo.');
  return { owner, repo };
}

function githubError(status: number): Error {
  if (status === 403 || status === 429) return new NerdSpecsError('ERR_GITHUB_RATE_LIMIT');
  if (status === 404) return new Error('Could not fetch repository from GitHub.');
  return new Error(`GitHub API request failed with status ${status}.`);
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path), { headers: fetchHeaders() });
  if (!response.ok) throw githubError(response.status);
  return response.json() as Promise<T>;
}

async function fetchReadme(owner: string, repo: string): Promise<string> {
  const response = await fetch(apiUrl(`/repos/${owner}/${repo}/readme`), { headers: fetchHeaders() });
  if (response.status === 404) return '';
  if (!response.ok) throw githubError(response.status);
  const payload = await response.json() as GitHubReadmeResponse;
  return payload.encoding === 'base64' ? Buffer.from((payload.content ?? '').replace(/\n/g, ''), 'base64').toString('utf8') : payload.content ?? '';
}

function toRepoInfo(repo: GitHubRepoResponse, owner: string, name: string, readme: string): RepoInfo {
  return {
    repo_url: repo.html_url,
    owner,
    repo: name,
    full_name: repo.full_name,
    description: repo.description ?? '',
    readme,
    stars: repo.stargazers_count,
    language: repo.language,
    topics: repo.topics ?? [],
    homepage: repo.homepage,
  };
}

export async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  const [repoData, readme] = await Promise.all([
    fetchJson<GitHubRepoResponse>(`/repos/${owner}/${repo}`),
    fetchReadme(owner, repo),
  ]);
  return toRepoInfo(repoData, owner, repo, readme);
}
