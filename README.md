# NerdSpecs

> Put on nerd glasses and the project becomes visible.

NerdSpecs is an MCP server that turns your AI-built project into human-readable documentation. Works with **any AI CLI** — Claude Code, Gemini CLI, Codex, OpenCode, Qwen Code, Cursor, VS Code, and more.

**Zero API keys. Zero config. Just add it and say "make a README for this project."**

**[Live Demo](https://lucasung-debug.github.io/nerdspecs/)** · **[npm](https://www.npmjs.com/package/nerdspecs)**

## Quick Start

Add NerdSpecs to your AI CLI config, then ask it to generate docs.

### Claude Code / Gemini CLI / Qwen Code / Cursor

Add to your config file (`.mcp.json`, `~/.gemini/settings.json`, etc.):

```json
{
  "mcpServers": {
    "nerdspecs": {
      "command": "npx",
      "args": ["-y", "nerdspecs"]
    }
  }
}
```

### OpenAI Codex CLI

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.nerdspecs]
command = "npx"
args = ["-y", "nerdspecs"]
```

### VS Code (GitHub Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "nerdspecs": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "nerdspecs"]
    }
  }
}
```

Then just say:

> "Analyze this project and generate a README and landing page."

## MCP Tools

NerdSpecs provides 8 tools that your AI assistant can use:

| Tool | What it does |
|------|-------------|
| `analyze_project` | Scan project files — detect language, framework, dependencies |
| `generate_readme` | Generate README.md with bilingual support (EN/KO/ZH) |
| `generate_landing_page` | Generate dark-themed landing page with terminal demo |
| `fetch_repo_metadata` | Fetch GitHub repo info for the AI to explain |
| `save_decision` | Record adopt/skip/watch decisions for projects |
| `get_project_status` | Check current config and stored motivation |
| `auto_commit_and_push` | Commit and push docs in one step (for non-developers) |
| `suggest_next_steps` | Analyze project state and suggest what to do next |

## How It Works

```
Your AI CLI (Claude/Gemini/Codex/etc.)
        |
  NerdSpecs analyzes your code
        |
  AI writes the summary
        |
  NerdSpecs renders templates
        |
  README.md + Landing Page
```

The key difference: **your AI CLI IS the LLM**. NerdSpecs doesn't call any AI API — it provides code analysis and template rendering. Your CLI generates the summaries using its own intelligence.

## Features

- **Works with any MCP-compatible CLI** — Claude Code, Gemini, Codex, OpenCode, Qwen Code, Cursor, VS Code
- **Zero API keys required** — your CLI already has authentication
- **Trilingual** — English, Korean, Chinese (EN/KO/ZH)
- **Dark-themed landing page** — terminal demo, before/after comparison, feature cards
- **Image slots** — `hero_image_url` and `screenshots` for Gemini MCP / Pencil / design tools
- **Non-developer friendly** — "push this for me" auto-commits and pushes
- **Smart suggestions** — tells you what to do next (missing README? uncommitted changes?)
- **Project memory** — remembers your answers across sessions

## Image Integration

NerdSpecs doesn't generate images — it provides slots that other tools can fill:

```
Your AI decides:
  ├─ Gemini MCP available → generate hero image → hero_image_url
  ├─ Pencil MCP available → design screenshots → screenshots[]
  ├─ Design skill available → create visuals → pass URLs
  └─ Nothing available → NerdSpecs terminal demo UI (default)
```

## Standalone CLI

NerdSpecs also works as a standalone CLI tool:

```bash
npx nerdspecs
```

| Command | What it does |
|---------|-------------|
| `nerdspecs write` | Generate README + landing page (requires API key) |
| `nerdspecs read <url>` | Explain any GitHub project |
| `nerdspecs think <url>` | Record project adoption decisions |
| `nerdspecs status` | Show configuration |
| `nerdspecs config` | Manage settings |
| `nerdspecs memory` | View or clear stored data |

<details><summary>Tech Stack</summary>

- **Runtime**: Node.js 18+ (TypeScript, ESM)
- **MCP**: @modelcontextprotocol/sdk + zod
- **CLI**: Commander + Inquirer + Chalk + Ora
- **Templates**: README (Markdown) + Landing Page (HTML)
- **Storage**: Local JSON (`.nerdspecs/memory.json`)

</details>

## Compatibility Matrix

| CLI Tool | Config File | Format |
|----------|------------|--------|
| Claude Code | `.mcp.json` or `~/.claude.json` | JSON (`mcpServers`) |
| Gemini CLI | `~/.gemini/settings.json` | JSON (`mcpServers`) |
| Qwen Code | `~/.qwen/settings.json` | JSON (`mcpServers`) |
| Cursor | `~/.cursor/mcp.json` | JSON (`mcpServers`) |
| OpenCode | `opencode.json` | JSON (`mcp`) |
| Codex CLI | `~/.codex/config.toml` | TOML (`[mcp_servers]`) |
| VS Code | `.vscode/mcp.json` | JSON (`servers`) |
| Continue | `.continue/mcpServers/*.json` | JSON (`mcpServers`) |
| Cline | VS Code globalStorage | JSON (`mcpServers`) |

## License

MIT

---

<div align="center">
  <pre>
   ╭─────╮ ╭─────╮
   │ ●   │─│   ● │
   ╰─────╯ ╰─────╯
  </pre>
  <sub>Made with <a href="https://www.npmjs.com/package/nerdspecs">NerdSpecs</a> — Put on nerd glasses and the project becomes visible.</sub>
</div>

<!-- Generated by NerdSpecs -->
