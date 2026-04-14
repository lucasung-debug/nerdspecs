// @TASK P2-R5-T2 - Mock Provider for Testing/Offline
// @SPEC docs/planning/06-tasks.md

import type { LLMProvider, OutputLanguage, SummaryContext } from './provider.js';

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

function getPurposeGuess(framework?: string): string {
  if (!framework) return 'helps accomplish a specific goal';
  const key = framework.toLowerCase();
  return FRAMEWORK_PURPOSE[key] ?? 'helps accomplish a specific goal';
}

export class MockProvider implements LLMProvider {
  async generateSummary(
    context: SummaryContext,
    _language: OutputLanguage = context.language ?? 'en',
  ): Promise<string> {
    const frameworkClause = context.framework ? ` built with ${context.framework}` : '';
    const purpose = getPurposeGuess(context.framework);
    return `**${context.project_name}** is a ${context.primary_language} project${frameworkClause} that ${purpose}.`;
  }
}
