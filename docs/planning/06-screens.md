# 06-screens.md — Screens and Interfaces

## Meta
- Project: NerdSpecs
- Version: 0.1-draft
- Date: 2026-04-13
- Author: DDSMUX Planning Session (T1 Claude Opus)

---

## Overview

NerdSpecs has three interface surfaces:
1. **CLI Interface** — the terminal experience inside Claude Code
2. **Generated README** — the documentation file in the user's GitHub repository
3. **Generated Landing Page** — the GitHub Pages website

Each surface has specific layout and content rules defined in this document.

---

## 1. CLI Interface Screens

### Screen 1.0: Skill Invocation

User runs `/nerdspecs` with no subcommand.

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] v0.1.0                                          │
│  Put on nerd glasses and the project becomes visible.        │
│                                                                │
│  What would you like to do?                                   │
│                                                                │
│  1. write   — Create docs for THIS project                   │
│  2. read    — Understand a GitHub project (v0.2)             │
│  3. think   — Record why you need a project (v0.2)           │
│  4. status  — Show your NerdSpecs settings                   │
│                                                                │
│  Or run a specific command: /nerdspecs write                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Screen 1.1: Write — First Time Setup Check

Shown when user runs `/nerdspecs write` for the first time in a project.

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] First time in this project!                     │
│                                                                │
│  I'll need to ask you one question to get started.           │
│                                                                │
│  Project detected: homework-bot                              │
│  Location: C:/Users/propo/Desktop/homework-bot               │
│  Language: Python                                             │
│                                                                │
│  Continue? [Y/n]                                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Screen 1.2: Write — The One Question

The motivational question screen. This is the most important user interaction.

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] One question before we start:                   │
│                                                                │
│  Why did you build this project?                             │
│  What problem does it solve for you?                         │
│                                                                │
│  (Write in your own words — no technical language needed.)   │
│                                                                │
│  > _                                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Screen 1.3: Write — Memory Confirmation (Returning User)

Shown when stored "why I built this" exists.

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] Found your previous answer:                     │
│                                                                │
│  "I built this to help my students submit homework without   │
│  email attachments. My school uses Google Classroom but      │
│  the notifications are terrible..."                          │
│                                                                │
│  Recorded: 7 days ago (2026-04-06)                           │
│                                                                │
│  Is this still accurate?                                      │
│  1. Yes, use this answer                                      │
│  2. No, let me update it                                      │
│                                                                │
│  > _                                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Screen 1.4: Write — Progress Display

Shown during generation. Progress messages appear one at a time, with the previous message fading (using terminal overwrite if supported, or new line if not).

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] Reading your project files...                   │
│  [NerdSpecs]   homework-bot/main.py                          │
│  [NerdSpecs]   homework-bot/bot.py                           │
│  [NerdSpecs]   homework-bot/requirements.txt                 │
│  [NerdSpecs]   ... and 5 more files                          │
│                                                                │
│  [NerdSpecs] Understanding what your project does...         │
│  [NerdSpecs] Writing your README...                          │
│  [NerdSpecs] Building your landing page...                   │
│  [NerdSpecs] Publishing to GitHub Pages...                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Screen 1.5: Write — Success Output

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] Done!                                           │
│                                                                │
│  Here's what was created:                                    │
│                                                                │
│    README.md        updated (284 lines, bilingual)           │
│    Landing page     https://propo.github.io/homework-bot     │
│                                                                │
│  Share the landing page link with anyone to explain          │
│  what your project does.                                     │
│                                                                │
│  GitHub Pages may take up to 2 minutes to go live.           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Screen 1.6: Write — Auto Mode (Git Hook Trigger)

Minimal output shown in terminal after git push.

```
[NerdSpecs] Detected push to main. Updating docs...
[NerdSpecs] Docs updated. Landing page: https://propo.github.io/homework-bot
```

No prompts in auto mode. Stored answers are used silently.

---

