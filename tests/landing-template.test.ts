// @TASK P3-R7-T1 - Landing Page Template Engine
// @SPEC docs/planning/06-tasks.md

import { describe, it, expect } from 'vitest';
import { generateLandingPage } from '../src/generators/landing-template.js';
import type { LandingData } from '../src/generators/landing-template.js';

const base: LandingData = {
  project_name: 'TestProject',
  summary: 'A tool for testing things.',
  pain_points: ['Pain A', 'Pain B', 'Pain C'],
  tech_stack: { language: 'TypeScript', frameworks: ['Node.js', 'Vitest'] },
  language_mode: 'en',
};

describe('generateLandingPage', () => {
  it('contains hero, terminal demo, flow, compare, and cta sections', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('id="hero"');
    expect(html).toContain('terminal-wrapper');
    expect(html).toContain('flow-container');
    expect(html).toContain('compare');
    expect(html).toContain('id="cta"');
  });

  it('includes responsive media queries', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('@media(max-width:768px)');
    expect(html).toContain('@media(max-width:480px)');
  });

  it('includes language toggle JavaScript', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('data-lang="en"');
    expect(html).toContain('data-lang="ko"');
    expect(html).toContain('function cycleLang');
  });

  it('persists language choice in localStorage', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('localStorage');
    expect(html).toContain('nerdspecs-lang');
  });

  it('renders pain point cards as feature-cards', () => {
    const html = generateLandingPage(base);
    const matches = html.match(/class="feature-card"/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(3);
  });

  it('includes repo_url in GitHub link when provided', () => {
    const html = generateLandingPage({ ...base, repo_url: 'https://github.com/user/repo' });
    expect(html).toContain('href="https://github.com/user/repo"');
  });

  it('escapes user supplied HTML before insertion', () => {
    const html = generateLandingPage({
      ...base,
      project_name: 'Bad <img src=x onerror=alert(1)>',
      summary: 'Summary <b>bold</b>',
      pain_points: ['Pain <script>alert(1)</script>'],
      tech_stack: { language: 'TypeScript <svg/onload=1>', frameworks: ['Vue <i>oops</i>'] },
    });

    expect(html).not.toContain('Bad <img src=x onerror=alert(1)>');
    expect(html).toContain('Bad &lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('Summary &lt;b&gt;bold&lt;/b&gt;');
    expect(html).toContain('Pain &lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('TypeScript &lt;svg/onload=1&gt;');
    expect(html).toContain('Vue &lt;i&gt;oops&lt;/i&gt;');
  });

  it('hides GitHub link when repo_url is absent', () => {
    const html = generateLandingPage({ ...base, repo_url: undefined });
    expect(html).not.toContain('github.com');
  });

  it('omits repo link when repo_url protocol is invalid', () => {
    const html = generateLandingPage({ ...base, repo_url: 'javascript:alert(1)' });
    expect(html).not.toContain('href="javascript:alert(1)"');
  });

  it('shows project name in nav', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('TestProject');
  });

  it('renders tech stack in footer', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('TypeScript');
    expect(html).toContain('Node.js');
  });

  it('uses dark theme styling', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('--bg:#0a0a0a');
    expect(html).toContain('--accent:#22d3ee');
  });

  it('includes terminal demo with cursor animation', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('terminal-body');
    expect(html).toContain('cursor');
    expect(html).toContain('@keyframes blink');
  });

  it('produces valid HTML5 doctype', () => {
    const html = generateLandingPage(base);
    expect(html.trimStart().startsWith('<!DOCTYPE html>')).toBe(true);
  });

  it('includes inline style tag', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('<style>');
    expect(html).toContain('</style>');
  });
});
