# 04-database-design.md — Data Design Document

## Meta
- Project: NerdSpecs
- Version: 0.1-draft
- Date: 2026-04-13
- Author: DDSMUX Planning Session (T1 Claude Opus)

---

## Overview

NerdSpecs does not use a traditional database. All persistent data is stored in one of two forms:
1. **mnemo-hook memory** (primary): key-value entries managed by the mnemo-hook CLI
2. **Local JSON files** (fallback): file-based storage within the project directory when mnemo-hook is unavailable

Data is scoped to:
- The **current project** (project-level configuration and "why I built this")
- The **user globally** (projects evaluated, decision records across all sessions)

---

## 1. Memory Storage: mnemo-hook Integration

### Key Naming Convention

All NerdSpecs keys in mnemo-hook use the prefix `nerdspecs/` to prevent collision with other skills.

```
nerdspecs/project/{repo_slug}/why_built
nerdspecs/project/{repo_slug}/metadata
nerdspecs/project/{repo_slug}/config
nerdspecs/evaluated/{owner}/{repo}/explanation
nerdspecs/evaluated/{owner}/{repo}/decision
nerdspecs/user/preferences
```

Where `{repo_slug}` is derived from the git remote URL: `owner--repo` (double hyphen as separator, all lowercase).

Example: `https://github.com/lucasung-debug/my-project` → `lucasung-debug--my-project`

### Key Types Summary

| Key Pattern | Description | Scope |
|-------------|-------------|-------|
| `nerdspecs/project/{slug}/why_built` | Why the user built this project | Per project |
| `nerdspecs/project/{slug}/metadata` | Project metadata snapshot | Per project |
| `nerdspecs/project/{slug}/config` | NerdSpecs config for this project | Per project |
| `nerdspecs/evaluated/{owner}/{repo}/explanation` | Cached explanation of an external project | Global |
| `nerdspecs/evaluated/{owner}/{repo}/decision` | User's "why I need this" decision record | Global |
| `nerdspecs/user/preferences` | User language and behavior preferences | Global |

---

## 2. Schema Definitions

### 2.1 Project Motivation Record

**Key**: `nerdspecs/project/{repo_slug}/why_built`

**Description**: Stores the user's answer to "Why did you build this project?"

```json
{
  "answer": "I built this to help my students submit homework without email attachments. My school uses Google Classroom but the notifications are terrible, so I wanted a simple bot that texts me when assignments are late.",
  "recorded_at": "2026-04-13T14:30:00Z",
  "last_used": "2026-04-13T14:30:00Z",
  "language": "en"
}
```

**Field Descriptions**:
- `answer` (string, required): The user's verbatim answer, preserved exactly as typed
- `recorded_at` (ISO-8601 string): When this answer was first recorded
- `last_used` (ISO-8601 string): When this answer was last used to generate documentation
- `language` (string): Language the answer was given in (`"en"`, `"ko"`)

**Update behavior**: When user runs WRITE again, they are shown the existing answer and asked if it still applies. If yes, `last_used` is updated. If no, a new answer is collected and `recorded_at` is reset.

---

### 2.2 Project Metadata Record

**Key**: `nerdspecs/project/{repo_slug}/metadata`

**Description**: Snapshot of automatically analyzed project information.

```json
{
  "repo_url": "https://github.com/lucasung-debug/homework-bot",
  "repo_slug": "lucasung-debug--homework-bot",
  "display_name": "Homework Bot",
  "detected_language": "Python",
  "detected_framework": "discord.py",
  "entry_file": "main.py",
  "dependency_count": 8,
  "core_files_analyzed": [
    "main.py",
    "bot.py",
    "config.py",
    "requirements.txt"
  ],
  "generated_summary": "A Discord bot that monitors Google Classroom for late homework submissions and sends text notifications to teachers.",
  "tech_stack": {
    "language": "Python 3.11",
    "frameworks": ["discord.py 2.3"],
    "apis": ["Google Classroom API", "Twilio SMS API"],
    "services": ["Discord", "Google Classroom", "Twilio"]
  },
  "last_analyzed": "2026-04-13T14:30:00Z",
  "nerdspecs_version": "0.1.0"
}
```

