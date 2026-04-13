import type { StorageAdapter } from '../storage/adapter.js';
import { nowIso } from '../utils.js';

export type Decision = 'adopt' | 'skip' | 'watch' | 'undecided';
export type DecisionStatus = 'active' | 'superseded' | 'archived';

export interface DecisionRecord {
  repo_url: string;
  decision: Decision;
  reasoning: string;
  reasoning_ko?: string;
  follow_up_answer?: string;
  recorded_at: string;
  reviewed_at?: string;
  status: DecisionStatus;
  is_vague: boolean;
}

export type DecisionRecordInput =
  Omit<DecisionRecord, 'recorded_at' | 'reviewed_at' | 'status' | 'is_vague'>
  & Partial<Pick<DecisionRecord, 'recorded_at' | 'reviewed_at' | 'status'>>;

const VAGUE_PATTERNS = [
  /\bseems useful\b/i,
  /\binteresting\b/i,
  /\bmaybe\b/i,
  /\bmight be good\b/i,
  /유용할 것 같/i,
  /흥미로/i,
  /좋아 보여/i,
];

function decisionKey(key: string): string {
  return `decision_record::${key}`;
}

function combinedText(data: Pick<DecisionRecordInput, 'reasoning' | 'follow_up_answer'>): string {
  return [data.reasoning, data.follow_up_answer].filter(Boolean).join(' ').trim();
}

export function isVagueAnswer(text: string): boolean {
  const value = text.trim().replace(/\s+/g, ' ');
  return value.length < 10 || (value.split(' ').length <= 4 && VAGUE_PATTERNS.some((pattern) => pattern.test(value)));
}

export async function getDecision(storage: StorageAdapter, key: string): Promise<DecisionRecord | null> {
  return storage.get<DecisionRecord>(decisionKey(key));
}

export async function setDecision(
  storage: StorageAdapter,
  key: string,
  data: DecisionRecordInput,
): Promise<DecisionRecord> {
  const now = nowIso();
  const existing = await getDecision(storage, key);
  const saved: DecisionRecord = {
    ...existing,
    ...data,
    recorded_at: existing?.recorded_at ?? data.recorded_at ?? now,
    reviewed_at: data.reviewed_at ?? now,
    status: data.status ?? existing?.status ?? 'active',
    is_vague: isVagueAnswer(combinedText(data)),
  };
  await storage.set(decisionKey(key), saved);
  return saved;
}

export async function deleteDecision(storage: StorageAdapter, key: string): Promise<void> {
  await storage.delete(decisionKey(key));
}
