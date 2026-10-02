// Ecomceptive · Seller Intelligence Platform — 30s 16:9 ad. Deterministic: window.renderAt(t).
const W = 1920, H = 1080, DUR = 30;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const eo3 = x => 1 - Math.pow(1 - x, 3);
const eo5 = x => 1 - Math.pow(1 - x, 5);
const ei3 = x => x * x * x;
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eio5 = x => x < .5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2;
const eoBack = (x, s = 1.4) => { const c3 = s + 1; return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const inr = v => '₹' + Math.round(v).toLocaleString('en-IN');
const sinr = v => (v < -0.5 ? '−' : '') + '₹' + Math.abs(Math.round(v)).toLocaleString('en-IN');
const int = v => Math.round(v).toLocaleString('en-IN');
const C = { or: '#F7931E', or2: '#FFB04A', gr: '#3CCB7F', rd: '#F0645A', pu: '#9384F5', bl: '#4C8DF6', am: '#F2B33D', tx: '#F3F4F6', mu: '#9BA2AE' };

// ---------------- timeline ----------------
const SB = [6.0, 9.5, 12.5, 15.5, 18.0, 20.5, 23.0, 25.0, 27.5]; // world scene boundaries
const NAV = ['Dashboard', 'Finance', 'Advertising', 'Sales & Traffic', 'Search & Brand', 'Inventory', 'Returns', 'Action Center'];
const camK = t => { let k = 0; for (let i = 1; i < 8; i++) k += eio5(seg(t, SB[i] - 0.42, SB[i] + 0.42)); return k; };

// ---------------- DOM helpers ----------------
const $wrap = document.getElementById('wrap'), $world = document.getElementById('world'), $fixed = document.getElementById('fixed');
const bg = document.getElementById('bgc').getContext('2d');
function node(html, parent) { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; (parent || $fixed).appendChild(e); return e; }
const A = [];
function an(el, t0, type, o = {}) { if (!el) throw new Error('missing el for ' + type + ' @' + t0); A.push({ el, t0, type, d: 0.6, ...o }); return el; }
const q = (root, s) => root.querySelector(s), qa = (root, s) => [...root.querySelectorAll(s)];

// smooth path through points (Catmull-Rom -> Bezier)
function smooth(pts) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
function series(n, seed, base, amp, trend = 0, spikes = {}) { const r = rng(seed); const v = []; let w = 0; for (let i = 0; i < n; i++) { w = w * 0.6 + (r() - 0.5) * amp; v.push(base + w + trend * i / n + (spikes[i] || 0)); } return v; }
function chart(vals, w, h, { min, max, color, fill = true, sw = 3, id }) {
  const lo = min ?? Math.min(...vals) * 0.9, hi = max ?? Math.max(...vals) * 1.08;
  const pts = vals.map((v, i) => [i / (vals.length - 1) * w, h - (v - lo) / (hi - lo) * h]);
  const line = smooth(pts);
  const area = line + ` L${w},${h} L0,${h} Z`;
  return { pts, svg: `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" class="abs" style="left:0;top:0">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".32"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>
    <clipPath id="${id}c"><rect class="clipr" x="0" y="-20" width="0" height="${h + 40}"/></clipPath></defs>
    ${fill ? `<path d="${area}" fill="url(#${id})" clip-path="url(#${id}c)"/>` : ''}
    <path class="ln" d="${line}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>` };
}
// a chart's reveal: line draws + area clip follows
function anChart(root, t0, d, w) { qa(root, 'path.ln').forEach(p => an(p, t0, 'draw', { d })); qa(root, 'rect.clipr').forEach(r => an(r, t0, 'fn', { d, fn: k => r.setAttribute('width', (w * eo3(k)).toFixed(1)) })); }
const thumbSVG = (c = '#C9CED6') => `<svg width="26" height="26" viewBox="0 0 26 26"><path d="M3 9h20M5 9l-2 13M21 9l2 13M7 9v-3h12v3" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const thumb = (bgc = '#2A3039') => `<div class="ico" style="background:${bgc};width:46px;height:46px;border-radius:12px">${thumbSVG()}</div>`;
const logoIcon = (size, cls = '') => `<svg class="${cls}" width="${size}" height="${size * 50 / 58}" viewBox="4 4 58 50">
  <path class="lg" d="M7 8 L14 8 L17.4 14.6" stroke="#F3F4F6" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/>
  <path class="lg" d="M42 41 L21.5 41 C16.2 41 14.4 35.5 14.4 27 C14.4 19 16.2 13 21.5 13 L59 13" stroke="#F7931E" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/>
  <path class="lg" d="M22.5 27 L51 27" stroke="#F3F4F6" stroke-width="4.4" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/>
  <circle class="wh" cx="29.6" cy="49.2" r="2.6" fill="#F3F4F6"/><circle class="wh" cx="40.2" cy="49.2" r="2.6" fill="#F3F4F6"/></svg>`;

// =====================================================================
// HOOK (0 – 4s)
// =====================================================================
const hook = node(`<div class="layer" id="hook">
  <div class="abs row" style="left:120px;top:312px;gap:14px"><span class="hk-l" style="display:block;width:0;height:2px;background:var(--or)"></span><span class="lbl hk-lb" style="color:var(--or);font-size:16px;letter-spacing:.2em">If you sell on Amazon</span></div>
  <div class="abs" style="left:116px;top:350px;font-family:var(--H);font-weight:800;font-size:96px;line-height:1.1;letter-spacing:-.035em">
    <span class="mask"><span class="h1">₹50 lakh in sales.</span></span>
    <span class="mask"><span class="h2" style="color:var(--rd)">₹2 lakh lost.</span></span>
    <span class="mask"><span class="h3">Would you <span style="color:var(--or)">know?</span></span></span>
  </div>
  <div class="abs hk-sub" style="left:122px;top:725px;width:760px;font-size:26px;line-height:1.5;color:var(--mu)">Turnover is not profit. Most sellers find out at the end of the month.</div>
  <div class="card ledger" style="left:1110px;top:150px;width:690px;height:780px;padding:30px 30px">
    <div class="lbl" style="color:var(--mu)">What you kept</div>
    <div class="num kept" style="font-size:64px;margin-top:6px">₹0</div>
    <div class="abs stack" style="left:30px;right:30px;top:138px;height:10px;border-radius:6px;background:rgba(255,255,255,.07);overflow:hidden;display:flex"></div>
    <div class="abs rows" style="left:30px;right:30px;top:172px"></div>
  </div>
</div>`);
const LEDGER = [
  ['Ordered sales', 'What customers paid', 5000000, '#3CCB7F'], ['Refunds', 'Returned orders', -400000, '#F0645A'], ['Amazon fees', 'Referral, FBA, closing', -1600000, '#F2B33D'],
  ['Advertising', 'Sponsored Products, Brands, Display', -1200000, '#9384F5'], ['Product cost', 'What you paid to make it', -1750000, '#4C8DF6'], ['Packaging', 'Boxes, tape, labels', -150000, '#58C6D8'], ['Shipping you paid', 'Self Ship orders', -100000, '#E58BD3'],
];
const ledgerRows = q(hook, '.rows'), stack = q(hook, '.stack');
LEDGER.forEach(([n, s, v, c], i) => {
  const r = node(`<div class="row" style="height:74px;border-top:1px solid var(--line);gap:16px">
    <div class="ico" style="background:${c}22"><div style="width:12px;height:12px;border-radius:4px;background:${c}"></div></div>
    <div style="flex:1"><div style="font-weight:600;font-size:21px">${n}</div><div style="font-size:15px;color:var(--mu);margin-top:2px">${s}</div></div>
    <div class="num" style="font-size:26px;color:${v > 0 ? 'var(--tx)' : 'var(--rd)'}">${sinr(v)}</div></div>`, ledgerRows);
  an(r, 0.85 + i * 0.2, 'up', { d: 0.45, dy: 24 });
  if (i > 0) { const sgm = node(`<div style="height:100%;width:0;background:${c}"></div>`, stack); an(sgm, 0.95 + i * 0.2, 'w', { d: 0.4, to: Math.abs(v) / 5000000 * 100 }); }
});
const keptRow = node(`<div class="row" style="height:84px;margin-top:6px;gap:16px;border:1px solid rgba(240,100,90,.45);border-radius:16px;padding:0 18px;background:rgba(240,100,90,.10);box-shadow:0 0 40px rgba(240,100,90,.18)">
  <div class="ico" style="background:rgba(240,100,90,.18)"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 2 L19 18 L1 18 Z" fill="none" stroke="#F0645A" stroke-width="2" stroke-linejoin="round"/><path d="M10 8v4.5M10 15.2v.1" stroke="#F0645A" stroke-width="2" stroke-linecap="round"/></svg></div>
  <div style="flex:1"><div style="font-weight:700;font-size:22px">What you kept</div><div style="font-size:15px;color:var(--mu)">After every cost</div></div>
  <div class="num" style="font-size:30px;color:var(--rd)">−₹2,00,000</div></div>`, ledgerRows);
an(keptRow, 2.35, 'pop', { d: 0.5 });
an(q(hook, '.ledger'), 0.55, 'up', { d: 0.8, dy: 60 });
an(q(hook, '.h1'), 0.25, 'rise', { d: 0.7 }); an(q(hook, '.h2'), 2.45, 'rise', { d: 0.6 }); an(q(hook, '.h3'), 2.95, 'rise', { d: 0.6 });
an(q(hook, '.hk-l'), 0.1, 'fn', { d: 0.5, fn: k => q(hook, '.hk-l').style.width = 44 * eo3(k) + 'px' });
an(q(hook, '.hk-lb'), 0.15, 'fade', { d: 0.5 });
an(q(hook, '.hk-sub'), 3.3, 'up', { d: 0.6, dy: 16 });
const keptEl = q(hook, '.kept');
an(keptEl, 0, 'fn', { d: 1, fn: () => {} });

// =====================================================================
// BRAND lockup (moves: center -> header -> CTA)
// =====================================================================
const brand = node(`<div class="abs" id="brand" style="left:0;top:0;transform-origin:0 0;display:flex;align-items:center;gap:26px">
  ${logoIcon(150, 'bicon')}
  <div><div class="bw" style="font-family:Poppins;font-weight:700;font-size:96px;line-height:1;letter-spacing:-.01em"><span style="color:var(--or)">E</span>comceptive</div>
  <div class="bs" style="font-size:20px;font-weight:600;letter-spacing:.32em;color:var(--mu);margin-top:12px;padding-left:4px">SELLER INTELLIGENCE PLATFORM</div></div></div>`);
const tagline = node(`<div class="abs" style="left:0;width:1920px;top:640px;text-align:center;font-size:30px;color:var(--mu)">Know what you <span style="color:var(--tx);font-weight:600">actually keep.</span></div>`);

// =====================================================================
// NAV pill
// =====================================================================
const nav = node(`<div class="abs" id="nav" style="left:50%;top:40px;transform:translateX(-50%);height:52px;border-radius:999px;background:rgba(28,32,39,.82);border:1px solid var(--line);display:flex;align-items:center;padding:0 6px;box-shadow:0 20px 50px rgba(0,0,0,.35)">
  <div class="ind abs" style="top:6px;height:38px;border-radius:999px;background:rgba(247,147,30,.16);border:1px solid rgba(247,147,30,.45)"></div>
  ${NAV.map((n, i) => `<div class="ni" style="position:relative;padding:0 18px;font-size:16px;font-weight:600;color:var(--mu);white-space:nowrap">${n}</div>`).join('')}</div>`);
const navItems = qa(nav, '.ni'), navInd = q(nav, '.ind');
const liveChip = node(`<div class="abs row" style="right:56px;top:46px;gap:10px;font-size:15px;color:var(--mu)"><span style="width:9px;height:9px;border-radius:50%;background:var(--gr);box-shadow:0 0 12px var(--gr)"></span>Amazon.in · Demo Brand</div>`);

// =====================================================================
// CAPTIONS (left column, one per world scene)
// =====================================================================
const CAP = [
  ['01', 'Dashboard', 'Your real profit.', 'Every single day.', 'Sales, ads, fees, refunds and product costs, in one live view.'],
  ['02', 'Finance', 'Where Amazon’s', 'money really went.', 'Every charge, fee, refund and payout, reconciled.'],
  ['03', 'Advertising', 'Spot ads that lose', 'money while selling.', 'Break-even ACoS for every single product.'],
  ['04', 'Sales & Traffic', 'See where visitors', 'stop buying.', 'From session to order, product by product.'],
  ['05', 'Search & Brand', 'Know what shoppers', 'search and skip.', 'Search, click, cart and purchase share vs the market.'],
  ['06', 'Inventory', 'Restock before', 'you stock out.', 'Days of cover for every product that is selling.'],
  ['07', 'Returns', 'Track every refund', 'to the rupee.', 'What came back, and what Amazon still owes you.'],
  ['08', 'Action Center', 'Your next move,', 'already ranked.', 'Every issue, prioritised by what it costs you.'],
];
const caps = CAP.map(([n, l, a, b, p], i) => {
  const c = node(`<div class="abs cap" style="left:120px;top:340px;width:620px">
    <div class="row" style="gap:12px"><span class="cl" style="display:block;height:2px;width:0;background:var(--or)"></span><span class="lbl clb" style="color:var(--or);font-size:16px;letter-spacing:.2em">${n} — ${l}</span></div>
    <div style="font-family:var(--H);font-weight:800;font-size:58px;line-height:1.12;letter-spacing:-.03em;margin-top:22px">
      <span class="mask"><span class="c1">${a}</span></span><span class="mask"><span class="c2" style="color:var(--or)">${b}</span></span></div>
    <div class="cp" style="font-size:23px;line-height:1.5;color:var(--mu);margin-top:24px;width:540px">${p}</div></div>`);
  const t0 = SB[i] + (i ? 0.08 : 0.25);
  an(q(c, '.cl'), t0, 'fn', { d: 0.5, fn: k => q(c, '.cl').style.width = 40 * eo3(k) + 'px' });
  an(q(c, '.clb'), t0, 'fade', { d: 0.4 });
  an(q(c, '.c1'), t0 + 0.08, 'rise', { d: 0.6 }); an(q(c, '.c2'), t0 + 0.18, 'rise', { d: 0.6 });
  an(q(c, '.cp'), t0 + 0.35, 'up', { d: 0.6, dy: 14 });
  return c;
});

// =====================================================================
// WORLD SCENES
// =====================================================================
const scenes = NAV.map((_, i) => node(`<div class="abs sc" style="left:${i * W}px;top:0;width:${W}px;height:${H}px"></div>`, $world));

// ---------- 0: Dashboard window ----------
{
  const s = scenes[0];
  const sales = series(30, 3, 230000, 60000, 40000, { 21: 50000, 22: 30000 });
  const ch = chart(sales, 336, 112, { color: C.or, id: 'g0' });
  const perfA = series(30, 8, 86, 18, 6), perfB = series(30, 9, 30, 6, 2);
  const pA = chart(perfA, 492, 150, { color: C.pu, id: 'g1', min: 0, max: 130 }), pB = chart(perfB, 492, 150, { color: C.or, id: 'g2', min: 0, max: 130, fill: false });
  const TILES = [['Units ordered', 3005, int, '+6.1%', C.bl, 4], ['Gross profit', 2234418, inr, '+9.8%', C.gr, 5], ['Net profit', 1034014, inr, '+14.2%', C.gr, 6], ['Ad spend', 421628, inr, '+4.2%', C.or, 7], ['TACoS', 5.9, v => v.toFixed(1) + '%', '−0.6 pts', C.pu, 11], ['ROAS', 6.15, v => v.toFixed(2) + '×', '+0.4×', C.bl, 12]];
  const side = ['Ecomceptive AI', 'Action Center', 'Dashboard', 'Products & Inventory', 'Sales & Traffic', 'Advertisements', 'Search & Brand', 'Finance', 'Returns'];
  const win = node(`<div class="card win" style="left:760px;top:170px;width:1060px;height:740px;overflow:hidden;border-radius:18px">
    <div class="abs row" style="left:0;right:0;top:0;height:46px;border-bottom:1px solid var(--line);padding:0 18px;gap:8px;background:#181B21">
      <i style="width:11px;height:11px;border-radius:50%;background:#F0645A"></i><i style="width:11px;height:11px;border-radius:50%;background:#F2B33D"></i><i style="width:11px;height:11px;border-radius:50%;background:#3CCB7F"></i>
      <div style="flex:1;text-align:center;font-size:14px;color:var(--mu)">Seller Intelligence · Dashboard</div></div>
    <div class="abs" style="left:0;top:46px;bottom:0;width:196px;border-right:1px solid var(--line);padding:18px 12px;background:#171A20">
      ${side.map((n, i) => `<div class="si row" style="height:38px;border-radius:10px;padding:0 10px;gap:9px;white-space:nowrap;font-size:13.5px;font-weight:${i === 2 ? 600 : 500};color:${i === 2 ? 'var(--or)' : 'var(--mu)'};background:${i === 2 ? 'rgba(247,147,30,.12)' : 'transparent'};margin-bottom:4px"><span style="width:14px;height:14px;border-radius:4px;border:1.6px solid currentColor;opacity:.8"></span>${n}</div>`).join('')}
    </div>
    <div class="abs" style="left:220px;top:64px"><div class="ttl" style="font-size:24px">Demo Brand</div><div class="sub">Amazon.in · Dashboard · last 30 days</div></div>
    <div class="abs row" style="right:24px;top:70px;gap:6px">${['Today', '7D', '30D', '90D'].map(x => `<span class="pill" style="padding:5px 12px;font-size:13px;${x === '30D' ? 'background:var(--or);color:#1a1205' : 'color:var(--mu);border:1px solid var(--line)'}">${x}</span>`).join('')}</div>
    <div class="card big" style="left:220px;top:126px;width:380px;height:296px;border-radius:16px;padding:20px;box-shadow:none">
      <div class="lbl" style="font-size:12px">Ordered sales</div>
      <div class="num v" style="font-size:44px;margin-top:6px">₹0</div>
      <div class="row" style="gap:8px;margin-top:6px"><span class="pill" style="padding:3px 10px;font-size:13px;background:rgba(60,203,127,.14);color:var(--gr)">▲ 12.4%</span><span class="sub" style="font-size:13px">vs previous 30 days</span></div>
      <div class="abs" style="left:22px;top:160px;width:336px;height:112px">${ch.svg}</div></div>
    ${TILES.map((tl, i) => `<div class="card tile" style="left:${612 + (i % 2) * 218}px;top:${126 + Math.floor(i / 2) * 100}px;width:206px;height:90px;border-radius:14px;padding:14px 16px;box-shadow:none">
      <div class="lbl" style="font-size:11px">${tl[0]}</div><div class="num tv" style="font-size:25px;margin-top:4px;color:${tl[0] === 'Net profit' ? 'var(--gr)' : 'var(--tx)'}">0</div>
      <div class="abs" style="right:14px;top:16px;font-size:12px;font-weight:600;color:${tl[3].startsWith('−') ? 'var(--gr)' : 'var(--gr)'}">${tl[3]}</div>
      <div class="abs sp" style="right:14px;bottom:14px;width:70px;height:22px">${chart(series(14, tl[5], 10, 4, 4), 70, 22, { color: tl[4], id: 'sp' + i, sw: 2, fill: false }).svg}</div></div>`).join('')}
    <div class="card perf" style="left:220px;top:438px;width:540px;height:280px;border-radius:16px;padding:20px;box-shadow:none">
      <div class="ttl" style="font-size:18px">Performance</div><div class="sub" style="font-size:13px">Ad sales vs ad spend · 30 days</div>
      <div class="abs row" style="right:20px;top:22px;gap:14px;font-size:13px;color:var(--mu)"><span class="row" style="gap:6px"><i style="width:10px;height:3px;background:var(--pu)"></i>Ad sales</span><span class="row" style="gap:6px"><i style="width:10px;height:3px;background:var(--or)"></i>Ad spend</span></div>
      <div class="abs" style="left:24px;top:100px;width:492px;height:150px">${pA.svg}${pB.svg}</div></div>
    <div class="card pr" style="left:772px;top:438px;width:264px;height:280px;border-radius:16px;padding:18px;box-shadow:none">
      <div class="ttl" style="font-size:18px">Priority actions</div><div class="sub" style="font-size:13px">10 open · 2 critical</div>
      ${[['CRITICAL', 'Ads burn on 2 products', C.rd], ['CRITICAL', 'Out of stock, still selling', C.rd], ['HIGH', 'Traffic leak on 3 products', C.am]].map(([s, n, c]) => `<div class="pa row" style="gap:10px;margin-top:14px;padding:10px 12px;border-radius:12px;background:${c}14;border:1px solid ${c}40"><i style="width:8px;height:8px;border-radius:50%;background:${c};flex:none"></i><div><div style="font-size:11px;font-weight:700;letter-spacing:.1em;color:${c}">${s}</div><div style="font-size:13.5px;font-weight:600;margin-top:2px">${n}</div></div></div>`).join('')}</div>
    <div class="abs hl" style="left:1042px;top:318px;width:0;height:0"></div>
  </div>`, s);
  an(win, 5.62, 'fn', { d: 0.85, fn: k => { const e = eo5(k); win.style.opacity = clamp(k * 1.8); win.style.transform = `perspective(1800px) translateY(${(1 - e) * 140}px) rotateX(${(1 - e) * 16}deg) scale(${lerp(0.94, 1, e)})`; } });
  an(q(win, '.big'), 6.05, 'up', { d: 0.6, dy: 20 });
  an(q(win, '.big .v'), 6.15, 'count', { d: 1.1, to: 7039956, fmt: inr });
  anChart(q(win, '.big'), 6.25, 1.2, 336);
  qa(win, '.tile').forEach((el, i) => { an(el, 6.25 + i * 0.07, 'pop', { d: 0.5 }); an(q(el, '.tv'), 6.3 + i * 0.07, 'count', { d: 1.0, to: TILES[i][1], fmt: TILES[i][2] }); anChart(el, 6.45 + i * 0.07, 0.9, 70); });
  an(q(win, '.perf'), 6.7, 'up', { d: 0.6, dy: 20 }); anChart(q(win, '.perf'), 6.9, 1.4, 492);
  an(q(win, '.pr'), 6.8, 'up', { d: 0.6, dy: 20 }); qa(win, '.pa').forEach((el, i) => an(el, 7.05 + i * 0.12, 'up', { d: 0.5, dy: 12 }));
  // highlight ring on Net profit tile
  const np = qa(win, '.tile')[2];
  an(np, 7.9, 'fn', { d: 1.4, fn: k => { const a = Math.sin(k * Math.PI) ; np.style.boxShadow = `0 0 0 ${2 * a}px rgba(60,203,127,${0.9 * a}), 0 0 ${40 * a}px rgba(60,203,127,${0.35 * a})`; } });
  an(win, 6.5, 'fn', { d: 3.0, fn: k => { if (k > 0) win.style.transform = `scale(${lerp(1, 1.025, eio(k))})`; } });
}

// ---------- 1: Finance money flow ----------
{
  const s = scenes[1], b = SB[1];
  const ROWS = [['Product charges', 11960873, '5,762 txns'], ['Shipping charges', 68557, '1,969 txns'], ['Tax collected', 2153433, '5,762 txns'], ['Reimbursements', 20521, '20 txns'], ['Fee refunds', 301119, '658 txns'], ['Refunds', -2090620, '832 txns'], ['Amazon fees', -5216759, '6,802 txns'], ['Advertising billed', -464316, '168 txns'], ['Promotions', -54683, '2,250 txns']];
  const BW = 300, Z = 120, MAXV = 11960873, PX = BW - Z;
  const card = node(`<div class="card" style="left:760px;top:170px;width:1060px;height:740px;padding:28px 30px">
    <div class="row" style="gap:14px"><div class="ico" style="background:rgba(60,203,127,.14)"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M2 14 L7 8 L11 11 L18 4" stroke="#3CCB7F" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div><div class="ttl">Money flow</div><div class="sub">Where did the money go? In Amazon’s own categories.</div></div></div>
    <div class="card np" style="left:30px;top:110px;width:320px;height:600px;border-radius:18px;padding:24px;background:linear-gradient(180deg,rgba(60,203,127,.10),rgba(60,203,127,.02));border-color:rgba(60,203,127,.25);box-shadow:none">
      <div class="lbl" style="font-size:12px;color:var(--gr)">Net financial movement</div>
      <div class="num nv" style="font-size:44px;color:var(--gr);margin-top:8px">₹0</div>
      ${[['Money in', 14504503, C.gr, 100], ['Money out', -7899190, C.rd, 54], ['What stayed', 6605313, C.gr, 46]].map(([n, v, c, w]) => `<div class="mi" style="margin-top:30px"><div class="row" style="justify-content:space-between;font-size:15px"><span style="color:var(--mu)">${n}</span><span class="num" style="font-size:17px;color:${c}">${sinr(v)}</span></div><div class="track" style="margin-top:10px"><div class="fill" style="width:0;background:${c}" data-w="${w}"></div></div></div>`).join('')}
      <div class="fnote" style="margin-top:34px;font-size:16px;line-height:1.55;color:var(--mu)">Of every <b style="color:var(--tx)">₹100</b> Amazon posted in, <b style="color:var(--gr)">₹46</b> stayed with you after refunds, fees, ads and tax.</div></div>
    <div class="abs rows" style="left:380px;top:112px;width:650px"></div></div>`, s);
  const rows = q(card, '.rows');
  ROWS.forEach(([n, v, tx], i) => {
    const pos = v > 0, len = Math.max(3, Math.abs(v) / MAXV * PX * (pos ? 1 : 1.6));
    const r = node(`<div class="row fr" style="height:56px;border-bottom:1px solid var(--line)">
      <div style="width:200px"><div style="font-size:16px;font-weight:600">${n}</div><div style="font-size:12.5px;color:var(--mu2,#6F7682);margin-top:2px">${tx}</div></div>
      <div style="position:relative;width:${BW}px;height:14px"><div class="abs" style="left:${Z}px;top:-14px;bottom:-14px;width:1px;background:rgba(255,255,255,.14)"></div>
        <div class="abs bar" style="top:0;height:14px;border-radius:4px;${pos ? `left:${Z}px` : `right:${BW - Z}px`};width:0;background:${pos ? C.gr : C.rd}" data-len="${len}"></div></div>
      <div class="num rv" style="flex:1;text-align:right;font-size:20px;color:${pos ? 'var(--tx)' : 'var(--rd)'}">₹0</div></div>`, rows);
    const t0 = b + 0.2 + i * 0.075;
    an(r, t0, 'up', { d: 0.5, dy: 14 });
    an(q(r, '.bar'), t0 + 0.12, 'fn', { d: 0.7, fn: k => q(r, '.bar').style.width = len * eo5(k) + 'px' });
    an(q(r, '.rv'), t0 + 0.1, 'count', { d: 0.9, to: v, fmt: sinr });
    if (n === 'Amazon fees') an(r, b + 1.7, 'fn', { d: 1.2, fn: k => { const a = Math.sin(k * Math.PI); r.style.background = `rgba(240,100,90,${0.12 * a})`; r.style.boxShadow = `inset 3px 0 0 rgba(240,100,90,${a})`; } });
  });
  const nr = node(`<div class="row" style="height:64px;margin-top:10px;border-radius:14px;padding:0 0 0 0">
    <div style="width:200px;font-size:17px;font-weight:700">Net movement</div>
    <div style="position:relative;width:${BW}px;height:16px"><div class="abs bar" style="left:${Z}px;top:0;height:16px;border-radius:5px;width:0;background:linear-gradient(90deg,#3CCB7F,#7BE3A9)"></div></div>
    <div class="num rv" style="flex:1;text-align:right;font-size:24px;color:var(--gr)">₹0</div></div>`, rows);
  an(nr, b + 0.95, 'up', { d: 0.5, dy: 14 }); an(q(nr, '.bar'), b + 1.05, 'w', { d: 0.8, px: 6605313 / MAXV * PX }); an(q(nr, '.rv'), b + 1.0, 'count', { d: 1.0, to: 6605313, fmt: inr });
  an(q(card, '.np'), b + 0.1, 'up', { d: 0.6, dy: 20 }); an(q(card, '.nv'), b + 0.2, 'count', { d: 1.2, to: 6605313, fmt: inr });
  qa(card, '.mi .fill').forEach((f, i) => an(f, b + 0.4 + i * 0.12, 'w', { d: 0.7, to: +f.dataset.w }));
  an(q(card, '.fnote'), b + 0.9, 'up', { d: 0.6, dy: 10 });
}

// ---------- 2: Advertising ----------
{
  const s = scenes[2], b = SB[2];
  const R = 118, cx = 190, cy = 186;
  const arc = (a0, a1, r) => { const p = a => [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`; };
  const g = node(`<div class="card ga" style="left:760px;top:170px;width:400px;height:330px;padding:24px">
    <div class="lbl" style="font-size:12px">Return on ad spend · all ads</div>
    <svg class="abs" style="left:10px;top:40px" width="380" height="260"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#F0645A"/><stop offset=".45" stop-color="#F2B33D"/><stop offset="1" stop-color="#3CCB7F"/></linearGradient></defs>
      <path d="${arc(Math.PI, 2 * Math.PI, R)}" stroke="rgba(255,255,255,.08)" stroke-width="20" fill="none" stroke-linecap="round"/>
      <path class="gsw" d="${arc(Math.PI, 2 * Math.PI, R)}" stroke="url(#gg)" stroke-width="20" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>
    <div class="abs" style="left:0;width:400px;top:150px;text-align:center"><div class="num gv" style="font-size:52px">₹0.00</div><div class="sub" style="font-size:15px">back for every ₹1 spent</div></div>
    <div class="abs row" style="left:24px;right:24px;bottom:22px;justify-content:space-between;font-size:14px;color:var(--mu)"><span>ACoS <b class="num" style="color:var(--tx)">16.4%</b></span><span>Break-even <b class="num" style="color:var(--tx)">33.8%</b></span></div></div>`, s);
  an(g, b - 0.38, 'up', { d: 0.7, dy: 30 }); an(q(g, '.gsw'), b + 0.2, 'fn', { d: 1.1, fn: k => q(g, '.gsw').setAttribute('stroke-dashoffset', 1 - 0.78 * eo5(k)) });
  an(q(g, '.gv'), b + 0.2, 'count', { d: 1.1, to: 6.08, fmt: v => '₹' + v.toFixed(2) });
  const T = [['Ad spend', 405231, inr, C.or, 21], ['Ad-attributed sales', 2464815, inr, C.gr, 22], ['ROAS', 6.08, v => v.toFixed(2) + '×', C.bl, 23], ['ACoS', 16.4, v => v.toFixed(1) + '%', C.pu, 24]];
  T.forEach(([n, v, f, c, sd], i) => {
    const el = node(`<div class="card" style="left:${1176 + (i % 2) * 330}px;top:${170 + Math.floor(i / 2) * 173}px;width:314px;height:157px;padding:20px 22px">
      <div class="lbl" style="font-size:12px">${n}</div><div class="num tv" style="font-size:34px;margin-top:6px">0</div>
      <div class="abs" style="left:22px;right:22px;bottom:18px;height:34px">${chart(series(20, sd, 10, 5, 3), 270, 34, { color: c, id: 'ad' + i, sw: 2.5 }).svg}</div></div>`, s);
    an(el, b - 0.35 + i * 0.05, 'up', { d: 0.7, dy: 30 }); an(q(el, '.tv'), b + 0.2 + i * 0.07, 'count', { d: 1.0, to: v, fmt: f }); anChart(el, b + 0.35 + i * 0.07, 1.0, 270);
  });
  const PR = [['Center Trolley Coffee Table, Black', 46.1, 33.8], ['3-Layer Microwave Oven Stand', 31.9, 21.1], ['Study Table, Black Frame', 28.7, 29.5], ['Wall Clothes Drying Bracket', 18.2, 28.4], ['Foldable Study Table, Walnut 2×3', 12.6, 30.2]];
  const gr = node(`<div class="card" style="left:760px;top:516px;width:1060px;height:394px;padding:24px 28px">
    <div class="row" style="justify-content:space-between"><div><div class="ttl">Product profit guardrails</div><div class="sub">Is advertising profitable on each product?</div></div>
      <div class="row" style="gap:18px;font-size:14px;color:var(--mu)"><span class="row" style="gap:8px"><i style="width:14px;height:6px;border-radius:3px;background:var(--mu)"></i>ACoS</span><span class="row" style="gap:8px"><i style="width:2px;height:14px;background:#fff"></i>Break-even</span></div></div>
    <div class="rows" style="margin-top:14px"></div></div>`, s);
  an(gr, b - 0.3, 'up', { d: 0.7, dy: 30 });
  PR.forEach(([n, a, be], i) => {
    const bad = a > be + 0.5, near = !bad && a > be - 2, c = bad ? C.rd : near ? C.am : C.gr, tag = bad ? 'Ads lose money' : near ? 'Near break-even' : 'Healthy';
    const TW = 250, sc = TW / 50;
    const r = node(`<div class="row" style="height:60px;gap:18px;border-top:1px solid var(--line)">
      ${thumb()}<div style="width:300px;font-size:16px;font-weight:600">${n}</div>
      <span class="pill bd" style="width:160px;justify-content:center;font-size:13px;background:${c}1f;color:${c};border:1px solid ${c}55">${tag}</span>
      <div style="position:relative;width:${TW}px;height:10px;border-radius:6px;background:rgba(255,255,255,.07)">
        <div class="abs af" style="left:0;top:0;height:10px;border-radius:6px;width:0;background:${c}"></div>
        <div class="abs" style="left:${be * sc}px;top:-9px;width:2px;height:28px;background:#fff;border-radius:2px"></div></div>
      <div class="num" style="flex:1;text-align:right;font-size:17px;color:${c}">${a.toFixed(1)}%<span style="color:var(--mu);font-weight:600;font-size:14px"> vs ${be.toFixed(1)}%</span></div></div>`, q(gr, '.rows'));
    const t0 = b + 0.6 + i * 0.09;
    an(r, t0, 'up', { d: 0.5, dy: 12 }); an(q(r, '.af'), t0 + 0.15, 'w', { d: 0.8, px: a * sc }); an(q(r, '.bd'), t0 + 0.75, 'pop', { d: 0.4 });
    if (bad) an(r, b + 1.7, 'fn', { d: 1.2, fn: k => { const al = Math.sin(k * Math.PI); r.style.background = `rgba(240,100,90,${0.10 * al})`; } });
  });
}

