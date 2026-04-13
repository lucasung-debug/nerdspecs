// @TASK P2-R5-T2 - Mock Provider for Testing/Offline
// @SPEC docs/planning/06-tasks.md

import type { LLMProvider, SummaryContext } from './provider.js';

const FRAMEWORK_PURPOSE: Record<string, string> = {
  express: 'serves a web application',
  fastify: 'serves a web application',
  koa: 'serves a web application',
  hapi: 'serves a web application',
  react: 'shows information visually in a browser',
  vue: 'shows information visually in a browser',
  svelte: 'shows information visually in a browser',
  next: 'delivers web pages to visitors',
  nuxt: 'delivers web pages to visitors',
  nestjs: 'manages business data and rules',
  django: 'runs a complete website with data storage',
  flask: 'serves a lightweight web service',
  fastapi: 'provides fast data access through a web connection',
};

const FRAMEWORK_PAIN_POINTS: Record<string, string[]> = {
  web: [
    'Setting up the project for the first time requires some technical steps',
    'Keeping the software updated takes ongoing attention',
    'Sharing it with others may need extra configuration',
  ],
  ui: [
    'Making it look right on different screen sizes can be tricky',
    'Browsers may behave differently and need separate testing',
    'Loading speed depends on how well the visuals are organized',
  ],
  api: [
    'Connecting other software to it requires understanding the data format',
    'Keeping it secure from unauthorized access needs careful setup',
    'Handling many users at once may require additional planning',
  ],
};

function getPurposeGuess(framework?: string): string {
  if (!framework) return 'helps accomplish a specific goal';
  const key = framework.toLowerCase();
  return FRAMEWORK_PURPOSE[key] ?? 'helps accomplish a specific goal';
}

export class MockProvider implements LLMProvider {
  async generateSummary(context: SummaryContext): Promise<string> {
    const frameworkClause = context.framework ? ` built with ${context.framework}` : '';
    const purpose = getPurposeGuess(context.framework);
    return `**${context.project_name}** is a ${context.primary_language} project${frameworkClause} that ${purpose}.`;
  }

  async generatePainPoints(motivation: string): Promise<string[]> {
    const lower = motivation.toLowerCase();
    if (lower.includes('web') || lower.includes('site')) return FRAMEWORK_PAIN_POINTS['web']!;
    if (lower.includes('ui') || lower.includes('interface')) return FRAMEWORK_PAIN_POINTS['ui']!;
    return FRAMEWORK_PAIN_POINTS['api']!;
  }
}
