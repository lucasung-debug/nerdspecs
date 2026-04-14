// @TASK P2-R5-T2 - LLM Provider Interface
// @SPEC docs/planning/06-tasks.md

export type OutputLanguage = 'en' | 'ko' | 'both';

export interface SummaryContext {
  project_name: string;
  primary_language: string;
  framework?: string;
  dependencies: string[];
  entry_file?: string;
  motivation?: string;
  language?: OutputLanguage;
}

export interface LLMProvider {
  generateSummary(context: SummaryContext, language?: OutputLanguage): Promise<string>;
  generatePainPoints?(motivation: string): Promise<string>;
}
