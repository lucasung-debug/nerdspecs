# 07-coding-convention.md — Coding Conventions

## Meta
- Project: NerdSpecs
- Version: 0.1-draft
- Date: 2026-04-13
- Author: DDSMUX Planning Session (T1 Claude Opus)

---

## 1. Language and Runtime

- **Language**: JavaScript (ES2022+) — no TypeScript in v0.1 (adds tooling complexity for a CLI skill)
- **Runtime**: Node.js 20+ LTS
- **Module system**: ES Modules (`import`/`export`) — NOT CommonJS (`require`/`module.exports`)
- **Package manager**: npm (not pnpm or yarn — simpler for non-developer contributors)

---

## 2. File Naming Conventions

### Source Files

| Pattern | Usage | Example |
|---------|-------|---------|
| `kebab-case.js` | All source modules | `project-analyzer.js` |
| `index.js` | Module entry point | `src/index.js` |
| `*.test.js` | Unit tests | `project-analyzer.test.js` |
| `*.prompt.txt` | Claude prompt templates | `analyze.prompt.txt` |
| `*.hbs` | Handlebars templates | `readme-full.hbs` |

### Directory Names

All directory names use `kebab-case`:
```
src/
templates/
  readme/
  landing-page/
    astro/
    html/
prompts/
tests/
```

### Configuration Files

- `package.json` — npm config (root level)
- `SKILL.md` — Claude Code skill definition (root level, uppercase per convention)
- `.nerdspecsrc` — user-level NerdSpecs config (in user home directory)

---

## 3. Code Style

### 3.1 Formatting

- **Indentation**: 2 spaces (no tabs)
- **Line endings**: LF (`\n`) — cross-platform consistency
- **Max line length**: 100 characters (soft limit — readability over strict enforcement)
- **Trailing commas**: Yes, in multi-line arrays and objects (cleaner diffs)
- **Semicolons**: No — use ASI (automatic semicolon insertion)
- **Quotes**: Single quotes for strings, except when string contains single quote

```javascript
// Good
const name = 'NerdSpecs'
const message = "It's working"

// Bad
const name = "NerdSpecs";
const message = 'It\'s working';
```

### 3.2 Variable and Function Naming

| Context | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `repoSlug`, `whyBuilt` |
| Constants (module-level) | UPPER_SNAKE_CASE | `DEFAULT_LANG`, `MAX_FILES` |
| Functions | camelCase, verb-first | `analyzeProject()`, `generateReadme()` |
| Classes | PascalCase | `ProjectAnalyzer`, `MemoryStore` |
| Files | kebab-case | `project-analyzer.js` |
| Environment variables | UPPER_SNAKE_CASE | `GITHUB_TOKEN`, `NERDSPECS_LANG` |

### 3.3 Function Length

Functions should do one thing. **Maximum 20 lines per function** (excluding comments and blank lines).

If a function exceeds 20 lines, extract sub-functions with descriptive names.

```javascript
// Too long — split this
async function generateDocumentation(projectPath) {
  // 50 lines of mixed concerns
}

// Better — each function has one job
async function generateDocumentation(projectPath) {
  const analysis = await analyzeProject(projectPath)
  const motivation = await loadMotivation(projectPath)
  const readme = await generateReadme(analysis, motivation)
  const landingPage = await generateLandingPage(analysis, motivation)
  return { readme, landingPage }
}
```

### 3.4 Async/Await

All asynchronous operations use `async`/`await`. No raw Promise chains (`.then().catch()`).

```javascript
// Good
async function fetchRepoInfo(url) {
  try {
    const response = await octokit.repos.get({ owner, repo })
    return response.data
  } catch (error) {
    throw new NerdSpecsError('ERR_GITHUB_FETCH', error.message)
  }
}

// Bad
function fetchRepoInfo(url) {
  return octokit.repos.get({ owner, repo })
    .then(response => response.data)
    .catch(error => { throw error })
}
```