**Field Descriptions**:
- `repo_url`: Full GitHub remote URL
- `repo_slug`: Computed slug used as key segment
- `display_name`: Human-readable project name (from repo name, prettified)
- `detected_language`: Primary programming language
- `detected_framework`: Main framework if detectable
- `entry_file`: Main entry point file path
- `dependency_count`: Number of dependencies (from package.json, requirements.txt, etc.)
- `core_files_analyzed`: List of files read during analysis
- `generated_summary`: One-sentence AI-generated summary
- `tech_stack`: Structured tech stack for developer section
- `last_analyzed`: When this snapshot was created
- `nerdspecs_version`: NerdSpecs version that generated this record (for migration)

---

### 2.3 Project Config Record

**Key**: `nerdspecs/project/{repo_slug}/config`

**Description**: User-configured settings for how NerdSpecs behaves for this specific project.

```json
{
  "language": "both",
  "auto_push": true,
  "landing_page_enabled": true,
  "landing_page_url": "https://lucasung-debug.github.io/homework-bot",
  "readme_sections": {
    "hero": true,
    "plain_explanation": true,
    "how_to_use": true,
    "tech_stack": true,
    "installation": false
  },
  "hook_installed": true,
  "hook_installed_at": "2026-04-13T14:00:00Z",
  "created_at": "2026-04-13T14:00:00Z",
  "updated_at": "2026-04-13T14:30:00Z"
}
```

**Field Descriptions**:
- `language`: Output language — `"en"`, `"ko"`, `"both"` (default: `"both"`)
- `auto_push`: Whether to auto-push README changes to git (default: `true`)
- `landing_page_enabled`: Whether to generate and deploy landing page (default: `true`)
- `landing_page_url`: Computed GitHub Pages URL (set after first successful deploy)
- `readme_sections`: Toggle individual README sections on/off
- `hook_installed`: Whether the git post-push hook is installed
- `hook_installed_at`: When the hook was installed
- `created_at` / `updated_at`: Record timestamps

---

### 2.4 External Project Explanation Cache

**Key**: `nerdspecs/evaluated/{owner}/{repo}/explanation`

**Description**: Cached plain-language explanation of a GitHub project fetched via READ mode.

```json
{
  "repo_url": "https://github.com/readme-ai/readme-ai",
  "owner": "readme-ai",
  "repo": "readme-ai",
  "fetched_at": "2026-04-13T16:00:00Z",
  "explanation_en": "readme-ai is a tool that automatically writes the README file for your code project. You point it at your code folder, and it reads the code, then writes a description explaining what the code does, how to install it, and how to use it. It is made for developers who want to save time writing documentation.",
  "explanation_ko": "readme-ai는 코드 프로젝트의 README 파일을 자동으로 작성해주는 도구입니다. 코드 폴더를 가리키면 코드를 읽고, 코드가 무엇을 하는지, 어떻게 설치하는지, 어떻게 사용하는지를 설명하는 내용을 작성합니다. 문서 작성 시간을 절약하려는 개발자를 위해 만들어졌습니다.",
  "use_cases": [
    "Developer wants to document a project quickly without writing",
    "Contributor wants to understand a new codebase"
  ],
  "target_audience": "Developers with existing code projects",
  "complexity_level": "intermediate",
  "nerdspecs_version": "0.1.0"
}
```

**Cache TTL**: 7 days. If `fetched_at` is older than 7 days, re-fetch on next READ.

**Note**: This cache reduces GitHub API calls and Claude API calls for frequently read projects.

---

### 2.5 Decision Record

**Key**: `nerdspecs/evaluated/{owner}/{repo}/decision`

**Description**: User's recorded reasoning for why they chose (or declined) a project.

