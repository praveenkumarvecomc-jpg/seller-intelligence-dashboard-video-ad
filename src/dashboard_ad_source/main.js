// Ecomceptive · Seller Intelligence Platform — 30s 16:9 Meta ad (v4). Deterministic: window.renderAt(t), t in seconds.
import { W, H, DUR, C, clamp, seg, lerp, eo3, eo4, eo5, eio3, eio5, sm, inr, sinr, int, node, q, qa, an, S, sst, beginFrame, runAnims, commit } from './core.js';
import { SB, NAV, TR, HOOK_OUT, DASH_IN, DASH_REVEAL, CTA_IN, CAMS, camStart, camEnd, OFFER } from './timeline.js';
import { buildScenes } from './scenes.js';

const $ = id => document.getElementById(id);
const bg = $('bgc').getContext('2d');
const $scenes = $('scenes'), $hookL = $('hookL'), $brandL = $('brandL'), $chrome = $('chrome'), $caps = $('caps'), $ctaL = $('ctaL'), $fx = $('fxL'), $wrap = $('wrap');

// =====================================================================
// HOOK (0 – 4s): the ledger drains from ₹50 lakh to −₹2 lakh
// =====================================================================
const LEDGER = [
  ['Ordered sales', 'What customers paid', 5000000, C.gr], ['Refunds', 'Returned orders', -400000, C.rd], ['Amazon fees', 'Referral, FBA, closing', -1600000, C.am],
  ['Advertising', 'Sponsored Products, Brands, Display', -1200000, C.pu], ['Product cost', 'What you paid to make it', -1750000, C.bl], ['Packaging', 'Boxes, tape, labels', -150000, C.cy], ['Shipping you paid', 'Self Ship orders', -100000, C.pk],
];
const hook = node(`<div class="layer" id="hook">
  <div class="abs row" style="left:112px;top:286px;gap:16px"><span class="hk-l" style="display:block;width:0;height:3px;background:var(--or)"></span><span class="lbl hk-lb" style="color:var(--or);font-size:21px;letter-spacing:.2em">If you sell on Amazon</span></div>
  <div class="abs" style="left:104px;top:334px;font-family:var(--H);font-weight:800;font-size:112px;line-height:1.1;letter-spacing:-.04em;white-space:nowrap">
    <span class="mask"><span class="h1">₹50 lakh in sales.</span></span>
    <span class="mask"><span class="h2" style="color:var(--rd)">₹2 lakh lost.</span></span>
    <span class="mask"><span class="h3">Would you <span style="color:var(--or)">know?</span></span></span>
  </div>
  <div class="abs hk-sub" style="left:112px;top:742px;width:820px;font-size:31px;line-height:1.45;color:var(--mu)">Turnover is not profit. Most sellers find out at the end of the month.</div>
  <div class="card ledger" style="left:1040px;top:150px;width:790px;height:780px;padding:30px 36px">
    <div class="row" style="justify-content:space-between"><span class="lbl" style="font-size:20px">What you kept</span><span class="pill lossp" style="font-size:17px;background:rgba(240,100,90,.18);color:var(--rd);border:1px solid rgba(240,100,90,.5)">▼ Loss</span></div>
    <div class="num kept" style="font-size:124px;margin-top:10px;white-space:nowrap">₹0</div>
    <div class="abs stack" style="left:36px;right:36px;top:222px;height:14px;border-radius:7px;background:rgba(255,255,255,.08);overflow:hidden;display:flex"></div>
    <div class="abs rows" style="left:36px;right:36px;top:254px"></div>
  </div></div>`, $hookL);
const hkRows = q(hook, '.rows'), hkStack = q(hook, '.stack');
LEDGER.forEach(([n, s, v, c], i) => {
  const r = node(`<div class="row" style="height:68px;border-top:1px solid var(--line);gap:18px">
    <div class="ico" style="background:${c}2a"><div style="width:14px;height:14px;border-radius:5px;background:${c}"></div></div>
    <div style="flex:1"><div style="font-weight:600;font-size:23px">${n}</div><div style="font-size:16px;color:var(--mu);margin-top:2px">${s}</div></div>
    <div class="num" style="font-size:30px;color:${v > 0 ? 'var(--tx)' : 'var(--rd)'}">${sinr(v)}</div></div>`, hkRows);
  an(r, 0.6 + i * 0.17, 'up', { d: 0.45, dy: 24 });
  if (i > 0) { const sg = node(`<div style="height:100%;width:0;background:${c}"></div>`, hkStack); an(sg, 0.7 + i * 0.17, 'w', { d: 0.4, to: Math.abs(v) / 5000000 * 100 }); }
});
an(q(hook, '.ledger'), 0.4, 'up', { d: 0.8, dy: 60 });
an(q(hook, '.h1'), 0.25, 'rise', { d: 0.7 }); an(q(hook, '.h2'), 1.8, 'rise', { d: 0.5 }); an(q(hook, '.h3'), 2.15, 'rise', { d: 0.5 });
an(q(hook, '.hk-l'), 0.1, 'fn', { d: 0.5, fn: k => q(hook, '.hk-l').style.width = 46 * eo3(k) + 'px' });
an(q(hook, '.hk-lb'), 0.15, 'fade', { d: 0.5 });
an(q(hook, '.hk-sub'), 2.5, 'up', { d: 0.6, dy: 16 });
an(q(hook, '.lossp'), 1.8, 'pop', { d: 0.5 });
const keptEl = q(hook, '.kept');
const HOOK_FOCUS = { x: 1420, y: 276 };

