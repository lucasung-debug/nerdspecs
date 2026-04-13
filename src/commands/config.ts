import { Command } from 'commander';
import { formatStatusRow } from '../components/index.js';
import { wrapCommand } from '../errors.js';
import { createStorageAdapter } from '../storage/auto-detect.js';
import { installPostPushHook } from './hooks.js';
import { getConfig, setConfig, type ProjectConfig } from '../resources/project-config.js';
import type { StorageAdapter } from '../storage/adapter.js';
import { resolveCurrentRepoSlug } from './helpers.js';

interface ConfigOptions {
  language?: string;
  autoPush?: string;
  landing?: string;
  installHook?: boolean;
}

function parseLanguage(value?: string): ProjectConfig['language'] | undefined {
  if (!value) return undefined;
  if (value === 'en' || value === 'ko' || value === 'both') return value;
  throw new Error('Invalid --language value. Use en, ko, or both.');
}

function parseBoolean(value: string | undefined, flag: string): boolean | undefined {
  if (!value) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`Invalid ${flag} value. Use true or false.`);
}

function printConfig(config: ProjectConfig): void {
  console.log(formatStatusRow('language', config.language));
  console.log(formatStatusRow('auto_push', config.auto_push));
  console.log(formatStatusRow('landing_page_enabled', config.landing_page_enabled));
  console.log(formatStatusRow('landing_page_url', config.landing_page_url ?? null));
  console.log(formatStatusRow('hook_installed', config.hook_installed));
  console.log(formatStatusRow('hook_installed_at', config.hook_installed_at ?? null));
  console.log(formatStatusRow('readme_sections', Object.entries(config.readme_sections).filter(([, enabled]) => enabled).map(([name]) => name).join(', ')));
}

function definedConfigUpdates(
  options: ConfigOptions,
): Partial<Omit<ProjectConfig, 'created_at' | 'updated_at'>> {
  return Object.fromEntries(
    Object.entries({
      language: parseLanguage(options.language),
      auto_push: parseBoolean(options.autoPush, '--auto-push'),
      landing_page_enabled: parseBoolean(options.landing, '--landing'),
    }).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<ProjectConfig, 'created_at' | 'updated_at'>>;
}

async function applyConfigChanges(
  storage: StorageAdapter,
  slug: string,
  options: ConfigOptions,
  projectDir: string,
): Promise<ProjectConfig> {
  const base = options.installHook
    ? await installPostPushHook(storage, slug, projectDir)
    : await getConfig(storage, slug);
  const updates = definedConfigUpdates(options);
  if (Object.keys(updates).length === 0) return base;
  return setConfig(storage, slug, updates);
}

export async function runConfigCommand(
  storage: StorageAdapter,
  options: ConfigOptions,
  slug?: string,
  projectDir: string = process.cwd(),
): Promise<ProjectConfig> {
  const currentSlug = slug ?? await resolveCurrentRepoSlug();
  const config = await applyConfigChanges(storage, currentSlug, options, projectDir);
  printConfig(config);
  if (options.installHook) console.log('Installed post-push hook: npx nerdspecs write --auto');
  console.log('Examples: nerdspecs config --language=ko | nerdspecs config --auto-push=false --landing=true');
  return config;
}

export async function runConfigCli(options: ConfigOptions): Promise<void> {
  await runConfigCommand(await createStorageAdapter(), options);
}

export function registerConfigCommand(program: Command): void {
  program
    .command('config')
    .description('View and edit NerdSpecs configuration')
    .option('--language <value>', 'en | ko | both')
    .option('--auto-push <value>', 'true | false')
    .option('--landing <value>', 'true | false')
    .option('--install-hook', 'Install the post-push git hook')
    .action(wrapCommand(async (options) => {
      await runConfigCli({
        language: options.language as string | undefined,
        autoPush: options.autoPush as string | undefined,
        landing: options.landing as string | undefined,
        installHook: Boolean(options.installHook),
      });
    }));
}
