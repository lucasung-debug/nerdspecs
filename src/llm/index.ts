// @TASK P2-R5-T2 - LLM Provider Factory
// @SPEC docs/planning/06-tasks.md

export type { LLMProvider, OutputLanguage, SummaryContext } from './provider.js';
export { ClaudeProvider } from './claude-provider.js';
export { OpenAIProvider } from './openai-provider.js';
export { MockProvider } from './mock-provider.js';

import type { LLMProvider } from './provider.js';
import { ClaudeProvider } from './claude-provider.js';
import { OpenAIProvider } from './openai-provider.js';
import { MockProvider } from './mock-provider.js';

export async function createLLMProvider(): Promise<LLMProvider> {
  if (process.env['ANTHROPIC_API_KEY'] ?? process.env['CLAUDE_API_KEY']) {
    return new ClaudeProvider();
  }
  if (process.env['OPENAI_API_KEY']) {
    return new OpenAIProvider();
  }
  console.warn('⚠ No API key found. Using offline mode — summaries will be template-based.');
  return new MockProvider();
}
