# 10-v2-plan.md — NerdSpecs v0.3.0 Plan (Supersedes v0.1 Planning)

## Meta
- Project: NerdSpecs
- Version: 0.3.0
- Date: 2026-04-15
- Predecessors: 01-prd.md through 09-doubt-audit.md (v0.1 planning, 2026-04-13)
- Status: **IMPLEMENTED** — this document reflects what was actually built

---

## 1. Goal Evolution

### v0.1 Original Goal (01-prd.md)
> A Claude Code slash command (`/nerdspecs`) that non-developer "vibe coders" run inside Claude Code.

### v0.3.0 Current Goal
> A dual-interface documentation tool: standalone CLI + MCP server compatible with ALL AI CLIs.

### Why Changed
- Original design was tightly coupled to Claude Code (doubt audit A5: "too narrow")
- API key requirement blocked adoption (users needed separate ANTHROPIC_API_KEY)
- MCP protocol enables zero-config usage across 9+ CLI clients
- NerdSpecs becomes infrastructure for AI assistants, not an assistant itself

---

## 2. Architecture Delta

| Area | v0.1 Planned | v0.3.0 Actual | Gap Status |
|------|-------------|---------------|------------|
| **Distribution** | Claude Code skill `/nerdspecs` | `npx nerdspecs` CLI + MCP server | CHANGED (better) |
| **LLM** | Claude only (via Claude Code context) | Host CLI is the LLM (MCP); Claude+OpenAI+Mock (CLI) | CHANGED (better) |
| **Storage** | mnemo-hook (primary) | LocalFileAdapter (mnemo-hook is stub) | DEFERRED |
| **Storage keys** | Slash notation `nerdspecs/project/{slug}/...` | Double-colon `project_config::slug` | CHANGED |
| **Templates** | Handlebars | TypeScript template literals | CHANGED (simpler) |
| **Landing page** | Astro static site generator | Plain HTML string (inline CSS) | CHANGED (simpler) |
| **Deploy** | git worktree → gh-pages branch | docs/index.html in main branch | CHANGED (simpler) |
| **Code language** | JavaScript ES2022 (07-coding-convention.md) | TypeScript strict mode | CHANGED (better) |
| **Languages** | EN + KO | EN + KO + ZH | EXPANDED |
| **Image** | Open question (01-prd.md) | Image slot system (hero_image_url, screenshots) | RESOLVED |

---

## 3. What Was Planned but NOT Built (Gaps)

| Item | Source | Status | Priority |
|------|--------|--------|----------|
| mnemo-hook integration | 04-database-design.md | STUB (throws error, falls back to local) | LOW — local adapter works |
| Gemini LLM adapter | 06-tasks.md P2-R5-T2 | NOT BUILT | DROPPED — MCP mode makes this unnecessary |
| `memory export/import` | 04-database-design.md §4 | NOT BUILT | MEDIUM — useful for data portability |
| `--no-hook` flag | 02-trd.md | NOT BUILT | LOW — auto mode covers this |
| Handlebars templates | 02-trd.md, 07-coding-convention.md | REPLACED with template literals | N/A — design decision |
| Astro landing page | 02-trd.md | REPLACED with plain HTML | N/A — design decision |
| Spec compliance validator | 06-tasks.md P3-S8-T1, P3-S9-T1 | NOT BUILT | LOW |
| git worktree deploy | 02-trd.md | REPLACED with docs/ in main | N/A — simpler approach |

---

## 4. What Was Built but NOT Planned (Additions)

