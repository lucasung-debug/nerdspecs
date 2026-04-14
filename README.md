# NerdSpecs

> Put on nerd glasses and the project becomes visible.

Translate AI-built projects into human-readable explanations. Auto-generate README + landing page that non-developers can actually understand.

## Why NerdSpecs?

You built something cool with AI. But when someone asks "what does it do?" — you freeze. NerdSpecs asks you one question ("why did you build this?"), analyzes your code, and generates documentation in plain language.

## Install

```bash
npx nerdspecs
```

Or install globally:

```bash
npm install -g nerdspecs
```

## Commands

| Command | What it does |
|---------|-------------|
| `nerdspecs write` | Generate README + landing page for your project |
| `nerdspecs read <url>` | Get a plain-language explanation of any GitHub project |
| `nerdspecs think <url>` | Record why you're adopting or skipping a project |
| `nerdspecs status` | Show current NerdSpecs configuration |
| `nerdspecs config` | Manage language, auto-push, and landing page settings |
| `nerdspecs memory` | View or clear stored data |

Running `nerdspecs` with no arguments opens an interactive menu.

## Features

- **One Question Onboarding** — just answer "why did you build this?"
- **Bilingual Output** — English, Korean, or both
- **Multiple LLM Providers** — Claude, OpenAI, or offline mode (no API key needed)
- **Landing Page Generator** — static HTML page ready for GitHub Pages
- **Auto-Push** — hook into git to regenerate docs on push
- **Project Memory** — remembers your answers across sessions

## LLM Setup

NerdSpecs auto-detects your API key from environment variables:

| Provider | Environment Variable |
|----------|---------------------|
| Claude (default) | `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Offline | No key needed (template-based output) |

## How It Works

```
You answer one question
        |
  Code analysis runs
        |
  LLM generates summary
        |
  README.md + index.html
```

1. **Write** — Analyzes your repo (language, tech stack, structure), combines it with your motivation, and generates docs
2. **Read** — Fetches a GitHub repo and explains it like you're not a developer
3. **Think** — Helps you decide whether to adopt, skip, or watch a project

## Tech Stack

- Node.js 18+ (TypeScript, ESM)
- Commander + Inquirer (CLI framework)
- Pluggable LLM abstraction (Claude / OpenAI / Mock)
- mnemo-hook or local JSON storage

## License

MIT
