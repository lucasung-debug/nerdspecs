// @TASK P3-R7-T1 - Landing Page Template Engine
// @SPEC docs/planning/06-tasks.md

export interface LandingData {
  project_name: string;
  summary: string;
  motivation?: string;
  pain_points: string[];
  tech_stack: { language: string; frameworks: string[] };
  repo_url?: string;
  language_mode: 'en' | 'ko' | 'zh' | 'both';
  hero_image_url?: string;
  screenshots?: string[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function normalizeRepoUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
    return parsed.toString();
  } catch { return undefined; }
}

function buildPainCards(points: string[]): string {
  if (points.length === 0) return '';
  const cards = points.map(p => `<div class="feature-card">
      <p>${p}</p>
    </div>`).join('\n    ');
  return `<section>
  <h2 data-lang="en">Sound familiar?</h2>
  <h2 data-lang="ko">이런 경험 있으시죠?</h2>
  <div class="features-grid">${cards}</div>
</section>`;
}

export function generateLandingPage(data: LandingData): string {
  const name = escapeHtml(data.project_name);
  const summary = escapeHtml(data.summary);
  const pains = data.pain_points.map(p => escapeHtml(p));
  const lang = escapeHtml(data.tech_stack.language);
  const fw = data.tech_stack.frameworks.map(f => escapeHtml(f));
  const fwStr = fw.length > 0 ? ` + ${fw.join(' + ')}` : '';
  const repo = normalizeRepoUrl(data.repo_url);
  const repoLink = repo ? escapeHtml(repo) : '';
  const npmName = name.toLowerCase().replace(/\s+/g, '-');
  const heroImg = data.hero_image_url ? normalizeRepoUrl(data.hero_image_url) : undefined;
  const screens = (data.screenshots ?? []).map(s => normalizeRepoUrl(s)).filter(Boolean) as string[];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0a0a0a;--card:#141414;--border:#222;--accent:#22d3ee;--accent2:#a78bfa;--text:#e5e5e5;--muted:#888;--green:#4ade80;--yellow:#facc15;--pink:#f472b6}
body{font-family:'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.7;overflow-x:hidden}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
nav{display:flex;justify-content:space-between;align-items:center;padding:1rem 2rem;border-bottom:1px solid var(--border);position:sticky;top:0;background:rgba(10,10,10,.9);backdrop-filter:blur(12px);z-index:100}
.nav-brand{font-weight:800;font-size:1.2rem}
.nav-right{display:flex;gap:.75rem;align-items:center}
.nav-link{padding:.4rem .8rem;border:1px solid var(--border);border-radius:6px;font-size:.85rem;color:var(--text);transition:border-color .2s}
.nav-link:hover{border-color:var(--accent);text-decoration:none}
.lang-toggle{cursor:pointer;border:1px solid var(--border);border-radius:6px;padding:.4rem .8rem;background:transparent;color:var(--text);font-size:.85rem;transition:border-color .2s}
.lang-toggle:hover{border-color:var(--accent)}
section{padding:5rem 2rem;max-width:1100px;margin:0 auto}
section h2{font-size:2rem;font-weight:800;text-align:center;margin-bottom:.75rem}
.section-sub{text-align:center;color:var(--muted);margin-bottom:3rem;font-size:1.05rem}
#hero{text-align:center;padding:6rem 2rem 4rem;position:relative}
#hero::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(34,211,238,.08) 0%,transparent 70%);pointer-events:none}
.badge{display:inline-block;padding:.3rem .8rem;border:1px solid var(--accent);border-radius:20px;font-size:.8rem;color:var(--accent);margin-bottom:1.5rem;letter-spacing:.5px}
#hero h1{font-size:3.2rem;font-weight:900;background:linear-gradient(135deg,#fff 0%,var(--accent) 50%,var(--accent2) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:1rem}
.hero-sub{font-size:1.2rem;color:var(--muted);max-width:55ch;margin:0 auto 2rem}
.btn-group{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;border-radius:8px;font-weight:600;font-size:.95rem;transition:all .2s}
.btn-primary{background:var(--accent);color:#000}
.btn-primary:hover{opacity:.85;text-decoration:none}
.btn-secondary{border:1px solid var(--border);color:var(--text)}
.btn-secondary:hover{border-color:var(--accent);text-decoration:none}
.terminal-wrapper{max-width:700px;margin:3rem auto 0}
.terminal{background:#1a1a2e;border-radius:12px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,.5),0 0 40px rgba(34,211,238,.05);border:1px solid #2a2a3e}
.terminal-bar{display:flex;align-items:center;gap:8px;padding:12px 16px;background:#12122a;border-bottom:1px solid #2a2a3e}
.terminal-dot{width:12px;height:12px;border-radius:50%}
.terminal-dot:nth-child(1){background:#ff5f57}
.terminal-dot:nth-child(2){background:#ffbd2e}
.terminal-dot:nth-child(3){background:#28c840}
.terminal-title{margin-left:auto;font-size:.75rem;color:#555}
.terminal-body{padding:1.25rem;font-family:'Cascadia Code','Fira Code',monospace;font-size:.85rem;line-height:1.8;min-height:220px}
.terminal-body .prompt{color:var(--green)}
.terminal-body .cmd{color:#fff}
.terminal-body .output{color:var(--muted)}
.terminal-body .highlight{color:var(--accent)}
.terminal-body .success{color:var(--green)}
.terminal-body .warn{color:var(--yellow)}
.terminal-body .pink{color:var(--pink)}
.terminal-body .dim{color:#555}
.cursor{display:inline-block;width:8px;height:16px;background:var(--accent);animation:blink 1s step-end infinite;vertical-align:middle;margin-left:2px}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.flow-container{display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap;margin-top:2rem}
.flow-step{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1.5rem;text-align:center;width:200px;transition:border-color .3s}
.flow-step:hover{border-color:var(--accent)}
.flow-icon{font-size:2.5rem;margin-bottom:.75rem}
.flow-step h3{font-size:.95rem;margin-bottom:.4rem}
.flow-step p{font-size:.8rem;color:var(--muted)}
.flow-arrow{font-size:1.5rem;color:var(--muted)}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.feature-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1.75rem;transition:all .3s}
.feature-card:hover{border-color:var(--accent);transform:translateY(-2px)}
.feature-icon{font-size:1.8rem;margin-bottom:.75rem}
.feature-card h3{font-size:1rem;margin-bottom:.5rem}
.feature-card p{font-size:.85rem;color:var(--muted)}
.compare{display:grid;grid-template-columns:1fr auto 1fr;gap:2rem;align-items:center;margin-top:2rem}
.compare-box{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:2rem;min-height:180px}
.compare-box h3{font-size:1rem;margin-bottom:1rem}
.compare-box pre{font-family:'Cascadia Code','Fira Code',monospace;font-size:.78rem;color:var(--muted);line-height:1.6;white-space:pre-wrap}
.compare-arrow{font-size:2.5rem;color:var(--accent);font-weight:200}
.compare-box.after pre{color:var(--text)}
.install-box{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:2rem;max-width:400px;margin:2rem auto 0;font-family:'Cascadia Code','Fira Code',monospace}
.install-box .prompt{color:var(--green)}
.install-box .cmd{color:#fff;font-size:1.1rem}
footer{text-align:center;padding:2rem;border-top:1px solid var(--border);color:var(--muted);font-size:.8rem}
@media(max-width:768px){
#hero h1{font-size:2.2rem}
.features-grid{grid-template-columns:1fr}
.compare{grid-template-columns:1fr;text-align:center}
.compare-arrow{transform:rotate(90deg)}
.flow-container{flex-direction:column}
.flow-arrow{transform:rotate(90deg)}
.terminal-wrapper{margin:2rem 1rem 0}
}
@media(max-width:480px){#hero h1{font-size:1.8rem}nav{padding:.75rem 1rem}}
</style>
</head>
<body>

<nav>
  <div class="nav-brand">${name}</div>
  <div class="nav-right">
    ${repoLink ? `<a href="${repoLink}" class="nav-link" target="_blank" rel="noopener noreferrer">GitHub</a>` : ''}
    <button class="lang-toggle" onclick="cycleLang()" aria-label="Language toggle">EN / KO</button>
  </div>
</nav>

<section id="hero">
  <h1>${name}</h1>
  <p class="hero-sub" data-lang="en">${summary}</p>
  <p class="hero-sub" data-lang="ko">${summary}</p>
  <div class="btn-group">
    ${repoLink ? `<a href="${repoLink}" class="btn btn-primary" target="_blank"><span data-lang="en">View on GitHub</span><span data-lang="ko">GitHub에서 보기</span></a>` : ''}
    <a href="https://www.npmjs.com/package/${escapeHtml(npmName)}" class="btn btn-secondary" target="_blank">npm</a>
  </div>

  ${heroImg
    ? `<div class="terminal-wrapper"><img src="${escapeHtml(heroImg)}" alt="${name}" style="width:100%;border-radius:12px;border:1px solid #2a2a3e"></div>`
    : `<div class="terminal-wrapper">
    <div class="terminal">
      <div class="terminal-bar">
        <span class="terminal-dot"></span>
        <span class="terminal-dot"></span>
        <span class="terminal-dot"></span>
        <span class="terminal-title">${name} — bash</span>
      </div>
      <div class="terminal-body">
        <span class="prompt">$</span> <span class="cmd">npx ${escapeHtml(npmName)}</span><br>
        <span class="output">  Language : <span class="highlight">${lang}</span></span><br>
        <span class="output">  Framework: <span class="highlight">${fw[0] ?? 'none'}</span></span><br><br>
        <span class="success">✔ Reading project files...</span><br>
        <span class="success">✔ Analyzing code...</span><br>
        <span class="success">✔ Generating docs...</span><br><br>
        <span class="success">✓</span> <span class="cmd">README.md generated</span><br>
        <span class="success">✓</span> <span class="cmd">Landing page ready</span><span class="cursor"></span>
      </div>
    </div>
  </div>`}
</section>

<section>
  <h2 data-lang="en">How It Works</h2>
  <h2 data-lang="ko">작동 방식</h2>
  <p class="section-sub" data-lang="en">Three steps. One question. Done.</p>
  <p class="section-sub" data-lang="ko">세 단계. 질문 하나. 끝.</p>
  <div class="flow-container">
    <div class="flow-step"><div class="flow-icon">💬</div><h3 data-lang="en">Answer one question</h3><h3 data-lang="ko">질문 하나에 답하기</h3><p data-lang="en">"Why did you build this?"</p><p data-lang="ko">"이걸 왜 만들었나요?"</p></div>
    <div class="flow-arrow">→</div>
    <div class="flow-step"><div class="flow-icon">🔍</div><h3 data-lang="en">AI analyzes your code</h3><h3 data-lang="ko">AI가 코드를 분석</h3><p data-lang="en">Scans files, detects stack</p><p data-lang="ko">파일 스캔, 기술 스택 감지</p></div>
    <div class="flow-arrow">→</div>
    <div class="flow-step"><div class="flow-icon">📄</div><h3 data-lang="en">Docs generated</h3><h3 data-lang="ko">문서 자동 생성</h3><p data-lang="en">README + Landing Page</p><p data-lang="ko">README + 랜딩 페이지</p></div>
  </div>
</section>

<section>
  <h2 data-lang="en">Before &amp; After</h2>
  <h2 data-lang="ko">사용 전 &amp; 후</h2>
  <div class="compare">
    <div class="compare-box">
      <h3 data-lang="en">😵 Before</h3>
      <h3 data-lang="ko">😵 사용 전</h3>
      <pre>my-project/
├── src/
│   ├── index.ts      <span style="color:var(--muted)">// ???</span>
│   ├── handler.ts    <span style="color:var(--muted)">// ???</span>
│   └── utils.ts      <span style="color:var(--muted)">// ???</span>
├── package.json
└── README.md          <span style="color:var(--pink)">// (empty)</span></pre>
    </div>
    <div class="compare-arrow">→</div>
    <div class="compare-box after">
      <h3 data-lang="en">🤓 After</h3>
      <h3 data-lang="ko">🤓 적용 후</h3>
      <pre><span style="color:var(--green)">✓</span> <span style="color:var(--accent)">README.md</span> — generated
  What is this? Who is it for?
  Install &amp; usage instructions

<span style="color:var(--green)">✓</span> <span style="color:var(--accent)">docs/index.html</span>
  Landing page with dark theme
  Bilingual (EN/KO)</pre>
    </div>
  </div>
</section>

${buildPainCards(pains)}

${screens.length > 0 ? `<section>
  <h2 data-lang="en">Screenshots</h2>
  <h2 data-lang="ko">스크린샷</h2>
  <h2 data-lang="zh">截图</h2>
  <div class="features-grid">${screens.map(s => `<div class="feature-card" style="padding:0;overflow:hidden"><img src="${escapeHtml(s)}" alt="Screenshot" style="width:100%;display:block"></div>`).join('')}</div>
</section>` : ''}

<section id="cta" style="text-align:center">
  <h2 data-lang="en">Get Started</h2>
  <h2 data-lang="ko">시작하기</h2>
  <h2 data-lang="zh">开始使用</h2>
  <p class="section-sub" data-lang="en">No config needed. Just run it.</p>
  <p class="section-sub" data-lang="ko">설정 필요 없음. 바로 실행하세요.</p>
  <p class="section-sub" data-lang="zh">无需配置。直接运行。</p>
  <div class="install-box">
    <span class="prompt">$</span> <span class="cmd">npx ${escapeHtml(npmName)}</span><span class="cursor"></span>
  </div>
</section>

<footer>
  <p>Built with ${lang}${fwStr} · <a href="${repoLink}">GitHub</a></p>
</footer>

<script>
var LANGS=['en','ko','zh'];
function showLang(l){
  document.querySelectorAll('[data-lang]').forEach(function(el){
    el.style.display=el.getAttribute('data-lang')===l?'':'none';
  });
  document.querySelector('.lang-toggle').textContent=l==='en'?'EN → KO':'KO → EN';
  localStorage.setItem('nerdspecs-lang',l);
}
function cycleLang(){
  var cur=localStorage.getItem('nerdspecs-lang')||'en';
  showLang(cur==='en'?'ko':'en');
}
showLang(localStorage.getItem('nerdspecs-lang')||'en');
</script>
</body>
</html>`;
}
