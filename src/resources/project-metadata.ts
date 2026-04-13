// @TASK P1-R3-T1 - ProjectMetadata Resource
// @SPEC docs/planning/06-tasks.md#P1-R3-T1
import type { StorageAdapter } from '../storage/adapter.js';

export interface ProjectMetadata {
  repo_url?: string;
  repo_slug: string;
  display_name: string;
  detected_language?: string;
  detected_framework?: string;
  entry_file?: string;
  dependency_count?: number;
  core_files_analyzed?: string[];
  generated_summary: string;
  tech_stack?: { language?: string; frameworks?: string[]; apis?: string[]; services?: string[] };
  last_analyzed: string;
  nerdspecs_version?: string;
}

const key = (slug: string) => `project_metadata::${slug}`;

export async function getMetadata(storage: StorageAdapter, repoSlug: string): Promise<ProjectMetadata | null> {
  return storage.get<ProjectMetadata>(key(repoSlug));
}

export async function setMetadata(storage: StorageAdapter, repoSlug: string, data: ProjectMetadata): Promise<void> {
  return storage.set(key(repoSlug), data);
}

export async function deleteMetadata(storage: StorageAdapter, repoSlug: string): Promise<void> {
  return storage.delete(key(repoSlug));
}
