// @TASK P2-R5-T2 - OpenAI API Adapter
// @SPEC docs/planning/06-tasks.md

import { NerdSpecsError } from '../errors.js';
import type { LLMProvider, SummaryContext } from './provider.js';
import { buildPrompt } from './prompts.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

function getApiKey(): string {
  const key = process.env['OPENAI_API_KEY'];
  if (!key) throw new NerdSpecsError('ERR_LLM_UNAVAILABLE');
  return key;
}

async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new NerdSpecsError('ERR_LLM_UNAVAILABLE', {
      message: `OpenAI API error: ${res.status} ${res.statusText}`,
    });
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? '';
}

export class OpenAIProvider implements LLMProvider {
  async generateSummary(context: SummaryContext): Promise<string> {
    return callOpenAI(buildPrompt(context));
  }

  async generatePainPoints(motivation: string): Promise<string[]> {
    const prompt = `List exactly 3 challenges a non-developer might face with this project type: "${motivation}". Format as a simple list of short phrases.`;
    const raw = await callOpenAI(prompt);
    return raw
      .split('\n')
      .map((l) => l.replace(/^[-\d.)\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 3);
  }
}
