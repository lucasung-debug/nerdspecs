// @TASK P1-R2-T1 - ProjectConfig resource
// @SPEC docs/planning/06-tasks.md#P1-R2-T1

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { StorageAdapter } from '../storage/adapter.js';

const execAsync = promisify(exec);

export interface ProjectConfig {
  language: 'en' | 'ko' | 'both';
  auto_push: boolean;
  landing_page_enabled: boolean;
  landing_page_url?: string;
  readme_sections: Record<string, boolean>;
  hook_installed: boolean;
  hook_installed_at?: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_README_SECTIONS: Record<string, boolean> = {
  hero: true,
  plain_explanation: true,
  how_to_use: true,
  tech_stack: true,
  installation: true,
};

const DEFAULTS: Omit<ProjectConfig, 'created_at' | 'updated_at'> = {
  language: 'both',
  auto_push: true,
  landing_page_enabled: true,
  readme_sections: DEFAULT_README_SECTIONS,
  hook_installed: false,
};

function configKey(repoSlug: string): string {
  return `project_config::${repoSlug}`;
}

export function parseRepoSlug(url: string): string {
  const match = url.match(/[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!match) throw new Error(`Cannot parse git remote URL: ${url}`);
  return `${match[1]}--${match[2]}`;
}

export async function deriveRepoSlug(): Promise<string> {
  const { stdout } = await execAsync('git remote get-url origin');
  return parseRepoSlug(stdout.trim());
}

export async function getConfig(
  storage: StorageAdapter,
  repoSlug: string,
): Promise<ProjectConfig> {
  const existing = await storage.get<ProjectConfig>(configKey(repoSlug));
  if (existing) return existing;

  const now = new Date().toISOString();
  const config: ProjectConfig = { ...DEFAULTS, readme_sections: { ...DEFAULT_README_SECTIONS }, created_at: now, updated_at: now };
  await storage.set(configKey(repoSlug), config);
  return config;
}

export async function setConfig(
  storage: StorageAdapter,
  repoSlug: string,
  partial: Partial<Omit<ProjectConfig, 'created_at' | 'updated_at'>>,
): Promise<ProjectConfig> {
  const existing = await getConfig(storage, repoSlug);
  const updated: ProjectConfig = {
    ...existing,
    ...partial,
    updated_at: new Date().toISOString(),
  };
  await storage.set(configKey(repoSlug), updated);
  return updated;
}

export async function deleteConfig(storage: StorageAdapter, repoSlug: string): Promise<void> {
  await storage.delete(configKey(repoSlug));
}
