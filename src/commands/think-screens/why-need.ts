import { freeTextInput } from '../../components/index.js';
import type { ExplanationCache } from '../../resources/explanation-cache.js';

export async function runWhyNeed(cache: ExplanationCache): Promise<string> {
  return freeTextInput(`Why do you need ${cache.repo}?`);
}
