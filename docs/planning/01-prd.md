# 01-prd.md — Product Requirements Document

## Meta
- Project: NerdSpecs
- Version: 0.1-draft
- Date: 2026-04-13
- Author: DDSMUX Planning Session (T1 Claude Opus)

---

## 1. Project Overview

### Name
**NerdSpecs** — Put on nerd glasses and the project becomes visible.

*Specs* carries a double meaning: eyeglasses (making things clear) + specifications (technical documents). The nerd glasses metaphor represents seeing a project clearly despite technical complexity.

### One-Line Summary
NerdSpecs translates AI-built projects into human-readable explanations — automating the translation so humans can focus on thinking.

### Tagline
**"Translation by AI, Thinking by Human, Records Together"**

### Core Cogito (Fundamental Truth)
A tool that helps non-developers explain their AI-built projects (WRITE) and understand others' projects (READ) — automation handles translation, humans handle thinking, records are kept together.

---

## 2. Vision

The AI era has fundamentally changed who can build software. Domain experts — teachers, doctors, designers, researchers — now build production-quality tools with AI assistance, without knowing how to code. However, the surrounding ecosystem (GitHub, documentation, open-source communities) still speaks developer language.

NerdSpecs bridges this gap:
- Non-developers who BUILD with AI need to explain their projects to others
- Non-developers who BROWSE GitHub need projects explained to them
- Everyone who makes decisions about software needs to record WHY they chose it

NerdSpecs is not a README generator for developers. It is a translation layer for the post-AI developer ecosystem.

---

## 3. Target Users

### Primary Persona: Vibe Coder
- Non-developer domain expert (teacher, designer, researcher, entrepreneur)
- Builds software with Claude Code, Cursor, or similar AI tools
- Has working projects on GitHub but cannot explain them to others
- Knows what their project DOES but not how to communicate it in developer terms
- Pain: "I built something real but nobody understands it when they look at my GitHub"

### Secondary Persona: Explorer
- Non-developer browsing GitHub or HuggingFace for AI tools to adopt
- Overwhelmed by technical READMEs: jargon, English, installation complexity
- Wants to know: "Is this project useful to me? Do I actually need it?"
- Pain: "I found something that might help me but I can't understand what it does"

### Tertiary Persona: Starter
- Just discovered AI coding tools (Claude, Gemini, Copilot)
- Beginning their vibe coding journey
- Needs understandable project discovery to find starting points
- Pain: "I want to use open-source AI projects but everything looks incomprehensible"

---

## 4. Problem Statement

### P1: WRITE — Non-developers cannot explain their projects
Non-developers are building real, working software with AI assistance. But they lack the vocabulary and conventions to write README files, documentation, or landing pages that communicate value to others. GitHub becomes a graveyard of interesting projects that nobody adopts because the documentation is missing or incomprehensible.

### P2: READ — Non-developers cannot understand technical documentation
When non-developers visit a GitHub repository, they encounter a double barrier:
1. **Developer jargon**: "fork", "pull request", "dependency injection", "REST API"
2. **English language**: Most open-source documentation is English-only

Korean non-developers face this double barrier especially acutely. The result is that potentially valuable tools are invisible to the people who would benefit most from them.

### P3: THINK — AI summaries don't create memory
When users ask AI to summarize a project for them, they get an answer but don't internalize it. The reasoning evaporates. When asked a week later why they chose a tool, they cannot remember. This prevents the development of technical taste and judgment — the "thinking" part of software decision-making.

---

## 5. Core Features

### F1: Auto-Analyze Project Code and Structure
**Version**: v0.1
**Description**: When triggered, NerdSpecs scans the project directory — reading code files, configuration, dependencies, and structure — to understand what the project actually does without requiring the human to explain technical details.
**User value**: "I don't have to describe my code. It reads it."
**Input**: Project directory path (defaults to current working directory)
**Output**: Internal structured representation of project capabilities

### F2: "Why Did You Build This?" Memory
**Version**: v0.1
**Description**: NerdSpecs asks the user ONE question: "Why did you build this? What problem does it solve for you?" The answer is stored in mnemo-hook memory and reused for all future documentation generation for this project.
**User value**: "It only asks me once. It remembers."
**Integration**: mnemo-hook memory system
**Behavior**: If answer already exists in memory, skip the question and use stored answer

### F3: Generate Non-Developer-Friendly Explanation
**Version**: v0.1
**Description**: Using the code analysis (F1) and motivation context (F2), generate a plain-language explanation of the project. Translate all jargon into everyday language. Write as if explaining to a curious friend with no technical background.
**User value**: "My non-technical friends can now understand what I built"
**Tone**: Warm, conversational, concrete examples over abstractions

### F4: Generate Landing Page
**Version**: v0.1
**Description**: Generate a complete visual landing page deployed to GitHub Pages. The page follows the NerdSpecs landing page template: hero image, problem statement, solution description, how-to section, tech stack footer.
**User value**: "I have a real website for my project, not just a text file"
**Output**: Static HTML/Astro site pushed to `gh-pages` branch

### F5: Organize Tech Stack Section
**Version**: v0.1
**Description**: From code analysis, extract and organize the technical stack into a structured section for developer review. This section is placed at the BOTTOM of documentation — after the human-readable explanation — so it doesn't intimidate non-developer readers.
**User value**: "Developers can still find the technical info, but it doesn't dominate the page"

