import { isAbsolute, relative, resolve } from 'node:path';

export function nowIso(): string {
  return new Date().toISOString();
}

export function validatePath(base: string, target: string): string {
  const resolvedBase = resolve(base);
  const resolvedTarget = resolve(resolvedBase, target);
  const rel = relative(resolvedBase, resolvedTarget);

  if (rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))) {
    return resolvedTarget;
  }

  throw new Error('Path traversal detected');
}
