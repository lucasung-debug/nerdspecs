import chalk from 'chalk';

interface ErrorEntry {
  userMessage: string;
  suggestion: string;
}

type ErrorReporter = (message: string) => void;

export const ERROR_REGISTRY = {
  ERR_NO_MOTIVATION: {
    userMessage: 'No project motivation is saved yet.',
    suggestion: 'Run `nerdspecs write` first so auto mode has context to use.',
  },
  ERR_STORAGE_UNAVAILABLE: {
    userMessage: 'NerdSpecs could not access its storage backend.',
    suggestion: 'Check file permissions, then retry so NerdSpecs can use local storage.',
  },
  ERR_GIT_NO_REMOTE: {
    userMessage: 'Git metadata is unavailable for this project.',
    suggestion: 'Make sure you are inside the target git repository before continuing.',
  },
  ERR_GITHUB_RATE_LIMIT: {
    userMessage: 'GitHub API rate limit reached. Please try again later.',
    suggestion: 'Wait a bit and retry, or set `GITHUB_TOKEN` for higher limits.',
  },
  ERR_LLM_UNAVAILABLE: {
    userMessage: 'The language model provider is unavailable right now.',
    suggestion: 'Set the required API key or retry when the provider is reachable.',
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
}

export class NerdSpecsError extends Error {
  readonly code: NerdSpecsErrorCode;
  readonly userMessage: string;

  constructor(code: NerdSpecsErrorCode, options: NerdSpecsErrorOptions = {}) {
    super(options.message ?? options.userMessage ?? ERROR_REGISTRY[code].userMessage, {
      cause: options.cause,
    });
    this.name = 'NerdSpecsError';
    this.code = code;
    this.userMessage = options.userMessage ?? ERROR_REGISTRY[code].userMessage;
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

export function renderErrorScreen(error: unknown, report: ErrorReporter = console.error): void {
  const normalized = normalizeError(error);
  if (!(normalized instanceof NerdSpecsError)) {
    report(chalk.red(`NerdSpecs error: ${normalized.message}`));
    return;
  }
  report(chalk.red(`NerdSpecs error [${normalized.code}]: ${normalized.userMessage}`));
  report(chalk.gray(ERROR_REGISTRY[normalized.code].suggestion));
}

export function wrapCommand<T extends unknown[]>(
  handler: (...args: T) => Promise<void>,
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    try {
      await handler(...args);
    } catch (error) {
      renderErrorScreen(error);
      process.exit(1);
    }
  };
}
