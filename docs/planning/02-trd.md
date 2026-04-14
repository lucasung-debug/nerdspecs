# 02-trd.md — Technical Requirements Document

## Meta
- Project: NerdSpecs
- Version: 0.1-draft
- Date: 2026-04-13
- Author: DDSMUX Planning Session (T1 Claude Opus)

---

## 1. Architecture Overview

NerdSpecs is a **Claude Code skill + git hook + static site generator** pipeline. It does not run as a server or web application — it runs as a CLI tool invoked by the user or triggered by a git hook.

```
┌─────────────────────────────────────────────────────────────────┐
│                        NerdSpecs System                         │
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐   │
│  │  Git Hook   │───>│  /nerdspecs  │───>│  Landing Page   │   │
│  │ (post-push) │    │  CLI Skill   │    │  (GitHub Pages) │   │
│  └─────────────┘    └──────┬───────┘    └─────────────────┘   │
│                            │                                    │
│                    ┌───────┴────────┐                          │
│                    │                │                          │
│             ┌──────▼──────┐  ┌─────▼──────┐                  │
│             │  Analyzer   │  │  Generator  │                  │
│             │ (read code) │  │ (write docs)│                  │
│             └─────────────┘  └─────────────┘                  │
│                    │                │                          │
│             ┌──────▼──────┐  ┌─────▼──────┐                  │
│             │ mnemo-hook  │  │   Astro /   │                  │
│             │  (memory)   │  │  Plain HTML │                  │
│             └─────────────┘  └─────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### Subsystem Responsibilities

| Subsystem | Responsibility | Implementation |
|-----------|---------------|----------------|
| CLI Skill | Entry point, command routing, user prompts | `/nerdspecs` Claude Code command |
| Analyzer | Read project code, extract structure/purpose | Node.js file scanner + Claude API |
| Generator | Produce README, landing page HTML | Claude API + template engine |
| Git Hook | Auto-trigger on push | bash post-push hook |
| Memory | Store "why" answers, decision records | mnemo-hook integration |
| Hosting | Deploy landing page | GitHub Pages via `gh-pages` branch |

---

## 2. Tech Stack Decisions

### 2.1 Runtime: Node.js

**Decision**: Node.js 20+ LTS

**Rationale**:
- Claude Code skills are JavaScript/Node.js natively
- Cross-platform: Windows, Mac, Linux without modification
- Vast ecosystem for file system operations, GitHub API, HTML generation
- Avoids Python dependency management complexity for non-developers
- npm package distribution is widely understood

**Alternative considered**: Python (rejected — pip/venv complexity for non-developer installation)

### 2.2 CLI Entry Point: Claude Code Skill

**Decision**: Implement as a Claude Code slash command (`/nerdspecs`)

**Rationale**:
- Target users already have Claude Code installed (they are vibe coders)
- Skills provide a natural extension point without separate installation
- Claude API is already authenticated via Claude Code session
- Skills can access local filesystem through Claude Code's permission system

**Skill location**: `~/.claude/skills/nerdspecs/`

**Alternative considered**: Standalone CLI tool (rejected — requires separate installation and auth for Claude API)

### 2.3 Code Analysis: Claude API via Claude Code

**Decision**: Use Claude Code's internal Claude API access to analyze project code

**Rationale**:
- No separate API key management for non-developers
- Claude can understand code structure, purpose, and relationships holistically
- Single model call can analyze multiple files and synthesize
- Avoids brittle AST parsing that fails for non-standard code

**File scanning**: Node.js `fs` module — walk directory tree, filter relevant extensions, read content

**Token management**: Only send representative files (entry points, main modules, config, README if exists) — not entire repo

**File priority order**:
1. `README.md` (existing context)
2. `package.json`, `pyproject.toml`, `Cargo.toml` (dependencies, description)
3. Main entry file (index.js, main.py, app.py, etc.)
4. Config files (`.env.example`, settings files)
5. Core source files (up to 10 largest non-test files)

### 2.4 Documentation Generation: Claude API

**Decision**: Claude API (accessed via Claude Code skill context) generates all prose

**Template approach**: Structured prompts with output format instructions produce consistent README and landing page markup

**Language handling**: Single generation pass produces both English and Korean output when bilingual mode is enabled

### 2.5 Landing Page: Astro (Primary) / Plain HTML (Fallback)

**Decision**: Astro for v0.1, with plain HTML fallback

**Rationale for Astro**:
- Static site generation — no server required
- Component-based templates for consistent visual output
- Built-in GitHub Pages deployment
- Good TypeScript support
- Active ecosystem for image handling

**Rationale for plain HTML fallback**:
- Astro requires Node.js build step
- If Astro build fails (Windows path issues, etc.), pre-compiled plain HTML template is used
- Ensures non-technical users always get a working result

**Hosting**: GitHub Pages (`gh-pages` branch)
- Free
- No additional account required (user already has GitHub)
- Custom domain compatible for future use

### 2.6 Memory: mnemo-hook

**Decision**: Integrate with mnemo-hook for all persistent data storage

**Integration points**:
- F2: Store "why I built this" answer keyed to repo URL + project name
- F9: Store "why I need this project" answers keyed to target repo URL
- Decision records include timestamp, project URL, user reasoning

**Fallback behavior when mnemo-hook is absent**:
- Store in local `.nerdspecs/memory.json` within project directory
- Print warning: "mnemo-hook not found. Using local memory file instead."
- Local file is git-ignored by default (`.nerdspecs/` added to `.gitignore`)

**Memory schema** (see 04-database-design.md for full schema):
```json
{
  "project_url": "https://github.com/user/repo",
  "why_built": "string",
  "recorded_at": "ISO-8601 timestamp",
  "decisions": []
}
```

### 2.7 Git Hook: bash post-push

**Decision**: Standard git post-push hook

**Location**: `.git/hooks/post-push`

**Installation**: `nerdspecs install-hook` command copies hook script and makes it executable

**Hook behavior**:
1. Detect push target branch (only run on `main` or `master`)
2. Call `claude /nerdspecs --auto` (non-interactive mode)
3. Auto-mode skips prompts, uses stored memory answers
4. Commit and push generated documentation if changed

**Windows compatibility**: Hook script uses bash shebang; compatible with Git for Windows bash

### 2.8 Image Generation

**Decision**: Deferred to v0.1 implementation phase; use placeholder initially

**Options under evaluation**:
- Claude MCP image generation tools (if available in Claude Code context)
- Static placeholder images with CSS gradients for initial version
- User-provided screenshot capture via `screenshot-desktop` npm package

---

## 3. Integration Points

### 3.1 mnemo-hook Integration

**Interface**: mnemo-hook exposes a file-based or CLI interface for reading/writing memory entries.

**NerdSpecs calls**:
```bash
# Write a memory entry
mnemo write --key "nerdspecs/project/{repo_slug}/why_built" --value "{user_answer}"

