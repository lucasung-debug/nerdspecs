# 08-cogito-chain.md — Cogito Deduction Chain

## Meta
- Project: NerdSpecs
- Version: 0.1-draft
- Date: 2026-04-13
- Author: DDSMUX Planning Session (T1 Claude Opus)
- Session: /doubt + /socrates planning sessions

---

## What Is This Document?

The Cogito Chain is a **traceability document** that shows the deductive path from fundamental truth to each product feature. Every feature in NerdSpecs must be traceable back to the core Cogito. This document is the audit trail.

If a feature cannot be connected to the Cogito chain, it should be questioned or removed.

---

## 1. Core Cogito Statement

> **"A tool that helps non-developers explain their AI-built projects (WRITE) and understand others' projects (READ) — automation handles translation, humans handle thinking, records are kept together."**

Tagline: **"Translation by AI, Thinking by Human, Records Together"**

### Cogito Derivation

The Cogito was not chosen — it was extracted by repeatedly asking "What is the real problem?":

```
Observation: AI tools let non-developers build software
       ↓
But: Non-developers cannot communicate in developer language
       ↓
Therefore: There is a translation gap between builders and audiences
       ↓
But also: AI can translate, so why is there still a gap?
       ↓
Because: Translation without thinking produces forgetting
       ↓
Therefore: The real gap is not just language — it is RETAINED UNDERSTANDING
       ↓
Cogito: Translation by AI, Thinking by Human, Records Together
```

The Cogito has three clauses that map directly to the three product phases (v0.1, v0.2, v0.3).

---

## 2. Problem Chain

### P1: Non-developers cannot explain their projects (WRITE)
```
Premise 1: Non-developers are building software with AI tools (observed)
Premise 2: GitHub/open-source communities require written documentation
Premise 3: Writing developer documentation requires developer vocabulary
Premise 4: Non-developers lack developer vocabulary
─────────────────────────────────────────────────────
Conclusion: Non-developers cannot create documentation that communicates to others
```

### P2: Non-developers cannot understand technical documentation (READ)
```
Premise 1: Most GitHub documentation is written by developers for developers
Premise 2: Developer documentation uses domain-specific jargon
Premise 3: Most GitHub documentation is in English
Premise 4: Korean non-developers face both jargon AND language barriers
─────────────────────────────────────────────────────
Conclusion: Korean non-developers cannot reliably assess GitHub projects
```

### P3: AI summaries do not create retained understanding (THINK)
```
Premise 1: Non-developers ask AI to explain things
Premise 2: AI explanations are consumed passively
Premise 3: Passive consumption does not require reasoning
Premise 4: Memory forms from reasoning, not from reading
─────────────────────────────────────────────────────
Conclusion: AI summaries produce temporary information, not lasting understanding
```

---

## 3. Feature Justification Chain

Each feature traces back to: Cogito → Problem → User Need → Feature.

### F1: Auto-Analyze Project Code and Structure

```
Cogito:      "automation handles translation"
Problem:     P1 — non-developers cannot explain their projects
User Need:   User should not need to describe their code in technical terms
Dependency:  Before any explanation can be generated, the code must be understood
Feature:     F1 — scan and analyze project files automatically
Justification: If user had to describe the code themselves, automation is not happening.
               Automation must start from the code itself, not from the user's description.
```

### F2: "Why Did You Build This?" Memory

```
Cogito:      "Thinking by Human, Records Together"
Problem:     P3 — AI summaries don't create retained understanding
             P1 — user's motivation is not in the code itself
User Need:   Human context (motivation) that code cannot contain must come from the human once
             and be preserved for reuse
Feature:     F2 — ask once, remember forever
Justification: The motivation behind a project is pure human thought — no AI can infer it.
               But asking every time creates friction. Memory preserves the thought persistently.
               This is the "thinking" AND "records" clause of the Cogito in one feature.
```

### F3: Generate Non-Developer-Friendly Explanation

```
Cogito:      "Translation by AI"
Problem:     P1 — non-developers use developer vocabulary they don't have
User Need:   Plain-language prose that accurately represents the project without jargon
Feature:     F3 — translate technical analysis into plain language
Justification: This is the most direct implementation of "Translation by AI."
               The AI takes code (developer language) and produces prose (human language).
```

### F4: Generate Landing Page

