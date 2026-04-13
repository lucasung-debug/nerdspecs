# 09-doubt-audit.md — Combined Doubt + Socrates Audit

## Meta
- Project: NerdSpecs
- Version: 0.1-draft
- Date: 2026-04-13
- Author: DDSMUX Planning Session (T1 Claude Opus)
- Sessions: /doubt (assumption decomposition) + /socrates (market expansion)

---

## What Is This Document?

This document records the full intellectual work behind NerdSpecs' planning. It is the audit trail of two planning methodologies applied in sequence:

1. **/doubt** — Systematic assumption decomposition: What do we believe to be true? What happens if we're wrong?
2. **/socrates** — Socratic expansion: What did we miss? What questions do we not know to ask?

Together, these produced the final Cogito and the validated feature set.

---

## Part 1: /doubt Session Results

### 1.1 Initial Problem Statement (Before /doubt)

The problem before doubt-testing:

> "Non-developers who use AI to build projects cannot write GitHub READMEs because they don't know developer jargon. There should be a tool that writes READMEs for them automatically."

This was the starting hypothesis. /doubt was applied to it.

---

### 1.2 Assumption Inventory

Every assumption embedded in the initial problem statement, extracted explicitly:

| ID | Assumption | Type |
|----|------------|------|
| A1 | Non-developers are using AI to build projects | Market reality |
| A2 | These non-developers want to share on GitHub | User motivation |
| A3 | GitHub requires developer-style documentation | Platform constraint |
| A4 | Non-developers lack jargon to write docs | Skill gap |
| A5 | Automatic generation is better than templates | Solution design |
| A6 | README is the right output format | Output format |
| A7 | The problem is only one-directional (writing) | Scope |
| A8 | Automation alone solves the problem | Solution completeness |

---

### 1.3 Five-Layer Doubt Results

**Layer 1: Doubt the facts**

*Is A1 true? Are non-developers actually building projects with AI?*

Evidence: Yes. Measurably true. Claude Code, Cursor, GitHub Copilot all report majority non-developer user growth. "Vibe coding" as a term emerged in 2025 precisely to name this phenomenon. Not a prediction — an observed reality.

*Is A3 true? Does GitHub actually require developer documentation?*

Doubt result: Partially false. GitHub does not REQUIRE developer documentation — it just does not provide non-developer tools. A README is a plain text file; anyone can write anything. The real constraint is cultural expectation and tool defaults, not a hard GitHub requirement. **Implication: The problem is cultural and tooling, not technical.**

**Layer 2: Doubt the cause**

*Is the problem that non-developers lack jargon (A4), or something else?*

Deeper doubt: The problem might not be vocabulary. Non-developers might HAVE the vocabulary to explain their project — they just don't know the STRUCTURE. GitHub READMEs have implicit conventions (installation, usage, contributing) that non-developers don't know exist, let alone how to fill.

**Revised understanding**: The problem is both vocabulary AND structure. A jargon-to-plain translator is insufficient — the tool must also impose the right structure.

**Layer 3: Doubt the solution**

*Is automatic generation (A5) better than templates?*

Templates give control; generation gives quality. Templates require the user to fill them out, which requires knowing what to say — the same problem. Generation is better for the core use case.

But: What about the motivation? Code analysis can detect WHAT a project does, but not WHY the user built it. Generation from code alone is incomplete. **Implication: Human input is required for motivation; only automation without human input is incomplete.**

This doubt session generated the insight that became F2 (the "why did you build this?" question).

**Layer 4: Doubt the scope (A7)**

*Is the problem only one-directional (non-developers writing for others)?*

What about non-developers READING what others wrote? If a non-developer builds with AI, they must also evaluate tools built by others. The same translation barrier that prevents writing also prevents reading.

This doubt session generated the READ feature set (F7, F8).

**Layer 5: Doubt the goal**

*What is the actual outcome we want?*

The stated goal: "non-developers can write READMEs."

Doubting this: Is writing a README the real goal? Or is the goal that non-developers can PARTICIPATE in the open-source ecosystem as full members?

Participation requires:
- Explaining their own work (WRITE)
- Understanding others' work (READ)
- Making good decisions about which tools to adopt (THINK)

**This doubt session produced the three-part Cogito**: Write + Read + Think. The original problem statement was only one-third of the real problem.

