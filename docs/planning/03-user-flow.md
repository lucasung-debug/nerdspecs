# 03-user-flow.md — User Flow Document

## Meta
- Project: NerdSpecs
- Version: 0.1-draft
- Date: 2026-04-13
- Author: DDSMUX Planning Session (T1 Claude Opus)

---

## Overview

NerdSpecs has three primary user flows corresponding to the three phases of the roadmap:
1. **WRITE Flow** (v0.1): User documents their own project
2. **READ Flow** (v0.2): User understands someone else's project
3. **THINK Flow** (v0.2): User records why they chose a project

Each flow is designed for a non-developer. Every decision point uses plain language. Technical operations are invisible.

---

## Flow 1: WRITE — Document Your Own Project

### Entry Points
- **Manual**: User types `/nerdspecs write` in Claude Code
- **Automatic**: User runs `git push` — post-push hook triggers auto mode

### Happy Path (First Time)

```
┌──────────────────────────────────────────────────────────────┐
│  USER ACTION: /nerdspecs write                               │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  SYSTEM: Check for existing "why I built this" memory        │
│          (mnemo-hook lookup by repo URL)                     │
└─────────────────────────┬────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
    [Memory found]           [No memory / First time]
              │                       │
              │               ┌───────▼───────────────────┐
              │               │  PROMPT: "Why did you      │
              │               │  build this project?       │
              │               │  What problem does it      │
              │               │  solve for you?"           │
              │               └───────────────────────────┤
              │                       │                    │
              │               ┌───────▼───────────────────┐
              │               │  WAIT for user answer      │
              │               └───────────────────────────┤
              │                       │                    │
              │               ┌───────▼───────────────────┐
              │               │  SAVE answer to            │
              │               │  mnemo-hook memory         │
              │               └───────┬───────────────────┘
              │                       │
              └───────────┬───────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  SYSTEM: Scan project files                                  │
│  - Read package.json / pyproject.toml / Cargo.toml          │
│  - Read main entry file                                      │
│  - Read config files                                         │
│  - Read up to 10 core source files                          │
│  DISPLAY: "Reading your project... (analyzing 12 files)"    │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  SYSTEM: Send to Claude API                                  │
│  - File contents + user's "why" answer                       │
│  - Prompt: generate plain-language explanation               │
│  DISPLAY: "Understanding what your project does..."         │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  SYSTEM: Generate README                                     │
│  - Top: landing page link + one-line summary                 │
│  - Middle: plain-language explanation                        │
│  - Bottom: tech stack (organized by analyzer)                │
│  DISPLAY: "Writing your README..."                          │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  SYSTEM: Generate landing page                               │
│  - Hero section                                              │
│  - Problem section                                           │
│  - Solution section                                          │
│  - How-to section                                            │
│  - Tech stack footer                                         │
│  DISPLAY: "Building your landing page..."                   │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  SYSTEM: Deploy to GitHub Pages                              │
│  - Push to gh-pages branch                                   │
│  DISPLAY: "Publishing to GitHub Pages..."                   │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  SYSTEM: Commit README to main branch                        │
│  Commit message: "docs: update README via NerdSpecs"        │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  SUCCESS OUTPUT:                                             │
│  "Done! Here's what was created:"                           │
│  - README.md updated                                         │
│  - Landing page: https://username.github.io/repo-name       │
│  "Share this link with anyone to explain your project."     │
└──────────────────────────────────────────────────────────────┘
```

### Happy Path (Returning User — Automatic Mode via Git Hook)

```
GIT PUSH ──> post-push hook fires
         │
         ▼
/nerdspecs write --auto
         │
         ▼
Load "why I built this" from memory (skip prompt)
         │
         ▼
Scan project files
         │
         ▼
Generate README + landing page (same as above)
         │
         ▼
Commit + push silently
         │
         ▼
Print to terminal: "NerdSpecs: docs updated ✓"
```

### Error Branches

```
Memory lookup fails
  → Prompt user for answer
  → Continue

File scan finds 0 code files
  → Ask user: "I couldn't find code files. What type of project is this?"
  → Accept text description
  → Use description instead of code analysis

Claude API times out
  → Retry once (5 second delay)
  → If second failure: save partial output with [TODO: Claude timeout] markers
  → Notify user: "Generation was incomplete. Run /nerdspecs write again to retry."

GitHub Pages push fails
  → Save landing page files to ./docs/ instead
  → Instruct user to enable GitHub Pages manually

Astro build fails
  → Fall back to plain HTML template automatically
  → No user action required
```

---

## Flow 2: READ — Understand Any GitHub Project

### Entry Point
User pastes a GitHub URL and types `/nerdspecs read https://github.com/owner/repo`

### Happy Path

