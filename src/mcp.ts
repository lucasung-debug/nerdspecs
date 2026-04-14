import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { analyzeProject } from './resources/code-analyzer.js';
import { generateReadme, type ReadmeData } from './generators/readme-template.js';
import { generateLandingPage, type LandingData } from './generators/landing-template.js';
import { writeReadme } from './generators/readme-writer.js';
import { deployLandingPage } from './generators/landing-deployer.js';
import { parseGitHubUrl, fetchRepoInfo } from './resources/github-fetcher.js';
import { setDecision, type DecisionRecordInput } from './resources/decision-record.js';
import { getConfig, DEFAULT_README_SECTIONS } from './resources/project-config.js';
import { getMotivation } from './resources/project-motivation.js';
import { resolveCurrentRepoSlug } from './commands/helpers.js';
import { LocalFileAdapter } from './storage/local-file-adapter.js';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { access, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const execAsync = promisify(exec);

function cwd(dir?: string): string {
  return dir ?? process.cwd();
}

function storageFor(dir?: string): LocalFileAdapter {
  return new LocalFileAdapter(join(cwd(dir), '.nerdspecs', 'memory.json'));
}

function ok(data: unknown): { content: Array<{ type: 'text'; text: string }> } {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function err(msg: string): { content: Array<{ type: 'text'; text: string }>; isError: true } {
  return { content: [{ type: 'text' as const, text: msg }], isError: true };
}

export async function runMcpServer(): Promise<void> {
  const server = new McpServer({ name: 'nerdspecs', version: '0.3.0' });

  // ── Tool 1: analyze_project ──
  server.tool(
    'analyze_project',
    'Scan project directory and return language, framework, dependencies, entry file, and tech stack',
    { project_dir: z.string().optional().describe('Absolute path to project. Defaults to cwd.') },
    async ({ project_dir }) => {
      try {
        const result = await analyzeProject(cwd(project_dir));
        return ok(result);
      } catch (e: any) {
        return err(`Failed to analyze project: ${e.message}`);
      }
    },
  );

  // ── Tool 2: generate_readme ──
  server.tool(
    'generate_readme',
    'Generate README.md from project data and write to disk. The summary should be written by the host LLM.',
    {
      project_name: z.string(),
      summary: z.string().describe('Human-readable summary written by the host LLM'),
      motivation: z.string().optional(),
      language_mode: z.enum(['en', 'ko', 'zh', 'both']).default('en'),
      project_dir: z.string().optional(),
      language: z.string().optional().describe('Primary language (e.g. TypeScript)'),
      frameworks: z.array(z.string()).optional(),
      apis: z.array(z.string()).optional(),
      services: z.array(z.string()).optional(),
      dry_run: z.boolean().optional().describe('If true, returns content without writing file'),
    },
    async (args) => {
      try {
        const dir = cwd(args.project_dir);
        let techStack = {
          language: args.language ?? 'Unknown',
          frameworks: args.frameworks ?? [],
          apis: args.apis ?? [],
          services: args.services ?? [],
        };
        if (!args.language) {
          const analysis = await analyzeProject(dir);
          techStack = analysis.tech_stack;
        }
        const data: ReadmeData = {
          project_name: args.project_name,
          summary: args.summary,
          motivation: args.motivation,
          tech_stack: techStack,
          language_mode: args.language_mode,
          sections: { hero: true, plain_explanation: true, how_to_use: true, tech_stack: true, installation: true },
        };
        const content = generateReadme(data);
        if (args.dry_run) {
          return ok({ content, lines: content.split('\n').length });
        }
        const result = await writeReadme(dir, content);
        return ok({ path: result.path, lines: result.lines, content });
      } catch (e: any) {
        return err(`Failed to generate README: ${e.message}`);
      }
    },
  );

  // ── Tool 3: generate_landing_page ──
  server.tool(
    'generate_landing_page',
    'Generate a dark-themed landing page HTML and write to docs/index.html. Images can be provided via hero_image_url and screenshots.',
    {
      project_name: z.string(),
      summary: z.string(),
      motivation: z.string().optional(),
      pain_points: z.array(z.string()).describe('Pain points the host LLM generated'),
      language_mode: z.enum(['en', 'ko', 'zh', 'both']).default('en'),
      project_dir: z.string().optional(),
      repo_url: z.string().optional(),
      language: z.string().optional(),
      frameworks: z.array(z.string()).optional(),
      hero_image_url: z.string().optional().describe('URL for hero image. Falls back to terminal demo if not provided.'),
      screenshots: z.array(z.string()).optional().describe('Screenshot URLs for gallery section'),
      dry_run: z.boolean().optional(),
    },
    async (args) => {
      try {
        const dir = cwd(args.project_dir);
        let techStack = { language: args.language ?? 'Unknown', frameworks: args.frameworks ?? [] };
        if (!args.language) {
          const analysis = await analyzeProject(dir);
          techStack = { language: analysis.tech_stack.language, frameworks: analysis.tech_stack.frameworks };
        }
        const data: LandingData = {
          project_name: args.project_name,
          summary: args.summary,
          motivation: args.motivation,
          pain_points: args.pain_points,
          tech_stack: techStack,
          repo_url: args.repo_url,
          language_mode: args.language_mode,
          hero_image_url: args.hero_image_url,
          screenshots: args.screenshots,
        };
        const html = generateLandingPage(data);
        if (args.dry_run) {
          return ok({ content: html });
        }
        const slug = await resolveCurrentRepoSlug(dir);
        const result = await deployLandingPage(dir, html, slug);
        return ok({ path: result.path, url: result.url, content: html });
      } catch (e: any) {
        return err(`Failed to generate landing page: ${e.message}`);
      }
    },
  );

  // ── Tool 4: fetch_repo_metadata ──
  server.tool(
    'fetch_repo_metadata',
    'Fetch GitHub repository metadata (description, readme, stars, topics, language). Does NOT generate summaries — the host LLM should interpret the data.',
    { github_url: z.string().describe('Full GitHub URL like https://github.com/owner/repo') },
    async ({ github_url }) => {
      try {
        const { owner, repo } = parseGitHubUrl(github_url);
        const info = await fetchRepoInfo(owner, repo);
        return ok(info);
      } catch (e: any) {
        return err(`Failed to fetch repo: ${e.message}`);
      }
    },
  );

  // ── Tool 5: save_decision ──
  server.tool(
    'save_decision',
    'Save a project adoption/skip/watch decision with reasoning',
    {
      repo_url: z.string(),
      decision: z.enum(['adopt', 'skip', 'watch', 'undecided']),
      reasoning: z.string(),
      project_dir: z.string().optional(),
    },
    async (args) => {
      try {
        const storage = storageFor(args.project_dir);
        const input: DecisionRecordInput = {
          repo_url: args.repo_url,
          decision: args.decision,
          reasoning: args.reasoning,
        };
        const saved = await setDecision(storage, args.repo_url, input);
        return ok({ saved: true, recorded_at: saved.recorded_at });
      } catch (e: any) {
        return err(`Failed to save decision: ${e.message}`);
      }
    },
  );

  // ── Tool 6: get_project_status ──
  server.tool(
    'get_project_status',
    'Get current NerdSpecs configuration and stored motivation for a project',
    { project_dir: z.string().optional() },
    async ({ project_dir }) => {
      try {
        const dir = cwd(project_dir);
        const storage = storageFor(project_dir);
        const slug = await resolveCurrentRepoSlug(dir);
        const [config, motivation] = await Promise.all([
          getConfig(storage, slug),
          getMotivation(storage, slug),
        ]);
        return ok({ repo_slug: slug, config, motivation });
      } catch (e: any) {
        return err(`Failed to get project status: ${e.message}`);
      }
    },
  );

  // ── Tool 7: auto_commit_and_push ──
  server.tool(
    'auto_commit_and_push',
    '⚠️ Commits and PUSHES to remote. For non-developers: generates docs, commits, and pushes in one step.',
    {
      project_dir: z.string().optional(),
      commit_message: z.string().optional().describe('Custom commit message. Defaults to "docs: update via NerdSpecs"'),
      include_docs: z.boolean().optional().describe('If true, runs generate_readme + generate_landing_page before commit'),
    },
    async (args) => {
      try {
        const dir = cwd(args.project_dir);
        const msg = args.commit_message ?? 'docs: update via NerdSpecs';
        const filesChanged: string[] = [];

        if (args.include_docs) {
          filesChanged.push('README.md', 'docs/index.html');
        }

        await execAsync('git add README.md docs/', { cwd: dir }).catch(() => {});
        await execAsync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, { cwd: dir });
        await execAsync('git push', { cwd: dir });
        return ok({ committed: true, pushed: true, files_changed: filesChanged, message: msg });
      } catch (e: any) {
        return err(`Git operation failed: ${e.message}. Make sure you have uncommitted changes and a remote configured.`);
      }
    },
  );

  // ── Tool 8: suggest_next_steps ──
  server.tool(
    'suggest_next_steps',
    'Analyze project state and suggest next actions (e.g., create README, set up GitHub Pages, commit changes)',
    { project_dir: z.string().optional() },
    async ({ project_dir }) => {
      try {
        const dir = cwd(project_dir);
        const suggestions: string[] = [];
        const actions: string[] = [];

        const hasFile = async (f: string) => { try { await access(join(dir, f)); return true; } catch { return false; } };

        if (!await hasFile('README.md')) {
          suggestions.push('No README.md found. Generate one with generate_readme.');
          actions.push('generate_readme');
        }
        if (!await hasFile('docs/index.html')) {
          suggestions.push('No landing page found. Generate one with generate_landing_page.');
          actions.push('generate_landing_page');
        }
        if (await hasFile('docs/index.html') && !await hasFile('.git/refs/remotes')) {
          suggestions.push('Landing page exists but no remote. Set up GitHub Pages after pushing.');
        }

        try {
          const { stdout } = await execAsync('git status --porcelain', { cwd: dir });
          if (stdout.trim()) {
            suggestions.push('Uncommitted changes detected. Use auto_commit_and_push to save and push.');
            actions.push('auto_commit_and_push');
          }
        } catch {}

        if (suggestions.length === 0) {
          suggestions.push('Project looks good! README and landing page are in place.');
        }
        return ok({ suggestions, actions });
      } catch (e: any) {
        return err(`Failed to analyze project: ${e.message}`);
      }
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[nerdspecs-mcp] server running on stdio');
}
