# 05-design-system.md — Design System

## Meta
- Project: NerdSpecs
- Version: 0.1-draft
- Date: 2026-04-13
- Author: DDSMUX Planning Session (T1 Claude Opus)

---

## 1. Brand Identity

### Name and Concept

**NerdSpecs** — The nerd glasses metaphor is the foundation of all visual design decisions.

- **Nerd glasses**: Round or rectangular thick-frame glasses, iconic symbol of learning and clarity
- **Specs**: Double meaning — eyeglasses (making things visible) + specifications (technical documents)
- **Core metaphor**: "Put on nerd glasses and the project becomes visible"

The brand feeling is: **approachable intelligence**. Not cold and corporate. Not childish. The tone of a brilliant friend who explains things clearly without making you feel dumb.

### Brand Personality Attributes

| Attribute | Description |
|-----------|-------------|
| Approachable | Never intimidating, always welcoming non-developers |
| Clear | Removes complexity, adds clarity |
| Warm | Friendly tone, not cold technical documentation |
| Honest | Does not overpromise; shows limitations |
| Bilingual | Korean and English are equally first-class |

### Brand Voice

- Speaks like a smart friend, not a manual
- Short sentences. Active voice.
- Concrete examples over abstract descriptions
- No jargon. If technical term is unavoidable, immediately explain it
- Korean translations maintain the same warmth (avoid formal 존댓말 overuse; semi-formal 해요체)

---

## 2. Color System

### Primary Palette

| Name | Hex | Usage |
|------|-----|-------|
| Nerd Black | `#1A1A2E` | Primary text, headings |
| Lens Blue | `#4A90E2` | Primary action color, links, CTAs |
| Glass Frame | `#2C3E50` | Secondary headings, borders |
| Paper White | `#F8F9FA` | Background, card backgrounds |
| Warm White | `#FEFEFE` | Page background |

### Accent Palette

| Name | Hex | Usage |
|------|-----|-------|
| Highlight Yellow | `#FFD60A` | Key phrases, tooltips, "nerd glasses" accent |
| Success Green | `#27AE60` | Completion states, success messages |
| Warning Orange | `#F39C12` | Warnings, "beta" labels |
| Error Red | `#E74C3C` | Error states only |

### Semantic Usage Rules

- **Lens Blue** is the only interactive color. All clickable elements use it.
- **Highlight Yellow** is used sparingly (max 1-2 instances per page) — it represents the "glasses moment" of clarity
- **Nerd Black** for all body text; never pure `#000000` (too harsh)
- **Paper White** backgrounds keep the visual feel of printed documentation

### Dark Mode Variants (v0.2)

| Light | Dark | Usage |
|-------|------|-------|
| `#F8F9FA` | `#1A1A2E` | Background |
| `#1A1A2E` | `#F8F9FA` | Text |
| `#4A90E2` | `#60A5FA` | Links/Actions |

---

## 3. Typography

### Font Stack

```css
/* Headings */
font-family: 'Inter', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

/* Body text */
font-family: 'Inter', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

/* Code blocks */
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

**Rationale**:
- **Inter**: Clean, highly readable, excellent for both English and screen display
- **Pretendard**: Korean-optimized geometric sans-serif that pairs naturally with Inter
- No decorative fonts — legibility over aesthetics; NerdSpecs is about clarity

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display-xl` | 3.5rem (56px) | 800 | 1.1 | Hero headline |
| `display-lg` | 2.5rem (40px) | 700 | 1.2 | Section headlines |
| `heading-xl` | 2rem (32px) | 700 | 1.3 | H1 in README |
| `heading-lg` | 1.5rem (24px) | 600 | 1.4 | H2 in README |
| `heading-md` | 1.25rem (20px) | 600 | 1.4 | H3, card titles |
| `body-lg` | 1.125rem (18px) | 400 | 1.6 | Landing page body |
| `body-md` | 1rem (16px) | 400 | 1.6 | README body text |
| `body-sm` | 0.875rem (14px) | 400 | 1.5 | Captions, footnotes |
| `code` | 0.875rem (14px) | 400 | 1.5 | Code blocks |
| `label` | 0.75rem (12px) | 600 | 1.4 | Tags, labels, badges |

