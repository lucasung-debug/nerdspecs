import type { OutputLanguage, SummaryContext } from './provider.js';

function buildLanguageInstruction(language: OutputLanguage): string {
  if (language === 'ko') return 'Respond entirely in Korean (한국어로 답변해주세요).';
  if (language === 'both') return 'Provide the response first in English, then in Korean separated by ---.';
  return '';
}

export function buildPrompt(
  context: SummaryContext,
  language: OutputLanguage = context.language ?? 'en',
): string {
  const deps = context.dependencies.slice(0, 5).join(', ');
  const framework = context.framework ? ` using ${context.framework}` : '';
  const languageInstruction = buildLanguageInstruction(language);

  return `Explain this project as if talking to someone who has never coded. Keep it friendly and simple (2-3 sentences max).
${languageInstruction ? `\n${languageInstruction}` : ''}

Project: ${context.project_name}
Language: ${context.primary_language}${framework}
Key tools: ${deps}
${context.motivation ? `Purpose: ${context.motivation}` : ''}`;
}

export function buildPainPointsPrompt(motivation: string): string {
  return `Based on the project motivation below, identify exactly 3 short pain points this project is trying to solve.

Return either:
- a JSON array of 3 strings, or
- 3 newline-separated items with no extra commentary.

Keep each pain point concise, human-readable, and grounded in the motivation.

Motivation: ${motivation}`;
}
