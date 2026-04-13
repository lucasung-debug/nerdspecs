import { selectionPrompt } from '../components/index.js';
import type { StorageAdapter } from '../storage/adapter.js';
import { isOnboardingNeeded, runOnboarding } from './onboarding.js';

export interface MainMenuHandlers {
  write: () => Promise<void>;
  read: () => Promise<void>;
  think: () => Promise<void>;
  status: () => Promise<void>;
}

type MainMenuAction = keyof MainMenuHandlers;

export const MAIN_MENU_OPTIONS: ReadonlyArray<{ action: MainMenuAction; label: string }> = [
  { action: 'write', label: '1. Write - Create docs for this project' },
  { action: 'read', label: '2. Read - Understand a GitHub project (Coming in v0.2)' },
  { action: 'think', label: '3. Think - Record project decisions (Coming in v0.2)' },
  { action: 'status', label: '4. Status - Show NerdSpecs info' },
];

function resolveAction(selected: string): MainMenuAction {
  return MAIN_MENU_OPTIONS.find((option) => option.label === selected)?.action ?? 'status';
}

function printComingSoon(action: 'read' | 'think'): void {
  const label = action[0].toUpperCase() + action.slice(1);
  console.log(`${label} is coming in v0.2. Opening the preview flow.`);
}

async function routeSelection(action: MainMenuAction, handlers: MainMenuHandlers): Promise<void> {
  if (action === 'read' || action === 'think') printComingSoon(action);
  await handlers[action]();
}

export async function runMainMenu(
  storage: StorageAdapter,
  handlers: MainMenuHandlers,
): Promise<void> {
  if (await isOnboardingNeeded(storage)) return runOnboarding(storage);
  const selected = await selectionPrompt(
    'Choose what NerdSpecs should do',
    MAIN_MENU_OPTIONS.map((option) => option.label),
  );
  await routeSelection(resolveAction(selected), handlers);
}
