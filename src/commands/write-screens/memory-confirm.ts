// @TASK P2-S3-T1 - Write Memory Confirm Screen
// @SPEC docs/planning/06-tasks.md#P2-S3-T1

import { selectionPrompt } from '../../components/index.js';
import { getMotivation } from '../../resources/project-motivation.js';
import type { StorageAdapter } from '../../storage/adapter.js';

function relativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export async function runMemoryConfirm(storage: StorageAdapter, repoSlug: string): Promise<boolean> {
  const motivation = await getMotivation(storage, repoSlug);
  if (!motivation) return false;

  console.log(`\n  "${motivation.answer}"\n  (recorded ${relativeTime(motivation.recorded_at)})\n`);
  const choice = await selectionPrompt('Use this answer?', ['Yes, use it', 'No, let me answer again']);
  return choice === 'Yes, use it';
}