// ---------- 3: Sales & Traffic ----------
{
  const s = scenes[3], b = SB[3];
  const f = node(`<div class="card" style="left:760px;top:170px;width:1060px;height:340px;padding:24px 28px">
    <div class="row" style="justify-content:space-between"><div><div class="ttl">From visit to order</div><div class="sub">How your visitors turned into orders · 30 days</div></div>
      <span class="pill ch" style="background:rgba(247,147,30,.14);color:var(--or2);border:1px solid rgba(247,147,30,.4)">18 units sold for every 1,000 visits</span></div>
    <div class="row stats" style="margin-top:22px">${[['Sessions', 160416, int, C.pu], ['Page views', 224296, int, C.bl], ['Units ordered', 2945, int, C.gr], ['Ordered sales', 6901151, inr, C.or]].map(([n, v, fm, c]) => `<div class="st" style="flex:1"><div class="row" style="gap:8px"><i style="width:8px;height:8px;border-radius:50%;background:${c}"></i><span class="lbl" style="font-size:12px">${n}</span></div><div class="num sv" style="font-size:34px;margin-top:6px" data-v="${v}">0</div></div>`).join('')}</div>
    <svg class="abs rib" style="left:28px;top:200px" width="1004" height="110"><defs><linearGradient id="rb" x1="0" x2="1"><stop offset="0" stop-color="#9384F5"/><stop offset=".45" stop-color="#4C8DF6"/><stop offset=".6" stop-color="#3CCB7F"/><stop offset="1" stop-color="#F7931E"/></linearGradient>
      <clipPath id="rbc"><rect class="rbr" x="0" y="0" width="0" height="110"/></clipPath></defs>
      <path clip-path="url(#rbc)" d="M0,10 L470,10 C540,10 540,44 600,44 L1004,44 L1004,66 L600,66 C540,66 540,100 470,100 L0,100 Z" fill="url(#rb)" opacity=".9"/></svg>
    ${[['1.4 views per visit', 240], ['1.84% of visits ordered', 640], ['₹2,343 per unit', 880]].map(([t, x]) => `<span class="pill rl abs" style="left:${x}px;top:236px;background:rgba(19,22,27,.88);color:var(--tx);font-size:14px;border:1px solid var(--line2)">${t}</span>`).join('')}</div>`, s);
  an(f, b - 0.38, 'up', { d: 0.7, dy: 30 }); an(q(f, '.ch'), b + 0.9, 'pop', { d: 0.5 });
  qa(f, '.st').forEach((el, i) => { an(el, b + 0.15 + i * 0.08, 'up', { d: 0.5, dy: 12 }); an(q(el, '.sv'), b + 0.2 + i * 0.08, 'count', { d: 1.0, to: +q(el, '.sv').dataset.v, fmt: i === 3 ? inr : int }); });
  an(q(f, '.rbr'), b + 0.35, 'fn', { d: 1.1, fn: k => q(f, '.rbr').setAttribute('width', 1004 * eio(k)) });
  qa(f, '.rl').forEach((el, i) => an(el, b + 0.65 + i * 0.25, 'pop', { d: 0.45 }));
  const sess = series(29, 31, 5500, 900, 0, { 7: 1700, 8: 1900, 22: -2600, 23: -3200, 24: -1400 });
  const pv = sess.map((v, i) => v * 1.4 + Math.sin(i) * 300);
  const c1 = chart(pv, 1000, 230, { color: C.bl, id: 't1', min: 0, max: 11000 }), c2 = chart(sess, 1000, 230, { color: C.pu, id: 't2', min: 0, max: 11000 });
  const tc = node(`<div class="card" style="left:760px;top:526px;width:1060px;height:384px;padding:24px 28px">
    <div class="row" style="justify-content:space-between"><div><div class="ttl">Traffic & conversion</div><div class="sub">Sessions and page views, day by day</div></div>
      <div class="row" style="gap:18px;font-size:14px;color:var(--mu)"><span class="row" style="gap:8px"><i style="width:12px;height:3px;background:var(--pu)"></i>Sessions</span><span class="row" style="gap:8px"><i style="width:12px;height:3px;background:var(--bl)"></i>Page views</span></div></div>
    <div class="abs plot" style="left:30px;top:120px;width:1000px;height:230px">
      ${[0, 1, 2, 3].map(i => `<div class="abs" style="left:0;right:0;top:${i * 76}px;height:1px;background:rgba(255,255,255,.05)"></div>`).join('')}${c1.svg}${c2.svg}
      <div class="abs tip1" style="left:${c1.pts[8][0] - 90}px;top:${c1.pts[8][1] - 46}px"><span class="pill" style="background:#262B34;border:1px solid var(--line2);font-size:13px"><i style="width:7px;height:7px;border-radius:50%;background:var(--gr)"></i>Busiest · Thu 10 Sep · 7,446</span></div>
      <div class="abs tip2" style="left:${c2.pts[23][0] - 110}px;top:${c2.pts[23][1] + 18}px"><span class="pill" style="background:#262B34;border:1px solid var(--line2);font-size:13px"><i style="width:7px;height:7px;border-radius:50%;background:var(--rd)"></i>Quietest · Fri 25 Sep · 2,124</span></div>
    </div></div>`, s);
  an(tc, b - 0.3, 'up', { d: 0.7, dy: 30 }); anChart(tc, b + 0.5, 1.4, 1000); an(q(tc, '.tip1'), b + 1.1, 'pop', { d: 0.45 }); an(q(tc, '.tip2'), b + 1.6, 'pop', { d: 0.45 });
}