// =====================================================================
// BRAND lockup (centre -> header -> CTA)
// =====================================================================
const logoIcon = (size, cls = '') => `<svg class="${cls}" width="${size}" height="${size * 50 / 58}" viewBox="4 4 58 50">
  <path class="lg" d="M7 8 L14 8 L17.4 14.6" stroke="#F5F6F8" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/>
  <path class="lg" d="M42 41 L21.5 41 C16.2 41 14.4 35.5 14.4 27 C14.4 19 16.2 13 21.5 13 L59 13" stroke="#F7931E" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/>
  <path class="lg" d="M22.5 27 L51 27" stroke="#F5F6F8" stroke-width="4.4" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/>
  <circle class="wh" cx="29.6" cy="49.2" r="2.6" fill="#F5F6F8"/><circle class="wh" cx="40.2" cy="49.2" r="2.6" fill="#F5F6F8"/></svg>`;
const brand = node(`<div class="abs" id="brand" style="left:0;top:0;transform-origin:0 0;display:flex;align-items:center;gap:26px;opacity:0">
  ${logoIcon(150, 'bicon')}
  <div><div class="bw" style="font-family:Poppins;font-weight:700;font-size:96px;line-height:1;letter-spacing:-.01em;white-space:nowrap"><span style="color:var(--or)">E</span>comceptive</div>
  <div class="bs" style="font-size:20px;font-weight:600;letter-spacing:.32em;color:var(--mu);margin-top:12px;padding-left:4px;white-space:nowrap">SELLER INTELLIGENCE PLATFORM</div></div></div>`, $brandL);
const tagline = node(`<div class="abs" style="left:0;width:1920px;top:650px;text-align:center;font-size:34px;color:var(--mu);opacity:0">Know what you <span style="color:var(--tx);font-weight:600">actually keep.</span></div>`, $brandL);

// =====================================================================
// NAV pill + live chip
// =====================================================================
const nav = node(`<div class="abs" id="nav" style="left:50%;top:32px;height:58px;border-radius:999px;background:rgba(40,46,56,.9);border:1px solid var(--line2);display:flex;align-items:center;padding:0 7px;box-shadow:0 20px 50px rgba(8,10,14,.35);opacity:0">
  <div class="ind abs" style="top:7px;height:42px;border-radius:999px;background:rgba(247,147,30,.18);border:1px solid rgba(247,147,30,.55)"></div>
  ${NAV.map(n => `<div class="ni" style="position:relative;padding:0 19px;font-size:17.5px;font-weight:600;color:var(--mu);white-space:nowrap">${n.replace('&', '&amp;')}</div>`).join('')}</div>`, $chrome);
const navItems = qa(nav, '.ni'), navInd = q(nav, '.ind');
const liveChip = node(`<div class="abs row" style="right:56px;top:46px;gap:10px;font-size:18px;color:var(--mu);opacity:0"><span style="width:10px;height:10px;border-radius:50%;background:var(--gr);box-shadow:0 0 12px var(--gr)"></span>Amazon.in · Demo Brand</div>`, $chrome);

// =====================================================================
// CAPTIONS (left column, one per module)
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
const CAP_IN = i => i === 0 ? 6.0 : SB[i] - 0.12, CAP_OUT = i => i < 7 ? TR[i + 1][0] + 0.02 : CTA_IN[0];
const caps = CAP.map(([n, l, a, b, p], i) => {
  const c = node(`<div class="abs cap" style="left:100px;top:332px;width:700px;display:none">
    <div class="row" style="gap:14px"><span class="cl" style="display:block;height:3px;width:0;background:var(--or)"></span><span class="lbl clb" style="color:var(--or);font-size:21px;letter-spacing:.2em">${n} — ${l.replace('&', '&amp;')}</span></div>
    <div style="font-family:var(--H);font-weight:800;font-size:68px;line-height:1.1;letter-spacing:-.035em;margin-top:26px;white-space:nowrap">
      <span class="mask"><span class="c1">${a}</span></span><span class="mask"><span class="c2" style="color:var(--or)">${b}</span></span></div>
    <div class="cp" style="font-size:27px;line-height:1.45;color:var(--mu);margin-top:28px;width:600px">${p}</div></div>`, $caps);
  const t0 = CAP_IN(i);
  an(q(c, '.cl'), t0, 'fn', { d: 0.5, fn: k => q(c, '.cl').style.width = 44 * eo3(k) + 'px' });
  an(q(c, '.clb'), t0, 'fade', { d: 0.4 });
  an(q(c, '.c1'), t0 + 0.06, 'rise', { d: 0.6 }); an(q(c, '.c2'), t0 + 0.16, 'rise', { d: 0.6 });
  an(q(c, '.cp'), t0 + 0.34, 'up', { d: 0.6, dy: 14 });
  return c;
});