### 3.5 Error Handling

All errors are wrapped in a `NerdSpecsError` class with:
- `code`: machine-readable error code (e.g., `ERR_PAGES_PUSH_FAILED`)
- `message`: user-facing message in plain language
- `cause`: original error (for debugging)

```javascript
class NerdSpecsError extends Error {
  constructor(code, userMessage, cause = null) {
    super(userMessage)
    this.code = code
    this.cause = cause
  }
}
```

Error codes follow the pattern `ERR_COMPONENT_ACTION`:

| Code | Meaning |
|------|---------|
| `ERR_GITHUB_FETCH` | Failed to fetch from GitHub API |
| `ERR_PAGES_PUSH_FAILED` | GitHub Pages deployment failed |
| `ERR_MNEMO_NOT_FOUND` | mnemo-hook CLI not found |
| `ERR_ANALYSIS_TIMEOUT` | Code analysis timed out |
| `ERR_NO_GIT_REMOTE` | Project has no git remote configured |
| `ERR_ASTRO_BUILD` | Astro build failed |

---

## 4. Module Structure

### 4.1 Module Boundaries

Each module has a single responsibility:

```
src/
├── analyzer.js          # Reads project files, sends to Claude, returns structured analysis
├── generator.js         # Takes analysis + motivation, returns README + landing page content
├── memory.js            # Reads/writes to mnemo-hook or fallback file
├── github.js            # GitHub API client (v0.2)
├── deployer.js          # Pushes landing page to GitHub Pages
├── hook-installer.js    # Installs/removes git post-push hook
├── config.js            # Reads/writes .nerdspecs config
├── prompts.js           # Loads prompt template files
├── output.js            # All terminal output formatting (no console.log outside this module)
└── errors.js            # NerdSpecsError class + error code constants
```

### 4.2 Module Interface Pattern

Each module exports a small, clean API. Internal helpers are not exported.

```javascript
// analyzer.js — exported interface
export async function analyzeProject(projectPath) { ... }
export async function getRepoSlug(projectPath) { ... }

// Internal helpers — NOT exported
async function readProjectFiles(projectPath) { ... }
async function filterRelevantFiles(files) { ... }
function detectLanguage(files) { ... }
```

### 4.3 No Global State

Modules do not maintain global mutable state. All state is passed as function arguments or returned as values.

```javascript
// Bad — global state
let currentProject = null

export function setProject(path) {
  currentProject = path
}

// Good — explicit argument
export async function analyzeProject(projectPath) {
  // projectPath is passed in, no global dependency
}
```

---

## 5. Template Conventions

### 5.1 Handlebars Templates

README templates use Handlebars syntax:

```handlebars
{{!-- readme-full.hbs --}}
<div align="center">
  <h1>{{project.displayName}}</h1>
  <p><em>{{project.summary}}</em></p>
  {{#if config.landingPageUrl}}
  <a href="{{config.landingPageUrl}}">View Landing Page</a>
  {{/if}}
</div>

## What is this?

{{explanation.en}}

{{#if explanation.ko}}
{{explanation.ko}}
{{/if}}
```

**Template variables** use `camelCase` dot notation.

### 5.2 Prompt Templates

Claude prompt files use plain text with `{{VARIABLE}}` placeholders (uppercase, double curly):

```
prompts/analyze.prompt.txt:

Analyze the following project files and answer:
1. What does this project do? (one sentence, plain language)
2. Who is it for? (describe the type of person)
3. What are the main components?

Project motivation (from the developer):
{{WHY_BUILT}}

Files:
{{FILE_CONTENTS}}

Respond in JSON format: { summary, audience, components, techStack }
```

---

## 6. Testing Conventions

### 6.1 Test File Location

Test files live alongside source files:

```
src/
├── analyzer.js
├── analyzer.test.js
├── generator.js
└── generator.test.js
```

### 6.2 Test Naming