### Screen 2.0: Read — URL Input

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] Paste a GitHub URL to get a plain explanation.  │
│                                                                │
│  > _                                                          │
│                                                                │
│  (or run: /nerdspecs read https://github.com/owner/repo)     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Screen 2.1: Read — Progress

```
[NerdSpecs] Fetching readme-ai from GitHub...
[NerdSpecs] Reading this project for you...
```

---

### Screen 2.2: Read — Explanation Display

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] Here's what readme-ai does:                     │
│                                                                │
│  readme-ai is a tool that automatically writes the README    │
│  file for your code project. You point it at your code       │
│  folder, and it reads the code, then writes a description    │
│  explaining what the project does, how to install it, and   │
│  how to use it.                                              │
│                                                                │
│  It is made for developers who want to save time writing     │
│  documentation. You need to know how to use Python and run  │
│  terminal commands to set it up.                             │
│                                                                │
│  ────────────────────────────────────────────────────────   │
│  한국어 설명:                                                 │
│                                                                │
│  readme-ai는 코드 프로젝트의 README 파일을 자동으로           │
│  작성해주는 도구입니다...                                     │
│                                                                │
│  ────────────────────────────────────────────────────────   │
│                                                                │
│  Do you think you might need this project?                   │
│  1. Yes, I want to record why                                │
│  2. No                                                        │
│  3. Not sure yet                                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Screen 3.0: Think — Why Do You Need This?

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] Good. Let's record your thinking.               │
│                                                                │
│  Why do you think you need readme-ai?                        │
│  Try to be specific — what problem of yours does it solve?   │
│                                                                │
│  > _                                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Screen 3.1: Think — Follow-Up (Vague Answer)

Triggered when user gives a vague answer like "it seems useful" or "maybe".

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] Got it. Let me ask one more thing:              │
│                                                                │
│  Can you give me a specific example of when you'd use this?  │
│  For example: "When I finish building a project and want     │
│  to share it on GitHub, I would use this to..."              │
│                                                                │
│  > _                                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Screen 3.2: Think — Decision Saved

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] Saved. Here's your decision record:             │
│                                                                │
│  Project:    readme-ai (github.com/readme-ai/readme-ai)      │
│  What it does: Automatically writes README files from code   │
│  Why you need it: "I need this because my NerdSpecs project  │
│                    needs to generate README files..."         │
│  Your decision: adopt                                        │
│  Saved on:   2026-04-13                                      │
│                                                                │
│  You can find all your records with: /nerdspecs memory show  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Screen 4.0: Status

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] v0.1.0 — Status                                 │
│                                                                │
│  Current project: homework-bot                               │
│  Git remote:      github.com/propo/homework-bot              │
│  Hook installed:  Yes (post-push)                            │
│  mnemo-hook:      Connected                                  │
│  Language:        Both (EN + KO)                             │
│                                                                │
│  Memory:                                                      │
│    "Why I built this" recorded: Yes (6 days ago)             │
│    Projects evaluated: 3                                     │
│                                                                │
│  Landing page: https://propo.github.io/homework-bot          │
│  Last generated: 2 days ago (2026-04-11)                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Screen 4.1: Error — Generic

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] Something went wrong.                           │
│                                                                │
│  What happened: Couldn't push the landing page to GitHub.   │
│  What to do:   Check your internet connection, then run     │
│                /nerdspecs write again.                       │
│                                                                │
│  Error code: ERR_PAGES_PUSH_FAILED                           │
│  (Copy this if you need to report an issue)                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Generated README Layout

The README is a Markdown file committed to the repository. Its visual layout in GitHub's rendering:

### Full README Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│                    [centered hero image]                         │
│                                                                  │
│              # Homework Bot (centered heading)                   │
│                                                                  │
│  > A Discord bot that tells you when students submit late       │
│                                                                  │
│  [View Landing Page] · [Report Issue] · [한국어]                │
│                                                                  │
│  ──────────────────────────────────────────────────────────     │
│                                                                  │
│  ## What is this?                                               │
│                                                                  │
│  [2-3 paragraph plain explanation]                              │
│                                                                  │
│  [Korean translation below each paragraph]                      │
│                                                                  │
│  ──────────────────────────────────────────────────────────     │
│                                                                  │
│  ## Who is it for?                                              │
│                                                                  │
│  If you are a teacher who uses Google Classroom and wants      │
│  to know immediately when students submit late, this bot       │
│  is for you.                                                    │
│                                                                  │
│  ──────────────────────────────────────────────────────────     │
│                                                                  │
│  ## How to use it                                               │
│                                                                  │
│  **Step 1: Install the bot**                                    │
│  ...                                                            │
│                                                                  │
│  **Step 2: Connect to your Discord server**                     │
│  ...                                                            │
│                                                                  │
│  ──────────────────────────────────────────────────────────     │
│                                                                  │
│  <details>                                                      │
│  <summary>For Developers: Tech Stack & Installation</summary>  │
│                                                                  │
│  | Layer | Technology |                                         │
│  | Bot framework | discord.py 2.3 |                            │
│  | Notification | Twilio SMS API |                             │
│  | Classroom sync | Google Classroom API |                     │
│                                                                  │
│  </details>                                                     │
│                                                                  │
│  ──────────────────────────────────────────────────────────     │
│                                                                  │
│  <!-- Generated by NerdSpecs v0.1 -->                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Generated Landing Page Layout

