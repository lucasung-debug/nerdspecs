import type { SummaryContext } from './provider.js';

export function buildPrompt(context: SummaryContext): string {
  const deps = context.dependencies.slice(0, 5).join(', ');
  const framework = context.framework ? ` using ${context.framework}` : '';

  return `Explain this project as if talking to someone who has never coded. Keep it friendly and simple (2-3 sentences max).

Project: ${context.project_name}
Language: ${context.primary_language}${framework}
Key tools: ${deps}
${context.motivation ? `Purpose: ${context.motivation}` : ''}`;
}
