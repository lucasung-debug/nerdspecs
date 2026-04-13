import { selectionPrompt } from '../../components/index.js';
import { setDecision, type Decision, type DecisionRecord } from '../../resources/decision-record.js';
import type { ExplanationCache } from '../../resources/explanation-cache.js';
import { detectLanguage } from '../../resources/project-motivation.js';
import type { StorageAdapter } from '../../storage/adapter.js';

function combinedReasoning(reasoning: string, followUpAnswer?: string): string {
  return followUpAnswer ? `${reasoning}\nExample: ${followUpAnswer}` : reasoning;
}

function reasoningKo(text: string): string | undefined {
  return detectLanguage(text) === 'ko' ? text : undefined;
}

function printSavedSummary(cache: ExplanationCache, record: DecisionRecord): void {
  console.log('Saved.');
  console.log(`Project: ${cache.owner}/${cache.repo}`);
  if (cache.explanation_en) console.log(`What it does: ${cache.explanation_en}`);
  console.log(`Why: ${record.reasoning}`);
  console.log(`Decision: ${record.decision}`);
  console.log(`Recorded: ${record.recorded_at.slice(0, 10)}`);
}

export async function runDecisionSaved(
  storage: StorageAdapter,
  cache: ExplanationCache,
  reasoning: string,
  followUpAnswer?: string,
): Promise<DecisionRecord> {
  const decision = await selectionPrompt('What is your decision?', ['adopt', 'skip', 'watch', 'undecided']) as Decision;
  const fullReasoning = combinedReasoning(reasoning, followUpAnswer);
  const record = await setDecision(storage, `${cache.owner}/${cache.repo}`, {
    repo_url: cache.repo_url,
    decision,
    reasoning: fullReasoning,
    reasoning_ko: reasoningKo(fullReasoning),
    follow_up_answer: followUpAnswer,
  });
  printSavedSummary(cache, record);
  return record;
}
