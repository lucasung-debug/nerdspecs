// @TASK P2-R5-T2 - OpenAI API Adapter
// @SPEC docs/planning/06-tasks.md

import { NerdSpecsError } from '../errors.js';
import type { LLMProvider, OutputLanguage, SummaryContext } from './provider.js';
import { buildPainPointsPrompt, buildPrompt } from './prompts.js';
import { withRetry } from './retry.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

interface OpenAIResponse {
  choices: Array<{ message: { content: string } }>;
}

function getApiKey(): string {
  const key = process.env['OPENAI_API_KEY'];
  if (!key) throw new NerdSpecsError('ERR_LLM_UNAVAILABLE');
  return key;
}

async function callOpenAI(prompt: string, maxTokens = 256): Promise<string> {
  return withRetry(async () => {
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      throw new NerdSpecsError('ERR_LLM_UNAVAILABLE', {
        message: `OpenAI API error: ${res.status} ${res.statusText}`,
      });
    }

    return parseOpenAIResponse((await res.json()) as OpenAIResponse);
  });
}

function parseOpenAIResponse(data: OpenAIResponse): string {
  return data.choices[0]?.message?.content ?? '';
}

export class OpenAIProvider implements LLMProvider {
  async generateSummary(
    context: SummaryContext,
    language: OutputLanguage = context.language ?? 'en',
  ): Promise<string> {
    return callOpenAI(buildPrompt(context, language));
  }

  async generatePainPoints(motivation: string): Promise<string> {
    return callOpenAI(buildPainPointsPrompt(motivation), 128);
  }
}