---

### 1.4 /doubt Extracted Cogito (Pre-Socrates)

After the five layers, the extracted Cogito candidate:

> "A translation layer for non-developers that converts between developer language and human language — in both directions — with enough retained understanding to make good decisions."

This was the pre-Socrates version. Note: "retained understanding" was present but underdeveloped. The record-keeping and "thinking" components needed further development.

---

## Part 2: /socrates Session Results

### 2.1 Competitive Landscape Deep Dive

/socrates asked: "What already exists? Where is the gap?"

**Existing tools analyzed**:

| Tool | What It Does | Why It's Not NerdSpecs |
|------|-------------|----------------------|
| readme-ai | Auto-generates README from code analysis | For developers; markdown output only; no landing page; no reading mode; no Korean; no "why" |
| Mintlify | Beautiful documentation sites | For developers; requires manual writing; no code analysis; no plain-language translation |
| Doxygen / JSDoc | Generate API docs from code comments | For developers; highly technical output; opposite of plain language |
| GitHub Copilot README suggestions | Inline README suggestions | For developers; no visual output; no structured plain-language goal |
| Notion AI | AI writing in Notion | Generic; no code awareness; not GitHub-integrated |
| MyTotems.page | Landing page format validation | No code analysis; no AI generation; format-only |
| HuggingFace Spaces README | HuggingFace-specific README format | Domain-specific; developer-focused |

**Gap identified**: The intersection of (1) code analysis + (2) non-developer prose + (3) visual landing page + (4) reading mode + (5) bilingual output is **unoccupied**. No tool does more than two of these five.

**Conclusion**: No direct competitor exists. NerdSpecs occupies a novel position.

---

### 2.2 Persona Deep Dive (Socrates Expansion)

/doubt had identified "non-developers who build with AI" as the target. /socrates questioned whether this was specific enough.

**Socrates pushed**: Who specifically? What do they want? What words do they use?

**Three personas emerged** (see PRD 01-prd.md for full definitions):

1. **Vibe Coder**: The builder who needs WRITE features
2. **Explorer**: The evaluator who needs READ + THINK features
3. **Starter**: The newcomer who needs READ + discoverability

The Explorer and Starter personas were NOT in the original problem statement. /socrates found them by asking "who else faces this translation barrier?"

**Critical insight from Socrates**: The Explorer persona is actually more numerous than the Vibe Coder. More people browse GitHub than publish projects on it. READ mode is not a secondary feature — it is a parallel core feature.

---

### 2.3 "Thinking" Philosophy Discovery

This was the most significant /socrates contribution.

/socrates asked: "If translation is solved, what else is missing?"

The question that surfaced: *"If AI can translate any project perfectly, why would anyone use NerdSpecs instead of just asking ChatGPT?"*

This question forced a deeper answer. The differentiator cannot be translation quality alone — AI is a commodity. The differentiator must be something structural.

**Socrates iteration**:
- Round 1: "NerdSpecs is integrated with GitHub" → Not sufficient; GitHub has its own AI
- Round 2: "NerdSpecs remembers your answers" → Getting closer
- Round 3: "NerdSpecs forces you to THINK before it records" → This is it

The insight: Forcing the user to articulate their reasoning is not just a UX feature. It is the product's core differentiator. AI can summarize; only the user can reason. If NerdSpecs captures the reasoning (not just the summary), its records are genuinely irreplaceable.

This is where "Thinking by Human" became a full Cogito clause, not just a nice-to-have feature.

---

### 2.4 Read + Write Expansion

/socrates asked: "Is the WRITE flow complete? What scenarios does it miss?"

**Scenarios surfaced by Socrates**:
1. Project is updated frequently — documentation goes stale (→ F6, auto-trigger)
2. User builds in a language other than their native language — the README reflects their second language (→ F8, bilingual output)
3. User's "why I built this" changes over time (→ F2's "is this still accurate?" confirmation)
4. User has multiple projects with different motivations (→ keyed memory by repo slug)

**Scenarios surfaced for READ flow**:
1. User evaluates a project and decides not to use it — that decision is also worth recording (→ F9 `decision: "skip"` option)
2. User wants to share the explanation with a non-technical colleague (→ landing page link or shareable summary format)
3. User reads an explanation and disagrees — wants to add their own annotation (→ deferred to v0.3+)

