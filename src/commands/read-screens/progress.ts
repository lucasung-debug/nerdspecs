import { setCache, type ComplexityLevel, type ExplanationCache } from '../../resources/explanation-cache.js';
import { fetchRepoInfo, type RepoInfo } from '../../resources/github-fetcher.js';
import type { StorageAdapter } from '../../storage/adapter.js';
import type { ReadTarget } from './url-input.js';

const VERSION = process.env.npm_package_version ?? '0.1.0';

const AUDIENCE_RULES: Array<[string, string]> = [
  ['designer', 'designers and frontend teams'],
  ['student', 'students and beginners'],
  ['team', 'product teams'],
  ['data', 'data-focused developers'],
  ['api', 'developers integrating APIs'],
];

const BEGINNER_HINTS = ['beginner', 'starter', 'simple', 'quickstart', 'template'];
const ADVANCED_HINTS = ['platform', 'framework', 'compiler', 'distributed', 'infrastructure', 'sdk'];

function cleanMarkdown(text: string): string {
  return text.replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*]\([^)]*\)/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#>*`~_-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function firstMeaningfulLine(readme: string): string | null {
  return readme.split('\n').map(cleanMarkdown).find((line) => line.length > 40) ?? null;
}

function sentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function purpose(info: RepoInfo): string {
  return sentence(firstMeaningfulLine(info.readme) ?? info.description ?? `${info.repo} shares its code, setup, and usage details in this repository`);
}

function targetAudience(info: RepoInfo): string {
  const lower = `${info.description} ${info.readme}`.toLowerCase();
  return AUDIENCE_RULES.find(([keyword]) => lower.includes(keyword))?.[1] ?? 'developers evaluating a new tool';
}

function complexity(info: RepoInfo): ComplexityLevel {
  const lower = `${info.description} ${info.readme} ${info.topics.join(' ')}`.toLowerCase();
  if (BEGINNER_HINTS.some((hint) => lower.includes(hint))) return 'beginner';
  return ADVANCED_HINTS.some((hint) => lower.includes(hint)) ? 'advanced' : 'intermediate';
}

function complexityKo(level: ComplexityLevel): string {
  return { beginner: '입문', intermediate: '중간', advanced: '고급' }[level];
}

function useCases(info: RepoInfo): string[] {
  const topic = info.topics[0]?.replace(/-/g, ' ') ?? info.language?.toLowerCase() ?? info.repo;
  return [`Evaluate whether ${info.repo} fits your workflow`, `Learn how ${info.repo} approaches ${topic}`, `Reuse ideas or setup patterns from ${info.repo}`];
}

function explanationData(repoUrl: string, info: RepoInfo): Omit<ExplanationCache, 'fetched_at'> {
  const audience = targetAudience(info);
  const level = complexity(info);
  const what = purpose(info);
  return {
    repo_url: repoUrl,
    owner: info.owner,
    repo: info.repo,
    explanation_en: `${info.repo} is a GitHub project by ${info.owner}. ${what} It is best suited for ${audience}. Complexity: ${level}.`,
    explanation_ko: `${info.repo}는 ${info.owner}가 공개한 GitHub 프로젝트입니다. 주요 목적은 다음과 같습니다: ${what} 추천 대상은 ${audience}이며 난이도는 ${complexityKo(level)} 수준입니다.`,
    use_cases: useCases(info),
    target_audience: audience,
    complexity_level: level,
    nerdspecs_version: VERSION,
  };
}

export async function runReadProgress(storage: StorageAdapter, target: ReadTarget): Promise<ExplanationCache> {
  if (target.cache && !target.stale) return target.cache;
  console.log(`Fetching ${target.repo} from GitHub...`);
  const repoInfo = await fetchRepoInfo(target.owner, target.repo);
  console.log('Reading this project for you...');
  return setCache(storage, target.key, explanationData(target.repo_url, repoInfo));
}
