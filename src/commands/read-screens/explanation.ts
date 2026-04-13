import { selectionPrompt } from '../../components/index.js';
import type { ExplanationCache } from '../../resources/explanation-cache.js';

export type ExplanationChoice = 'think' | 'exit';

function printUseCases(useCases: string[]): void {
  useCases.forEach((item) => console.log(`  - ${item}`));
}

function toChoice(selection: string): ExplanationChoice {
  return selection === 'Yes, record why' ? 'think' : 'exit';
}

export async function runExplanation(cache: ExplanationCache): Promise<ExplanationChoice> {
  console.log(cache.explanation_en);
  console.log('---');
  console.log(cache.explanation_ko ?? '—');
  console.log('');
  console.log(`Audience: ${cache.target_audience ?? '—'}`);
  console.log(`Complexity: ${cache.complexity_level}`);
  printUseCases(cache.use_cases);
  const choice = await selectionPrompt('Do you think you might need this?', ['Yes, record why', 'No', 'Not sure yet']);
  if (choice !== 'Yes, record why') console.log(choice === 'No' ? 'Okay. No decision recorded.' : 'You can always come back later.');
  return toChoice(choice);
}