// ---------- 4: Search & Brand ----------
{
  const s = scenes[4], b = SB[4];
  const sb = node(`<div class="card" style="left:760px;top:170px;width:1060px;height:84px;padding:0 28px;display:flex;align-items:center;gap:16px;border-radius:18px">
    <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="9.5" cy="9.5" r="7" stroke="#9BA2AE" stroke-width="2.2" fill="none"/><path d="M15 15l5 5" stroke="#9BA2AE" stroke-width="2.2" stroke-linecap="round"/></svg>
    <div class="qt" style="font-size:24px;font-weight:500"></div><span class="caret" style="width:2px;height:28px;background:var(--or)"></span>
    <div style="flex:1"></div><span class="pill cnt" style="color:var(--mu);border:1px solid var(--line)">951 queries · 1,58,58,597 searches</span></div>`, s);
  const QT = 'study table for home';
  an(sb, b - 0.38, 'up', { d: 0.7, dy: 30 }); an(q(sb, '.cnt'), b + 0.5, 'fade', { d: 0.5 });
  an(q(sb, '.qt'), b + 0.2, 'fn', { d: 0.8, fn: k => q(sb, '.qt').textContent = QT.slice(0, Math.round(QT.length * k)) });
  an(q(sb, '.caret'), b, 'fn', { d: 2.5, fn: k => q(sb, '.caret').style.opacity = (Math.floor(k * 2.5 * 2.2) % 2 === 0 || k < 0.4) ? 1 : 0 });
  const FN = [['Seen', 0.94, 'impression share', '3,88,752 of 4,11,39,909', C.bl], ['Clicked', 0.92, 'click share', '5,540 of 6,04,461', C.rd], ['Added to cart', 0.92, 'cart-add share', '1,041 of 1,12,978', C.am], ['Bought', 0.92, 'purchase share', '73 of 7,960', C.gr]];
  FN.forEach(([n, v, u, d, c], i) => {
    const hot = n === 'Clicked';
    const el = node(`<div class="card" style="left:${760 + i * 269}px;top:270px;width:253px;height:270px;padding:20px;${hot ? 'border-color:rgba(240,100,90,.55);background:linear-gradient(180deg,rgba(240,100,90,.12),#1A1E25)' : ''}">
      <div class="lbl" style="font-size:12px;color:${hot ? 'var(--rd)' : 'var(--mu)'}">${n}</div>
      <svg class="abs" style="left:20px;top:56px" width="76" height="76"><circle cx="38" cy="38" r="31" stroke="rgba(255,255,255,.08)" stroke-width="7" fill="none"/><circle class="rg" cx="38" cy="38" r="31" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 38 38)"/></svg>
      <div class="abs" style="left:112px;top:66px"><div class="num fv" style="font-size:32px">0.00%</div><div class="sub" style="font-size:13px">${u}</div></div>
      <div class="abs" style="left:20px;top:150px;font-size:14px;color:var(--mu);line-height:1.5">${d}<br>marketplace total</div>
      ${hot ? `<span class="pill abs hot" style="left:20px;bottom:18px;font-size:12.5px;background:rgba(240,100,90,.16);color:var(--rd);border:1px solid rgba(240,100,90,.45)">↓ Largest fall in share</span>` : ''}</div>`, s);
    an(el, b - 0.32 + i * 0.05, 'up', { d: 0.7, dy: 30 });
    an(q(el, '.rg'), b + 0.35 + i * 0.09, 'fn', { d: 0.9, fn: k => q(el, '.rg').setAttribute('stroke-dashoffset', 1 - 0.62 * eo5(k)) });
    an(q(el, '.fv'), b + 0.35 + i * 0.09, 'count', { d: 0.9, to: v, fmt: x => x.toFixed(2) + '%' });
    if (hot) { an(q(el, '.hot'), b + 1.2, 'pop', { d: 0.45 }); an(el, b + 1.3, 'fn', { d: 1.0, fn: k => el.style.boxShadow = `0 0 ${50 * Math.sin(k * Math.PI)}px rgba(240,100,90,.35), 0 40px 90px rgba(0,0,0,.45)` }); }
  });
  const OP = [['Funnel leak', 6, 'Seen and clicked, then shoppers do not buy', C.rd], ['Demand gap', 129, 'Real demand, the brand is barely seen', C.or], ['No paid coverage', 66, 'Converts well with no advertising behind it', C.pu], ['Paid dependency', 24, 'Only shows up because of ads', C.bl]];
  const op = node(`<div class="card" style="left:760px;top:556px;width:1060px;height:354px;padding:24px 28px">
    <div class="row" style="gap:18px;align-items:baseline"><div class="num oc" style="font-size:64px">0</div><div><div class="ttl">opportunities found this week</div><div class="sub">Gaps that belong to advertising, the listing, or stock</div></div></div>
    <div class="row sbar" style="margin-top:18px;height:14px;gap:4px">${OP.map(([, v, , c]) => `<div class="sg" style="height:14px;border-radius:7px;background:${c};width:0" data-w="${v / 225 * 100}"></div>`).join('')}</div>
    <div class="row" style="margin-top:22px;gap:16px;flex-wrap:wrap">${OP.map(([n, v, d, c]) => `<div class="oi card" style="position:relative;width:236px;height:118px;border-radius:14px;padding:14px 16px;box-shadow:none;background:#222730"><div class="row" style="justify-content:space-between"><span class="row" style="gap:8px;font-size:15px;font-weight:600"><i style="width:9px;height:9px;border-radius:50%;background:${c}"></i>${n}</span><span class="num" style="font-size:22px">${v}</span></div><div style="font-size:13.5px;color:var(--mu);margin-top:8px;line-height:1.45">${d}</div></div>`).join('')}</div></div>`, s);
  an(op, b - 0.25, 'up', { d: 0.7, dy: 30 }); an(q(op, '.oc'), b + 0.7, 'count', { d: 1.1, to: 225, fmt: int });
  qa(op, '.sg').forEach((el, i) => an(el, b + 0.8 + i * 0.1, 'fn', { d: 0.7, fn: k => el.style.width = `calc(${+el.dataset.w * eo5(k)}% - 3px)` }));
  qa(op, '.oi').forEach((el, i) => an(el, b + 1.0 + i * 0.08, 'up', { d: 0.5, dy: 12 }));
}