### Korean Typography Notes

- Korean characters need slightly more line height (+0.1 to +0.2) than Latin for comfortable reading
- Pretendard is preferred over Noto Sans KR for its geometric proportions matching Inter
- Mixed Korean/English line: use Inter/Pretendard hybrid (they share proportions)
- Minimum font size for Korean body text: 16px (14px is too small for complex characters)

---

## 4. Spacing System

Base unit: **8px**

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight internal padding |
| `space-2` | 8px | Standard internal padding |
| `space-3` | 12px | Small gap |
| `space-4` | 16px | Standard gap |
| `space-6` | 24px | Section padding |
| `space-8` | 32px | Component spacing |
| `space-12` | 48px | Section separation |
| `space-16` | 64px | Large section break |
| `space-24` | 96px | Hero section spacing |

---

## 5. Component Library (Landing Page)

### 5.1 Hero Component

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   [Logo: nerd glasses icon]  NerdSpecs               │
│                                                      │
│   Put on nerd glasses and the                       │
│   project becomes visible.                          │
│                                                      │
│   [Highlight: Translation by AI, Thinking by Human] │
│                                                      │
│   [CTA: Get NerdSpecs]  [CTA: See an example]       │
│                                                      │
│   [Hero image: glasses on top of code / GitHub]     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Design tokens**:
- Background: gradient `#1A1A2E` → `#2C3E50`
- Headline: `display-xl`, color: `#FEFEFE`
- Subheadline: `body-lg`, color: `rgba(255,255,255,0.8)`
- Highlight: `#FFD60A` background, `Nerd Black` text
- CTA primary: `Lens Blue` background, white text
- CTA secondary: transparent, `Lens Blue` border

### 5.2 Problem Section

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   Have you experienced this?                        │
│                                                      │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│   │ 😤 You     │  │ 😕 You     │  │ 🤔 You     │   │
│   │ built      │  │ found a    │  │ chose a    │   │
│   │ something  │  │ GitHub     │  │ tool but   │   │
│   │ but can't  │  │ project    │  │ forgot why │   │
│   │ explain it │  │ you can't  │  │ a week     │   │
│   │            │  │ understand │  │ later      │   │
│   └────────────┘  └────────────┘  └────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Design tokens**:
- Background: `Paper White`
- Cards: white, `1px solid #E0E0E0`, `border-radius: 12px`
- Card headline: `heading-md`, `Nerd Black`
- Card body: `body-md`, `#555555`

### 5.3 Solution Section

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   NerdSpecs solves it like this                     │
│                                                      │
│   BEFORE ──────────────────────> AFTER              │
│                                                      │
│   Technical README              Plain-language      │
│   that nobody understands  →    README everyone     │
│                                 can read             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Design tokens**:
- Background: `#F0F4FF` (light blue tint)
- Before: `#888888` text, strikethrough style
- Arrow: `Lens Blue`
- After: `Nerd Black`, bold

### 5.4 How-To Section

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   How to use NerdSpecs                              │
│                                                      │
│   ① Run /nerdspecs write                           │
│      [screenshot]                                   │
│                                                      │
│   ② Answer one question                             │
│      "Why did you build this?"                      │
│      [screenshot]                                   │
│                                                      │
│   ③ Your README and landing page are ready         │
│      [screenshot of result]                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Step number design**: `Lens Blue` circle, white number, `heading-lg` inside

### 5.5 Tech Stack Footer

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   Built with                                        │
│                                                      │
│   [Claude Code]  [Node.js]  [Astro]  [GitHub Pages] │
│   [mnemo-hook]                                      │
│                                                      │
│   Open source · MIT License                         │
│   github.com/lucasung-debug/nerdspecs               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 6. README Template Structure

The README template is a Markdown document with defined sections and visual hierarchy.