### F6: Auto-Trigger on Git Push
**Version**: v0.1
**Description**: A git post-push hook automatically runs NerdSpecs after each push to the main branch. Documentation updates without requiring manual intervention.
**User value**: "My documentation stays current automatically"
**Implementation**: Git hook that calls the `/nerdspecs` Claude Code skill

### F7: GitHub URL → Easy Explanation
**Version**: v0.2
**Description**: User pastes any GitHub repository URL. NerdSpecs fetches the repository structure and README, analyzes the code, and generates a plain-language explanation of what the project does and who it's for.
**User value**: "I can understand any project on GitHub, not just mine"
**Input**: GitHub repository URL
**Output**: Plain-language explanation + "do you need this?" prompt

### F8: Korean Translation
**Version**: v0.2
**Description**: All generated explanations are available in Korean. The interface prompts for language preference on first run and stores the preference. Korean translation is automatic, not an afterthought.
**User value**: "I don't have to read technical English"
**Note**: Korean is a first-class language, not a secondary translation

### F9: "Do I Need This?" Thinking Helper
**Version**: v0.2
**Description**: After explaining a project (F7), NerdSpecs asks the user: "Why do you think you need this?" It records the user's reasoning in mnemo-hook memory alongside the project explanation. This forces the thinking process that creates real understanding.
**User value**: "I remember why I chose this tool, not just what it does"
**Behavior**: Does not accept "I don't know" — asks follow-up questions until a concrete reason is articulated

---

## 6. README Structure

The README generated by NerdSpecs follows a layered structure designed to serve all three personas simultaneously:

```
[TOP — for everyone]
  Landing page link + hero image
  One-line summary in plain language

[MIDDLE — for non-developers]
  Motivation: "I built this because..."
  What it does: plain language explanation
  Who it's for: concrete use cases
  How to use it: step-by-step, no jargon

[BOTTOM — for developers]
  Tech stack
  Installation
  API reference
  Contributing guide
```

---

## 7. Landing Page Structure

```
[HERO]
  One-line summary
  Representative image / screenshot

[PROBLEM]
  "Have you experienced this frustration?"
  Concrete pain point description

[SOLUTION]
  "This project solves it like this"
  Before/after comparison

[HOW-TO]
  Screenshots or GIFs showing actual use
  3-5 steps maximum

[TECH STACK]
  For developer review
  Minimal, scannable
```

---

## 8. Success Metrics

### v0.1 Success Criteria
- A non-developer can push a project and get a complete README + landing page in under 5 minutes
- The generated explanation passes the "explain to a friend" test: a non-technical reader understands the project's purpose without asking questions
- The landing page is live on GitHub Pages without manual configuration

### v0.2 Success Criteria
- A non-developer can paste any GitHub URL and receive a plain-language explanation in Korean within 60 seconds
- The "why do you need this?" prompt generates a recorded decision that the user confirms is accurate

### v0.3 Success Criteria
- Users can retrieve past decisions ("why did I choose this tool?") from mnemo-hook memory
- Decision records survive across sessions

### Qualitative Success
- NerdSpecs' own README and landing page are generated entirely by NerdSpecs itself (self-proving)
- At least one person who has never coded successfully uses NerdSpecs to document their first AI-built project

---

## 9. Constraints

### Platform
- Windows 11 primary runtime
- Cross-platform compatible (Mac, Linux)
- Works within Claude Code CLI environment
- Non-developer must install and use without terminal expertise

### Language
- Korean + English bilingual output as default
- All user-facing prompts available in Korean
- All generated documentation optionally in Korean

### Infrastructure
- GitHub Pages for landing page hosting (free, no additional accounts)
- No paid services in v0.1 baseline
- mnemo-hook must be installed for F2/F9 memory features (graceful fallback if absent)

### Privacy
- User's project code is analyzed locally or via Claude Code (not sent to third-party services)
- "Why I built this" answers are stored locally in mnemo-hook (not uploaded)

### Scope Exclusions (Not Building)
- No web application (CLI-only for v0.1-v0.3)
- No database backend (file-based storage only)
- No user authentication or accounts
- No real-time collaboration
- No paid tier in initial versions

---

## 10. Roadmap

### v0.1 — WRITE Core
**Goal**: Non-developer can auto-generate README + landing page on git push
**Features**: F1, F2, F3, F4, F5, F6
**Done when**: NerdSpecs documents itself using itself

### v0.2 — READ Layer
**Goal**: Non-developer can understand any GitHub project
**Features**: F7, F8, F9
**Done when**: Korean non-developer can assess any GitHub project without English

### v0.3 — THINK Records
**Goal**: Decisions are recorded and retrievable
**Features**: Enhanced F2/F9 with full mnemo-hook integration
**Done when**: User can ask "why did I choose X?" and get a recorded answer

### Future (Unscheduled)
- Community library of translated project explanations
- Batch processing (translate entire awesome-list)
- Integration with HuggingFace in addition to GitHub
- VSCode extension wrapper

---

## 11. Open Questions

1. How does NerdSpecs handle private repositories in READ mode? (GitHub token auth required)
2. What image generation tool is used for landing page hero images? (MCP image gen TBD)
3. Does the git hook require user to install it manually, or does NerdSpecs install it automatically?
4. How does mnemo-hook handle projects that are later deleted or renamed?
5. What is the fallback experience when mnemo-hook is not installed?