```
Cogito:      "Translation by AI"
Problem:     P1 — a GitHub README is not enough for non-developer audience communication
User Need:   Visual, shareable representation of the project that non-technical readers trust
Feature:     F4 — generate a visual landing page, not just text
Justification: A README is still a developer artifact (you must navigate to GitHub to see it).
               A landing page is a non-developer artifact — it looks like any other website.
               Translation must extend beyond prose to visual format.
```

### F5: Organize Tech Stack Section

```
Cogito:      "automation handles translation" (specifically: segregation of audiences)
Problem:     P1 — tech stack must be present for developers but not dominate non-dev audience
User Need:   Developer-readable information preserved but placed appropriately
Feature:     F5 — structure and separate tech stack from human explanation
Justification: Removing tech stack entirely would be dishonest and reduce developer adoption.
               But placing it prominently defeats the non-developer accessibility goal.
               Automation should handle the organization — user should not decide what goes where.
```

### F6: Auto-Trigger on Git Push

```
Cogito:      "automation handles translation"
Problem:     P1 — if documentation requires manual effort, non-developers will skip it
User Need:   Documentation stays current without deliberate user action
Feature:     F6 — git hook triggers documentation automatically
Justification: "Automation handles translation" means the user should not be in the loop
               for routine updates. If the user must remember to run NerdSpecs, it will fail.
               The automation must be the default, not an option.
```

### F7: GitHub URL → Easy Explanation

```
Cogito:      "Translation by AI" (applied to reading, not just writing)
Problem:     P2 — non-developers cannot understand developer-written documentation
User Need:   Any project can be explained in plain language on demand
Feature:     F7 — translate any GitHub project's README into plain prose
Justification: The same translation function that serves WRITE also serves READ.
               If AI can translate your project outward, it can translate any project inward.
               This is the same mechanism applied to the inverse problem.
```

### F8: Korean Translation

```
Cogito:      "Translation by AI" (language translation is a subset of translation)
Problem:     P2 — English is a specific barrier for Korean non-developers
User Need:   Korean-language explanations of GitHub projects
Feature:     F8 — automatic Korean translation in all generated content
Justification: The Cogito's translation is not only technical-to-plain.
               It is also foreign-to-native-language. Korean is not a secondary feature —
               it was the original observation that motivated the problem statement.
```

### F9: "Do I Need This?" Thinking Helper

```
Cogito:      "Thinking by Human, Records Together"
Problem:     P3 — AI summaries produce temporary information, not lasting understanding
User Need:   Force the reasoning step that creates actual memory
Feature:     F9 — ask "why do you need this?", record the reasoning
Justification: Reading an explanation (even a good one) does not create understanding.
               Understanding comes from applying reasoning: "Do I need this? Why?"
               The feature does not answer the question — it forces the human to answer it.
               This is the purest expression of "Thinking by Human."
```

---

## 4. Assumption Audit Table

All assumptions made during the planning sessions, evaluated for validity.

| ID | Assumption | Type | Status | Evidence / Notes |
|----|------------|------|--------|-----------------|
| A1 | Non-developers are a growing segment of GitHub contributors | Market | SURVIVE | GitHub Octoverse reports increasing non-traditional contributors; AI coding tool adoption is measurable |
| A2 | Non-developers cannot write developer documentation | User behavior | SURVIVE | Confirmed by persona research; "vibe coder" communities (Reddit, Discord) consistently report this pain |
| A3 | Korean non-developers have double barrier (jargon + English) | Localization | SURVIVE | Korean GitHub community discussion; Korean AI tool usage is high but English documentation creates friction |
| A4 | AI summaries do not create retained understanding | Cognitive | SURVIVE (weak) | Supported by cognitive science (passive vs active learning); but not directly tested in this product context |
| A5 | Non-developers already have Claude Code installed | Distribution | BURN (partial) | Too narrow — many non-devs use Cursor, GitHub Copilot, or web-based AI. NerdSpecs should not REQUIRE Claude Code |
| A6 | GitHub Pages is the right hosting for landing pages | Technical | SURVIVE | Free, integrated with GitHub, no extra account; perfect for non-developer use |
| A7 | mnemo-hook will be widely used by target personas | Integration | BURN | mnemo-hook is a niche tool; most non-developers won't have it. Fallback must be first-class, not afterthought |
| A8 | Git push hook is a good UX for non-developers | UX | BURN (partial) | Non-developers may not understand post-push hooks. Installation step must be truly simple. Auto-mode UX must be tested. |

