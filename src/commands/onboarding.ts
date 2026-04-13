// @TASK P1-S0-T2 - Onboarding flow
// @SPEC docs/planning/06-tasks.md#P1-S0-T2

import type { StorageAdapter } from '../storage/adapter.js';
import { setPreferences } from '../resources/user-preferences.js';
import { renderHeader, selectionPrompt } from '../components/index.js';
import { getMnemoHookConnectionState } from '../storage/auto-detect.js';

const LANGUAGE_CHOICES = ['English', '한국어', 'Both (EN + KO)'] as const;
type LanguageChoice = (typeof LANGUAGE_CHOICES)[number];

function mapLanguage(choice: LanguageChoice): 'en' | 'ko' | 'both' {
  if (choice === 'English') return 'en';
  if (choice === '한국어') return 'ko';
  return 'both';
}

export async function isOnboardingNeeded(storage: StorageAdapter): Promise<boolean> {
  const existing = await storage.get<unknown>('user_preferences');
  return existing === null;
}

export async function runOnboarding(storage: StorageAdapter): Promise<void> {
  renderHeader('0.1.0');
  console.log("Welcome to NerdSpecs! Let's set things up.");

  console.log('Step 1/4: Choose your language');
  const choice = await selectionPrompt('Choose your language', [...LANGUAGE_CHOICES]);

  console.log('Step 2/4: Save your preferences');
  await setPreferences(storage, { language: mapLanguage(choice as LanguageChoice) });

  console.log('Step 3/4: Check mnemo-hook connection');
  console.log(`mnemo-hook: ${getMnemoHookConnectionState()}`);
  console.log('Storage: local file (.nerdspecs/)');

  console.log('Step 4/4: Quick reference');
  console.log('nerdspecs write');
  console.log('nerdspecs read');
  console.log('nerdspecs status');
  console.log("You're all set! Run `nerdspecs write` to get started.");
}
