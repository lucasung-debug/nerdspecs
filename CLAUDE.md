# NerdSpecs — Project Instructions

## What is NerdSpecs?
A cross-CLI Node.js tool that translates AI-built projects into human-readable explanations.
Non-developers can auto-generate README + landing page on git push.

## Tech Stack
- Runtime: Node.js 18+ (TypeScript strict mode, ESM)
- CLI: commander + inquirer + chalk + ora
- Storage: mnemo-hook (primary) or .nerdspecs/memory.json (fallback)
- LLM: abstraction layer supporting Claude API, OpenAI, Google Gemini
- Tests: vitest
- Deploy: npm package (npx nerdspecs)

## Project Structure
```
src/
  commands/    — CLI command handlers (write, read, think, status, config)
  resources/   — Domain resource CRUD (6 resources)
  generators/  — README + Landing Page template engines
  storage/     — StorageAdapter interface + implementations
  components/  — Reusable CLI components (header, prompt, spinner)
  llm/         — LLM provider abstraction
specs/         — Screen specs (YAML v2.0) and domain resources
docs/planning/ — Planning docs from /socrates pipeline
tests/         — vitest test suite
templates/     — HTML/Markdown templates
```

## Key Conventions
- All resources scoped by repo_slug (owner--repo format)
- Bilingual output: EN + KO (controlled by user_preferences.language)
- Functions under 20 lines
- TDD: write test first
- No web frontend — CLI terminal + generated static files only

## Task Reference
See `docs/planning/06-tasks.md` for the full task breakdown (37 tasks, 6 phases).

## Agent Team
- backend-specialist: storage, resources, code analyzer, LLM, CLI framework
- frontend-specialist: CLI components, screen flows, template engines
- test-specialist: unit tests, e2e, spec compliance