// ---------- 5: Inventory ----------
{
  const s = scenes[5], b = SB[5];
  const segs = [[3, C.rd], [2, '#FF8A65'], [5, C.am]];
  let acc = 0;
  const al = node(`<div class="card" style="left:760px;top:170px;width:400px;height:360px;padding:24px">
    <div class="lbl" style="font-size:12px">Stock alerts</div>
    <svg class="abs" style="left:110px;top:58px" width="180" height="180">${segs.map(([v, c], i) => { const st = acc / 10; acc += v; return `<circle class="ra" data-s="${st}" data-l="${v / 10 - 0.02}" cx="90" cy="90" r="74" stroke="${c}" stroke-width="16" fill="none" pathLength="1" stroke-dasharray="0 1" transform="rotate(${-90 + st * 360} 90 90)"/>`; }).join('')}</svg>
    <div class="abs" style="left:0;width:400px;top:112px;text-align:center"><div class="num ac" style="font-size:56px">0</div><div class="sub" style="font-size:14px">selling products</div></div>
    <div class="abs row" style="left:24px;right:24px;bottom:24px;gap:8px;justify-content:center">${[['3 out', C.rd], ['2 critical', '#FF8A65'], ['5 low', C.am]].map(([t, c]) => `<span class="pill ach" style="font-size:14px;background:${c}1f;color:${c}">● ${t}</span>`).join('')}</div></div>`, s);
  an(al, b - 0.38, 'up', { d: 0.7, dy: 30 }); an(q(al, '.ac'), b + 0.2, 'count', { d: 0.9, to: 10, fmt: int });
  qa(al, '.ra').forEach((c, i) => an(c, b + 0.2 + i * 0.15, 'fn', { d: 0.6, fn: k => c.setAttribute('stroke-dasharray', `${(+c.dataset.l * eo5(k)).toFixed(4)} 1`) }));
  qa(al, '.ach').forEach((c, i) => an(c, b + 0.7 + i * 0.08, 'pop', { d: 0.4 }));
  const ir = node(`<div class="card" style="left:760px;top:546px;width:400px;height:364px;padding:24px">
    <div class="ttl">Inventory right now</div><div class="sub">Live stock from Amazon</div>
    <div class="num iv" style="font-size:52px;margin-top:20px">0</div><div class="sub" style="font-size:15px">sellable units</div>
    <div class="row" style="margin-top:22px;height:12px;gap:4px;border-radius:6px;overflow:hidden">${[[82, C.gr], [6, C.bl], [8, C.am], [4, C.rd]].map(([w, c]) => `<div class="isg" style="height:12px;width:0;background:${c}" data-w="${w}"></div>`).join('')}</div>
    <div class="row" style="margin-top:16px;gap:16px;font-size:13.5px;color:var(--mu)">${[['Sellable', C.gr], ['Reserved', C.bl], ['Inbound', C.am], ['Out', C.rd]].map(([n, c]) => `<span class="row" style="gap:6px"><i style="width:8px;height:8px;border-radius:50%;background:${c}"></i>${n}</span>`).join('')}</div>
    <div class="row" style="margin-top:20px;gap:10px;align-items:baseline"><span class="num" style="font-size:28px">18.4 days</span><span class="sub">average stock cover</span></div></div>`, s);
  an(ir, b - 0.3, 'up', { d: 0.7, dy: 30 }); an(q(ir, '.iv'), b + 0.35, 'count', { d: 1.0, to: 3036, fmt: int });
  qa(ir, '.isg').forEach((e, i) => an(e, b + 0.5 + i * 0.08, 'fn', { d: 0.6, fn: k => e.style.width = (+e.dataset.w * eo5(k)) + '%' }));
  const RW = [['Heavy Duty 4-Tier Metal Rack, Black', '0 sellable · sells 0.53 a day', 0, 'Out of stock', 'Restock now', C.rd], ['Foldable Study Table, Cream', '4 sellable · sells 1.03 a day', 5.6, '5.6d', 'about 6 days left', C.rd], ['Foldable Table, Black 90×60', '39 sellable · sells 7 a day', 5.8, '5.8d', 'about 6 days left', C.rd], ['Foldable Study Table, White', '6 sellable · sells 0.43 a day', 9.4, '9.4d', 'about 9 days left', C.am], ['Foldable Study Table, Black', '7 sellable · sells 0.7 a day', 10.9, '10.9d', 'about 11 days left', C.am], ['Wall Clothes Drying Bracket', '19 sellable · sells 1.9 a day', 12.1, '12.1d', 'about 12 days left', C.am]];
  const wl = node(`<div class="card" style="left:1176px;top:170px;width:644px;height:740px;padding:24px 26px">
    <div><div class="ttl">Restock watchlist</div><div class="sub">Selling products with the least stock cover left</div></div>
    <div class="row" style="gap:14px;margin-top:14px;font-size:13.5px;color:var(--mu)">${[['Out', C.rd], ['Critical <7d', '#FF8A65'], ['Low 7–14d', C.am], ['Healthy 14d+', C.gr]].map(([n, c]) => `<span class="row" style="gap:6px"><i style="width:8px;height:8px;border-radius:50%;background:${c}"></i>${n}</span>`).join('')}</div>
    <div class="rows" style="margin-top:10px"></div></div>`, s);
  an(wl, b - 0.34, 'up', { d: 0.7, dy: 30 });
  RW.forEach(([n, d, days, badge, sub2, c], i) => {
    const r = node(`<div class="row" style="height:96px;gap:16px;border-top:1px solid var(--line)">
      ${thumb()}<div style="flex:1"><div style="font-size:16.5px;font-weight:600">${n}</div><div style="font-size:13.5px;color:var(--mu);margin-top:3px">${d}</div>
      <div class="track" style="margin-top:10px;width:330px;height:8px"><div class="fill rf" style="width:0;background:${c}"></div><div class="abs" style="left:${14 / 21 * 100}%;top:0;bottom:0;width:2px;background:rgba(255,255,255,.35)"></div></div></div>
      <div style="text-align:right"><span class="pill rb" style="font-size:13.5px;background:${c}22;color:${c};padding:4px 12px">● ${badge}</span><div style="font-size:13px;color:var(--mu);margin-top:6px">${sub2}</div></div></div>`, q(wl, '.rows'));
    const t0 = b + 0.35 + i * 0.09;
    an(r, t0, 'up', { d: 0.5, dy: 12 }); an(q(r, '.rf'), t0 + 0.15, 'w', { d: 0.8, to: Math.max(3, days / 21 * 100) }); an(q(r, '.rb'), t0 + 0.5, 'pop', { d: 0.4 });
    if (i === 0) an(r, b + 1.3, 'fn', { d: 1.1, fn: k => { const a = Math.sin(k * Math.PI); r.style.background = `rgba(240,100,90,${0.12 * a})`; r.style.boxShadow = `inset 3px 0 0 rgba(240,100,90,${a})`; } });
  });
}

