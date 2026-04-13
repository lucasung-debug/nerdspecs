// @TASK P2-R5-T1 - Code Analyzer Engine
// @SPEC docs/planning/06-tasks.md#P2-R5-T1
import { readdir, readFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

export interface AnalysisResult {
  primary_language: string;
  detected_framework?: string;
  entry_file?: string;
  dependency_count: number;
  dependencies: string[];
  core_files: string[];
  tech_stack: {
    language: string;
    frameworks: string[];
    apis: string[];
    services: string[];
  };
}

const EXT_LANG: Record<string, string> = {
  '.ts': 'TypeScript', '.tsx': 'TypeScript',
  '.js': 'JavaScript', '.jsx': 'JavaScript',
  '.py': 'Python',
  '.go': 'Go',
  '.rs': 'Rust',
  '.java': 'Java',
  '.rb': 'Ruby',
};

const BINARY_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
  '.woff', '.woff2', '.ttf', '.eot',
  '.zip', '.tar', '.gz', '.lock',
  '.pdf', '.mp4', '.mp3',
]);

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', '__pycache__',
  '.next', '.venv', 'vendor', 'build', 'out',
]);

const ENTRY_CANDIDATES = [
  'index.ts', 'main.ts', 'app.ts',
  'index.js', 'main.js', 'app.js',
  'main.py', 'app.py',
  'main.go',
  'src/main.rs',
];

const FRAMEWORK_MAP: Array<[string, string]> = [
  ['next', 'Next.js'], ['react', 'React'], ['vue', 'Vue'],
  ['angular', 'Angular'], ['svelte', 'Svelte'],
  ['express', 'Express'], ['nestjs', 'NestJS'],
  ['fastapi', 'FastAPI'], ['flask', 'Flask'], ['django', 'Django'],
  ['gin', 'Gin'], ['echo', 'Echo'], ['fiber', 'Fiber'],
  ['actix', 'Actix'], ['rocket', 'Rocket'],
];

const SERVICE_KEYWORDS: Array<[string, string]> = [
  ['postgres', 'PostgreSQL'], ['mysql', 'MySQL'], ['sqlite', 'SQLite'],
  ['mongodb', 'MongoDB'], ['redis', 'Redis'],
  ['prisma', 'Prisma'], ['sequelize', 'Sequelize'], ['typeorm', 'TypeORM'],
  ['passport', 'Auth'], ['jsonwebtoken', 'JWT'], ['oauth', 'OAuth'],
  ['s3', 'S3'], ['firebase', 'Firebase'], ['supabase', 'Supabase'],
];

async function scanFiles(dir: string, depth = 0): Promise<string[]> {
  if (depth > 4) return [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return []; }
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) {
      files.push(...await scanFiles(join(dir, entry.name), depth + 1));
    } else if (entry.isFile() && !BINARY_EXTS.has(extname(entry.name))) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

function detectLanguage(files: string[]): string {
  const counts: Record<string, number> = {};
  for (const f of files) {
    const lang = EXT_LANG[extname(f)];
    if (lang) counts[lang] = (counts[lang] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unknown';
}

async function readJsonFile(path: string): Promise<Record<string, unknown> | null> {
  try { return JSON.parse(await readFile(path, 'utf-8')) as Record<string, unknown>; }
  catch { return null; }
}

async function readTextFile(path: string): Promise<string | null> {
  try { return await readFile(path, 'utf-8'); }
  catch { return null; }
}

async function getNpmDeps(dir: string): Promise<string[]> {
  const pkg = await readJsonFile(join(dir, 'package.json'));
  if (!pkg) return [];
  const deps = { ...(pkg['dependencies'] as object ?? {}), ...(pkg['devDependencies'] as object ?? {}) };
  return Object.keys(deps);
}

async function getPythonDeps(dir: string): Promise<string[]> {
  const text = await readTextFile(join(dir, 'requirements.txt'));
  if (!text) return [];
  return text.split('\n')
    .map(l => l.trim().split(/[>=<!]/)[0].trim())
    .filter(l => l && !l.startsWith('#'));
}

async function getGoDeps(dir: string): Promise<string[]> {
  const text = await readTextFile(join(dir, 'go.mod'));
  if (!text) return [];
  return text.split('\n')
    .filter(l => l.trim().startsWith('require') || (l.trim().startsWith('\t') && l.includes('/')))
    .map(l => l.trim().split(/\s/)[0]);
}

async function getCargoDeps(dir: string): Promise<string[]> {
  const text = await readTextFile(join(dir, 'Cargo.toml'));
  if (!text) return [];
  const inDeps = (line: string) => line.startsWith('[dependencies') || line.startsWith('[dev-dependencies');
  const lines = text.split('\n');
  const deps: string[] = [];
  let capturing = false;
  for (const line of lines) {
    if (line.startsWith('[')) capturing = inDeps(line);
    else if (capturing && line.includes('=')) deps.push(line.split('=')[0].trim());
  }
  return deps;
}

async function getDependencies(dir: string): Promise<string[]> {
  const [npm, py, go, cargo] = await Promise.all([
    getNpmDeps(dir), getPythonDeps(dir), getGoDeps(dir), getCargoDeps(dir),
  ]);
  return [...npm, ...py, ...go, ...cargo];
}

function detectFrameworks(deps: string[]): string[] {
  const lower = deps.map(d => d.toLowerCase());
  return FRAMEWORK_MAP
    .filter(([key]) => lower.some(d => d.includes(key)))
    .map(([, label]) => label);
}

function detectApis(files: string[]): string[] {
  const apis: string[] = [];
  const hasRouteFiles = files.some(f => f.includes('route') || f.includes('controller'));
  if (hasRouteFiles) apis.push('REST');
  const hasGql = files.some(f => f.endsWith('.graphql') || f.endsWith('.gql'));
  if (hasGql) apis.push('GraphQL');
  return apis;
}

function detectServices(deps: string[]): string[] {
  const lower = deps.map(d => d.toLowerCase());
  return SERVICE_KEYWORDS
    .filter(([key]) => lower.some(d => d.includes(key)))
    .map(([, label]) => label)
    .filter((v, i, a) => a.indexOf(v) === i);
}

function findEntryFile(dir: string, files: string[]): string | undefined {
  for (const c of ENTRY_CANDIDATES) {
    const full = join(dir, c);
    if (files.includes(full)) return c;
  }
  return undefined;
}

function selectCoreFiles(dir: string, files: string[], limit = 20): string[] {
  const configNames = new Set(['package.json', 'tsconfig.json', 'Cargo.toml', 'go.mod', 'requirements.txt', 'pyproject.toml']);
  const priority = files.filter(f => {
    const name = basename(f);
    return ENTRY_CANDIDATES.some(c => f.endsWith(c)) || configNames.has(name);
  });
  const rest = files.filter(f => !priority.includes(f));
  return [...priority, ...rest].slice(0, limit).map(f => f.replace(dir + '/', '').replace(dir + '\\', ''));
}

export async function analyzeProject(projectDir: string): Promise<AnalysisResult> {
  const files = await scanFiles(projectDir);
  const deps = await getDependencies(projectDir);
  const language = detectLanguage(files);
  const frameworks = detectFrameworks(deps);

  return {
    primary_language: language,
    detected_framework: frameworks[0],
    entry_file: findEntryFile(projectDir, files),
    dependency_count: deps.length,
    dependencies: deps,
    core_files: selectCoreFiles(projectDir, files),
    tech_stack: {
      language,
      frameworks,
      apis: detectApis(files),
      services: detectServices(deps),
    },
  };
}
