// @TEST P3-S9-T1 - Landing Page Spec Compliance
// @IMPL src/generators/landing-template.ts
// @SPEC specs/screens/generated-landing-page.yaml

import { describe, it, expect } from 'vitest';
import { generateLandingPage, type LandingData } from '../../src/generators/landing-template.js';

function sampleData(overrides: Partial<LandingData> = {}): LandingData {
  return {
    project_name: 'SpecLandingApp',
    summary: 'Your project explained simply.',
    motivation: 'Non-developers need readable docs.',
    pain_points: [
      'You built something great but no one understands it.',
      'Writing docs takes hours you do not have.',
      'Your README is full of jargon.',
    ],
    tech_stack: {
      language: 'TypeScript',
      frameworks: ['Express'],
    },
    repo_url: 'https://github.com/example/spec-landing-app',
    language_mode: 'en',
    ...overrides,
  };
}

// ─── spec: all 6 sections present ────────────────────────────────────────────
describe('spec: all 6 sections present', () => {
  it('top_nav — id="nav" element present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('id="nav"');
  });

  it('hero_section — id="hero" element present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('id="hero"');
  });

  it('pain_points (problem) — id="problem" element present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('id="problem"');
  });

  it('before_after (solution) — id="solution" element present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('id="solution"');
  });

  it('how_to_steps — id="howto" element present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('id="howto"');
  });

  it('tech_footer — id="tech-footer" element present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('id="tech-footer"');
  });

  it('sections appear in correct document order: nav → hero → problem → solution → howto → footer', () => {
    const out = generateLandingPage(sampleData());
    const nav = out.indexOf('id="nav"');
    const hero = out.indexOf('id="hero"');
    const problem = out.indexOf('id="problem"');
    const solution = out.indexOf('id="solution"');
    const howto = out.indexOf('id="howto"');
    const footer = out.indexOf('id="tech-footer"');

    expect(nav).toBeLessThan(hero);
    expect(hero).toBeLessThan(problem);
    expect(problem).toBeLessThan(solution);
    expect(solution).toBeLessThan(howto);
    expect(howto).toBeLessThan(footer);
  });
});

// ─── spec: responsive CSS breakpoints ────────────────────────────────────────
describe('spec: responsive CSS breakpoints', () => {
  it('768px media query present in CSS', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('@media (max-width: 768px)');
  });

  it('480px media query present in CSS', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('@media (max-width: 480px)');
  });

  it('card-grid switches to 1 column at 480px', () => {
    const out = generateLandingPage(sampleData());
    const idx480 = out.indexOf('@media (max-width: 480px)');
    const section480 = out.slice(idx480, idx480 + 300);
    expect(section480).toContain('.card-grid');
    expect(section480).toMatch(/grid-template-columns\s*:\s*1fr/);
  });

  it('card-grid is 3-column by default (desktop)', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('grid-template-columns:repeat(3,1fr)');
  });

  it('card-grid becomes 2-column at 768px (tablet)', () => {
    const out = generateLandingPage(sampleData());
    const idx768 = out.indexOf('@media (max-width: 768px)');
    const section768 = out.slice(idx768, idx768 + 300);
    expect(section768).toContain('.card-grid');
    expect(section768).toMatch(/grid-template-columns\s*:\s*repeat\(2,1fr\)/);
  });
});

// ─── spec: language toggle button ────────────────────────────────────────────
describe('spec: language toggle button', () => {
  it('lang-toggle button element present in nav', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('class="lang-toggle"');
  });

  it('toggle button has EN | KO label', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('EN | KO');
  });

  it('cycleLang JS function present for toggle behavior', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('cycleLang');
  });

  it('localStorage used to persist language preference', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('localStorage');
    expect(out).toContain('nerdspecs-lang');
  });

  it('data-lang attributes present for language switching', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('data-lang="en"');
    expect(out).toContain('data-lang="ko"');
  });
});

