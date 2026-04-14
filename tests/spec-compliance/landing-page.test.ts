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

// ─── spec: key sections present ─────────────────────────────────────────────
describe('spec: key sections present', () => {
  it('hero section with id="hero" present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('id="hero"');
  });

  it('terminal demo present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('terminal-wrapper');
    expect(out).toContain('terminal-body');
  });

  it('flow section with steps present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('flow-container');
    expect(out).toContain('flow-step');
  });

  it('before/after comparison present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('compare');
    expect(out).toContain('compare-box');
  });

  it('CTA section with id="cta" present', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('id="cta"');
  });

  it('pain point cards rendered when pain_points provided', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('Sound familiar?');
    expect(out).toContain('feature-card');
  });

  it('sections appear in correct order: hero → flow → compare → cta', () => {
    const out = generateLandingPage(sampleData());
    const hero = out.indexOf('id="hero"');
    const flow = out.indexOf('class="flow-container"');
    const compare = out.indexOf('<div class="compare">');
    const cta = out.indexOf('id="cta"');

    expect(hero).toBeGreaterThan(-1);
    expect(flow).toBeGreaterThan(hero);
    expect(compare).toBeGreaterThan(flow);
    expect(cta).toBeGreaterThan(compare);
  });
});

// ─── spec: responsive CSS breakpoints ───────────────────────────────────────
describe('spec: responsive CSS breakpoints', () => {
  it('768px media query present in CSS', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('max-width:768px');
  });

  it('480px media query present in CSS', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('max-width:480px');
  });

  it('features-grid is 3-column by default (desktop)', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('grid-template-columns:repeat(3,1fr)');
  });
});

// ─── spec: language toggle button ───────────────────────────────────────────
describe('spec: language toggle button', () => {
  it('lang-toggle button element present in nav', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('class="lang-toggle"');
  });

  it('toggle button has EN / KO label', () => {
    const out = generateLandingPage(sampleData());
    expect(out).toContain('EN / KO');
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

// ─── spec: pain point cards ─────────────────────────────────────────────────
describe('spec: pain point cards', () => {
  it('renders 3 feature-card elements for 3 pain points', () => {
    const out = generateLandingPage(sampleData());
    const matches = out.match(/class="feature-card"/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(3);
  });

  it('each pain point text appears in the output', () => {
    const data = sampleData();
    const out = generateLandingPage(data);
    for (const point of data.pain_points) {
      expect(out).toContain(point);
    }
  });

  it('custom pain point count: 1 card renders correctly', () => {
    const out = generateLandingPage(sampleData({ pain_points: ['Only one pain.'] }));
    expect(out).toContain('Only one pain.');
    expect(out).toContain('feature-card');
  });
});

// ─── spec: valid HTML structure ─────────────────────────────────────────────
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

  it('viewport meta tag present', () => {
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

// ─── spec: hero section content ─────────────────────────────────────────────
describe('spec: hero section content', () => {
  it('project name appears in hero h1', () => {
    const out = generateLandingPage(sampleData({ project_name: 'MyHeroProject' }));
    const heroSection = out.slice(out.indexOf('id="hero"'), out.indexOf('id="cta"'));
    expect(heroSection).toContain('MyHeroProject');
    expect(heroSection).toContain('<h1>');
  });

  it('summary appears in hero section', () => {
    const out = generateLandingPage(sampleData({ summary: 'Hero summary unique 99' }));
    const heroSection = out.slice(out.indexOf('id="hero"'), out.indexOf('id="cta"'));
    expect(heroSection).toContain('Hero summary unique 99');
  });

  it('CTA button present when repo_url is set', () => {
    const out = generateLandingPage(sampleData({ repo_url: 'https://github.com/test/repo' }));
    expect(out).toContain('btn-primary');
  });
});

// ─── spec: footer content ───────────────────────────────────────────────────
describe('spec: footer section', () => {
  it('language appears in footer', () => {
    const out = generateLandingPage(sampleData({ tech_stack: { language: 'Rust', frameworks: [] } }));
    expect(out).toContain('Rust');
  });

  it('frameworks appear in footer when present', () => {
    const out = generateLandingPage(
      sampleData({ tech_stack: { language: 'TypeScript', frameworks: ['NestJS'] } })
    );
    expect(out).toContain('NestJS');
  });
});
