// @TASK P2-S2-T1 - Write One Question Screen
// @SPEC docs/planning/06-tasks.md#P2-S2-T1

import { freeTextInput } from '../../components/index.js';
import { setMotivation } from '../../resources/project-motivation.js';
import type { StorageAdapter } from '../../storage/adapter.js';

export async function runOneQuestion(storage: StorageAdapter, repoSlug: string): Promise<void> {
  const answer = await freeTextInput('Why did you build this project?');
  await setMotivation(storage, repoSlug, answer);
}
