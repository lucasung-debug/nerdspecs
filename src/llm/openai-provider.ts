// @TASK P2-R5-T2 - OpenAI API Adapter
// @SPEC docs/planning/06-tasks.md

import type { LLMProvider, SummaryContext } from './provider.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

function getApiKey(): string {
  const key = process.env['OPENAI_API_KEY'];
  if (!key) {
    throw new Error(
      'No OpenAI API key found. Set OPENAI_API_KEY environment variable.'
    );
  }
  return key;
}

function buildPrompt(context: SummaryContext): string {
  const deps = context.dependencies.slice(0, 5).join(', ');
  const framework = context.framework ? ` using ${context.framework}` : '';
  return `Explain this project as if talking to someone who has never coded. Keep it friendly and simple (2-3 sentences max).

Project: ${context.project_name}
Language: ${context.primary_language}${framework}
Key tools: ${deps}
${context.motivation ? `Purpose: ${context.motivation}` : ''}`;
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
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
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
