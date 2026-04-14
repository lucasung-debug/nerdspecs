import chalk from 'chalk';
import { resolveCurrentRepoSlug } from './commands/helpers.js';
import { LocalFileAdapter } from './storage/local-file-adapter.js';
import { MnemoHookAdapter } from './storage/mnemo-hook-adapter.js';
import type { StorageAdapter } from './storage/adapter.js';

interface ErrorEntry {
  userMessage: string;
  suggestion: string;
  userMessage_ko: string;
  suggestion_ko: string;
}

type ErrorReporter = (message: string) => void;
type ErrorDisplayLanguage = 'en' | 'ko';
type StoredLanguagePreference = { language?: 'en' | 'ko' | 'both' };

export const ERROR_REGISTRY = {
  ERR_NO_MOTIVATION: {
    userMessage: 'No project motivation is saved yet.',
    suggestion: 'Run `nerdspecs write` first so auto mode has context to use.',
    userMessage_ko: '프로젝트 동기가 저장되지 않았습니다.',
    suggestion_ko: '자동 모드가 참고할 수 있도록 먼저 `nerdspecs write`를 실행하세요.',
  },
  ERR_STORAGE_UNAVAILABLE: {
    userMessage: 'NerdSpecs could not access its storage backend.',
    suggestion: 'Check file permissions, then retry so NerdSpecs can use local storage.',
    userMessage_ko: 'NerdSpecs가 저장소 백엔드에 접근할 수 없습니다.',
    suggestion_ko: '파일 권한을 확인한 뒤 다시 시도해 로컬 저장소를 사용할 수 있게 하세요.',
  },
  ERR_GIT_NO_REMOTE: {
    userMessage: 'Git metadata is unavailable for this project.',
    suggestion: 'Make sure you are inside the target git repository before continuing.',
    userMessage_ko: '이 프로젝트의 Git 메타데이터를 확인할 수 없습니다.',
    suggestion_ko: '계속하기 전에 대상 Git 저장소 내부에서 실행 중인지 확인하세요.',
  },
  ERR_GITHUB_RATE_LIMIT: {
    userMessage: 'GitHub API rate limit reached. Please try again later.',
    suggestion: 'Wait a bit and retry, or set `GITHUB_TOKEN` for higher limits.',
    userMessage_ko: 'GitHub API 요청 한도에 도달했습니다. 잠시 후 다시 시도하세요.',
    suggestion_ko: '잠시 기다린 뒤 다시 시도하거나, 더 높은 한도를 위해 `GITHUB_TOKEN`을 설정하세요.',
  },
  ERR_LLM_UNAVAILABLE: {
    userMessage: 'The language model provider is unavailable right now.',
    suggestion: 'Set the required API key or retry when the provider is reachable.',
    userMessage_ko: '언어 모델 제공자를 지금 사용할 수 없습니다.',
    suggestion_ko: '필요한 API 키를 설정하거나 제공자에 다시 연결된 뒤 재시도하세요.',
  },
} as const satisfies Record<string, ErrorEntry>;

export type NerdSpecsErrorCode = keyof typeof ERROR_REGISTRY;

const ERROR_PATTERNS: Array<[RegExp, NerdSpecsErrorCode]> = [
  [/no motivation stored/i, 'ERR_NO_MOTIVATION'],
  [/(mnemo-hook|storage backend|memory\.json|storage is unavailable)/i, 'ERR_STORAGE_UNAVAILABLE'],
  [/(git remote|get-url origin|not a git repository|cannot parse git remote)/i, 'ERR_GIT_NO_REMOTE'],
  [/(rate limit|status 403|status 429)/i, 'ERR_GITHUB_RATE_LIMIT'],
  [/(openai api|claude api|api key|language model provider|llm provider)/i, 'ERR_LLM_UNAVAILABLE'],
];

interface NerdSpecsErrorOptions {
  cause?: unknown;
  message?: string;
  userMessage?: string;
  userMessage_ko?: string;
}

export class NerdSpecsError extends Error {
  readonly code: NerdSpecsErrorCode;
  readonly userMessage: string;
  readonly userMessage_ko: string;