---

## Part 3: Gap Analysis

### What /doubt Found That /socrates Missed

| Finding | Source | Impact |
|---------|--------|--------|
| "Why I built this" cannot be inferred from code | /doubt layer 3 | Required F2 — the most important UX innovation |
| The problem is cultural, not technical | /doubt layer 1 | Scoped the solution to cultural/tooling intervention |
| Assumption A8 (automation alone) is false | /doubt layer 3 | Defined the human-in-the-loop requirement |

### What /socrates Found That /doubt Missed

| Finding | Source | Impact |
|---------|--------|--------|
| Explorer and Starter personas | /socrates persona expansion | Elevated READ mode to parity with WRITE |
| No direct competitor exists | /socrates competitive analysis | Confirmed novel market position |
| "Thinking" as core differentiator | /socrates philosophy question | Elevated F9 from nice-to-have to core feature |
| Korean is a first-class concern, not localization | /socrates market analysis | Required F8 to be designed-in, not added-on |
| Documentation goes stale | /socrates write expansion | Required F6 (git hook auto-trigger) |

### Key Tensions Identified and Resolved

**Tension 1: Speed vs. Thinking**

/doubt wanted maximum automation. /socrates revealed that removing thinking removes the core value. Resolution: Automate everything EXCEPT the "why" questions. The two questions (F2 and F9) are the intentional friction that preserves the product's differentiator.

**Tension 2: README vs. Landing Page**

/doubt focused on README (GitHub convention). /socrates revealed that README is a developer artifact — a landing page serves the non-developer audience better. Resolution: Generate both. README for GitHub convention; landing page for non-developer audience.

**Tension 3: Claude Code Skill vs. Standalone Tool**

/doubt assumed Claude Code skill is sufficient. /socrates noted that many non-developers use other AI tools (Cursor, Copilot). Resolution: v0.1 as Claude Code skill (fastest path to working product); standalone CLI as v0.2 priority (broader distribution). Flagged as A5 BURN assumption.

---

## Part 4: Final Integrated Cogito

After /doubt + /socrates, the final Cogito:

> **"A tool that helps non-developers explain their AI-built projects (WRITE) and understand others' projects (READ) — automation handles translation, humans handle thinking, records are kept together."**

**Tagline**: "Translation by AI, Thinking by Human, Records Together"

### Why This Cogito Is Right

1. **It is falsifiable**: If a product does not do WRITE + READ + keep records, it is not NerdSpecs.
2. **It identifies who cannot replace it**: Generic AI assistants can translate. Only NerdSpecs forces the thinking step and records it.
3. **It contains all three product phases**: WRITE = v0.1, READ = v0.2, Records = v0.3.
4. **It names the non-obvious innovation**: "Humans handle thinking" sounds obvious but no competitor does it. Every competitor automates the thinking away.
5. **It is honest about scope**: "non-developers" and "AI-built projects" are specific, not aspirational.

### What the Cogito Deliberately Excludes

- Developer use cases (developers already have tools)
- Real-time collaboration (not in the target behavior)
- Discovery and ranking (a future possibility, not a core truth)
- Monetization (not a truth, not a constraint in v0.1-v0.3)

---

## Part 5: Confidence Assessment

| Element | Confidence | Basis |
|---------|------------|-------|
| WRITE problem exists | High | Observable in vibe coder communities |
| READ problem exists | High | Observable in Korean AI user communities |
| THINK problem exists | Medium | Inferred from cognitive science; not directly tested |
| No direct competitor | High | Competitive analysis across 7 tools |
| Non-developer target is viable | High | Growing measurable trend |
| Korean first-class is necessary | High | Market-specific observation |
| Vibe Coder is primary persona | High | Original problem statement survives doubt |
| Explorer persona size | Medium | Larger than Vibe Coder (claim), but not measured |
| mnemo-hook adoption | Low | Niche tool; fallback must be first-class |
| Git hook UX acceptance | Low | Non-developers may fear hooks; needs testing |

**Overall planning confidence**: High enough to proceed with v0.1 build. The two Low-confidence items (mnemo-hook adoption and git hook UX) are both addressed by design (local fallback for mnemo, simple installer for hook). They are risks, not blockers.