# Read a memory entry
mnemo read --key "nerdspecs/project/{repo_slug}/why_built"

# List all nerdspecs entries
mnemo list --prefix "nerdspecs/"
```

**Fallback**: If `mnemo` binary is not found, use local JSON file at `.nerdspecs/memory.json`

### 3.2 GitHub Pages Deployment

**Method**: Push generated static site to `gh-pages` branch

**Process**:
1. Generate landing page files in temporary directory
2. `git worktree add /tmp/nerdspecs-pages gh-pages`
3. Copy generated files to worktree
4. `git -C /tmp/nerdspecs-pages add -A && git -C /tmp/nerdspecs-pages commit -m "docs: update landing page"`
5. `git -C /tmp/nerdspecs-pages push origin gh-pages`
6. Clean up worktree

**GitHub Pages activation**: User must enable Pages in repository settings (one-time manual step — documented in onboarding)

### 3.3 GitHub API (READ mode — v0.2)

**Purpose**: Fetch repository content for F7 (GitHub URL → explanation)

**Authentication**:
- Public repos: no authentication required
- Private repos: GITHUB_TOKEN environment variable (optional, documented)

**Endpoints used**:
- `GET /repos/{owner}/{repo}` — repository metadata
- `GET /repos/{owner}/{repo}/contents/{path}` — file contents
- `GET /repos/{owner}/{repo}/readme` — README content

**Rate limiting**: 60 requests/hour unauthenticated; 5000/hour authenticated. Analysis pipeline uses 3-10 API calls per repository — unauthenticated is sufficient for normal use.

**Library**: `@octokit/rest` npm package

---

## 4. File Structure

```
~/.claude/skills/nerdspecs/
├── SKILL.md                    # Claude Code skill definition
├── package.json                # npm dependencies
├── index.js                    # Skill entry point
├── src/
│   ├── analyzer.js             # Project code scanner + analyzer
│   ├── generator.js            # README + landing page generator
│   ├── memory.js               # mnemo-hook integration + fallback
│   ├── github.js               # GitHub API client (v0.2)
│   ├── deployer.js             # GitHub Pages deployment
│   └── hook-installer.js       # Git hook installation
├── templates/
│   ├── readme/
│   │   ├── full.md.hbs         # Full README template (Handlebars)
│   │   └── sections/           # Partial templates per section
│   └── landing-page/
│       ├── astro/              # Astro project template
│       └── html/               # Plain HTML fallback template
└── prompts/
    ├── analyze.txt             # Prompt for code analysis
    ├── explain.txt             # Prompt for plain-language explanation
    ├── landing-page.txt        # Prompt for landing page copy
    └── translate-ko.txt        # Prompt for Korean translation
