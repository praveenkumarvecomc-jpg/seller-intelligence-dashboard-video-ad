// DOM-level QA: samples the "holds" (outside transition windows) and flags text that is off-frame,
// clipped by its own box, or overlapping other text. Also checks caption on-screen durations.
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
const EXE = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
const PORT = 9300 + Math.floor(Math.random() * 300);
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: process.cwd(), stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${PORT}/index4.html`);
await page.waitForFunction(() => window.READY === true);
if (process.env.SABOTAGE) await page.addStyleTag({ content: '.cap{left:700px !important} .ttl{font-size:60px !important}' });
const tl = await page.evaluate(async () => { const m = await import('./timeline.js'); return { SB: m.SB, TR: m.TR, HOOK_OUT: m.HOOK_OUT, DASH_IN: m.DASH_IN, DASH_REVEAL: m.DASH_REVEAL, CTA_IN: m.CTA_IN }; });
const times = [];
for (let t = 0.4; t < 3.6; t += 0.2) times.push(+t.toFixed(2));
for (let t = 4.9; t < 5.4; t += 0.25) times.push(+t.toFixed(2));
for (let i = 0; i < 8; i++) { const a = (i === 0 ? tl.DASH_REVEAL[1] : tl.TR[i][1]) + 0.1, b = (i === 7 ? tl.CTA_IN[0] : tl.TR[i + 1][0]) - 0.05; for (let t = a; t < b; t += 0.2) times.push(+t.toFixed(2)); }
for (let t = 28.6; t < 29.95; t += 0.2) times.push(+t.toFixed(2));
const issues = new Map();
for (const t of times) {
  const res = await page.evaluate(t => {
    window.renderAt(t);
    const vis = el => { let o = 1, e = el; while (e && e !== document.body) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= +cs.opacity; e = e.parentElement; } return o; };
    const items = [];
    for (const el of document.querySelectorAll('#wrap *')) {
      let own = ''; for (const n of el.childNodes) if (n.nodeType === 3) own += n.textContent; own = own.trim();
      if (!own || el.closest('svg')) continue;
      const o = vis(el); if (o < 0.6) continue;
      const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      if (el.closest('.mask')) continue; // masked rise lines are clipped by design while animating
      items.push({ el, txt: own.slice(0, 40), r: { l: r.left, t: r.top, r: r.right, b: r.bottom } });
    }
    const out = [];
    for (const it of items) {
      const { l, t: tp, r, b } = it.r;
      if (l < -1 || tp < -1 || r > 1921 || b > 1081) out.push(`OFFFRAME "${it.txt}" [${l | 0},${tp | 0},${r | 0},${b | 0}]`);
      // clipped by an ancestor box (overflow hidden) or its own nowrap parent
      let p = it.el.parentElement;
      while (p && p.id !== 'wrap') {
        const cs = getComputedStyle(p);
        if (cs.overflow !== 'visible' && !p.classList.contains('layer') && !p.classList.contains('mh') && !p.classList.contains('sc') && !p.classList.contains('px')) {
          const pr = p.getBoundingClientRect();
          if (l < pr.left - 1 || r > pr.right + 1 || tp < pr.top - 1 || b > pr.bottom + 1) out.push(`CLIPPED "${it.txt}" by ${p.className || p.tagName}`);
        }
        p = p.parentElement;
      }
    }
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const A = items[i], B = items[j]; if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
      const w = Math.min(A.r.r, B.r.r) - Math.max(A.r.l, B.r.l), h = Math.min(A.r.b, B.r.b) - Math.max(A.r.t, B.r.t);
      if (w > 3 && h > 3) { const ar = Math.min((A.r.r - A.r.l) * (A.r.b - A.r.t), (B.r.r - B.r.l) * (B.r.b - B.r.t)); if (w * h > 0.12 * ar) out.push(`OVERLAP "${A.txt}" x "${B.txt}" (${w | 0}x${h | 0})`); }
    }
    return out;
  }, t);
  for (const m of res) { const k = m; if (!issues.has(k)) issues.set(k, []); issues.get(k).push(t); }
}
console.log(`sampled ${times.length} hold times`);
if (!issues.size) console.log('QA DOM: no off-frame, clipped or overlapping text found');
for (const [k, ts] of issues) console.log(k, '@', ts.slice(0, 4).join(','), ts.length > 4 ? `(+${ts.length - 4})` : '');
// caption exposure (seconds each caption is >=90% opaque)
const cap = await page.evaluate(async () => {
  const caps = [...document.querySelectorAll('.cap')], res = [];
  for (const c of caps) {
    let on = 0, first = null, last = null;
    for (let t = 0; t < 30; t += 1 / 60) { window.renderAt(t); const o = +getComputedStyle(c).opacity, d = getComputedStyle(c).display; if (d !== 'none' && o > 0.9) { on += 1 / 60; if (first === null) first = t; last = t; } }
    res.push({ cap: c.querySelector('.clb').textContent, on: +on.toFixed(2), first: +first.toFixed(2), last: +last.toFixed(2) });
  }
  return res;
});
console.log('caption exposure (>=90% opacity):'); cap.forEach(c => console.log(' ', c.cap.padEnd(22), c.on + 's', `[${c.first} – ${c.last}]`, c.on >= 1.2 ? 'OK' : 'TOO SHORT'));
await browser.close(); srv.kill();