```json
{
  "repo_url": "https://github.com/readme-ai/readme-ai",
  "decision": "adopt",
  "reasoning": "I need this because my NerdSpecs project needs to generate README files. readme-ai has already solved the code-reading part. I can use it as a reference for the analysis approach, even if I don't directly use it.",
  "reasoning_ko": null,
  "follow_up_answer": "I would use this when I need to auto-analyze a project I've never seen before and need to understand its structure quickly.",
  "recorded_at": "2026-04-13T16:15:00Z",
  "reviewed_at": null,
  "status": "active"
}
```

**Field Descriptions**:
- `decision`: `"adopt"` | `"skip"` | `"watch"` | `"undecided"` (user's final call)
- `reasoning`: User's explanation in their own words (English)
- `reasoning_ko`: User's explanation in Korean if given in Korean (null if English-only)
- `follow_up_answer`: Answer to the follow-up clarifying question (if prompted)
- `recorded_at`: When the decision was first recorded
- `reviewed_at`: When the user last reviewed or updated this decision
- `status`: `"active"` | `"superseded"` | `"archived"` (for managing outdated decisions)

---

### 2.6 User Preferences

**Key**: `nerdspecs/user/preferences`

**Description**: Global user settings that apply across all projects.

```json
{
  "language": "both",
  "ask_why_built": true,
  "ask_why_need": true,
  "auto_deploy_pages": true,
  "show_progress": true,
  "timezone": "Asia/Seoul",
  "created_at": "2026-04-13T10:00:00Z",
  "updated_at": "2026-04-13T10:00:00Z"
}
```

**Field Descriptions**:
- `language`: Default output language (`"en"`, `"ko"`, `"both"`)
- `ask_why_built`: Whether to prompt "why did you build this?" (can be disabled for power users)
- `ask_why_need`: Whether to prompt "why do you need this?" after READ
- `auto_deploy_pages`: Whether to auto-deploy to GitHub Pages after generation
- `show_progress`: Whether to display progress messages during generation
- `timezone`: User's timezone for timestamps (defaults to Asia/Seoul for Korean users)

---

## 3. Local Fallback: File-Based Storage

When mnemo-hook is not installed, NerdSpecs stores data in a local directory within the project.

### Directory Structure
```
{project-root}/
└── .nerdspecs/
    ├── memory.json        # All memory entries (flattened)
    ├── config.json        # Project config
    └── .gitignore         # Ensures this directory is not committed
```

### Fallback memory.json Format

```json
{
  "version": "1",
  "entries": {
    "why_built": {
      "answer": "...",
      "recorded_at": "2026-04-13T14:30:00Z"
    },
    "config": { },
    "metadata": { }
  }
}
```

This is a simplified flat structure. The `.nerdspecs/` directory is automatically added to `.gitignore` to prevent accidental commit of personal notes.

---

## 4. Data Migration

### mnemo-hook → Local Fallback
If mnemo-hook becomes unavailable, NerdSpecs can export all relevant keys to local file:
```bash
/nerdspecs memory export --to .nerdspecs/memory.json
```

### Local Fallback → mnemo-hook
If user installs mnemo-hook after using the fallback:
```bash
/nerdspecs memory import --from .nerdspecs/memory.json
```

---

## 5. Data Retention and Privacy

- All data is stored locally on the user's machine (either mnemo-hook or `.nerdspecs/` files)
- No data is sent to external servers (project analysis goes through Claude Code's existing API — same as all Claude Code usage)
- Users can delete all NerdSpecs data with `/nerdspecs memory clear --all`
- Decision records are personal notes — they are never shared publicly or included in generated documentation

---

## 6. Schema Versioning

All records include a `nerdspecs_version` field for future migration support. If a schema change is required between versions:
1. New version reads old format using compatibility layer
2. Writes in new format on next update
3. Old fields are preserved but deprecated (prefixed `_deprecated_`) until explicitly cleaned up with `/nerdspecs memory migrate`