// =====================================================================
// MODULE SCENES
// =====================================================================
const { sc, px, rest, morphs, anchors } = buildScenes($scenes);
// masked reveals need an opaque arriving scene, so it carries its own copy of the background
const bgCopy = {};
[3, 5, 7].forEach(j => { const c = document.createElement('canvas'); c.width = W; c.height = H; c.style.cssText = 'position:absolute;left:0;top:0;display:none'; sc[j].insertBefore(c, px[j]); bgCopy[j] = c; });

// =====================================================================
// CTA (27.5 – 30s)
// =====================================================================
const BADGE = OFFER ? `Early access open · ${OFFER}` : 'Early access open · Early-bird pricing';
const cta = node(`<div class="layer" id="cta" style="opacity:0">
  <div class="abs" style="left:0;width:1920px;top:322px;text-align:center;font-family:var(--H);font-weight:800;font-size:124px;line-height:1.08;letter-spacing:-.045em">
    <span class="mask"><span class="k1">Stop guessing.</span></span><span class="mask"><span class="k2">Start <span style="color:var(--or)">knowing.</span></span></span></div>
  <div class="abs ks" style="left:0;width:1920px;top:620px;text-align:center;font-size:31px;color:var(--mu)">Orders, ads, fees, refunds and stock, finally read together.</div>
  <div class="abs row kb" style="left:0;width:1920px;top:712px;justify-content:center;gap:22px">
    <span class="pill badge" style="font-size:21px;padding:16px 26px;background:rgba(60,203,127,.14);color:#62E09C;border:1px solid rgba(60,203,127,.45)"><i style="width:10px;height:10px;border-radius:50%;background:#3CCB7F;box-shadow:0 0 12px #3CCB7F"></i>${BADGE}</span>
    <span class="pill btn" style="font-size:27px;font-weight:700;padding:20px 40px;gap:14px;background:linear-gradient(180deg,#FFB04A,#F7931E);color:#1d1204;box-shadow:0 18px 50px rgba(247,147,30,.45)">Claim early access<svg width="26" height="26" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="#1d1204" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
  <div class="abs row kt" style="left:0;width:1920px;top:846px;justify-content:center;gap:44px;font-size:21px;color:var(--mu)"><span>✓ Official Amazon authorisation</span><span>✓ No password sharing</span><span>✓ No report downloads, ever</span></div>
</div>`, $ctaL);
an(q(cta, '.k1'), 27.62, 'rise', { d: 0.7 }); an(q(cta, '.k2'), 27.74, 'rise', { d: 0.7 });
an(q(cta, '.ks'), 28.25, 'up', { d: 0.6, dy: 14 }); an(q(cta, '.badge'), 28.4, 'pop', { d: 0.5 }); an(q(cta, '.kt'), 28.75, 'fade', { d: 0.6 });
const ctaBtn = q(cta, '.btn');
an(ctaBtn, 29.2, 'fn', { d: 0.8, fn: k => { if (k > 0) ctaBtn.style.boxShadow = `0 18px 50px rgba(247,147,30,.45), 0 0 0 ${12 * k}px rgba(247,147,30,${0.32 * (1 - k)})`; } });

// =====================================================================
// FX layer: cursor, click ring, shared-element button, shockwave, iris edge
// =====================================================================
const cur = node(`<svg class="abs" width="44" height="44" viewBox="0 0 24 24" style="left:0;top:0;opacity:0;filter:drop-shadow(0 6px 12px rgba(0,0,0,.5))"><path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.8 L11.6 14 L18 14 Z" fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/></svg>`, $fx);
const clickRing = node(`<div class="abs" style="width:60px;height:60px;border-radius:50%;border:3px solid var(--rd);left:0;top:0;opacity:0"></div>`, $fx);
const fxBtn = node(`<div class="abs" style="left:0;top:0;border-radius:999px;display:none;overflow:hidden;white-space:nowrap">
  <div class="abs bgA" style="inset:0;background:#4b3a3f;border:1px solid rgba(240,100,90,.55);border-radius:999px"></div>
  <div class="abs bgB" style="inset:0;background:linear-gradient(180deg,#FFB04A,#F7931E);border-radius:999px"></div>
  <div class="abs tA row" style="inset:0;justify-content:center;font-size:18px;font-weight:600;color:var(--rd)">Review advertising →</div>
  <div class="abs tB row" style="inset:0;justify-content:center;gap:14px;font-size:27px;font-weight:700;color:#1d1204">Claim early access<svg width="26" height="26" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="#1d1204" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>`, $fx);
const shock = node(`<div class="abs" style="left:0;top:0;width:100px;height:100px;border-radius:50%;border:4px solid var(--or);opacity:0"></div>`, $fx);
const flash = node(`<div class="abs" style="inset:0;opacity:0;background:radial-gradient(circle at 50% 44%,rgba(247,147,30,.55),rgba(247,147,30,0) 55%)"></div>`, $fx);
const irisEdge = node(`<div class="abs" style="left:0;top:0;border-radius:50%;border:3px solid rgba(247,147,30,.9);box-shadow:0 0 40px rgba(247,147,30,.45), inset 0 0 40px rgba(247,147,30,.25);opacity:0"></div>`, $fx);
const wipeEdge = node(`<div class="abs" style="left:-400px;top:-400px;width:12px;height:2800px;opacity:0;background:linear-gradient(180deg,rgba(247,147,30,0),rgba(247,147,30,.95) 30%,rgba(247,147,30,.95) 70%,rgba(247,147,30,0));filter:blur(3px);transform-origin:50% 50%"></div>`, $fx);

