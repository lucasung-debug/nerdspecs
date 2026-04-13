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
  it('contains all 6 sections', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('id="nav"');
    expect(html).toContain('id="hero"');
    expect(html).toContain('id="problem"');
    expect(html).toContain('id="solution"');
    expect(html).toContain('id="howto"');
    expect(html).toContain('id="tech-footer"');
  });

  it('includes responsive media queries', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('@media (max-width: 768px)');
    expect(html).toContain('@media (max-width: 480px)');
  });

  it('includes language toggle JavaScript', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('data-lang="en"');
    expect(html).toContain('data-lang="ko"');
    expect(html).toContain('function toggleLang');
  });

  it('persists language choice in localStorage', () => {
    const html = generateLandingPage(base);
    expect(html).toContain('localStorage');
    expect(html).toContain('nerdspecs-lang');
  });

  it('renders 3 pain point cards', () => {
    const html = generateLandingPage(base);
    const matches = html.match(/class="pain-card"/g);
    expect(matches).toHaveLength(3);
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
    expect(html).not.toContain('class="btn-cta"');
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

  it('defaults to en lang visibility when language_mode is en', () => {
    const html = generateLandingPage({ ...base, language_mode: 'en' });
    expect(html).toContain('||"en"');
  });

  it('defaults to ko lang visibility when language_mode is ko', () => {
    const html = generateLandingPage({ ...base, language_mode: 'ko' });
    expect(html).toContain('||"ko"');
  });

  it('shows both by default when language_mode is both', () => {
    const html = generateLandingPage({ ...base, language_mode: 'both' });
    expect(html).toContain('||"both"');
  });

  it('normalizes unexpected language_mode values before embedding in script', () => {
    const html = generateLandingPage({
      ...base,
      language_mode: 'en";window.__LANG_XSS__=1;//' as LandingData['language_mode'],
    });

    expect(html).toContain('||"en"');
    expect(html).not.toContain('window.__LANG_XSS__');
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