// ---------- 6: Returns ----------
{
  const s = scenes[6], b = SB[6];
  const ref = series(30, 61, 32000, 14000, 4000, { 25: 30000, 26: 64000, 27: 20000 });
  const rc = chart(ref, 590, 190, { color: C.rd, id: 'rf', min: 0, max: 115000 });
  const m = node(`<div class="card" style="left:760px;top:170px;width:640px;height:430px;padding:24px 26px">
    <div class="lbl" style="font-size:12px">Refunded · 30 days</div>
    <div class="row" style="gap:14px;align-items:baseline;margin-top:6px"><div class="num rv" style="font-size:54px">₹0</div><div class="sub">Amazon Finance ledger</div></div>
    <div class="abs" style="left:26px;top:180px;width:590px;height:190px">${rc.svg}
      <div class="abs tip" style="left:${rc.pts[26][0] - 230}px;top:${rc.pts[26][1] - 12}px"><span class="pill" style="background:#262B34;border:1px solid var(--line2);font-size:13px"><i style="width:7px;height:7px;border-radius:50%;background:var(--rd)"></i>Highest · Tue 29 Sep · ₹1,01,846</span></div></div></div>`, s);
  an(m, b - 0.38, 'up', { d: 0.7, dy: 30 }); an(q(m, '.rv'), b + 0.12, 'count', { d: 0.9, to: 1034217, fmt: inr }); anChart(m, b + 0.2, 1.0, 590); an(q(m, '.tip'), b + 0.95, 'pop', { d: 0.4 });
  [['Refunded units', 488, 'Amazon refund items', C.rd], ['Refunded orders', 485, 'Orders with a refund item', C.am]].forEach(([n, v, d, c], i) => {
    const el = node(`<div class="card" style="left:1416px;top:${170 + i * 222}px;width:404px;height:206px;padding:24px"><div class="row" style="gap:10px"><i style="width:9px;height:9px;border-radius:50%;background:${c}"></i><span class="lbl" style="font-size:12px">${n}</span></div><div class="num tv" style="font-size:54px;margin-top:14px">0</div><div class="sub">${d}</div></div>`, s);
    an(el, b - 0.34 + i * 0.05, 'up', { d: 0.7, dy: 30 }); an(q(el, '.tv'), b + 0.18 + i * 0.08, 'count', { d: 0.8, to: v, fmt: int });
  });
  const PM = [['Foldable Study Table, Walnut 2×3', 128498, 66, 100], ['4-Layer Kitchen Organizer Rack', 121623, 33, 94], ['Foldable Study Table, Pearl White', 103000, 53, 80]];
  const pm = node(`<div class="card" style="left:760px;top:616px;width:1060px;height:294px;padding:22px 26px"><div class="ttl">Products refunded most</div><div class="sub">By refunded value in this period</div><div class="rows" style="margin-top:10px"></div></div>`, s);
  an(pm, b - 0.28, 'up', { d: 0.7, dy: 30 });
  PM.forEach(([n, v, u, w], i) => { const r = node(`<div class="row" style="height:62px;gap:16px;border-top:1px solid var(--line)"><span class="num" style="width:18px;color:var(--mu);font-size:16px">${i + 1}</span>${thumb()}<div style="width:330px;font-size:16px;font-weight:600">${n}</div><div class="track" style="flex:1;height:8px"><div class="fill pf" style="width:0;background:var(--rd)"></div></div><div style="width:150px;text-align:right"><div class="num" style="font-size:18px">${inr(v)}</div><div style="font-size:12.5px;color:var(--mu)">${u} units</div></div></div>`, q(pm, '.rows')); an(r, b + 0.45 + i * 0.08, 'up', { d: 0.45, dy: 10 }); an(q(r, '.pf'), b + 0.55 + i * 0.08, 'w', { d: 0.7, to: w }); });
}

