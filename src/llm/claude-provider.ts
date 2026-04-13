// @TASK P2-R5-T2 - Claude API Adapter
// @SPEC docs/planning/06-tasks.md

import { NerdSpecsError } from '../errors.js';
import type { LLMProvider, SummaryContext } from './provider.js';
import { buildPrompt } from './prompts.js';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

function getApiKey(): string {
  const key = process.env['ANTHROPIC_API_KEY'] ?? process.env['CLAUDE_API_KEY'];
  if (!key) throw new NerdSpecsError('ERR_LLM_UNAVAILABLE');
  return key;
}

async function callClaude(prompt: string): Promise<string> {
  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new NerdSpecsError('ERR_LLM_UNAVAILABLE', {
      message: `Claude API error: ${res.status} ${res.statusText}`,
    });
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  return data.content[0]?.text ?? '';
}

export class ClaudeProvider implements LLMProvider {
  async generateSummary(context: SummaryContext): Promise<string> {
    return callClaude(buildPrompt(context));
  }

  async generatePainPoints(motivation: string): Promise<string[]> {
    const prompt = `List exactly 3 challenges a non-developer might face with this project type: "${motivation}". Format as a simple list of short phrases.`;
    const raw = await callClaude(prompt);
    return raw
      .split('\n')
      .map((l) => l.replace(/^[-\d.)\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 3);
  }
}