```

---

## 5. Command Interface

### Primary Command
```
/nerdspecs [subcommand] [options]
```

### Subcommands

```
/nerdspecs write          # Analyze current project, generate README + landing page
/nerdspecs read <url>     # Translate GitHub URL to plain-language explanation (v0.2)
/nerdspecs think          # Interactive "why do you need this?" session (v0.2)
/nerdspecs install-hook   # Install git post-push hook in current repo
/nerdspecs memory show    # Display stored answers for current project
/nerdspecs memory clear   # Clear stored answers for current project
/nerdspecs status         # Show NerdSpecs configuration and mnemo-hook status
```

### Flags
```
--auto          # Non-interactive mode (use stored answers, skip prompts)
--lang=ko       # Force Korean output
--lang=en       # Force English output
--lang=both     # Generate both languages (default)
--no-pages      # Skip GitHub Pages deployment
--no-hook       # Skip hook installation check
--dry-run       # Preview output without writing files
```

---

## 6. Performance Requirements

| Operation | Target | Acceptable Maximum |
|-----------|--------|--------------------|
| Code analysis (< 50 files) | < 30s | 60s |
| README generation | < 15s | 30s |
| Landing page generation | < 20s | 45s |
| GitHub Pages deployment | < 60s | 120s |
| GitHub URL analysis (v0.2) | < 45s | 90s |
| Total end-to-end (write) | < 3 min | 5 min |

These targets are for user experience — slow generation breaks the "automatic" feel.

---

## 7. Error Handling

### Graceful Degradation Hierarchy

1. **mnemo-hook absent** → use local `.nerdspecs/memory.json`
2. **GitHub Pages not enabled** → generate files locally, provide setup instructions
3. **Image generation fails** → use CSS gradient placeholder
4. **Astro build fails** → fall back to plain HTML template
5. **GitHub API rate limit** → cache fetched content, display rate limit message
6. **Claude API timeout** → retry once, then save partial output with TODO markers

### Error Messages
All error messages must be:
- In the user's preferred language (Korean or English)
- Non-technical: describe what happened and what to do next
- Actionable: include the exact next step

Example:
```
Something went wrong when creating your landing page.
What happened: The Astro build tool couldn't find a required file.
What to do: Run `/nerdspecs write --html-only` to use the simpler template instead.
```

---

## 8. Security Considerations

- **No secrets in generated documentation**: Analyzer explicitly skips `.env`, `*.key`, `*.pem`, credential files
- **GitHub token handling**: If GITHUB_TOKEN is set, never include it in logs or generated files
- **Local execution only**: All code analysis runs locally — no code is sent to external services except Claude API (which is covered by existing Claude Code data handling)
- **Generated files are readable by default**: Users should review before pushing, especially if project has sensitive configuration

---

## 9. Deployment and Installation

### For the Skill Itself
```bash
# Install NerdSpecs skill (once NerdSpecs is published)
/skills install nerdspecs

# Or manual installation
git clone https://github.com/lucasung-debug/nerdspecs ~/.claude/skills/nerdspecs
cd ~/.claude/skills/nerdspecs && npm install
```

### For Each Project Using NerdSpecs
```bash
# In the project directory
/nerdspecs install-hook
# This installs the git post-push hook and creates .nerdspecs/ config directory
```

### Prerequisites
- Claude Code CLI installed
- Node.js 20+ installed
- Git installed
- GitHub account (for Pages deployment)
- mnemo-hook installed (optional but recommended)

---

## 10. Dependencies

### Runtime Dependencies
```json
{
  "@octokit/rest": "^21.0.0",
  "handlebars": "^4.7.8",
  "glob": "^11.0.0",
  "chalk": "^5.3.0",
  "inquirer": "^9.2.0"
}
```

### Dev Dependencies
```json
{
  "jest": "^29.0.0",
  "eslint": "^9.0.0"
}
```

### Peer Dependencies (must be installed separately)
- `astro` (optional, for landing page generation)
- `mnemo-hook` CLI (optional, for memory features)

## Implementation Notes (v0.1)

- Astro → plain HTML with inline CSS/JS (simpler, zero dependencies)
- @octokit/rest → native `fetch()` (lighter, no extra dependency)
- handlebars → template literals (TypeScript native)
- jest → vitest (faster, ESM-native)
- mnemo-hook → `LocalFileAdapter` (mnemo-hook not yet published)
