// The 8 module scenes (Dashboard ... Action Center). Every scene is laid out in 1920x1080 module-local px:
// caption lives on the left (separate layer), widgets on the right (x 840..1820, y 140..980).
// Each scene = sc (transition target) > px (camera push-in) > rest (everything except shared-element heroes).
import { W, H, C, clamp, seg, lerp, eo3, eo5, eio3, eoBack, sm, inr, sinr, int, node, q, qa, an, S, sst, chart, anChart, series } from './core.js';
import { SB, TR, DASH_IN } from './timeline.js';

const thumbSVG = (c = '#D3D8E0') => `<svg width="28" height="28" viewBox="0 0 26 26"><path d="M3 9h20M5 9l-2 13M21 9l2 13M7 9v-3h12v3" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const thumb = (s = 50) => `<div class="ico" style="background:#39414D;width:${s}px;height:${s}px;border-radius:14px">${thumbSVG()}</div>`;
const dot = (c, s = 9) => `<i style="width:${s}px;height:${s}px;border-radius:50%;background:${c};flex:none;display:inline-block"></i>`;
const lbl = (t, c, fs = 16) => `<span class="lbl" style="font-size:${fs}px;${c ? `color:${c}` : ''}">${t}</span>`;
const delta = (t, c = C.gr, fs = 16) => `<span class="pill" style="padding:4px 12px;font-size:${fs}px;background:${c}26;color:${c}">${t}</span>`;

export function buildScenes(scRoot) {
  const sc = [], px = [], rest = [], morphs = [], anchors = {};
  for (let i = 0; i < 8; i++) {
    sc[i] = node(`<div class="sc" style="display:none"></div>`, scRoot);
    px[i] = node(`<div class="px"></div>`, sc[i]);
    rest[i] = node(`<div class="abs" style="left:0;top:0;width:1920px;height:1080px"></div>`, px[i]);
  }
  // a widget card inside a scene's `rest` group with the standard staggered entrance
  const card = (i, style, inner, t0, o = {}) => {
    const e = node(`<div class="card${o.flat ? ' flat' : ''}" style="${style}">${inner}</div>`, rest[i]);
    an(e, t0, 'up', { d: o.d ?? 0.7, dy: o.dy ?? 26 }); return e;
  };
  // a shared-element host: card chrome + content A (leaving scene) + content B (arriving scene)
  const morphEl = (idx, A, B, rA, rB, o = {}) => {
    const el = node(`<div class="abs mh" style="transform-origin:0 0;left:${rA.x}px;top:${rA.y}px;width:${rA.w}px;height:${rA.h}px">
      <div class="card chrome ${o.flat ? 'flat' : ''}" style="left:0;top:0;width:100%;height:100%;${o.chromeStyle || ''}"></div>
      <div class="abs mA" style="left:0;top:0;width:100%;height:100%"></div>
      <div class="abs mB" style="left:0;top:0;width:100%;height:100%"></div></div>`, px[A]);
    const m = { id: idx, el, A, B, rA, rB, chrome: q(el, '.chrome'), mA: q(el, '.mA'), mB: q(el, '.mB'), chromeFrom: o.chromeFrom ?? 1, tA: o.tA, tB: o.tB };
    morphs.push(m); return m;
  };

  // =====================================================================
  // 0 · DASHBOARD  — hero: Net profit. (hero card is shared with Finance)
  // =====================================================================
  {
    const i = 0, e0 = 5.85;
    const m = morphEl('DF', 0, 1, { x: 840, y: 140, w: 980, h: 360 }, { x: 840, y: 140, w: 980, h: 300 }, { tA: TR[1][0], tB: TR[1][1] });
    anchors.dashHero = m; an(m.el, e0 - 0.1, 'up', { d: 0.8, dy: 40 });
    const g = chart(series(30, 3, 230000, 60000, 40000, { 21: 50000, 22: 30000 }), 908, 84, { color: C.gr, min: 100000, max: 380000 });
    m.mA.innerHTML = `
      <div class="row" style="position:absolute;left:36px;right:36px;top:30px;justify-content:space-between">
        <div class="row" style="gap:14px">${dot(C.gr, 12)}${lbl('Net profit', C.gr, 20)}<span class="sub" style="font-size:19px">· last 30 days</span></div>
        <div class="row" style="gap:8px">${['Today', '7D', '30D', '90D'].map(x => `<span class="pill" style="padding:5px 14px;font-size:15px;${x === '30D' ? 'background:var(--or);color:#1a1205' : 'color:var(--mu);border:1px solid var(--line)'}">${x}</span>`).join('')}</div></div>
      <div class="num v" style="position:absolute;left:34px;top:74px;font-size:136px;color:var(--gr)">₹0</div>
      <div class="row" style="position:absolute;left:38px;top:228px;gap:14px">${delta('▲ 14.2%', C.gr, 21)}<span class="sub" style="font-size:21px">vs previous 30 days · after every cost</span></div>
      <div class="abs gc" style="left:36px;top:272px;width:908px;height:84px">${g.svg}</div>`;
    const v = q(m.mA, '.v');
    an(v, e0 + 0.1, 'count', { d: 1.25, to: 1034014, fmt: inr }); anChart(m.mA, e0 + 0.2, 1.3, 908);
    // tiles
    const TL = [['Ordered sales', 7039956, inr, '+12.4%', C.or, 41], ['Gross profit', 2234418, inr, '+9.8%', C.pu, 5], ['Ad spend', 421628, inr, '+4.2%', C.bl, 7]];
    TL.forEach(([n, val, fm, d, c, sd], k) => {
      const el = card(i, `left:${840 + k * 332}px;top:516px;width:316px;height:190px;padding:22px 24px`, `
        <div class="row" style="justify-content:space-between">${lbl(n, null, 15)}${delta(d, C.gr, 15)}</div>
        <div class="num tv" style="font-size:44px;margin-top:12px">0</div>
        <div class="abs sp" style="left:24px;top:116px;width:268px;height:50px">${chart(series(18, sd, 10, 5, 4), 268, 50, { color: c, sw: 3 }).svg}</div>`, e0 + 0.25 + k * 0.08);
      an(q(el, '.tv'), e0 + 0.4 + k * 0.08, 'count', { d: 1.0, to: val, fmt: fm }); anChart(el, e0 + 0.55 + k * 0.08, 0.9, 268);
    });
    const pa = series(30, 8, 86, 18, 6), pb = series(30, 9, 30, 6, 2);
    const A1 = chart(pa, 924, 150, { color: C.pu, min: 0, max: 130 }), B1 = chart(pb, 924, 150, { color: C.or, min: 0, max: 130, fill: false });
    const perf = card(i, `left:840px;top:722px;width:980px;height:258px;padding:24px 28px`, `
      <div class="row" style="justify-content:space-between"><div><div class="ttl" style="font-size:24px">Performance</div><div class="sub" style="font-size:16px">Ad sales vs ad spend · 30 days</div></div>
      <div class="row" style="gap:20px;font-size:16px;color:var(--mu)"><span class="row" style="gap:8px"><i style="width:14px;height:4px;background:var(--pu)"></i>Ad sales</span><span class="row" style="gap:8px"><i style="width:14px;height:4px;background:var(--or)"></i>Ad spend</span></div></div>
      <div class="abs" style="left:28px;top:84px;width:924px;height:150px">${A1.svg}${B1.svg}</div>`, e0 + 0.5);
    anChart(perf, e0 + 0.75, 1.4, 924);
    // net profit highlight ring
    an(m.chrome, 7.55, 'fn', { d: 1.3, fn: k => { const a = Math.sin(k * Math.PI); m.chrome.style.boxShadow = k > 0 && k < 1 ? `0 0 0 ${3 * a}px rgba(60,203,127,${0.85 * a}), 0 0 ${60 * a}px rgba(60,203,127,${0.35 * a}), 0 36px 80px rgba(8,10,14,.38)` : ''; } });
  }

  // =====================================================================
  // 1 · FINANCE — hero: Net financial movement (arrives via shared-element morph)
  // =====================================================================
  {
    const i = 1, b = SB[1], m = anchors.dashHero;
    m.mB.innerHTML = `
      <div class="abs" style="left:0;top:0;right:0;bottom:0;border-radius:26px;background:linear-gradient(180deg,rgba(60,203,127,.16),rgba(60,203,127,.04));border:1px solid rgba(60,203,127,.32)"></div>
      <div class="row" style="position:absolute;left:36px;right:36px;top:30px;justify-content:space-between">
        <div class="row" style="gap:14px">${dot(C.gr, 12)}${lbl('Net financial movement', C.gr, 20)}</div>
        <span class="pill" style="background:rgba(60,203,127,.15);color:var(--gr);font-size:18px">₹46 of every ₹100 stays with you</span></div>
      <div class="num nv" style="position:absolute;left:34px;top:72px;font-size:136px;color:var(--gr)">₹0</div>
      ${[['Money in', 14504503, C.gr, 100, 0], ['Money out', -7899190, C.rd, 54, 1], ['What stayed', 6605313, C.gr, 46, 2]].map(([n, v, c, w, k]) => `
        <div class="abs mi" style="left:${36 + k * 304}px;top:226px;width:280px"><div class="row" style="justify-content:space-between;font-size:17px"><span style="color:var(--mu)">${n}</span><span class="num" style="font-size:21px;color:${c}">${sinr(v)}</span></div>
        <div class="track" style="margin-top:10px;height:9px"><div class="fill" style="width:0;background:${c}" data-w="${w}"></div></div></div>`).join('')}`;
    an(q(m.mB, '.nv'), b - 0.15, 'count', { d: 1.15, to: 6605313, fmt: inr });
    qa(m.mB, '.mi .fill').forEach((f, k) => an(f, b + 0.1 + k * 0.12, 'w', { d: 0.8, to: +f.dataset.w }));
    // ledger
    const ROWS = [['Product charges', 11960873, '5,762 txns'], ['Shipping charges', 68557, '1,969 txns'], ['Tax collected', 2153433, '5,762 txns'], ['Reimbursements', 20521, '20 txns'], ['Fee refunds', 301119, '658 txns'], ['Refunds', -2090620, '832 txns'], ['Amazon fees', -5216759, '6,802 txns'], ['Advertising billed', -464316, '168 txns'], ['Promotions', -54683, '2,250 txns']];
    const BW = 300, Z = 128, MAXV = 11960873;
    const ledger = card(i, `left:840px;top:456px;width:980px;height:524px;padding:22px 32px`, `
      <div class="row" style="gap:14px"><div class="ico" style="background:rgba(60,203,127,.15);width:42px;height:42px"><svg width="22" height="22" viewBox="0 0 20 20"><path d="M2 14 L7 8 L11 11 L18 4" stroke="#3CCB7F" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div><div class="ttl" style="font-size:26px">Money flow</div></div><div class="sub" style="margin-left:auto;font-size:17px">Where the money went, in Amazon’s own categories</div></div>
      <div class="rows" style="margin-top:12px"></div>`, b - 0.2);
    const rows = q(ledger, '.rows'); anchors.finRows = [];
    ROWS.forEach(([n, v, tx], k) => {
      const pos = v > 0, len = Math.max(4, Math.abs(v) / MAXV * (BW - Z) * (pos ? 1 : 1.45));
      const r = node(`<div class="row" style="height:44px;border-bottom:1px solid var(--line)">
        <div style="width:236px;font-size:20px;font-weight:600">${n}</div><div style="width:122px;font-size:15px;color:var(--mu2)">${tx}</div>
        <div style="position:relative;width:${BW}px;height:14px"><div class="abs" style="left:${Z}px;top:-14px;bottom:-14px;width:1px;background:rgba(255,255,255,.16)"></div>
          <div class="abs bar" style="top:0;height:14px;border-radius:4px;${pos ? `left:${Z}px` : `right:${BW - Z}px`};width:0;background:${pos ? C.gr : C.rd}"></div></div>
        <div class="num rv" style="flex:1;text-align:right;font-size:22px;color:${pos ? 'var(--tx)' : 'var(--rd)'}">₹0</div></div>`, rows);
      const t0 = b + 0.0 + k * 0.07;
      an(r, t0, 'up', { d: 0.5, dy: 14 });
      an(q(r, '.bar'), t0 + 0.1, 'fn', { d: 0.7, fn: kk => q(r, '.bar').style.width = len * eo5(kk) + 'px' });
      an(q(r, '.rv'), t0 + 0.1, 'count', { d: 0.9, to: v, fmt: sinr });
      if (n === 'Amazon fees') an(r, b + 1.3, 'fn', { d: 1.3, fn: kk => { const a = Math.sin(kk * Math.PI); r.style.background = `rgba(240,100,90,${0.16 * a})`; r.style.boxShadow = `inset 4px 0 0 rgba(240,100,90,${a})`; } });
      if (n === 'Advertising billed') anchors.finAdsRow = r;
    });
  }

  // =====================================================================
  // 2 · ADVERTISING — hero: ROAS gauge
  // =====================================================================
  {
    const i = 2, b = SB[2], e0 = b - 0.3;
    const R = 150, cx = 235, cy = 232;
    const arc = (a0, a1, r) => { const p = a => [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`; };
    const g = card(i, `left:840px;top:140px;width:470px;height:470px;padding:26px 28px`, `
      ${lbl('Return on ad spend', null, 15)}
      <svg class="abs" style="left:0;top:0" width="470" height="300"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#F0645A"/><stop offset=".45" stop-color="#F2B33D"/><stop offset="1" stop-color="#3CCB7F"/></linearGradient></defs>
        <path d="${arc(Math.PI, 2 * Math.PI, R)}" stroke="rgba(255,255,255,.09)" stroke-width="30" fill="none" stroke-linecap="round"/>
        <path class="gsw" d="${arc(Math.PI, 2 * Math.PI, R)}" stroke="url(#gg)" stroke-width="30" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>
      <div class="abs" style="left:0;width:470px;top:246px;text-align:center"><div class="num gv" style="font-size:108px;color:var(--tx)">₹0.00</div><div class="sub" style="font-size:22px;margin-top:8px">back for every ₹1 spent</div></div>
      <div class="abs row" style="left:28px;right:28px;bottom:24px;justify-content:space-between;font-size:19px;color:var(--mu)"><span>ACoS <b class="num" style="color:var(--tx);font-size:22px">16.4%</b></span><span>Break-even <b class="num" style="color:var(--tx);font-size:22px">33.8%</b></span></div>`, e0 + 0.05, { dy: 30 });
    an(q(g, '.gsw'), b - 0.1, 'fn', { d: 1.2, fn: k => q(g, '.gsw').setAttribute('stroke-dashoffset', 1 - 0.78 * eo5(k)) });
    an(q(g, '.gv'), b - 0.1, 'count', { d: 1.2, to: 6.08, fmt: v => '₹' + v.toFixed(2) });
    anchors.gauge = g;
    [['Ad spend', 405231, inr, C.or, 21], ['Ad-attributed sales', 2464815, inr, C.gr, 22]].forEach(([n, v, f, c, sd], k) => {
      const el = card(i, `left:1326px;top:${140 + k * 243}px;width:494px;height:227px;padding:24px 28px`, `
        ${lbl(n, null, 15)}<div class="num tv" style="font-size:54px;margin-top:12px">0</div>
        <div class="abs" style="left:28px;right:28px;bottom:24px;height:60px">${chart(series(20, sd, 10, 5, 3), 438, 60, { color: c, sw: 3 }).svg}</div>`, e0 + 0.12 + k * 0.07);
      an(q(el, '.tv'), b + 0.0 + k * 0.08, 'count', { d: 1.0, to: v, fmt: f }); anChart(el, b + 0.15 + k * 0.08, 1.0, 438);
    });
    const PR = [['Center Trolley Coffee Table', 46.1, 33.8], ['3-Layer Microwave Oven Stand', 31.9, 21.1], ['Study Table, Black Frame', 28.7, 29.5], ['Wall Clothes Drying Bracket', 18.2, 28.4], ['Foldable Study Table 2×3', 12.6, 30.2]];
    const gr = card(i, `left:840px;top:626px;width:980px;height:354px;padding:22px 28px`, `
      <div class="row" style="justify-content:space-between"><div><div class="ttl" style="font-size:26px">Product profit guardrails</div><div class="sub" style="font-size:16px">Is advertising profitable on each product?</div></div>
        <div class="row" style="gap:20px;font-size:16px;color:var(--mu)"><span class="row" style="gap:8px"><i style="width:16px;height:7px;border-radius:4px;background:var(--mu)"></i>ACoS</span><span class="row" style="gap:8px"><i style="width:3px;height:16px;background:#fff"></i>Break-even</span></div></div>
      <div class="rows" style="margin-top:8px"></div>`, e0 + 0.2);
    PR.forEach(([n, a, be], k) => {
      const bad = a > be + 0.5, near = !bad && a > be - 2, c = bad ? C.rd : near ? C.am : C.gr, tag = bad ? 'Ads lose money' : near ? 'Near break-even' : 'Healthy';
      const TW = 190, scl = TW / 50;
      const r = node(`<div class="row" style="height:49px;gap:14px;border-top:1px solid var(--line)">
        ${thumb(38)}<div class="nw" style="width:296px;font-size:19px;font-weight:600">${n}</div>
        <span class="pill bd" style="width:152px;justify-content:center;font-size:15px;padding:5px 0;background:${c}22;color:${c};border:1px solid ${c}66">${tag}</span>
        <div style="position:relative;width:${TW}px;height:12px;border-radius:7px;background:rgba(255,255,255,.09)"><div class="abs af" style="left:0;top:0;height:12px;border-radius:7px;width:0;background:${c}"></div>
          <div class="abs" style="left:${be * scl}px;top:-9px;width:3px;height:30px;background:#fff;border-radius:2px"></div></div>
        <div class="num nw" style="flex:1;text-align:right;font-size:22px;color:${c}">${a.toFixed(1)}%<span style="color:var(--mu);font-weight:600;font-size:16px"> vs ${be.toFixed(1)}%</span></div></div>`, q(gr, '.rows'));
      const t0 = b + 0.2 + k * 0.09;
      an(r, t0, 'up', { d: 0.5, dy: 12 }); an(q(r, '.af'), t0 + 0.15, 'w', { d: 0.8, px: a * scl }); an(q(r, '.bd'), t0 + 0.7, 'pop', { d: 0.4 });
      if (bad && k === 0) an(r, b + 1.5, 'fn', { d: 1.3, fn: kk => { const al = Math.sin(kk * Math.PI); r.style.background = `rgba(240,100,90,${0.14 * al})`; } });
    });
  }

  // =====================================================================
  // 3 · SALES & TRAFFIC — hero: visit -> order funnel (stat blocks morph into Search & Brand's 4 share cards)
  // =====================================================================
  {
    const i = 3, b = SB[3], e0 = b - 0.3;
    const f = card(i, `left:840px;top:140px;width:980px;height:470px;padding:24px 36px`, `
      <div class="row" style="justify-content:space-between"><div><div class="ttl" style="font-size:28px">From visit to order</div><div class="sub" style="font-size:17px">How your visitors turned into orders</div></div>
        <span class="pill" style="color:var(--mu);border:1px solid var(--line2)">Last 30 days</span></div>
      <svg class="abs rib" style="left:28px;top:218px" width="924" height="124"><defs><linearGradient id="rb" x1="0" x2="1"><stop offset="0" stop-color="#9384F5"/><stop offset=".45" stop-color="#4C8DF6"/><stop offset=".62" stop-color="#3CCB7F"/><stop offset="1" stop-color="#F7931E"/></linearGradient>
        <clipPath id="rbc"><rect class="rbr" x="0" y="0" width="0" height="124"/></clipPath></defs>
        <path clip-path="url(#rbc)" d="M0,6 L430,6 C515,6 515,44 600,44 L924,44 L924,80 L600,80 C515,80 515,118 430,118 L0,118 Z" fill="url(#rb)" opacity=".92"/></svg>
      <span class="pill rl abs" style="left:150px;top:266px;background:rgba(34,39,47,.9);color:var(--tx);font-size:18px;border:1px solid var(--line2)">1.4 views per visit</span>
      <div class="abs conv" style="left:36px;top:356px;display:flex;align-items:baseline;gap:20px"><div class="num cv" style="font-size:86px;color:var(--or)">0.00%</div><div style="font-size:26px;color:var(--mu);font-weight:500">of visits became orders</div></div>
      <div class="abs rl" style="right:36px;top:372px;text-align:right"><div class="num" style="font-size:40px">₹2,343</div><div class="sub" style="font-size:18px;margin-top:4px">per unit sold</div></div>`, e0, { dy: 30 });
    an(q(f, '.cv'), b + 0.55, 'count', { d: 1.1, to: 1.87, fmt: v => v.toFixed(2) + '%' });
    an(q(f, '.rbr'), b + 0.1, 'fn', { d: 1.1, fn: k => q(f, '.rbr').setAttribute('width', 924 * eio3(k)) });
    qa(f, '.rl').forEach((el, k) => an(el, b + 0.6 + k * 0.25, 'pop', { d: 0.45 }));
    anchors.funnel = f;
    // stat blocks (shared elements)
    const BL = [['Sessions', 160416, int, C.pu, 876, 206], ['Page views', 224296, int, C.bl, 1098, 214], ['Units ordered', 3005, int, C.gr, 1328, 180], ['Ordered sales', 7039956, inr, C.or, 1524, 270]];
    anchors.blocks = [];
    BL.forEach(([n, v, fm, c, x, w], k) => {
      const rA = { x, y: 244, w, h: 92 };
      const m = morphEl('SB' + k, 3, 4, rA, { x: 840 + k * 249, y: 240, w: 233, h: 380 }, { chromeFrom: 0, tA: TR[4][0], tB: TR[4][1] });
      m.mA.innerHTML = `<div class="row" style="gap:9px;position:absolute;left:0;top:4px">${dot(c, 10)}${lbl(n, null, 15)}</div><div class="num sv" style="position:absolute;left:0;top:34px;font-size:45px">0</div>`;
      an(q(m.mA, '.sv'), b + 0.1 + k * 0.08, 'count', { d: 1.0, to: v, fmt: fm });
      an(m.el, e0 + 0.1 + k * 0.08, 'up', { d: 0.55, dy: 14 });
      m.cfg = { n, c }; anchors.blocks.push(m);
    });
    // traffic chart
    const sess = series(29, 31, 5500, 900, 0, { 7: 1700, 8: 1900, 22: -2600, 23: -3200, 24: -1400 }), pv = sess.map((v, k) => v * 1.4 + Math.sin(k) * 300);
    const c1 = chart(pv, 920, 190, { color: C.bl, min: 0, max: 11000 }), c2 = chart(sess, 920, 190, { color: C.pu, min: 0, max: 11000 });
    const tc = card(i, `left:840px;top:626px;width:980px;height:354px;padding:22px 30px`, `
      <div class="row" style="justify-content:space-between"><div><div class="ttl" style="font-size:26px">Traffic &amp; conversion</div><div class="sub" style="font-size:16px">Sessions and page views, day by day</div></div>
      <div class="row" style="gap:20px;font-size:16px;color:var(--mu)"><span class="row" style="gap:8px"><i style="width:14px;height:4px;background:var(--pu)"></i>Sessions</span><span class="row" style="gap:8px"><i style="width:14px;height:4px;background:var(--bl)"></i>Page views</span></div></div>
      <div class="abs plot" style="left:30px;top:100px;width:920px;height:190px">${[0, 1, 2, 3].map(k => `<div class="abs" style="left:0;right:0;top:${k * 63}px;height:1px;background:rgba(255,255,255,.06)"></div>`).join('')}${c1.svg}${c2.svg}
        <div class="abs tip1" style="left:${c1.pts[8][0] + 34}px;top:${c1.pts[8][1] - 10}px"><span class="pill" style="background:#38404C;border:1px solid var(--line2);font-size:16px">${dot(C.gr, 8)}Busiest · Thu 10 Sep · 7,446</span></div>
        <div class="abs tip2" style="left:${c2.pts[23][0] - 190}px;top:${c2.pts[23][1] + 14}px"><span class="pill" style="background:#38404C;border:1px solid var(--line2);font-size:16px">${dot(C.rd, 8)}Quietest · Fri 25 Sep · 2,124</span></div></div>`, e0 + 0.25);
    anChart(tc, b + 0.4, 1.4, 920); an(q(tc, '.tip1'), b + 1.0, 'pop', { d: 0.45 }); an(q(tc, '.tip2'), b + 1.5, 'pop', { d: 0.45 });
  }

  // =====================================================================
  // 4 · SEARCH & BRAND — hero: share funnel cards (arrive via shared-element morph from Sales & Traffic stat blocks)
  // =====================================================================
  {
    const i = 4, b = SB[4];
    const sb = card(i, `left:840px;top:140px;width:980px;height:84px;padding:0 30px;display:flex;align-items:center;gap:16px;border-radius:22px`, `
      <svg width="26" height="26" viewBox="0 0 22 22"><circle cx="9.5" cy="9.5" r="7" stroke="#AAB1BD" stroke-width="2.2" fill="none"/><path d="M15 15l5 5" stroke="#AAB1BD" stroke-width="2.2" stroke-linecap="round"/></svg>
      <div class="qt" style="font-size:28px;font-weight:500"></div><span class="caret" style="width:3px;height:32px;background:var(--or)"></span>
      <div style="flex:1"></div><span class="pill cnt" style="color:var(--mu);border:1px solid var(--line);font-size:16px">951 queries · 1,58,58,597 searches</span>`, b - 0.35, { dy: 20 });
    const QT = 'study table for home';
    an(q(sb, '.qt'), b - 0.1, 'fn', { d: 0.8, fn: k => q(sb, '.qt').textContent = QT.slice(0, Math.round(QT.length * k)) });
    an(q(sb, '.caret'), b - 0.3, 'fn', { d: 3, fn: k => q(sb, '.caret').style.opacity = (Math.floor(k * 3 * 2.2) % 2 === 0 || k < 0.3) ? 1 : 0 });
    an(q(sb, '.cnt'), b + 0.3, 'fade', { d: 0.5 });
    const FN = [['Seen', 0.94, 'impression share', '3,88,752 of 4,11,39,909', C.bl], ['Clicked', 0.92, 'click share', '5,540 of 6,04,461', C.rd], ['Added to cart', 0.92, 'cart-add share', '1,041 of 1,12,978', C.am], ['Bought', 0.92, 'purchase share', '73 of 7,960', C.gr]];
    anchors.searchCards = [];
    FN.forEach(([n, v, u, d, c], k) => {
      const m = anchors.blocks[k], hot = n === 'Clicked';
      m.mB.innerHTML = `
        <div class="abs" style="left:24px;top:24px">${lbl(n, hot ? 'var(--rd)' : null, 16)}</div>
        <svg class="abs" style="left:24px;top:58px" width="104" height="104"><circle cx="52" cy="52" r="42" stroke="rgba(255,255,255,.09)" stroke-width="10" fill="none"/><circle class="rg" cx="52" cy="52" r="42" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 52 52)"/></svg>
        <div class="abs num fv" style="left:24px;top:176px;font-size:54px">0.00%</div>
        <div class="abs sub" style="left:24px;top:238px;font-size:18px">${u}</div>
        <div class="abs" style="left:24px;top:272px;width:190px;font-size:16px;color:var(--mu2);line-height:1.45">${d}<br>marketplace total</div>
        ${hot ? `<span class="pill abs hot" style="left:20px;bottom:18px;font-size:15px;padding:6px 14px;background:rgba(240,100,90,.18);color:var(--rd);border:1px solid rgba(240,100,90,.5)">↓ Largest fall in share</span>` : ''}`;
      an(q(m.mB, '.rg'), b + 0.0 + k * 0.1, 'fn', { d: 0.9, fn: kk => q(m.mB, '.rg').setAttribute('stroke-dashoffset', 1 - 0.62 * eo5(kk)) });
      an(q(m.mB, '.fv'), b + 0.0 + k * 0.1, 'count', { d: 0.9, to: v, fmt: x => x.toFixed(2) + '%' });
      if (hot) {
        an(q(m.mB, '.hot'), b + 1.0, 'pop', { d: 0.45 });
        an(m.chrome, b + 1.05, 'fn', { d: 1.1, fn: kk => { const a = Math.sin(kk * Math.PI); m.chrome.style.boxShadow = kk > 0 && kk < 1 ? `0 0 ${60 * a}px rgba(240,100,90,${.4 * a}), 0 0 0 ${2 * a}px rgba(240,100,90,${.7 * a}), 0 36px 80px rgba(8,10,14,.38)` : ''; } });
        m.hotCard = true;
      }
    });
    const OP = [['Funnel leak', 6, 'Seen and clicked, then shoppers do not buy', C.rd], ['Demand gap', 129, 'Real demand, the brand is barely seen', C.or], ['No paid coverage', 66, 'Converts well with no advertising behind it', C.pu], ['Paid dependency', 24, 'Only shows up because of ads', C.bl]];
    const op = card(i, `left:840px;top:636px;width:980px;height:344px;padding:20px 30px`, `
      <div class="row" style="gap:22px"><div class="num oc" style="font-size:112px">0</div><div><div class="ttl" style="font-size:30px">opportunities found this week</div><div class="sub" style="font-size:18px;margin-top:6px">Gaps that belong to advertising, the listing, or stock</div></div></div>
      <div class="row sbar" style="margin-top:12px;height:14px;gap:4px">${OP.map(([, v, , c]) => `<div class="sg" style="height:14px;border-radius:7px;background:${c};width:0" data-w="${v / 225 * 100}"></div>`).join('')}</div>
      <div class="row" style="margin-top:18px;gap:14px">${OP.map(([n, v, d, c]) => `<div class="oi card flat" style="position:relative;width:219px;height:130px;border-radius:16px;padding:12px 16px;background:#323945"><div class="row" style="gap:10px"><span class="num" style="font-size:34px">${v}</span>${dot(c, 10)}</div><div class="nw" style="font-size:17px;font-weight:600;margin-top:4px">${n}</div><div style="font-size:14px;color:var(--mu);margin-top:4px;line-height:1.35">${d}</div></div>`).join('')}</div>`, b + 0.0);
    an(q(op, '.oc'), b + 0.5, 'count', { d: 1.1, to: 225, fmt: int });
    qa(op, '.sg').forEach((el, k) => an(el, b + 0.6 + k * 0.1, 'fn', { d: 0.7, fn: kk => el.style.width = `calc(${+el.dataset.w * eo5(kk)}% - 3px)` }));
    qa(op, '.oi').forEach((el, k) => an(el, b + 0.8 + k * 0.08, 'up', { d: 0.5, dy: 12 }));
  }

  // =====================================================================
  // 5 · INVENTORY — hero: stock alerts donut + restock watchlist
  // =====================================================================
  {
    const i = 5, b = SB[5], e0 = b - 0.3;
    const segs = [[3, C.rd], [2, '#FF8A65'], [5, C.am]]; let acc = 0;
    const al = card(i, `left:840px;top:140px;width:360px;height:440px;padding:24px`, `
      ${lbl('Stock alerts', null, 15)}
      <svg class="abs" style="left:55px;top:48px" width="250" height="250">${segs.map(([v, c]) => { const st = acc / 10; acc += v; return `<circle class="ra" data-l="${v / 10 - 0.02}" cx="125" cy="125" r="104" stroke="${c}" stroke-width="26" fill="none" pathLength="1" stroke-dasharray="0 1" transform="rotate(${-90 + st * 360 + 3} 125 125)"/>`; }).join('')}
        <circle cx="125" cy="125" r="104" stroke="rgba(255,255,255,.06)" stroke-width="26" fill="none" transform="rotate(-90 125 125)"/></svg>
      <div class="abs" style="left:0;width:360px;top:112px;text-align:center"><div class="num ac" style="font-size:112px">0</div></div>
      <div class="abs sub" style="left:0;width:360px;top:312px;text-align:center;font-size:20px">selling products</div>
      <div class="abs row" style="left:24px;right:24px;bottom:26px;gap:8px;justify-content:center">${[['3 out', C.rd], ['2 critical', '#FF8A65'], ['5 low', C.am]].map(([t, c]) => `<span class="pill ach nw" style="font-size:16px;padding:6px 12px;background:${c}26;color:${c}">● ${t}</span>`).join('')}</div>`, e0 + 0.05, { dy: 30 });
    an(q(al, '.ac'), b - 0.05, 'count', { d: 0.9, to: 10, fmt: int });
    qa(al, '.ra').forEach((c, k) => an(c, b - 0.05 + k * 0.15, 'fn', { d: 0.7, fn: kk => c.setAttribute('stroke-dasharray', `${(+c.dataset.l * eo5(kk)).toFixed(4)} 1`) }));
    qa(al, '.ach').forEach((c, k) => an(c, b + 0.55 + k * 0.08, 'pop', { d: 0.4 }));
    const ir = card(i, `left:840px;top:596px;width:360px;height:384px;padding:24px`, `
      <div class="ttl" style="font-size:24px">Inventory right now</div><div class="sub" style="font-size:16px">Live stock from Amazon</div>
      <div class="num iv" style="font-size:84px;margin-top:16px">0</div><div class="sub" style="font-size:19px;margin-top:4px">sellable units</div>
      <div class="row" style="margin-top:18px;height:14px;gap:4px;border-radius:7px;overflow:hidden">${[[82, C.gr], [6, C.bl], [8, C.am], [4, C.rd]].map(([w, c]) => `<div class="isg" style="height:14px;width:0;background:${c}" data-w="${w}"></div>`).join('')}</div>
      <div class="row" style="margin-top:14px;gap:6px 14px;font-size:15px;color:var(--mu);flex-wrap:wrap">${[['Sellable', C.gr], ['Reserved', C.bl], ['Inbound', C.am], ['Out', C.rd]].map(([n, c]) => `<span class="row" style="gap:6px">${dot(c, 8)}${n}</span>`).join('')}</div>
      <div class="row" style="margin-top:14px;gap:10px;align-items:baseline"><span class="num" style="font-size:36px">18.4 days</span><span class="sub" style="font-size:16px">avg stock cover</span></div>`, e0 + 0.12);
    an(q(ir, '.iv'), b + 0.1, 'count', { d: 1.0, to: 3036, fmt: int });
    qa(ir, '.isg').forEach((e, k) => an(e, b + 0.25 + k * 0.08, 'fn', { d: 0.6, fn: kk => e.style.width = (+e.dataset.w * eo5(kk)) + '%' }));
    const RW = [['Heavy Duty 4-Tier Rack, Black', '0 sellable · sells 0.53 a day', 0, 'Out of stock', 'Restock now', C.rd], ['Foldable Study Table, Cream', '4 sellable · sells 1.03 a day', 5.6, '5.6d', 'about 6 days left', C.rd], ['Foldable Table, Black 90×60', '39 sellable · sells 7 a day', 5.8, '5.8d', 'about 6 days left', C.rd], ['Foldable Study Table, White', '6 sellable · sells 0.43 a day', 9.4, '9.4d', 'about 9 days left', C.am], ['Foldable Study Table, Black', '7 sellable · sells 0.7 a day', 10.9, '10.9d', 'about 11 days left', C.am], ['Wall Clothes Drying Bracket', '19 sellable · sells 1.9 a day', 12.1, '12.1d', 'about 12 days left', C.am]];
    const wl = card(i, `left:1216px;top:140px;width:604px;height:840px;padding:24px 26px`, `
      <div class="ttl" style="font-size:28px">Restock watchlist</div><div class="sub" style="font-size:16px">Selling products with the least stock cover left</div>
      <div class="row" style="gap:16px;margin-top:14px;font-size:15px;color:var(--mu)">${[['Out', C.rd], ['Critical &lt;7d', '#FF8A65'], ['Low 7–14d', C.am], ['Healthy', C.gr]].map(([n, c]) => `<span class="row" style="gap:6px">${dot(c, 8)}${n}</span>`).join('')}</div>
      <div class="rows" style="margin-top:10px"></div>`, e0 + 0.08, { dy: 30 });
    RW.forEach(([n, d, days, badge, sub2, c], k) => {
      const r = node(`<div class="row" style="height:108px;gap:16px;border-top:1px solid var(--line)">
        ${thumb(54)}<div style="flex:1;min-width:0"><div class="nw" style="font-size:20px;font-weight:600">${n}</div><div class="nw" style="font-size:15px;color:var(--mu);margin-top:3px">${d}</div>
        <div class="track" style="margin-top:11px;width:280px;height:9px"><div class="fill rf" style="width:0;background:${c}"></div><div class="abs" style="left:${14 / 21 * 100}%;top:0;bottom:0;width:2px;background:rgba(255,255,255,.4)"></div></div></div>
        <div style="text-align:right;width:138px"><span class="pill rb nw" style="font-size:16px;background:${c}26;color:${c};padding:5px 12px">● ${badge}</span><div class="nw" style="font-size:15px;color:var(--mu);margin-top:8px">${sub2}</div></div></div>`, q(wl, '.rows'));
      const t0 = b + 0.05 + k * 0.09;
      an(r, t0, 'up', { d: 0.5, dy: 12 }); an(q(r, '.rf'), t0 + 0.15, 'w', { d: 0.8, to: Math.max(3, days / 21 * 100) }); an(q(r, '.rb'), t0 + 0.5, 'pop', { d: 0.4 });
      if (k === 0) an(r, b + 1.0, 'fn', { d: 1.2, fn: kk => { const a = Math.sin(kk * Math.PI); r.style.background = `rgba(240,100,90,${0.16 * a})`; r.style.boxShadow = `inset 4px 0 0 rgba(240,100,90,${a})`; } });
    });
  }

  // =====================================================================
  // 6 · RETURNS — hero: refunded value
  // =====================================================================
  {
    const i = 6, b = SB[6], e0 = b - 0.3;
    const ref = series(30, 61, 32000, 14000, 4000, { 25: 30000, 26: 64000, 27: 20000 });
    const rc = chart(ref, 908, 170, { color: C.rd, min: 0, max: 115000 });
    const m = card(i, `left:840px;top:140px;width:980px;height:410px;padding:26px 36px`, `
      <div class="row" style="gap:14px">${dot(C.rd, 12)}${lbl('Refunded', C.rd, 20)}<span class="sub" style="font-size:19px">· last 30 days · Amazon Finance ledger</span></div>
      <div class="num rv" style="font-size:136px;margin-top:12px;color:var(--tx)">₹0</div>
      <div class="abs" style="left:36px;top:222px;width:908px;height:170px">${rc.svg}
        <div class="abs tip" style="left:${rc.pts[26][0] - 330}px;top:${rc.pts[26][1] - 22}px"><span class="pill" style="background:#38404C;border:1px solid var(--line2);font-size:16px">${dot(C.rd, 8)}Highest · Tue 29 Sep · ₹1,01,846</span></div></div>`, e0 + 0.05, { dy: 30 });
    an(q(m, '.rv'), b - 0.1, 'count', { d: 1.0, to: 1034217, fmt: inr }); anChart(m, b + 0.0, 1.0, 908); an(q(m, '.tip'), b + 0.8, 'pop', { d: 0.4 });
    [['Refunded units', 488, 'Amazon refund items', C.rd], ['Refunded orders', 485, 'Orders with a refund item', C.am]].forEach(([n, v, d, c], k) => {
      const el = card(i, `left:${840 + k * 498}px;top:566px;width:482px;height:140px;padding:20px 28px`, `
        <div class="row" style="gap:10px">${dot(c, 10)}${lbl(n, null, 15)}</div><div class="row" style="gap:16px;align-items:baseline;margin-top:8px"><div class="num tv" style="font-size:68px">0</div><div class="sub" style="font-size:18px">${d}</div></div>`, e0 + 0.12 + k * 0.05);
      an(q(el, '.tv'), b + 0.0 + k * 0.08, 'count', { d: 0.8, to: v, fmt: int });
    });
    const PM = [['Foldable Study Table, Walnut 2×3', 128498, 66, 100], ['4-Layer Kitchen Organizer Rack', 121623, 33, 94], ['Foldable Study Table, Pearl White', 103000, 53, 80]];
    const pm = card(i, `left:840px;top:722px;width:980px;height:258px;padding:20px 30px`, `<div class="ttl" style="font-size:26px">Products refunded most</div><div class="sub" style="font-size:16px">By refunded value in this period</div><div class="rows" style="margin-top:6px"></div>`, e0 + 0.2);
    PM.forEach(([n, v, u, w], k) => {
      const r = node(`<div class="row" style="height:56px;gap:16px;border-top:1px solid var(--line)"><span class="num" style="width:20px;color:var(--mu);font-size:20px">${k + 1}</span>${thumb(42)}<div class="nw" style="width:360px;font-size:20px;font-weight:600">${n}</div><div class="track" style="flex:1;height:10px"><div class="fill pf" style="width:0;background:var(--rd)"></div></div><div style="width:160px;text-align:right"><div class="num" style="font-size:22px">${inr(v)}</div><div style="font-size:14px;color:var(--mu)">${u} units</div></div></div>`, q(pm, '.rows'));
      an(r, b + 0.25 + k * 0.08, 'up', { d: 0.45, dy: 10 }); an(q(r, '.pf'), b + 0.35 + k * 0.08, 'w', { d: 0.7, to: w });
    });
  }

  // =====================================================================
  // 7 · ACTION CENTER — hero: ranked priority actions (clicked button becomes the CTA button)
  // =====================================================================
  {
    const i = 7, b = SB[7], e0 = b - 0.3;
    const ac = card(i, `left:840px;top:140px;width:980px;height:840px;padding:26px 28px`, `
      <div class="row" style="justify-content:space-between"><div class="row" style="gap:16px"><div class="ico" style="background:rgba(247,147,30,.16)"><svg width="20" height="22" viewBox="0 0 18 20"><path d="M10 1 L2 12 H9 L8 19 L16 8 H9 Z" fill="#F7931E"/></svg></div><div><div class="ttl" style="font-size:30px">Priority actions</div><div class="sub" style="font-size:17px">10 open actions · 2 critical</div></div></div>
        <span class="pill" style="color:var(--or2);border:1px solid rgba(247,147,30,.45)">View all 10 →</span></div>
      <div class="row cnts" style="gap:16px;margin-top:20px">${[['Critical', 2, C.rd], ['High', 3, C.am], ['Medium', 5, C.bl]].map(([n, v, c]) => `<div class="cb card flat" style="position:relative;flex:1;height:110px;border-radius:18px;padding:16px 22px;background:${c}1c;border-color:${c}55"><div style="font-size:15px;font-weight:700;letter-spacing:.14em;color:${c}">${n.toUpperCase()}</div><div class="num" style="font-size:56px;margin-top:6px">${v}</div></div>`).join('')}</div>
      <div class="acts" style="margin-top:6px"></div>`, e0 + 0.05, { dy: 30 });
    qa(ac, '.cb').forEach((e, k) => an(e, b + 0.0 + k * 0.08, 'pop', { d: 0.45 }));
    const AC = [['CRITICAL · ADS BURN', 'Advertising turns a profitable product into a loss', 'Earns ₹2,403 before ads. ₹9,276 of ad spend makes it a ₹6,873 loss.', 'Review advertising', C.rd], ['CRITICAL · STOCK RISK', 'Out of stock while still selling', 'No sellable units left on a product that sells 0.53 a day.', 'Review inventory', C.rd], ['HIGH · CONVERSION', 'Traffic leak: high traffic, low conversion', '17,430 sessions converting at 1.31% against your 1.84% average.', 'View sales &amp; traffic', C.am]];
    anchors.actBtns = [];
    AC.forEach(([tag, t, d, btn, c], k) => {
      const r = node(`<div class="card ar flat" style="position:relative;height:184px;border-radius:20px;margin-top:14px;padding:20px 28px 20px 34px;background:#323945">
        <div class="abs" style="left:0;top:18px;bottom:18px;width:5px;border-radius:3px;background:${c}"></div>
        <div style="font-size:15px;font-weight:700;letter-spacing:.14em;color:${c}">${tag}</div>
        <div style="font-family:var(--H);font-size:28px;font-weight:700;margin-top:8px;line-height:1.2;width:700px">${t}</div>
        <div style="font-size:18px;color:var(--mu);margin-top:8px;width:700px">${d}</div>
        <span class="pill abs btn nw" style="right:26px;bottom:24px;font-size:18px;padding:10px 20px;background:${c}26;color:${c};border:1px solid ${c}66">${btn} →</span></div>`, q(ac, '.acts'));
      an(r, b + 0.1 + k * 0.1, 'up', { d: 0.6, dy: 0, dx: 70 });
      anchors.actBtns.push(q(r, '.btn'));
    });
  }

  return { sc, px, rest, morphs, anchors };
}
