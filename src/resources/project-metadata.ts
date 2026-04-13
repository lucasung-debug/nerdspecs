// @TASK P1-R3-T1 - ProjectMetadata Resource
// @SPEC docs/planning/06-tasks.md#P1-R3-T1
import { readdir, stat, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
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

const EXT_LANG: Record<string, string> = {
  '.ts': 'TypeScript', '.tsx': 'TypeScript',
  '.js': 'JavaScript', '.jsx': 'JavaScript',
  '.py': 'Python',
  '.go': 'Go',
  '.rs': 'Rust',
  '.java': 'Java',
  '.rb': 'Ruby',
  '.php': 'PHP',
};

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '__pycache__', '.venv']);

async function scanFiles(dir: string, depth = 0): Promise<string[]> {
  if (depth > 3) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) {
      files.push(...await scanFiles(join(dir, entry.name), depth + 1));
    } else if (entry.isFile()) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

function detectLanguage(files: string[]): string | undefined {
  const counts: Record<string, number> = {};
  for (const f of files) {
    const lang = EXT_LANG[extname(f)];
    if (lang) counts[lang] = (counts[lang] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

async function detectFramework(dir: string): Promise<string | undefined> {
  try {
    const pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf-8')) as Record<string, unknown>;
    const deps = { ...(pkg['dependencies'] as object ?? {}), ...(pkg['devDependencies'] as object ?? {}) };
    for (const [name, label] of [['next', 'Next.js'], ['react', 'React'], ['vue', 'Vue'], ['express', 'Express']] as const) {
      if (name in deps) return label;
    }
  } catch { /* no package.json */ }
  try { await stat(join(dir, 'requirements.txt')); return 'Python (pip)'; } catch { /* skip */ }
  try { await stat(join(dir, 'go.mod')); return 'Go module'; } catch { /* skip */ }
  return undefined;
}

async function findEntryFile(dir: string, files: string[]): Promise<string | undefined> {
  const candidates = ['index.ts', 'main.py', 'main.go', 'app.ts', 'index.js', 'main.ts', 'index.py'];
  for (const c of candidates) {
    if (files.some(f => f === join(dir, c))) return c;
  }
  return undefined;
}

async function countDependencies(dir: string): Promise<number> {
  try {
    const pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf-8')) as Record<string, unknown>;
    const deps = Object.keys(pkg['dependencies'] as object ?? {}).length;
    const dev = Object.keys(pkg['devDependencies'] as object ?? {}).length;
    return deps + dev;
  } catch { /* skip */ }
  try {
    const lines = (await readFile(join(dir, 'requirements.txt'), 'utf-8')).split('\n').filter(l => l.trim() && !l.startsWith('#'));
    return lines.length;
  } catch { /* skip */ }
  return 0;
}

export async function analyzeProject(projectDir: string): Promise<Partial<ProjectMetadata>> {
  const files = await scanFiles(projectDir);
  const [framework, depCount] = await Promise.all([detectFramework(projectDir), countDependencies(projectDir)]);
  return {
    detected_language: detectLanguage(files),
    detected_framework: framework,
    entry_file: await findEntryFile(projectDir, files),
    dependency_count: depCount,
    core_files_analyzed: files.slice(0, 20).map(f => f.replace(projectDir + '/', '')),
    generated_summary: '[Pending LLM analysis]',
    last_analyzed: new Date().toISOString(),
  };
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