```javascript
// Pattern: describe('moduleName', () => { it('does what', ...) })
describe('analyzer', () => {
  it('returns project summary from package.json description', async () => { ... })
  it('falls back to directory name when no description exists', async () => { ... })
  it('skips .env and credential files during scan', async () => { ... })
})
```

### 6.3 Mocking External Services

All external services (GitHub API, mnemo-hook, Claude API) are mocked in tests. Tests do not make real network calls.

```javascript
// Mock mnemo-hook
jest.mock('../src/memory.js', () => ({
  loadMotivation: jest.fn().mockResolvedValue({ answer: 'test motivation' }),
  saveMotivation: jest.fn().mockResolvedValue(true),
}))
```

### 6.4 Test Coverage Targets

| Module | Target Coverage |
|--------|----------------|
| `analyzer.js` | 80%+ |
| `generator.js` | 70%+ |
| `memory.js` | 90%+ (critical path) |
| `deployer.js` | 60%+ (heavy mocking) |
| `output.js` | 50%+ (visual output) |

---

## 7. Documentation Conventions

### 7.1 JSDoc Comments

All exported functions have JSDoc comments:

```javascript
/**
 * Analyzes a local project directory and returns structured metadata.
 *
 * @param {string} projectPath - Absolute path to the project directory
 * @returns {Promise<ProjectAnalysis>} Structured analysis result
 * @throws {NerdSpecsError} ERR_ANALYSIS_TIMEOUT if analysis takes > 60 seconds
 */
export async function analyzeProject(projectPath) { ... }
```

### 7.2 Inline Comments

Comments explain WHY, not WHAT:

```javascript
// Good — explains why
// GitHub API returns file contents base64-encoded; decode before passing to Claude
const content = Buffer.from(file.content, 'base64').toString('utf-8')

// Bad — explains what (obvious from code)
// Decode base64 content
const content = Buffer.from(file.content, 'base64').toString('utf-8')
```

---

## 8. Git Conventions

### Commit Message Format

```
type: short description (max 72 chars)

Optional longer description if needed.
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**Examples**:
```
feat: add Korean translation to README generator
fix: handle missing package.json gracefully
docs: add analyzer module JSDoc
test: add memory fallback tests for mnemo-hook absent
```

### Branch Naming

```
feature/analyzer-v2
fix/github-api-rate-limit
docs/update-readme-template
```

---

## 9. Security Conventions

### 9.1 File Scanning Safety

The analyzer MUST skip these files even if present in the project:

```javascript
const SKIP_PATTERNS = [
  '.env',
  '.env.*',
  '*.key',
  '*.pem',
  '*.p12',
  '*.pfx',
  'credentials.json',
  '*secret*',
  '*token*',
  '.git/**',
  'node_modules/**',
]
```

### 9.2 No Hardcoded Secrets

Never hardcode API keys, tokens, or credentials. Use environment variables.

```javascript
// Bad
const token = 'ghp_abc123def456'

// Good
const token = process.env.GITHUB_TOKEN
```

### 9.3 Output Safety

Generated documentation must not include:
- Content from `.env` files
- Paths containing personal user information (replace with `~` or `<project-dir>`)
- Authentication tokens or API keys (even if detected in config files)

---

## 10. Cross-Platform Compatibility

### 10.1 File Paths

Use `path.join()` and `path.resolve()` — never string concatenation for paths:

```javascript
// Bad
const configPath = projectPath + '/.nerdspecs/config.json'

// Good
import path from 'path'
const configPath = path.join(projectPath, '.nerdspecs', 'config.json')
```

### 10.2 Line Endings

When writing files, explicitly use `\n` (LF) regardless of platform:

```javascript
const content = lines.join('\n')
await fs.writeFile(outputPath, content, { encoding: 'utf-8' })
```

### 10.3 Shell Commands

Avoid shelling out to OS commands where a Node.js API exists. When shell commands are necessary (git operations), use `cross-spawn` or handle Windows/Unix differences explicitly.
