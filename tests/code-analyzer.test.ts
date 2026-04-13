// @TASK P2-R5-T1 - Code Analyzer Engine Tests
// @TEST tests/code-analyzer.test.ts
import { rm, mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { analyzeProject } from '../src/resources/code-analyzer.js';

let tmpDir: string;
let projectDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'nerdspecs-analyzer-'));
  projectDir = join(tmpDir, 'project');
  await mkdir(projectDir, { recursive: true });
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

async function makeNodeProject(dir: string, extraDeps: Record<string, string> = {}) {
  await writeFile(join(dir, 'package.json'), JSON.stringify({
    dependencies: { express: '^4.18.0', ...extraDeps },
    devDependencies: { typescript: '^5.0.0', vitest: '^1.0.0' },
  }));
  await writeFile(join(dir, 'index.ts'), 'import express from "express";');
  await writeFile(join(dir, 'utils.ts'), 'export const add = (a: number, b: number) => a + b;');
}

async function makePythonProject(dir: string) {
  await writeFile(join(dir, 'requirements.txt'), 'django>=4.0\nrequests>=2.28\npillow>=9.0\n# comment line');
  await writeFile(join(dir, 'main.py'), 'from django.core.management import execute_from_command_line');
  await writeFile(join(dir, 'utils.py'), 'def helper(): pass');
}

async function makeReactProject(dir: string) {
  await writeFile(join(dir, 'package.json'), JSON.stringify({
    dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
    devDependencies: { typescript: '^5.0.0', vite: '^5.0.0' },
  }));
  const srcDir = join(dir, 'src');
  await mkdir(srcDir);
  await writeFile(join(srcDir, 'index.tsx'), 'import React from "react";');
  await writeFile(join(srcDir, 'App.tsx'), 'export default function App() { return null; }');
}

describe('Language Detection', () => {
  it('detects TypeScript for Node.js Express project', async () => {
    await makeNodeProject(projectDir);
    const result = await analyzeProject(projectDir);
    expect(result.primary_language).toBe('TypeScript');
  });

  it('detects Python for Django project', async () => {
    await makePythonProject(projectDir);
    const result = await analyzeProject(projectDir);
    expect(result.primary_language).toBe('Python');
  });

  it('detects TypeScript for React/TSX project', async () => {
    await makeReactProject(projectDir);
    const result = await analyzeProject(projectDir);
    expect(result.primary_language).toBe('TypeScript');
  });

  it('returns Unknown for empty project', async () => {
    const result = await analyzeProject(projectDir);
    expect(result.primary_language).toBe('Unknown');
  });
});

describe('Framework Detection', () => {
  it('detects Express from package.json', async () => {
    await makeNodeProject(projectDir);
    const result = await analyzeProject(projectDir);
    expect(result.detected_framework).toBe('Express');
  });

  it('detects Django from requirements.txt', async () => {
    await makePythonProject(projectDir);
    const result = await analyzeProject(projectDir);
    expect(result.detected_framework).toBe('Django');
  });

  it('detects React from package.json', async () => {
    await makeReactProject(projectDir);
    const result = await analyzeProject(projectDir);
    expect(result.detected_framework).toBe('React');
  });

  it('returns undefined for no framework', async () => {
    await writeFile(join(projectDir, 'app.ts'), 'console.log("hello");');
    const result = await analyzeProject(projectDir);
    expect(result.detected_framework).toBeUndefined();
  });
});

describe('Entry File Detection', () => {
  it('finds index.ts as entry file', async () => {
    await makeNodeProject(projectDir);
    const result = await analyzeProject(projectDir);
    expect(result.entry_file).toBe('index.ts');
  });

  it('finds main.py as entry file for Python project', async () => {
    await makePythonProject(projectDir);
    const result = await analyzeProject(projectDir);
    expect(result.entry_file).toBe('main.py');
  });

  it('returns undefined when no entry file found', async () => {
    await writeFile(join(projectDir, 'random.ts'), '');
    const result = await analyzeProject(projectDir);
    expect(result.entry_file).toBeUndefined();
  });
});

describe('Dependency Count', () => {
  it('counts all dependencies from package.json', async () => {
    await makeNodeProject(projectDir);
    const result = await analyzeProject(projectDir);
    expect(result.dependency_count).toBe(3);
  });

  it('counts Python deps from requirements.txt (excludes comments)', async () => {
    await makePythonProject(projectDir);
    const result = await analyzeProject(projectDir);
    expect(result.dependency_count).toBe(3);
  });

  it('returns 0 for project with no manifest', async () => {
    await writeFile(join(projectDir, 'main.ts'), '');
    const result = await analyzeProject(projectDir);
    expect(result.dependency_count).toBe(0);
  });
});

describe('Core Files', () => {
  it('core_files is non-empty for a project with source files', async () => {
    await makeNodeProject(projectDir);
    const result = await analyzeProject(projectDir);
    expect(result.core_files.length).toBeGreaterThan(0);
  });

  it('core_files does not exceed 20 files', async () => {
    await makeNodeProject(projectDir);
    for (let i = 0; i < 25; i++) {
      await writeFile(join(projectDir, `file${i}.ts`), `export const x${i} = ${i};`);
    }
    const result = await analyzeProject(projectDir);
    expect(result.core_files.length).toBeLessThanOrEqual(20);
  });

  it('core_files prioritizes package.json and entry files', async () => {
    await makeNodeProject(projectDir);
    for (let i = 0; i < 15; i++) {
      await writeFile(join(projectDir, `extra${i}.ts`), '');
    }
    const result = await analyzeProject(projectDir);
    expect(result.core_files.some(f => f.includes('package.json'))).toBe(true);
    expect(result.core_files.some(f => f.includes('index.ts'))).toBe(true);
  });

  it('skips node_modules in core_files', async () => {
    await makeNodeProject(projectDir);
    const nm = join(projectDir, 'node_modules', 'express');
    await mkdir(nm, { recursive: true });
    await writeFile(join(nm, 'index.js'), '');
    const result = await analyzeProject(projectDir);
    expect(result.core_files.some(f => f.includes('node_modules'))).toBe(false);
  });
});

describe('Tech Stack', () => {
  it('builds tech_stack with language and frameworks', async () => {
    await makeNodeProject(projectDir);
    const result = await analyzeProject(projectDir);
    expect(result.tech_stack.language).toBe('TypeScript');
    expect(result.tech_stack.frameworks).toContain('Express');
  });

  it('detects database service from deps', async () => {
    await makeNodeProject(projectDir, { prisma: '^5.0.0' });
    const result = await analyzeProject(projectDir);
    expect(result.tech_stack.services).toContain('Prisma');
  });

  it('detects REST api from route files', async () => {
    await makeNodeProject(projectDir);
    await mkdir(join(projectDir, 'routes'));
    await writeFile(join(projectDir, 'routes', 'user.ts'), 'router.get("/users", ...)');
    const result = await analyzeProject(projectDir);
    expect(result.tech_stack.apis).toContain('REST');
  });
});