```markdown
<!-- NERDSPECS GENERATED - DO NOT EDIT MANUALLY -->

<div align="center">
  <img src="./docs/hero.png" alt="[Project Name]" width="600">

  # [Project Name]

  > [One-line plain-language summary]

  [View Landing Page](https://username.github.io/repo) · [Report Issue](https://github.com/...)

  ---
</div>

## What is this?

[Plain-language explanation — 2-3 paragraphs, no jargon]

## Who is it for?

[Concrete description of target user — "If you are a teacher who...", "If you run a small business..."]

## How to use it

[Step-by-step instructions — maximum 5 steps, plain language]

### Step 1: [...]
...

---

<details>
<summary>For Developers: Tech Stack and Installation</summary>

## Tech Stack

| Layer | Technology |
|-------|-----------|
| ... | ... |

## Installation

\`\`\`bash
...
\`\`\`

## Contributing

...

</details>
```

**Key design decisions**:
- Developer section is in a `<details>` collapse by default — invisible to casual readers, accessible to developers
- Hero image is center-aligned — visual first, text second
- Korean translation: duplicate sections with `[한국어]` heading, OR add Korean beneath each English paragraph

---

## 7. Bilingual Layout Guidelines

### Approach: Inline Bilingual (Default)

Preferred for README and landing page:

```markdown
## What is this? / 이게 뭔가요?

NerdSpecs automatically creates documentation for your AI-built project.
NerdSpecs는 AI로 만든 프로젝트의 문서를 자동으로 생성해줍니다.
```

### Alternative: Separate Sections

For landing pages where layout matters:

```
[Language toggle: English | 한국어]
```

Toggle switches entire page content, not individual sections.

### Rules for Korean Translation

1. Korean text immediately follows the English text (same section, separated by blank line)
2. Korean translations match the register (semi-formal 해요체 — warm but respectful)
3. Technical terms that have no natural Korean equivalent are kept in English with Korean explanation in parentheses: `GitHub Pages (깃허브 페이지 — 무료 웹사이트 호스팅)`
4. Korean paragraphs should not be direct literal translations — they should be natural Korean sentences
5. Korean headline/subheadline can be displayed at same visual weight as English or slightly smaller (Korean characters are visually denser)

---

## 8. CLI Interface Design

The CLI output (terminal text) has its own visual design:

### Progress Messages
```
[NerdSpecs] Reading your project files... (14 files)
[NerdSpecs] Understanding what your project does...
[NerdSpecs] Writing your README...
[NerdSpecs] Building your landing page...
[NerdSpecs] Publishing to GitHub Pages...
[NerdSpecs] Done!
```

**Prefix**: Always `[NerdSpecs]` — makes it easy to distinguish NerdSpecs output from other terminal output

### Success State
```
[NerdSpecs] Done! Here's what was created:

  README.md       updated (347 lines)
  Landing page    https://username.github.io/my-project

Share the landing page link with anyone to explain your project.
```

### Error State
```
[NerdSpecs] Something went wrong.

  What happened: Couldn't connect to GitHub to deploy the landing page.
  What to do:   Check your internet connection, then run /nerdspecs write again.
  Error code:   ERR_PAGES_PUSH_FAILED (for support)
```

### Prompt Design
```
[NerdSpecs] One question before we start:

  Why did you build this project?
  What problem does it solve for you?

  > [user types here]
```

Prompt uses `>` character as the input indicator — familiar from terminal conventions, visually clean.

---

## 9. Logo and Icon

### Primary Logo Mark

The NerdSpecs logo is a pair of round glasses where:
- The left lens contains `< >` (code brackets)
- The right lens contains the letter `N` (for NerdSpecs)

ASCII representation for terminal use:
```
  (< >)(N)
  NerdSpecs
```

SVG version (for landing pages and README): To be created in implementation phase.

### Favicon
Round glasses icon, `Lens Blue` on `Nerd Black` background.

### GitHub Social Preview
1200×630px image:
- Dark background (`#1A1A2E`)
- Large logo in center
- Tagline below: "Translation by AI, Thinking by Human, Records Together"
- Bottom: `github.com/lucasung-debug/nerdspecs`