| Item | Files | Impact |
|------|-------|--------|
| **MCP Server (8 tools)** | `src/mcp.ts`, `bin/nerdspecs-mcp.js` | MAJOR — changes distribution model entirely |
| **Chinese (ZH) support** | `src/i18n.ts`, templates, onboarding | MEDIUM — expands audience to 1.3B speakers |
| **OpenAI provider** | `src/llm/openai-provider.ts` | MEDIUM — multi-provider support |
| **Mock provider** | `src/llm/mock-provider.ts` | LOW — enables offline mode |
| **Image slots** | `landing-template.ts` LandingData interface | MEDIUM — enables Gemini MCP/Pencil integration |
| **ASCII nerd logo** | `readme-template.ts` FOOTER | LOW — branding |
| **auto_commit_and_push** | `src/mcp.ts` tool 7 | MEDIUM — non-developer workflow |
| **suggest_next_steps** | `src/mcp.ts` tool 8 | MEDIUM — guided assistance |
| **i18n system** | `src/i18n.ts` | MEDIUM — trilingual CLI prompts |
| **Dark-themed landing page** | `src/generators/landing-template.ts` | LOW — visual upgrade |
| **TypeScript (was JS)** | All `src/**/*.ts` | HIGH — type safety, better DX |

---

## 5. MCP Server Specification (NEW in v0.3.0)

### Tools (8)

```
analyze_project       — readOnly, reuses code-analyzer.ts
generate_readme       — writes README.md, dry_run supported
generate_landing_page — writes docs/index.html, image slots, dry_run supported
fetch_repo_metadata   — readOnly, fetches GitHub API
save_decision         — writes to local storage
get_project_status    — readOnly, returns config + motivation
auto_commit_and_push  — ⚠️ pushes to remote
suggest_next_steps    — readOnly, analyzes project state
```

### Cross-CLI Compatibility (9 clients verified)

| Client | Config Key | Format |
|--------|-----------|--------|
| Claude Code, Gemini, Qwen, Cursor, Continue, Cline | `mcpServers` | JSON |
| OpenCode | `mcp` | JSON |
| Codex CLI | `[mcp_servers.x]` | TOML |
| VS Code Copilot | `servers` | JSON |

### Design Principles (from research)
- Workflow-first tool design (Block Engineering pattern)
- `isError: true` + recovery hint (never throw)
- `readOnlyHint` annotation for safe tools
- summary is HOST LLM input, not NerdSpecs output
- console.log banned in MCP mode (stdio corruption)

---

## 6. Domain Resources (Updated)

### Unchanged from v0.1 (04-database-design.md)
- project_motivation — `project_motivation::slug`
- project_config — `project_config::slug`
- project_metadata — `project_metadata::slug`
- decision_record — `decision_record::key`
- explanation_cache — `explanation_cache::key`
- user_preferences — `user_preferences` (singleton)

### Storage Key Format Change
- v0.1: `nerdspecs/project/{slug}/why_built` (slash notation)
- v0.3.0: `project_motivation::slug` (double-colon notation)
- Reason: LocalFileAdapter uses flat JSON, slash paths unnecessary

### Language Type Change
- v0.1: `'en' | 'ko' | 'both'`
- v0.3.0: `'en' | 'ko' | 'zh' | 'both'`

---

## 7. Future Gaps to Address (v0.4.0 candidates)

| Priority | Item | Notes |
|----------|------|-------|
| HIGH | MCP Resources | Expose config/status as MCP Resources (read-only, cacheable) |
| HIGH | MCP Prompts | `nerdspecs-write` workflow prompt for host LLM guidance |
| MEDIUM | memory export/import | Data portability for backup/migration |
| MEDIUM | MCP InMemoryTransport tests | Unit tests for each MCP tool handler |
| MEDIUM | Landing page image generation | Integration guide for Gemini MCP / Pencil MCP |
| LOW | mnemo-hook integration | Only if mnemo-hook becomes available |
| LOW | Spec compliance validator | Automated check against screen specs |
| DROPPED | Gemini LLM adapter | Unnecessary — MCP mode lets any LLM work |
| DROPPED | Astro | Plain HTML is simpler and sufficient |
| DROPPED | Handlebars | Template literals are simpler and type-safe |

---

## 8. Version History

| Version | Date | Milestone |
|---------|------|-----------|
| v0.1.0 | 2026-04-13 | Initial planning (9 documents) |
| v0.2.0 | 2026-04-13 | CLI implementation complete (37 tasks, 281 tests) |
| v0.2.0 | 2026-04-14 | GitHub + npm publish, landing page, 5 bug fixes |
| v0.3.0 | 2026-04-15 | MCP server (8 tools), i18n (EN/KO/ZH), image slots, trilingual README |
