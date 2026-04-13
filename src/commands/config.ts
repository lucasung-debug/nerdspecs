import { Command } from 'commander';
import { basename } from 'node:path';
import { formatStatusRow } from '../components/index.js';
import { deriveRepoSlug, getConfig, setConfig, type ProjectConfig } from '../resources/project-config.js';
import type { StorageAdapter } from '../storage/adapter.js';
import { LocalFileAdapter } from '../storage/local-file-adapter.js';

interface ConfigOptions {
  language?: string;
  autoPush?: string;
  landing?: string;
}

async function repoSlug(): Promise<string> {
  try { return await deriveRepoSlug(); } catch { return basename(process.cwd()); }
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
  console.log(formatStatusRow('readme_sections', Object.entries(config.readme_sections).filter(([, enabled]) => enabled).map(([name]) => name).join(', ')));
}

export async function runConfigCommand(
  storage: StorageAdapter,
  options: ConfigOptions,
  slug?: string,
): Promise<ProjectConfig> {
  const currentSlug = slug ?? await repoSlug();
  const updates = {
    language: parseLanguage(options.language),
    auto_push: parseBoolean(options.autoPush, '--auto-push'),
    landing_page_enabled: parseBoolean(options.landing, '--landing'),
  };
  const config = Object.values(updates).some((value) => value !== undefined) ? await setConfig(storage, currentSlug, updates) : await getConfig(storage, currentSlug);
  printConfig(config);
  console.log('Examples: nerdspecs config --language=ko | nerdspecs config --auto-push=false --landing=true');
  return config;
}

export function registerConfigCommand(program: Command): void {
  program
    .command('config')
    .description('View and edit NerdSpecs configuration')
    .option('--language <value>', 'en | ko | both')
    .option('--auto-push <value>', 'true | false')
    .option('--landing <value>', 'true | false')
    .action(async (options) => {
      try {
        await runConfigCommand(new LocalFileAdapter(), {
          language: options.language as string | undefined,
          autoPush: options.autoPush as string | undefined,
          landing: options.landing as string | undefined,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`NerdSpecs error: ${message}`);
        process.exit(1);
      }
    });
}