### Assumption Action Items

**A5 (BURN)**: NerdSpecs should be installable as a standalone CLI tool, not only as a Claude Code skill. The Claude Code skill is the v0.1 path; standalone CLI is v0.2 priority.

**A7 (BURN)**: The mnemo-hook fallback (local `.nerdspecs/memory.json`) must be equally well-designed as the mnemo-hook integration. Do not treat fallback as second-class.

**A8 (partial BURN)**: Hook installation must be a one-command operation with clear confirmation. The user must understand what "auto-update docs on push" means in plain language before installing.

---

## 5. Rejected Features

These features were considered and explicitly rejected during planning sessions.

### R1: Web Application Dashboard

**What**: A web app where users log in and manage their projects

**Rejected because**:
- Adds authentication complexity
- Requires server hosting (cost, maintenance)
- Breaks the "works in your existing Claude Code environment" value proposition
- Non-developers would need yet another account
- The Cogito is satisfied by CLI + GitHub Pages — no web app is needed

### R2: Automatic Screenshot Capture

**What**: NerdSpecs captures screenshots of running projects automatically

**Rejected because**:
- Requires projects to be running (not always the case)
- Highly environment-dependent (window manager, OS)
- Too complex to be reliable across Windows/Mac/Linux
- Hero image can be user-provided or CSS placeholder; screenshots are not required for v0.1

### R3: Team Collaboration Mode

**What**: Multiple users can co-document a project

**Rejected because**:
- Target user is a solo vibe coder
- Multi-user adds merge conflicts, permissions, and UX complexity
- Not in the Cogito — "records together" means one person's records across time, not multiple people

### R4: SEO Optimization for Landing Pages

**What**: Auto-generate meta tags, sitemap, structured data for search engine ranking

**Rejected for v0.1 because**:
- Adds significant template complexity
- Most non-developer projects are not optimized for search discovery
- Not a primary user pain point (the problem is documentation quality, not SEO)
- Can be added in v0.3+ as an enhancement layer

### R5: Pricing Tiers / Pro Features

**What**: Freemium model with paid features

**Rejected for v0.1-v0.3 because**:
- NerdSpecs is a portfolio project; monetization is not a goal
- Paid tiers would create friction for the non-developer audience
- Open source / community tool model aligns better with the target personas
- Revenue is not in the Cogito

---

## 6. Cogito Integrity Check

After all features are defined, verify against the Cogito:

| Cogito Clause | Covered By | Coverage |
|---------------|-----------|----------|
| "Translation by AI" | F1, F3, F4, F5, F7, F8 | Strong — multiple features |
| "Thinking by Human" | F2, F9 | Covered — both write and read contexts |
| "Records Together" | F2 (memory), F9 (decisions) | Covered — needs mnemo-hook reliability |
| "WRITE (explain yours)" | F1, F2, F3, F4, F5, F6 | Strong — full v0.1 coverage |
| "READ (understand others)" | F7, F8, F9 | Covered — full v0.2 coverage |
| "Automation handles translation" | F1, F6, F7, F8 | Strong |
| "Humans handle thinking" | F2, F9 | Covered — must not let AI answer the "why" questions |

**Integrity result**: All Cogito clauses are covered. No orphan features (features with no Cogito connection). The "Records Together" clause is the most fragile — it depends on mnemo-hook reliability (see A7 above).

---

## 7. Philosophical Foundation

The Cogito chain rests on a specific view of the AI era:

> "In the AI era, automation is easy. But humans must think. Thinking creates memory, memory creates creativity. NerdSpecs automates translation but preserves human thinking."

This means:

1. **NerdSpecs must never answer "why" questions for the user.** If asked "why did you build this?", NerdSpecs waits for the human answer. It does not suggest answers. It does not pre-fill based on code analysis. The human answer is sacred.

2. **The thinking moment is not a UX obstacle.** The "why do you need this?" question might feel like friction. It is intentional friction — the kind that creates memory. Removing it would optimize for speed at the cost of the core value proposition.

3. **Records are not logs.** The records NerdSpecs keeps are not usage telemetry or analytics. They are the user's own thinking, stored for the user's own benefit. This distinction must be preserved in all future feature development.