  constructor(code: NerdSpecsErrorCode, options: NerdSpecsErrorOptions = {}) {
    super(options.message ?? options.userMessage ?? ERROR_REGISTRY[code].userMessage, {
      cause: options.cause,
    });
    this.name = 'NerdSpecsError';
    this.code = code;
    this.userMessage = options.userMessage ?? ERROR_REGISTRY[code].userMessage;
    this.userMessage_ko = options.userMessage_ko ?? ERROR_REGISTRY[code].userMessage_ko;
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function inferErrorCode(message: string): NerdSpecsErrorCode | undefined {
  return ERROR_PATTERNS.find(([pattern]) => pattern.test(message))?.[1];
}

export function normalizeError(error: unknown): Error {
  if (error instanceof NerdSpecsError) return error;
  const message = errorMessage(error);
  const code = inferErrorCode(message);
  return code ? new NerdSpecsError(code, { message }) : new Error(message);
}

function localizedEntry(code: NerdSpecsErrorCode, language: ErrorDisplayLanguage): {
  userMessage: string;
  suggestion: string;
} {
  const entry = ERROR_REGISTRY[code];
  if (language === 'ko') {
    return {
      userMessage: entry.userMessage_ko,
      suggestion: entry.suggestion_ko,
    };
  }
  return {
    userMessage: entry.userMessage,
    suggestion: entry.suggestion,
  };
}

function extractLanguagePreference(args: readonly unknown[]): ErrorDisplayLanguage | undefined {
  for (const arg of args) {
    if (!arg || typeof arg !== 'object') continue;

    const optionBag = arg as Record<string, unknown>;
    const candidate = optionBag['lang'] ?? optionBag['language'];
    if (candidate === 'ko') return 'ko';
    if (candidate === 'en' || candidate === 'both') return 'en';
  }

  return undefined;
}

function createErrorStorageAdapter(): StorageAdapter | undefined {
  try {
    return new MnemoHookAdapter();
  } catch (error) {
    if (!(error instanceof Error) || !/mnemo-hook/i.test(error.message)) return undefined;
  }

  try {
    return new LocalFileAdapter();
  } catch {
    return undefined;
  }
}

async function resolveStoredLanguagePreference(): Promise<ErrorDisplayLanguage | undefined> {
  const storage = createErrorStorageAdapter();
  if (!storage) return undefined;

  try {
    const repoSlug = await resolveCurrentRepoSlug();
    const projectConfig = await storage.get<StoredLanguagePreference>(`project_config::${repoSlug}`);
    if (projectConfig?.language === 'ko') return 'ko';
    if (projectConfig?.language === 'en' || projectConfig?.language === 'both') return 'en';

    const preferences = await storage.get<StoredLanguagePreference>('user_preferences');
    if (preferences?.language === 'ko') return 'ko';
    if (preferences?.language === 'en' || preferences?.language === 'both') return 'en';
  } catch {
    return undefined;
  }

  return undefined;
}

async function resolveErrorLanguage(args: readonly unknown[]): Promise<ErrorDisplayLanguage> {
  return extractLanguagePreference(args) ?? await resolveStoredLanguagePreference() ?? 'en';
}

export function renderErrorScreen(
  error: unknown,
  report: ErrorReporter = console.error,
  language: ErrorDisplayLanguage = 'en',
): void {
  const normalized = normalizeError(error);
  if (!(normalized instanceof NerdSpecsError)) {
    const label = language === 'ko' ? 'NerdSpecs 오류' : 'NerdSpecs error';
    report(chalk.red(`${label}: ${normalized.message}`));
    return;
  }
  const entry = localizedEntry(normalized.code, language);
  const label = language === 'ko' ? 'NerdSpecs 오류' : 'NerdSpecs error';
  const userMessage = language === 'ko' ? normalized.userMessage_ko : normalized.userMessage;
  report(chalk.red(`${label} [${normalized.code}]: ${userMessage || entry.userMessage}`));
  report(chalk.gray(entry.suggestion));
}

export function wrapCommand<T extends unknown[]>(
  handler: (...args: T) => Promise<void>,
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    try {
      await handler(...args);
    } catch (error) {
      renderErrorScreen(error, console.error, await resolveErrorLanguage(args));
      process.exit(1);
    }
  };
}