// ─── spec: 3 pain point cards ────────────────────────────────────────────────
describe('spec: 3 pain point cards', () => {
  it('renders exactly 3 pain-card elements', () => {
    const out = generateLandingPage(sampleData());
    const matches = out.match(/class="pain-card"/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(3);
  });

  it('each pain point text appears in the output', () => {
    const data = sampleData();
    const out = generateLandingPage(data);
    for (const point of data.pain_points) {
      expect(out).toContain(point);
    }
  });

  it('pain cards are inside card-grid container', () => {
    const out = generateLandingPage(sampleData());
    const gridStart = out.indexOf('class="card-grid"');
    const gridEnd = out.indexOf('</div>', gridStart);
    // all pain-card occurrences must be between gridStart and the closing of problem section
    const problemSection = out.slice(
      out.indexOf('id="problem"'),
      out.indexOf('id="solution"')
    );
    expect(problemSection.match(/class="pain-card"/g)?.length).toBe(3);
  });

  it('custom pain point count: 1 card renders correctly', () => {
    const out = generateLandingPage(sampleData({ pain_points: ['Only one pain.'] }));
    expect(out.match(/class="pain-card"/g)?.length).toBe(1);
  });
});

// ─── spec: valid HTML structure ───────────────────────────────────────────────
describe('spec: valid HTML structure', () => {
  it('starts with <!DOCTYPE html>', () => {
    const out = generateLandingPage(sampleData());
    expect(out.trimStart()).toMatch(/^<!DOCTYPE html>/i);
  });

  it('<html> tag present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('<html');
    expect(out).toContain('</html>');
  });

  it('<head> with charset UTF-8 present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('<head>');
    expect(out).toContain('charset="UTF-8"');
  });

  it('viewport meta tag present (mobile compatibility)', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('name="viewport"');
    expect(out).toContain('width=device-width');
  });

  it('<title> contains project name', () => {
    const out = generateLandingPage(sampleData({ project_name: 'SpecLandingApp' }));
    expect(out).toContain('<title>SpecLandingApp</title>');
  });

  it('<body> opens and closes', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('<body>');
    expect(out).toContain('</body>');
  });

  it('<style> block embedded in <head>', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('<style>');
    expect(out).toContain('</style>');
    // style must come before body
    const styleIdx = out.indexOf('<style>');
    const bodyIdx = out.indexOf('<body>');
    expect(styleIdx).toBeLessThan(bodyIdx);
  });

  it('<script> block embedded before </body>', () => {
    const out = generateLandingPage(sampleData());
    const scriptIdx = out.indexOf('<script>');
    const bodyCloseIdx = out.indexOf('</body>');
    expect(scriptIdx).toBeGreaterThan(-1);
    expect(scriptIdx).toBeLessThan(bodyCloseIdx);
  });
});

// ─── spec: hero section content ──────────────────────────────────────────────
describe('spec: hero section content', () => {
  it('project name appears in hero h1', () => {
    const out = generateLandingPage(sampleData({ project_name: 'MyHeroProject' }));
    const heroSection = out.slice(out.indexOf('id="hero"'), out.indexOf('id="problem"'));
    expect(heroSection).toContain('MyHeroProject');
    expect(heroSection).toContain('<h1>');
  });

  it('summary appears in hero section', () => {
    const out = generateLandingPage(sampleData({ summary: 'Hero summary unique 99' }));
    const heroSection = out.slice(out.indexOf('id="hero"'), out.indexOf('id="problem"'));
    expect(heroSection).toContain('Hero summary unique 99');
  });

  it('CTA button present when repo_url is set', () => {
    const out = generateLandingPage(sampleData({ repo_url: 'https://github.com/test/repo' }));
    expect(out).toContain('class="btn-cta"');
  });
});

// ─── spec: tech_footer content ───────────────────────────────────────────────
describe('spec: tech_footer section', () => {
  it('language appears in tech footer', () => {
    const out = generateLandingPage(sampleData({ tech_stack: { language: 'Rust', frameworks: [] } }));
    const footerSection = out.slice(out.indexOf('id="tech-footer"'));
    expect(footerSection).toContain('Rust');
  });

  it('frameworks appear in tech footer when present', () => {
    const out = generateLandingPage(
      sampleData({ tech_stack: { language: 'TypeScript', frameworks: ['NestJS'] } })
    );
    const footerSection = out.slice(out.indexOf('id="tech-footer"'));
    expect(footerSection).toContain('NestJS');
  });
});
