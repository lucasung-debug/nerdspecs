// @TASK P3-R7-T1 - Landing Page Template Engine
// @SPEC docs/planning/06-tasks.md

export interface LandingData {
  project_name: string;
  summary: string;
  motivation?: string;
  pain_points: string[];
  tech_stack: { language: string; frameworks: string[] };
  repo_url?: string;
  language_mode: 'en' | 'ko' | 'both';
}

interface SafeLandingData extends Omit<LandingData, 'project_name' | 'summary' | 'pain_points' | 'tech_stack'> {
  project_name: string;
  summary: string;
  pain_points: string[];
  tech_stack: { language: string; frameworks: string[] };
}

const LANGUAGE_MODES = ['en', 'ko', 'both'] as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function normalizeRepoUrl(repoUrl?: string): string | undefined {
  if (!repoUrl) return undefined;

  try {
    const parsed = new URL(repoUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function sanitizeData(data: LandingData): SafeLandingData {
  return {
    ...data,
    project_name: escapeHtml(data.project_name),
    summary: escapeHtml(data.summary),
    pain_points: data.pain_points.map((painPoint) => escapeHtml(painPoint)),
    tech_stack: {
      language: escapeHtml(data.tech_stack.language),
      frameworks: data.tech_stack.frameworks.map((framework) => escapeHtml(framework)),
    },
    repo_url: normalizeRepoUrl(data.repo_url),
  };
}

function normalizeLanguageMode(mode: LandingData['language_mode']): LandingData['language_mode'] {
  return LANGUAGE_MODES.includes(mode) ? mode : 'en';
}

function buildNav(data: SafeLandingData): string {
  const link = data.repo_url
    ? `<a href="${escapeHtml(data.repo_url)}" class="nav-link" target="_blank" rel="noopener noreferrer">GitHub</a>`
    : '';
  const toggle = `<button class="lang-toggle" onclick="cycleLang()" aria-label="Language toggle">EN | KO</button>`;
  return `<nav id="nav"><span class="nav-brand">${data.project_name}</span><div class="nav-right">${link}${toggle}</div></nav>`;
}

function buildHero(data: SafeLandingData): string {
  const cta = data.repo_url
    ? `<a href="${escapeHtml(data.repo_url)}" class="btn-cta" target="_blank" rel="noopener noreferrer"><span data-lang="en">View on GitHub</span><span data-lang="ko">GitHub에서 보기</span></a>`
    : '';
  return `<section id="hero">
  <div data-lang="en"><h1>${data.project_name}</h1><p class="hero-summary">${data.summary}</p>${cta}</div>
  <div data-lang="ko"><h1>${data.project_name}</h1><p class="hero-summary">${data.summary}</p>${cta}</div>
</section>`;
}

function buildPainCard(text: string): string {
  return `<div class="pain-card"><p data-lang="en">${text}</p><p data-lang="ko">${text}</p></div>`;
}

function buildProblem(data: SafeLandingData): string {
  const cards = data.pain_points.map(buildPainCard).join('');
  return `<section id="problem">
  <h2 data-lang="en">Sound familiar?</h2>
  <h2 data-lang="ko">이런 경험 있으시죠?</h2>
  <div class="card-grid">${cards}</div>
</section>`;
}

function buildSolution(): string {
  return `<section id="solution">
  <div class="solution-grid">
    <div class="solution-before">
      <h3 data-lang="en">Code dump</h3>
      <h3 data-lang="ko">코드 덤프</h3>
      <p data-lang="en">Raw files, no context.</p>
      <p data-lang="ko">파일만 있고, 설명이 없어요.</p>
    </div>
    <div class="solution-arrow">→</div>
    <div class="solution-after">
      <h3 data-lang="en">Clear explanation</h3>
      <h3 data-lang="ko">명확한 설명</h3>
      <p data-lang="en">Human-readable docs, auto-generated.</p>
      <p data-lang="ko">자동 생성된 읽기 쉬운 문서.</p>
    </div>
  </div>
</section>`;
}

function buildHowTo(): string {
  const steps = [
    { en: 'Install NerdSpecs', ko: 'NerdSpecs 설치', code: 'npm install -g nerdspecs' },
    { en: 'Run nerdspecs write', ko: 'nerdspecs write 실행', code: 'nerdspecs write' },
    { en: 'Share your docs', ko: '문서 공유하기', code: 'git push' },
  ];
  const items = steps
    .map(
      (s, i) => `<div class="step">
    <span class="step-num">${i + 1}</span>
    <h3 data-lang="en">${s.en}</h3>
    <h3 data-lang="ko">${s.ko}</h3>
    <code>${s.code}</code>
  </div>`
    )
    .join('');
  return `<section id="howto">
  <h2 data-lang="en">How to use</h2>
  <h2 data-lang="ko">사용법</h2>
  <div class="step-grid">${items}</div>
</section>`;
}

function buildTechFooter(data: SafeLandingData): string {
  const fw = data.tech_stack.frameworks.join(', ');
  return `<footer id="tech-footer">
  <p data-lang="en">Built with ${data.tech_stack.language}${fw ? ` · ${fw}` : ''}</p>
  <p data-lang="ko">${data.tech_stack.language}${fw ? ` · ${fw}` : ''}(으)로 제작</p>
</footer>`;
}

function baseCSS(): string {
  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;color:#1a1a1a;background:#fff;line-height:1.6}
a{color:inherit;text-decoration:none}
nav#nav{display:flex;justify-content:space-between;align-items:center;padding:1rem 2rem;border-bottom:1px solid #eee;position:sticky;top:0;background:#fff;z-index:100}
.nav-brand{font-weight:700;font-size:1.1rem}
.nav-right{display:flex;gap:1rem;align-items:center}
.nav-link{padding:.4rem .8rem;border:1px solid #ccc;border-radius:6px;font-size:.875rem}
.lang-toggle{cursor:pointer;border:1px solid #ccc;border-radius:6px;padding:.4rem .8rem;background:#f5f5f5;font-size:.875rem}
section{padding:4rem 2rem;max-width:1100px;margin:0 auto}
#hero{text-align:center}
#hero h1{font-size:2.5rem;font-weight:800;margin-bottom:1rem}
.hero-summary{font-size:1.125rem;color:#555;max-width:60ch;margin:0 auto 1.5rem}
.btn-cta{display:inline-block;background:#111;color:#fff;padding:.75rem 1.5rem;border-radius:8px;font-weight:600;transition:opacity .2s}
.btn-cta:hover{opacity:.8}
.card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:2rem}
.pain-card{border:1px solid #eee;border-radius:12px;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.solution-grid{display:grid;grid-template-columns:1fr auto 1fr;gap:2rem;align-items:center;margin-top:2rem}
.solution-before,.solution-after{border:1px solid #eee;border-radius:12px;padding:1.5rem}
.solution-arrow{font-size:2rem;color:#999}
.step-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:2rem}
.step{border:1px solid #eee;border-radius:12px;padding:1.5rem;text-align:center}
.step-num{display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;border-radius:50%;background:#111;color:#fff;font-weight:700;margin-bottom:.75rem}
.step code{display:block;margin-top:.75rem;background:#f5f5f5;padding:.5rem;border-radius:6px;font-size:.85rem}
footer#tech-footer{text-align:center;padding:2rem;border-top:1px solid #eee;color:#888;font-size:.875rem}`;
}

function responsiveCSS(): string {
  return `
@media (max-width: 768px){
.card-grid{grid-template-columns:repeat(2,1fr)}
.solution-grid{grid-template-columns:1fr;text-align:center}
.solution-arrow{transform:rotate(90deg)}
.step-grid{grid-template-columns:repeat(2,1fr)}
}
@media (max-width: 480px){
.card-grid{grid-template-columns:1fr}
.step-grid{grid-template-columns:1fr}
#hero h1{font-size:1.75rem}
}`;
}

function buildCSS(): string {
  return `<style>${baseCSS()}${responsiveCSS()}</style>`;
}

function buildScript(mode: LandingData['language_mode']): string {
  const safeMode = JSON.stringify(normalizeLanguageMode(mode));

  return `<script>
var LANGS=['en','ko','both'];
function showLang(l){
  document.querySelectorAll('[data-lang]').forEach(function(el){
    var lang=el.getAttribute('data-lang');
    el.style.display=(l==='both'||lang===l)?'':'none';
  });
  localStorage.setItem('nerdspecs-lang',l);
}
function cycleLang(){
  var cur=localStorage.getItem('nerdspecs-lang')||'en';
  var next=LANGS[(LANGS.indexOf(cur)+1)%LANGS.length];
  showLang(next);
}
function toggleLang(l){showLang(l);}
showLang(localStorage.getItem('nerdspecs-lang')||${safeMode});
</script>`;
}

export function generateLandingPage(data: LandingData): string {
  const safeData = sanitizeData(data);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeData.project_name}</title>${buildCSS()}</head>
<body>
${buildNav(safeData)}
${buildHero(safeData)}
${buildProblem(safeData)}
${buildSolution()}
${buildHowTo()}
${buildTechFooter(safeData)}
${buildScript(data.language_mode)}
</body>
</html>`;
}