// =====================================================================
// camera (analytic: push-in per module, so shared elements can be mapped between scene cameras exactly)
// =====================================================================
function cam(i, t) {
  const c = CAMS[i], s = 1 + c.amp * sm(seg(t, camStart(i), camEnd(i)));
  return { s, tx: c.fx * (1 - s), ty: c.fy * (1 - s) };
}
const toScreen = (c, p) => ({ x: p.x * c.s + c.tx, y: p.y * c.s + c.ty });
const toLocal = (c, p) => ({ x: (p.x - c.tx) / c.s, y: (p.y - c.ty) / c.s });
const rectToScreen = (c, r) => ({ x: r.x * c.s + c.tx, y: r.y * c.s + c.ty, w: r.w * c.s, h: r.h * c.s });
const rectToLocal = (c, r) => ({ x: (r.x - c.tx) / c.s, y: (r.y - c.ty) / c.s, w: r.w / c.s, h: r.h / c.s });
const lrect = (el, stop) => { let x = 0, y = 0, e = el; while (e && e !== stop) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y, w: el.offsetWidth, h: el.offsetHeight }; };
const mix = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k) });

// =====================================================================
// background (charcoal, soft glows, parallax dot grid)
// =====================================================================
function drawBG(t, ck, g = bg) {
  g.fillStyle = '#22272F'; g.fillRect(0, 0, W, H);
  const r1 = g.createRadialGradient(1250, 520, 0, 1250, 520, 1250); r1.addColorStop(0, 'rgba(52,59,71,1)'); r1.addColorStop(1, 'rgba(34,39,47,0)');
  g.fillStyle = r1; g.fillRect(0, 0, W, H);
  const glow = (x, y, r, c) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
  glow(1550 + Math.sin(t * 0.35) * 160 - ck * 38, 280 + Math.cos(t * 0.3) * 80, 760, 'rgba(247,147,30,0.11)');
  glow(420 + Math.cos(t * 0.3) * 120, 940 + Math.sin(t * 0.4) * 60, 700, 'rgba(147,132,245,0.10)');
  const off = -(ck * W * 0.14) % 40;
  g.fillStyle = 'rgba(255,255,255,0.055)';
  for (let y = 20; y < H; y += 40) for (let x = off; x < W; x += 40) g.fillRect(x, y, 2, 2);
  const v = g.createRadialGradient(W / 2, H / 2, H * 0.55, W / 2, H / 2, H * 1.1); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.26)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// =====================================================================
// measure layout-dependent anchors once fonts are in
// =====================================================================
let BRW = 0, BRH = 0, CTA_BTN = null, MEAS = {};
function measure() {
  sc.forEach(s => s.style.display = 'block'); cta.style.opacity = 1;
  BRW = brand.offsetWidth; BRH = brand.offsetHeight;
  const r = ctaBtn.getBoundingClientRect(); CTA_BTN = { x: r.left, y: r.top, w: r.width, h: r.height };
  MEAS.finAds = lrect(anchors.finAdsRow, px[1]);
  MEAS.act = lrect(anchors.actBtns[0], px[7]);
  // rows are nested in the card: offsetParent chain reaches px
  const hotM = anchors.blocks[1]; MEAS.hot = hotM.rB;
  const bought = anchors.blocks[3].rB; MEAS.ring = { x: bought.x + 24 + 52, y: bought.y + 58 + 52 };
  navPos = navItems.map(e => [e.offsetLeft, e.offsetWidth]);
  sc.forEach(s => s.style.display = 'none'); cta.style.opacity = 0;
}
let navPos = null;

// =====================================================================
// per-frame
// =====================================================================
const visWin = i => [i === 0 ? DASH_IN[0] : TR[i][0], i === 7 ? CTA_IN[1] + 0.05 : TR[i + 1][1]];
const navK = t => { let k = 0; for (let j = 1; j <= 7; j++) k += sm(seg(t, TR[j][0], TR[j][1])); return k; };