```
┌──────────────────────────────────────────────────────────────┐
│  USER ACTION: /nerdspecs read https://github.com/owner/repo  │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  SYSTEM: Fetch repository info via GitHub API                │
│  - Repository metadata (name, description, language)        │
│  - README.md content                                         │
│  - package.json or equivalent                               │
│  - Top-level file listing                                    │
│  DISPLAY: "Fetching project info..."                        │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  SYSTEM: Send to Claude API                                  │
│  - Fetched content                                           │
│  - Prompt: explain in plain language + Korean               │
│  DISPLAY: "Reading this project for you..."                 │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  DISPLAY: Plain-language explanation                         │
│                                                              │
│  "Here's what this project does:"                           │
│  [Plain English explanation]                                │
│                                                              │
│  "한국어로 설명:"                                            │
│  [Korean explanation]                                       │
│                                                              │
│  "What it's for: [concrete use cases]"                      │
│  "Who built it: [author context if available]"              │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  TRANSITION TO THINK FLOW (F9)                               │
│                                                              │
│  PROMPT: "Do you think you need this project?"              │
│  OPTIONS: [Yes, tell me why] [No] [Not sure]                │
└─────────────────────────┬────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
           [Yes]                   [No / Not sure]
              │                       │
              │                       ▼
              │               "Noted. The explanation
              │               is saved in case you
              │               want to come back."
              │                       │
              ▼                       ▼
     THINK FLOW ──────────────── END
```

---

## Flow 3: THINK — Record Your Decision

### Entry Point
- Triggered automatically after READ flow when user says "Yes"
- Or manually: `/nerdspecs think https://github.com/owner/repo`

### Happy Path

```
┌──────────────────────────────────────────────────────────────┐
│  CONTEXT: User has just read an explanation of a project     │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  PROMPT: "Why do you think you need this project?"           │
│  "Try to be specific — what problem of yours does it solve?" │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  WAIT for user answer                                        │
└─────────────────────────┬────────────────────────────────────┘
                          │
              ┌───────────┴────────────────────┐
              │                                │
              ▼                                ▼
    [Specific answer]              [Vague: "I don't know" /
              │                    "seems useful" / "maybe"]
              │                                │
              │                   ┌────────────▼──────────────┐
              │                   │  FOLLOW-UP PROMPT:         │
              │                   │  "Can you give me a        │
              │                   │  specific example of when  │
              │                   │  you'd use this?"          │
              │                   └────────────┬──────────────┘
              │                                │
              │                   WAIT for user answer
              │                                │
              └───────────┬────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  SYSTEM: Save decision record to mnemo-hook                  │
│  Record includes:                                            │
│  - Project URL                                               │
│  - Plain-language explanation (from READ step)               │
│  - User's reasoning (their words)                           │
│  - Timestamp                                                 │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  CONFIRM OUTPUT:                                             │
│  "Saved. Here's your decision record:"                      │
│                                                              │
│  Project: [name]                                            │
│  What it does: [one sentence]                               │
│  Why you need it: [user's words]                            │
│  Saved on: [date]                                           │
│                                                              │
│  "You can find this again with: /nerdspecs memory show"     │
└──────────────────────────────────────────────────────────────┘
```

---

## Flow 4: INSTALL HOOK — Set Up Automation

### Entry Point
User types `/nerdspecs install-hook` in Claude Code (within a git project directory)

```
┌──────────────────────────────────────────────────────────────┐
│  USER ACTION: /nerdspecs install-hook                        │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  CHECK: Is current directory a git repository?              │
└─────────────────────────┬────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
     [Yes, git repo]          [Not a git repo]
              │                       │
              │               "This folder isn't a
              │               git project yet.
              │               Run 'git init' first."
              │                       │
              ▼                       ▼
┌──────────────────────────────────────────────────────────────┐
│  CHECK: Is .git/hooks/post-push already installed?          │
└─────────────────────────┬────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
     [Not installed]          [Already installed]
              │                       │
              │               "NerdSpecs hook is
              │               already installed.
              │               Run /nerdspecs write
              │               to test it."
              │                       ▼
              ▼                     END
┌──────────────────────────────────────────────────────────────┐
│  WRITE: .git/hooks/post-push script                         │
│  CHMOD: make executable                                      │
│  CREATE: .nerdspecs/ config directory                       │
│  UPDATE: .gitignore (add .nerdspecs/)                       │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  SUCCESS OUTPUT:                                             │
│  "Done! NerdSpecs will automatically update your docs       │
│  every time you push to GitHub."                            │
│                                                              │
│  "Next: Run /nerdspecs write to create your first docs."    │
└──────────────────────────────────────────────────────────────┘
```

---

## Flow 5: MEMORY SHOW — Review Stored Decisions

### Entry Point
User types `/nerdspecs memory show`

```
/nerdspecs memory show
          │
          ▼
Fetch all entries from mnemo-hook with prefix "nerdspecs/"
          │
          ▼
Display:
  "Your NerdSpecs records:"

  THIS PROJECT (current directory):
    Why you built it: "[stored answer]"
    Last updated: [date]

  PROJECTS YOU'VE EVALUATED:
    1. github.com/owner/repo1
       What it does: [one sentence]
       Why you need it: "[your reasoning]"
       Saved: [date]

    2. github.com/owner/repo2
       ...

  Run /nerdspecs memory clear to delete all records.
```

---

## User Experience Principles

All flows adhere to these UX rules:

1. **One question at a time**: Never ask two questions in the same prompt
2. **Progress visibility**: Always display what is happening ("Analyzing files...", "Writing README...")
3. **Plain language only**: No technical terms in user-facing messages
4. **Recoverable errors**: Every error state has a specific next action
5. **Bilingual by default**: Korean translation offered automatically, not only on request
6. **Confirmation at completion**: Always show a summary of what was created/saved
7. **Non-destructive**: NerdSpecs never overwrites existing README without showing a diff first (v0.2 refinement)
