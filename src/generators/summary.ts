// @TASK P2-R5-T2 - Summary Generator
// @SPEC docs/planning/06-tasks.md

import type { LLMProvider, SummaryContext } from '../llm/provider.js';

function buildTechStackDescription(context: SummaryContext): string {
  const parts: string[] = [context.primary_language];
  if (context.framework) parts.push(context.framework);
  const topDeps = context.dependencies.slice(0, 4);
  if (topDeps.length > 0) parts.push(...topDeps);
  return parts.join(', ');
}

export async function generateProjectSummary(
  provider: LLMProvider,
  context: SummaryContext
): Promise<{ summary: string; tech_stack_description: string }> {
  const [summary, tech_stack_description] = await Promise.all([
    provider.generateSummary(context, context.language),
    Promise.resolve(buildTechStackDescription(context)),
  ]);
  return { summary, tech_stack_description };
}