window.renderAt = function (t) {
  beginFrame();
  const ck = navK(t);
  drawBG(t, ck);
  runAnims(t);

  // ---- hook ----
  { let sum = 0; LEDGER.forEach(([, , v], i) => { sum += v * eo3(seg(t, 0.7 + i * 0.17, 1.05 + i * 0.17)); });
    keptEl.textContent = sinr(sum);
    const neg = sum < 0, pulse = Math.sin(clamp((t - 1.8) / 1.1) * Math.PI);
    keptEl.style.color = neg ? 'var(--rd)' : 'var(--tx)';
    keptEl.style.textShadow = neg && t > 1.75 ? `0 0 ${50 * pulse + 14}px rgba(240,100,90,${0.55 * pulse + 0.2})` : 'none'; }
  { const k = seg(t, HOOK_OUT[0], HOOK_OUT[1]);
    const e = eio3(k), sca = Math.exp(Math.log(11) * e) * (1 + 0.05 * sm(seg(t, 0.3, 3.8)));
    hook.style.display = t > HOOK_OUT[1] ? 'none' : 'block';
    hook.style.transformOrigin = `${HOOK_FOCUS.x}px ${HOOK_FOCUS.y}px`;
    hook.style.transform = `scale(${sca.toFixed(4)})`;
    hook.style.opacity = (1 - eo3(seg(k, 0.5, 0.92))).toFixed(4);
    hook.style.filter = k > 0 ? `blur(${(10 * seg(k, 0.15, 1)).toFixed(2)}px)` : 'none';
    // shockwave ring + warm flash at the moment the number fills the frame
    const sw = seg(t, HOOK_OUT[0] + 0.3, HOOK_OUT[1] + 0.35), r = 60 + 1500 * eo3(sw);
    shock.style.opacity = sw > 0 && sw < 1 ? (0.9 * (1 - sw)).toFixed(3) : 0;
    shock.style.width = shock.style.height = r * 2 + 'px'; shock.style.left = 960 - r + 'px'; shock.style.top = 470 - r + 'px';
    const fl = Math.sin(seg(t, HOOK_OUT[0] + 0.25, HOOK_OUT[1] + 0.3) * Math.PI);
    flash.style.opacity = fl.toFixed(3); }

  // ---- brand lockup ----
  { const cs = 1 + 0.05 * sm(seg(t, 3.95, DASH_IN[0])), center = { x: 960 - BRW * cs / 2, y: 470 - BRH * cs / 2, s: cs }, c0 = { x: 960 - BRW * 1.05 / 2, y: 470 - BRH * 1.05 / 2, s: 1.05 }, head = { x: 56, y: 34, s: 0.34 }, ctaP = { x: 960 - BRW * 0.6 / 2, y: 176, s: 0.6 };
    let P = center, op = 0;
    if (t < 3.92) op = 0;
    else if (t < DASH_IN[0]) { P = center; op = 1; }
    else if (t < CTA_IN[0] + 0.05) { const k = eio5(seg(t, DASH_IN[0], DASH_IN[1])); P = { x: lerp(c0.x, head.x, k), y: lerp(c0.y, head.y, k), s: lerp(c0.s, head.s, k) }; op = 1; }
    else { const k = eio5(seg(t, CTA_IN[0] + 0.05, CTA_IN[1] + 0.1)); P = { x: lerp(head.x, ctaP.x, k), y: lerp(head.y, ctaP.y, k), s: lerp(head.s, ctaP.s, k) }; op = 1; }
    sst(brand, 'opacity', op); sst(brand, 'transform', `translate(${P.x.toFixed(2)}px,${P.y.toFixed(2)}px) scale(${P.s.toFixed(4)})`);
    const lg = qa(brand, '.lg'); [seg(t, 3.95, 4.25), seg(t, 4.05, 4.55), seg(t, 4.35, 4.65)].forEach((k, i) => lg[i].setAttribute('stroke-dashoffset', (1 - eo3(k)).toFixed(4)));
    qa(brand, '.wh').forEach((c, i) => c.setAttribute('r', (2.6 * clamp(eoBackL(seg(t, 4.55 + i * 0.08, 4.85 + i * 0.08)))).toFixed(3)));
    const bw = q(brand, '.bw'), bs = q(brand, '.bs');
    const wk = eo5(seg(t, 4.2, 4.75)); bw.style.opacity = wk; bw.style.transform = `translateX(${(1 - wk) * -24}px)`; bw.style.clipPath = `inset(0 ${(1 - wk) * 100}% 0 0)`;
    const sk = eo3(seg(t, 4.5, 4.9)); bs.style.opacity = sk; bs.style.letterSpacing = `${lerp(0.6, 0.32, eo5(seg(t, 4.5, 5.05)))}em`;
    const tg = seg(t, 4.7, 5.05) * (1 - seg(t, 5.3, 5.55)); tagline.style.opacity = eo3(tg).toFixed(3); tagline.style.transform = `translateY(${(1 - eo5(seg(t, 4.7, 5.15))) * 14}px)`; }

  // ---- nav ----
  { const nv = eo5(seg(t, 5.95, 6.5)) * (1 - eo3(seg(t, CTA_IN[0], CTA_IN[0] + 0.35)));
    sst(nav, 'opacity', nv.toFixed(3)); sst(nav, 'transform', `translateX(-50%) translateY(${((1 - nv) * -16).toFixed(2)}px)`); sst(liveChip, 'opacity', nv.toFixed(3));
    const i0 = Math.min(7, Math.floor(ck)), i1 = Math.min(7, i0 + 1), fk = ck - i0;
    navInd.style.left = lerp(navPos[i0][0], navPos[i1][0], fk) + 'px'; navInd.style.width = lerp(navPos[i0][1], navPos[i1][1], fk) + 'px';
    navItems.forEach((e, i) => e.style.color = Math.abs(ck - i) < 0.5 ? '#FFC277' : 'var(--mu)'); }

  // ---- captions ----
  caps.forEach((c, i) => {
    const tin = CAP_IN(i), tout = CAP_OUT(i), vis = t >= tin - 0.02 && t < tout + 0.45;
    sst(c, 'display', vis ? 'block' : 'none');
    const ok = eio3(seg(t, tout, tout + 0.32)); sst(c, 'opacity', (1 - ok).toFixed(3)); sst(c, 'transform', `translateY(${(-ok * 36).toFixed(2)}px)`);
  });

  // ---- scenes: visibility, camera, transitions ----
  for (let i = 0; i < 8; i++) {
    const [a, b] = visWin(i), vis = t >= a && t < b;
    sst(sc[i], 'display', vis ? 'block' : 'none');
    sst(sc[i], 'clipPath', ''); sst(sc[i], 'filter', ''); sst(sc[i], 'webkitMaskImage', ''); sst(sc[i], 'transformOrigin', '0 0');
    if (vis) { const c = cam(i, t); sst(px[i], 'transform', `translate(${c.tx.toFixed(3)}px,${c.ty.toFixed(3)}px) scale(${c.s.toFixed(5)})`); }
  }
  sst(irisEdge, 'opacity', 0); sst(wipeEdge, 'opacity', 0);
  for (const j in bgCopy) sst(bgCopy[j], 'display', t > TR[j][0] && t <= TR[j][1] ? 'block' : 'none');
  transitions(t, ck);

  // ---- shared-element morph hosts ----
  // The card re-parents from module A's camera to module B's camera. Its box AND its contents are scaled by a
  // continuous factor (A's push-in scale -> B's push-in scale) so nothing pops at the hand-over.
  for (const m of morphs) {
    const A = m.A, B = m.B, k = seg(t, m.tA, m.tB), e = sm(k);
    const host = t < m.tA ? px[A] : px[B];
    if (m.el.parentNode !== host) host.appendChild(m.el);
    let x, y, w, h, scl = 1;
    if (t < m.tA) ({ x, y, w, h } = m.rA);
    else if (t >= m.tB) ({ x, y, w, h } = m.rB);
    else {
      const cA = cam(A, t), cB = cam(B, t), R = mix(rectToScreen(cA, m.rA), rectToScreen(cB, m.rB), e);
      w = lerp(m.rA.w, m.rB.w, e); h = lerp(m.rA.h, m.rB.h, e); scl = (R.w / w) / cB.s;
      const p = toLocal(cB, { x: R.x, y: R.y }); x = p.x; y = p.y;
    }
    sst(m.el, 'left', x.toFixed(2) + 'px'); sst(m.el, 'top', y.toFixed(2) + 'px'); sst(m.el, 'width', w.toFixed(2) + 'px'); sst(m.el, 'height', h.toFixed(2) + 'px');
    S(m.el).sc *= scl;
    const xf = sm(seg(k, 0.2, 0.62)); sst(m.mA, 'opacity', (1 - xf).toFixed(3)); sst(m.mA, 'display', t >= m.tB ? 'none' : 'block');
    sst(m.mB, 'opacity', xf.toFixed(3));
    sst(m.chrome, 'opacity', (m.chromeFrom ? 1 : sm(seg(k, 0.15, 0.7))).toFixed(3));
  }

  // ---- action center cursor + CTA shared button ----
  actionFx(t);

  // ---- CTA ----
  cta.style.opacity = eo3(seg(t, CTA_IN[0] + 0.3, CTA_IN[1] - 0.25)).toFixed(3);
  sst(ctaBtn, 'visibility', t >= CTA_IN[1] ? 'visible' : 'hidden');

  commit();
  $wrap.style.filter = t < 0.12 ? `brightness(${(0.3 + 0.7 * t / 0.12).toFixed(3)})` : t > 29.75 ? `brightness(${(1 - 0.75 * seg(t, 29.75, 30)).toFixed(3)})` : 'none';
  return true;
};
const eoBackL = (x, s = 2) => { const c3 = s + 1; return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };

// =====================================================================
// transitions (each is eased; nothing linear, nothing jumpy)
// =====================================================================
function transitions(t, ck) {
  // dashboard unveiled by an opening window mask (width first, then height)
  { const k = seg(t, DASH_REVEAL[0], DASH_REVEAL[1]);
    if (t >= DASH_IN[0] && k < 1) { const eh = sm(seg(k, 0, 0.7)), ev = sm(seg(k, 0.2, 1)), x0 = 1330 - 1330 * eh, x1 = 1330 + 590 * eh, y0 = 520 - 520 * ev, y1 = 520 + 560 * ev;
      sst(sc[0], 'clipPath', `inset(${y0.toFixed(1)}px ${(W - x1).toFixed(1)}px ${(H - y1).toFixed(1)}px ${x0.toFixed(1)}px round ${lerp(60, 0, k).toFixed(1)}px)`); } }
  for (let j = 1; j <= 7; j++) {
    const [a, b] = TR[j], k = seg(t, a, b);
    if (t < a || t > b) continue;
    const A = sc[j - 1], B = sc[j];
    switch (j) {
      case 1: case 4: { // shared-element card morph(s): rest of A leaves, rest of B arrives, hero cards fly between
        const e = sm(seg(k, 0, 0.6)); S(rest[j - 1]).op *= 1 - e; S(rest[j - 1]).ty += e * 36;
        S(rest[j]).op *= sm(seg(k, 0.35, 0.95)); break; }
      case 2: { // zoom-through into the "Advertising billed" row
        const c = cam(1, t), f = toScreen(c, { x: MEAS.finAds.x + MEAS.finAds.w * 0.78, y: MEAS.finAds.y + MEAS.finAds.h / 2 });
        const e = eio3(k), s = Math.exp(Math.log(7) * e);
        sst(A, 'transformOrigin', `${f.x.toFixed(1)}px ${f.y.toFixed(1)}px`); S(A).sc *= s; S(A).op *= 1 - eo3(seg(k, 0.4, 0.82));
        sst(A, 'filter', `blur(${(7 * seg(k, 0.1, 1)).toFixed(2)}px)`);
        const e2 = eo4(seg(k, 0.22, 1));
        sst(B, 'transformOrigin', '960px 540px'); S(B).sc *= lerp(0.5, 1, e2); S(B).op *= sm(seg(k, 0.3, 0.8));
        sst(B, 'filter', `blur(${(6 * (1 - seg(k, 0.35, 0.95))).toFixed(2)}px)`); break; }
      case 3: { // venetian slat reveal (masked), 8 slats opening from the centre line with a stagger
        const N = 7, sw = W / N; let d = '';
        for (let s = 0; s < N; s++) { const p = eio3(seg(k, s * 0.045, s * 0.045 + 0.55)), h = p * H * 1.02, y0 = H / 2 - h / 2; d += `M${s * sw - 0.5},${y0.toFixed(1)}H${(s + 1) * sw + 0.5}V${(y0 + h).toFixed(1)}H${s * sw - 0.5}Z`; }
        drawBG(t, ck, bgCopy[3].getContext('2d'));
        sst(B, 'clipPath', `path('${d}')`);
        sst(A, 'transformOrigin', '960px 540px'); S(A).sc *= lerp(1, 0.95, sm(k)); sst(A, 'filter', `brightness(${lerp(1, 0.55, sm(k)).toFixed(3)})`); break; }
      case 5: { // circular iris opening from the "Bought" ring
        const c = cam(4, t), f = toScreen(c, MEAS.ring), R = 2300 * sm(seg(k, 0.02, 0.98));
        drawBG(t, ck, bgCopy[5].getContext('2d'));
        sst(B, 'clipPath', `circle(${R.toFixed(1)}px at ${f.x.toFixed(1)}px ${f.y.toFixed(1)}px)`);
        sst(A, 'transformOrigin', `${f.x.toFixed(1)}px ${f.y.toFixed(1)}px`); S(A).sc *= lerp(1, 1.1, sm(k)); sst(A, 'filter', `brightness(${lerp(1, 0.5, sm(k)).toFixed(3)})`);
        sst(irisEdge, 'left', (f.x - R).toFixed(1) + 'px'); sst(irisEdge, 'top', (f.y - R).toFixed(1) + 'px'); sst(irisEdge, 'width', (2 * R).toFixed(1) + 'px'); sst(irisEdge, 'height', (2 * R).toFixed(1) + 'px');
        sst(irisEdge, 'opacity', (R > 4 && k < 0.92 ? 0.9 * (1 - seg(k, 0.55, 0.92)) : 0).toFixed(3)); break; }
      case 6: { // depth tilt: module falls back, next module tilts up out of the floor
        const e1 = sm(seg(k, 0, 0.7)), e2 = eo4(seg(k, 0.25, 1));
        sst(A, 'transformOrigin', '960px 1080px'); S(A).raw = `perspective(1700px) rotateX(${(22 * e1).toFixed(2)}deg)`; S(A).ty += -70 * e1; S(A).sc *= 1 - 0.06 * e1;
        S(A).op *= 1 - sm(seg(k, 0.15, 0.7)); sst(A, 'filter', `blur(${(4 * e1).toFixed(2)}px)`);
        sst(B, 'transformOrigin', '960px 0px'); S(B).raw = `perspective(1700px) rotateX(${(-18 * (1 - e2)).toFixed(2)}deg)`; S(B).ty += 110 * (1 - e2); S(B).sc *= lerp(1.05, 1, e2);
        S(B).op *= sm(seg(k, 0.3, 0.8)); sst(B, 'filter', `blur(${(4 * (1 - seg(k, 0.35, 0.9))).toFixed(2)}px)`); break; }
      case 7: { // feathered diagonal wipe (mask) with a glowing leading edge
        const p = lerp(-0.3, 1.26, sm(k)), X = p * 100, ang = 112 * Math.PI / 180, L = Math.abs(W * Math.sin(ang)) + Math.abs(H * Math.cos(ang)), dx = Math.sin(ang), dy = -Math.cos(ang);
        drawBG(t, ck, bgCopy[7].getContext('2d'));
        sst(B, 'webkitMaskImage', `linear-gradient(112deg,#000 ${X - 22}%,rgba(0,0,0,0) ${X}%)`);
        sst(A, 'transformOrigin', '960px 540px'); S(A).sc *= lerp(1, 0.96, sm(k)); sst(A, 'filter', `brightness(${lerp(1, 0.55, sm(k)).toFixed(3)})`);
        const e = ((X - 9) / 100) * L, ex = 960 - (L / 2) * dx + e * dx, ey = 540 - (L / 2) * dy + e * dy;
        sst(wipeEdge, 'left', (ex - 6).toFixed(1) + 'px'); sst(wipeEdge, 'top', (ey - 1400).toFixed(1) + 'px'); sst(wipeEdge, 'transform', 'rotate(22deg)');
        sst(wipeEdge, 'opacity', (Math.sin(clamp(k) * Math.PI) * 0.9).toFixed(3)); break; }
    }
  }
  // scene 7 -> CTA: module recedes (scale + blur + fade) while the clicked button flies to the CTA slot
  { const k = seg(t, CTA_IN[0], CTA_IN[1]);
    if (k > 0) { const e = sm(k); const A = sc[7]; sst(A, 'transformOrigin', '960px 540px'); S(A).sc *= lerp(1, 0.92, e); S(A).op *= 1 - sm(seg(k, 0.2, 0.8)); sst(A, 'filter', `blur(${(6 * e).toFixed(2)}px)`); } }
}