// ---------- 7: Action Center ----------
{
  const s = scenes[7], b = SB[7];
  const ac = node(`<div class="card" style="left:760px;top:170px;width:1060px;height:740px;padding:26px 28px">
    <div class="row" style="justify-content:space-between"><div class="row" style="gap:14px"><div class="ico" style="background:rgba(247,147,30,.14)"><svg width="18" height="20" viewBox="0 0 18 20"><path d="M10 1 L2 12 H9 L8 19 L16 8 H9 Z" fill="#F7931E"/></svg></div><div><div class="ttl">Priority actions</div><div class="sub">10 open actions · 2 critical</div></div></div>
      <span class="pill" style="color:var(--or2);border:1px solid rgba(247,147,30,.4)">View all 10 →</span></div>
    <div class="row cnts" style="gap:16px;margin-top:22px">${[['Critical', 2, C.rd], ['High', 3, C.am], ['Medium', 5, C.bl]].map(([n, v, c]) => `<div class="cb card" style="position:relative;flex:1;height:92px;border-radius:16px;padding:16px 20px;box-shadow:none;background:${c}14;border-color:${c}44"><div style="font-size:13px;font-weight:700;letter-spacing:.12em;color:${c}">${n.toUpperCase()}</div><div class="num" style="font-size:36px;margin-top:2px">${v}</div></div>`).join('')}</div>
    <div class="acts" style="margin-top:18px"></div></div>`, s);
  an(ac, b - 0.38, 'up', { d: 0.7, dy: 30 }); qa(ac, '.cb').forEach((e, i) => an(e, b + 0.15 + i * 0.08, 'pop', { d: 0.45 }));
  const AC = [['CRITICAL · ADS BURN', 'Advertising turns a profitable product into a loss', 'Earns ₹2,403 before ads. ₹9,276 of ad spend makes it a ₹6,873 loss.', 'Review advertising', C.rd], ['CRITICAL · STOCK RISK', 'Out of stock while still selling', 'No sellable units left on a product that sells 0.53 a day.', 'Review inventory', C.rd], ['HIGH · CONVERSION', 'Traffic leak: high traffic, low conversion', '17,430 sessions converting at 1.31% against your 1.84% average.', 'View sales & traffic', C.am]];
  AC.forEach(([tag, t, d, btn, c], i) => {
    const r = node(`<div class="card ar" style="position:relative;height:150px;border-radius:16px;margin-top:14px;padding:20px 24px 20px 30px;box-shadow:none;background:#20252D">
      <div class="abs" style="left:0;top:16px;bottom:16px;width:4px;border-radius:2px;background:${c}"></div>
      <div style="font-size:12.5px;font-weight:700;letter-spacing:.12em;color:${c}">${tag}</div>
      <div style="font-family:var(--H);font-size:22px;font-weight:700;margin-top:6px">${t}</div>
      <div style="font-size:15px;color:var(--mu);margin-top:6px">${d}</div>
      <span class="pill abs btn" style="right:24px;top:52px;font-size:14px;background:${c}22;color:${c};border:1px solid ${c}55">${btn} →</span></div>`, q(ac, '.acts'));
    an(r, b + 0.3 + i * 0.12, 'fn', { d: 0.6, fn: k => { const e = eo5(k); r.style.opacity = clamp(k * 1.6); r.style.transform = `translateX(${(1 - e) * 80}px)`; } });
  });
  // cursor click on first button
  const cur = node(`<svg class="abs cur" width="34" height="34" viewBox="0 0 24 24" style="left:0;top:0;filter:drop-shadow(0 6px 12px rgba(0,0,0,.5))"><path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.8 L11.6 14 L18 14 Z" fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/></svg>`, s);
  const ring = node(`<div class="abs" style="width:40px;height:40px;border-radius:50%;border:2px solid var(--rd);left:0;top:0;opacity:0"></div>`, s);
  const p0 = [1560, 1000], p1 = [1688, 438];
  an(cur, b + 0.9, 'fn', { d: 0.7, fn: k => { const e = eio(k); cur.style.opacity = clamp(k * 4); cur.style.transform = `translate(${lerp(p0[0], p1[0], e)}px,${lerp(p0[1], p1[1], e)}px) scale(${k > 0.97 ? 0.92 : 1})`; } });
  an(ring, b + 1.62, 'fn', { d: 0.5, fn: k => { ring.style.opacity = k > 0 && k < 1 ? 1 - k : 0; ring.style.transform = `translate(${p1[0] - 12}px,${p1[1] - 14}px) scale(${0.4 + k * 1.6})`; } });
  const b0 = qa(ac, '.btn')[0];
  const b0css = b0.getAttribute('style');
  an(b0, b + 1.62, 'fn', { d: 0.4, fn: k => { b0.setAttribute('style', b0css); if (k > 0) { b0.textContent = '✓ Opening campaign'; b0.style.background = 'rgba(60,203,127,.18)'; b0.style.color = '#3CCB7F'; b0.style.borderColor = 'rgba(60,203,127,.5)'; } else b0.textContent = 'Review advertising →'; } });
}