The landing page is a static HTML/Astro site deployed to GitHub Pages.

### Full Landing Page Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ NAVIGATION                                                       │
│  (glasses icon) NerdSpecs   [About] [GitHub] [한국어]           │
├──────────────────────────────────────────────────────────────────┤
│ HERO SECTION (dark background)                                   │
│                                                                  │
│   ████████████████                                              │
│   ████ Hero   ████   Homework Bot                               │
│   ████ Image  ████                                              │
│   ████████████████   A Discord bot that tells you              │
│                      when students submit late.                 │
│                                                                  │
│                      [Get Started]  [View on GitHub]            │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ PROBLEM SECTION (white background)                               │
│                                                                  │
│   Have you experienced this?                                    │
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│   │ You grade 30 │  │ Students say │  │ Email gets   │        │
│   │ students and │  │ they sent it │  │ buried and   │        │
│   │ lose track of│  │ but you      │  │ you miss     │        │
│   │ who is late  │  │ never got it │  │ submissions  │        │
│   └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ SOLUTION SECTION (light blue background)                         │
│                                                                  │
│   Here's how Homework Bot fixes that                            │
│                                                                  │
│   BEFORE                          AFTER                         │
│   Check email constantly    →     Get an instant text message  │
│   Manually track who's late →     Bot tracks it automatically  │
│   Miss late submissions     →     Never miss one again         │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ HOW-TO SECTION (white background)                                │
│                                                                  │
│   Three steps to get started                                    │
│                                                                  │
│   (1) Install → [screenshot of terminal]                       │
│                                                                  │
│   (2) Connect to Discord → [screenshot of bot in Discord]      │
│                                                                  │
│   (3) Get notified → [screenshot of text message]              │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ TECH STACK FOOTER (dark background)                              │
│                                                                  │
│   Built with                                                    │
│   [Python] [discord.py] [Google Classroom API] [Twilio]        │
│                                                                  │
│   Open source · MIT License                                     │
│   github.com/propo/homework-bot                                 │
│                                                                  │
│   Made with NerdSpecs                                           │
└──────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (> 1024px) | 3-column card layout, side-by-side before/after |
| Tablet (768-1024px) | 2-column cards, stacked before/after |
| Mobile (< 768px) | Single column, all sections stacked |

---

## 4. Config Interface

### .nerdspecs/config.json (Displayed by /nerdspecs status)

When user runs `/nerdspecs config`, they see and can edit:

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [NerdSpecs] Configuration for: homework-bot                 │
│                                                                │
│  Language output:        both (EN + KO)      [change]        │
│  Auto-deploy pages:      yes                 [change]        │
│  Landing page sections:  hero, problem, solution, how-to     │
│                          [change]                            │
│  Hook:                   installed           [remove]        │
│                                                                │
│  Run /nerdspecs config --lang=en to change language to       │
│  English-only.                                               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

Config changes are applied by flags, not interactive menus — this keeps the CLI simple and scriptable.

---

## 5. Onboarding Flow (First Use Ever)

When user runs `/nerdspecs` for the very first time with no existing config:

```
Screen A: Welcome
─────────────────
[NerdSpecs] Welcome! Let's set up NerdSpecs for the first time.
This will take about 1 minute.

Screen B: Language Preference
──────────────────────────────
What language should NerdSpecs use for your documentation?
1. Both English and Korean (recommended)
2. English only
3. Korean only
> _

Screen C: mnemo-hook Check
───────────────────────────
[NerdSpecs] Checking for mnemo-hook...
  Found: yes / Not found: I'll use a local file instead.
  (You can install mnemo-hook later for better memory features.)

Screen D: Ready
───────────────
[NerdSpecs] All set!

Run /nerdspecs write in any project folder to start.

Quick reference:
  /nerdspecs write          — Document your project
  /nerdspecs read <url>     — Understand a GitHub project
  /nerdspecs install-hook   — Auto-update docs on git push
  /nerdspecs memory show    — See your saved records
```
