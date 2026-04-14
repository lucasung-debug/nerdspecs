// @TASK P1-S0-T2 - Onboarding flow
// @SPEC docs/planning/06-tasks.md#P1-S0-T2

import type { StorageAdapter } from '../storage/adapter.js';
import { setPreferences } from '../resources/user-preferences.js';
import { renderHeader, selectionPrompt } from '../components/index.js';
import { getMnemoHookConnectionState } from '../storage/auto-detect.js';
import { t } from '../i18n.js';

const LANGUAGE_CHOICES = ['English', '한국어', '中文', 'Both (EN + KO)'] as const;
type LanguageChoice = (typeof LANGUAGE_CHOICES)[number];

function mapLanguage(choice: LanguageChoice): 'en' | 'ko' | 'zh' | 'both' {
  if (choice === 'English') return 'en';
  if (choice === '한국어') return 'ko';
  if (choice === '中文') return 'zh';
  return 'both';
}

export async function isOnboardingNeeded(storage: StorageAdapter): Promise<boolean> {
  const existing = await storage.get<unknown>('user_preferences');
  return existing === null;
}

export async function runOnboarding(storage: StorageAdapter): Promise<void> {
  renderHeader('0.3.0');
  console.log(t('welcome', 'en'));

  console.log(t('stepLang', 'en'));
  const choice = await selectionPrompt(t('chooseLang', 'en'), [...LANGUAGE_CHOICES]);
  const lang = mapLanguage(choice as LanguageChoice);

  console.log(t('stepSave', lang));
  await setPreferences(storage, { language: lang });

  console.log(t('stepCheck', lang));
  console.log(`Storage: local file (.nerdspecs/)`);

  console.log(t('stepRef', lang));
  console.log('nerdspecs write');
  console.log('nerdspecs read');
  console.log('nerdspecs status');
  console.log(t('allSet', lang));
}