// =====================================================================
// CTA
// =====================================================================
const cta = node(`<div class="layer" id="cta" style="opacity:0">
  <div class="abs" style="left:0;width:1920px;top:390px;text-align:center;font-family:var(--H);font-weight:800;font-size:104px;line-height:1.08;letter-spacing:-.04em">
    <span class="mask"><span class="k1">Stop guessing.</span></span><span class="mask"><span class="k2">Start <span style="color:var(--or)">knowing.</span></span></span></div>
  <div class="abs ks" style="left:0;width:1920px;top:642px;text-align:center;font-size:27px;color:var(--mu)">Orders, ads, fees, refunds and stock, finally read together.</div>
  <div class="abs row kb" style="left:0;width:1920px;top:722px;justify-content:center;gap:18px">
    <span class="pill badge" style="font-size:17px;padding:14px 22px;background:rgba(60,203,127,.12);color:#5FDB98;border:1px solid rgba(60,203,127,.4)"><i style="width:9px;height:9px;border-radius:50%;background:#3CCB7F;box-shadow:0 0 10px #3CCB7F"></i>Early access open · Early-bird pricing</span>
    <span class="pill btn" style="font-size:22px;font-weight:700;padding:18px 34px;background:linear-gradient(180deg,#FFB04A,#F7931E);color:#1d1204;box-shadow:0 18px 50px rgba(247,147,30,.45)">Claim early access →</span></div>
  <div class="abs row kt" style="left:0;width:1920px;top:830px;justify-content:center;gap:36px;font-size:18px;color:var(--mu)"><span>✓ Official Amazon authorisation</span><span>✓ No password sharing</span><span>✓ No report downloads, ever</span></div>
</div>`);
an(q(cta, '.k1'), 27.95, 'rise', { d: 0.7 }); an(q(cta, '.k2'), 28.1, 'rise', { d: 0.7 });
an(q(cta, '.ks'), 28.4, 'up', { d: 0.6, dy: 14 }); an(q(cta, '.badge'), 28.6, 'pop', { d: 0.5 }); an(q(cta, '.btn'), 28.72, 'pop', { d: 0.55 }); an(q(cta, '.kt'), 28.95, 'fade', { d: 0.6 });
const btnG = q(cta, '.btn');
an(btnG, 29.2, 'fn', { d: 0.8, fn: k => { if (k > 0) btnG.style.boxShadow = `0 18px 50px rgba(247,147,30,.45), 0 0 0 ${10 * k}px rgba(247,147,30,${0.3 * (1 - k)})`; } });

