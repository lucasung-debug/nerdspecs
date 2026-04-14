// @TASK P2-S2-T1 - Write One Question Screen
// @SPEC docs/planning/06-tasks.md#P2-S2-T1

import { freeTextInput } from '../../components/index.js';
import { setMotivation } from '../../resources/project-motivation.js';
import { getPreferences } from '../../resources/user-preferences.js';
import { t } from '../../i18n.js';
import type { StorageAdapter } from '../../storage/adapter.js';

export async function runOneQuestion(storage: StorageAdapter, repoSlug: string): Promise<void> {
  const prefs = await getPreferences(storage);
  const lang = prefs.language === 'both' ? 'en' : prefs.language;
  const answer = await freeTextInput(t('whyBuilt', lang));
  await setMotivation(storage, repoSlug, answer);
}