// =====================================================================
// action center cursor / click + shared CTA button
// =====================================================================
const CLICK_T = SB[7] + 1.55;
function actionFx(t) {
  const c = cam(7, t), r = MEAS.act, scrR = rectToScreen(c, r), ctr = { x: scrR.x + scrR.w * 0.5, y: scrR.y + scrR.h * 0.5 };
  // cursor travels in, clicks, fades as the button leaves
  const kIn = seg(t, SB[7] + 0.75, CLICK_T), e = eio3(kIn), p0 = { x: 1500, y: 1060 }, tgt = { x: ctr.x + 6, y: ctr.y + 8 };
  const pos = { x: lerp(p0.x, tgt.x, e), y: lerp(p0.y, tgt.y, e) }, press = t > CLICK_T && t < CLICK_T + 0.18;
  cur.style.opacity = (clamp(kIn * 4) * (1 - seg(t, CTA_IN[0] + 0.1, CTA_IN[0] + 0.4))).toFixed(3);
  cur.style.transform = `translate(${pos.x.toFixed(1)}px,${pos.y.toFixed(1)}px) scale(${press ? 0.88 : 1})`;
  const kr = seg(t, CLICK_T, CLICK_T + 0.5);
  clickRing.style.opacity = kr > 0 && kr < 1 ? (1 - kr).toFixed(3) : 0;
  clickRing.style.transform = `translate(${(ctr.x - 24).toFixed(1)}px,${(ctr.y - 20).toFixed(1)}px) scale(${(0.4 + kr * 2.2).toFixed(3)})`;
  // the real button inside the action card: pressed + glow, then handed over to fxBtn
  const b0 = anchors.actBtns[0], k0 = seg(t, CLICK_T, CLICK_T + 0.2);
  b0.style.transform = k0 > 0 ? `scale(${(1 - 0.06 * Math.sin(k0 * Math.PI)).toFixed(4)})` : '';
  b0.style.boxShadow = k0 > 0 ? `0 0 ${30 * Math.sin(clamp(seg(t, CLICK_T, CLICK_T + 0.9)) * Math.PI)}px rgba(240,100,90,.7)` : '';
  const kf = seg(t, CTA_IN[0], CTA_IN[1]);
  const showFx = t >= CTA_IN[0] && t < CTA_IN[1];
  sst(fxBtn, 'display', showFx ? 'block' : 'none'); sst(b0, 'visibility', t >= CTA_IN[0] ? 'hidden' : 'visible');
  if (showFx) {
    const ef = sm(kf), R = mix(scrR, CTA_BTN, ef);
    sst(fxBtn, 'left', R.x.toFixed(2) + 'px'); sst(fxBtn, 'top', R.y.toFixed(2) + 'px'); sst(fxBtn, 'width', R.w.toFixed(2) + 'px'); sst(fxBtn, 'height', R.h.toFixed(2) + 'px');
    const cx = sm(seg(kf, 0.25, 0.75));
    q(fxBtn, '.bgB').style.opacity = cx.toFixed(3); q(fxBtn, '.bgA').style.opacity = (1 - cx).toFixed(3);
    q(fxBtn, '.tA').style.opacity = (1 - sm(seg(kf, 0.2, 0.5))).toFixed(3); q(fxBtn, '.tB').style.opacity = sm(seg(kf, 0.5, 0.85)).toFixed(3);
    fxBtn.style.boxShadow = `0 ${18 * cx}px ${50 * cx}px rgba(247,147,30,${0.45 * cx})`;
  }
}

Promise.all([['800 60px Jakarta'], ['700 60px Jakarta'], ['600 30px Jakarta'], ['700 60px Poppins'], ['400 20px Inter'], ['500 20px Inter'], ['600 20px Inter'], ['700 20px Inter'], ['800 20px Inter']].map(([f]) => document.fonts.load(f, '₹0123456789 Abc'))).then(() => {
  measure(); window.renderAt(0); window.READY = true;
});