// =====================================================================
// animation evaluator
// =====================================================================
function runAnims(t) {
  for (const a of A) {
    const k = clamp((t - a.t0) / a.d), el = a.el;
    switch (a.type) {
      case 'up': { const e = eo5(k); el.style.opacity = clamp(k * 1.5); el.style.transform = `translateY(${(1 - e) * a.dy}px)`; break; }
      case 'fade': el.style.opacity = eo3(k); break;
      case 'pop': { const e = eoBack(k, 1.3); el.style.opacity = clamp(k * 2); el.style.transform = `scale(${lerp(0.9, 1, e)})`; break; }
      case 'rise': el.style.transform = `translateY(${(1 - eo5(k)) * 112}%)`; break;
      case 'w': el.style.width = (a.px != null ? a.px * eo5(k) + 'px' : a.to * eo5(k) + '%'); break;
      case 'draw': el.setAttribute('stroke-dashoffset', (1 - eo3(k)).toFixed(4)); break;
      case 'count': el.textContent = a.fmt(a.to * eo3(k)); break;
      case 'fn': a.fn(k); break;
    }
  }
}

// =====================================================================
// background
// =====================================================================
function drawBG(t, ck) {
  const g = bg; g.fillStyle = '#13161B'; g.fillRect(0, 0, W, H);
  const r1 = g.createRadialGradient(1250, 560, 0, 1250, 560, 1100); r1.addColorStop(0, 'rgba(36,41,50,1)'); r1.addColorStop(1, 'rgba(19,22,27,0)');
  g.fillStyle = r1; g.fillRect(0, 0, W, H);
  const glow = (x, y, r, c) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
  glow(1500 + Math.sin(t * 0.35) * 160 - ck * 40, 300 + Math.cos(t * 0.3) * 80, 700, 'rgba(247,147,30,0.10)');
  glow(500 + Math.cos(t * 0.3) * 120, 900 + Math.sin(t * 0.4) * 60, 650, 'rgba(147,132,245,0.08)');
  // dot grid with parallax
  const off = -(ck * W * 0.18) % 36;
  g.fillStyle = 'rgba(255,255,255,0.045)';
  for (let y = 18; y < H; y += 36) for (let x = off; x < W; x += 36) g.fillRect(x, y, 2, 2);
  // vignette
  const v = g.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// =====================================================================
// main
// =====================================================================
let BRW = 0, BRH = 0;
window.renderAt = function (t) {
  const ck = camK(t);
  drawBG(t, ck);
  runAnims(t);
  // hook: kept counter + exit
  { let sum = 0; LEDGER.forEach(([, , v], i) => { sum += v * eo3(seg(t, 0.95 + i * 0.2, 1.3 + i * 0.2)); }); keptEl.textContent = sinr(sum); keptEl.style.color = sum < 0 ? 'var(--rd)' : 'var(--tx)'; }
  const hx = seg(t, 3.85, 4.3); hook.style.opacity = 1 - eo3(hx); hook.style.transform = `scale(${1 + 0.06 * eo3(hx)})`; hook.style.filter = hx > 0 ? `blur(${8 * hx}px)` : 'none'; hook.style.display = t > 4.35 ? 'none' : 'block';
  // brand lockup path
  if (!BRW) { BRW = brand.offsetWidth; BRH = brand.offsetHeight; }
  const center = { x: 960 - BRW / 2, y: 470 - BRH / 2, s: 1 }, head = { x: 56, y: 40, s: 0.36 }, ctaP = { x: 960 - BRW * 0.62 / 2, y: 210, s: 0.62 };
  let P = center, op = 0;
  if (t < 4.0) op = 0;
  else if (t < 5.45) { P = center; op = 1; }
  else if (t < 27.5) { const k = eio5(seg(t, 5.45, 6.15)); P = { x: lerp(center.x, head.x, k), y: lerp(center.y, head.y, k), s: lerp(1, head.s, k) }; op = 1; }
  else { const k = eio5(seg(t, 27.45, 28.15)); P = { x: lerp(head.x, ctaP.x, k), y: lerp(head.y, ctaP.y, k), s: lerp(head.s, ctaP.s, k) }; op = 1; }
  brand.style.opacity = op; brand.style.transform = `translate(${P.x}px,${P.y}px) scale(${P.s})`;
  // logo draw-in
  const lg = qa(brand, '.lg'); [seg(t, 4.05, 4.35), seg(t, 4.2, 4.75), seg(t, 4.55, 4.85)].forEach((k, i) => lg[i].setAttribute('stroke-dashoffset', 1 - eo3(k)));
  qa(brand, '.wh').forEach((c, i) => c.setAttribute('r', 2.6 * clamp(eoBack(seg(t, 4.7 + i * 0.08, 5.0 + i * 0.08), 2))));
  const bw = q(brand, '.bw'), bs = q(brand, '.bs');
  const wk = eo5(seg(t, 4.45, 5.0)); bw.style.opacity = wk; bw.style.transform = `translateX(${(1 - wk) * -24}px)`; bw.style.clipPath = `inset(0 ${(1 - wk) * 100}% 0 0)`;
  const sk = eo3(seg(t, 4.75, 5.15)); bs.style.opacity = sk; bs.style.letterSpacing = `${lerp(0.6, 0.32, eo5(seg(t, 4.75, 5.3)))}em`;
  const tg = seg(t, 4.85, 5.2) * (1 - seg(t, 5.35, 5.6)); tagline.style.opacity = eo3(tg); tagline.style.transform = `translateY(${(1 - eo5(seg(t, 4.85, 5.3))) * 14}px)`;
  // nav + chip
  const nv = eo5(seg(t, 5.9, 6.5)) * (1 - eo3(seg(t, 27.3, 27.7)));
  nav.style.opacity = nv; nav.style.transform = `translateX(-50%) translateY(${(1 - nv) * -16}px)`; liveChip.style.opacity = nv;
  if (!nav._pos) nav._pos = navItems.map(e => [e.offsetLeft, e.offsetWidth]);
  const i0 = Math.floor(ck), i1 = Math.min(7, i0 + 1), fk = ck - i0;
  navInd.style.left = lerp(nav._pos[i0][0], nav._pos[i1][0], fk) + 'px'; navInd.style.width = lerp(nav._pos[i0][1], nav._pos[i1][1], fk) + 'px';
  navItems.forEach((e, i) => e.style.color = Math.abs(ck - i) < 0.5 ? '#FFC277' : 'var(--mu)');
  // captions
  caps.forEach((c, i) => { const tin = SB[i] - 0.05, tout = SB[i + 1] - 0.36; const vis = t >= tin - 0.01 && t < SB[i + 1] + 0.05 && t < 27.6; c.style.display = vis ? 'block' : 'none'; const ok = eio(seg(t, tout, tout + 0.3)); c.style.opacity = 1 - ok; c.style.transform = `translateY(${-ok * 34}px)`; });
  // world camera
  const vel = (camK(t + 1 / 120) - camK(t - 1 / 120)) * 60;
  const wo = seg(t, 5.55, 5.6);
  const ex = eio5(seg(t, 27.4, 28.0));
  $world.style.opacity = t < 5.55 ? 0 : 1 - ex;
  $world.style.transform = `translateX(${-ck * W}px)`;
  $world.style.filter = Math.abs(vel) > 0.05 || ex > 0 ? `blur(${Math.min(3.5, Math.abs(vel) * 1.4) + ex * 10}px)` : 'none';
  $world.style.transformOrigin = `${ck * W + 960}px 540px`;
  if (ex > 0) $world.style.transform += ` scale(${1 - 0.08 * ex})`;
  // CTA
  cta.style.opacity = eo3(seg(t, 27.6, 28.0));
  // global fade in/out
  $wrap.style.filter = t < 0.12 ? `brightness(${t / 0.12})` : t > 29.75 ? `brightness(${1 - seg(t, 29.75, 30)})` : 'none';
  return true;
};
Promise.all([document.fonts.load('800 60px Jakarta'), document.fonts.load('700 60px Jakarta'), document.fonts.load('700 60px Poppins'), document.fonts.load('500 20px Inter'), document.fonts.load('600 20px Inter'), document.fonts.load('700 20px Inter')]).then(() => { window.renderAt(0); window.READY = true; });
