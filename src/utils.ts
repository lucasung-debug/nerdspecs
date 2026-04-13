import { existsSync, realpathSync } from 'node:fs';
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path';

export function nowIso(): string {
  return new Date().toISOString();
}

function realpathAllowMissing(path: string): string {
  const resolved = resolve(path);
  if (existsSync(resolved)) return realpathSync(resolved);

  const parent = dirname(resolved);
  if (parent === resolved) return resolved;

  const resolvedParent = realpathAllowMissing(parent);
  return resolve(resolvedParent, basename(resolved));
}

export function validatePath(base: string, target: string): string {
  const resolvedBase = realpathAllowMissing(base);
  const resolvedTarget = realpathAllowMissing(resolve(base, target));
  const rel = relative(resolvedBase, resolvedTarget);

  if (rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))) {
    return resolvedTarget;
  }

  throw new Error('Path traversal detected');
}
