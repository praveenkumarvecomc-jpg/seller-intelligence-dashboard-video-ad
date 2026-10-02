// Core: math, easing, formatters, DOM helpers, deterministic animation system.
export const W = 1920, H = 1080, DUR = 30;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
export const eo3 = x => 1 - Math.pow(1 - x, 3);
export const eo4 = x => 1 - Math.pow(1 - x, 4);
export const eo5 = x => 1 - Math.pow(1 - x, 5);
export const ei3 = x => x * x * x;
export const eio3 = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const eio5 = x => x < .5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2;
export const sm = x => x * x * x * (x * (x * 6 - 15) + 10); // smootherstep
export const eoBack = (x, s = 1.4) => { const c3 = s + 1; return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
export function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Indian digit grouping (lakh / crore): 7039956 -> 70,39,956
export const inr = v => '₹' + Math.round(v).toLocaleString('en-IN');
export const sinr = v => (v < -0.5 ? '−' : '') + '₹' + Math.abs(Math.round(v)).toLocaleString('en-IN');
export const int = v => Math.round(v).toLocaleString('en-IN');
export const C = { or: '#F7931E', or2: '#FFB04A', gr: '#3CCB7F', rd: '#F0645A', pu: '#9384F5', bl: '#4C8DF6', am: '#F2B33D', tx: '#F5F6F8', mu: '#A5ACB8', cy: '#58C6D8', pk: '#E58BD3' };

// ---------------- DOM helpers ----------------
export const q = (root, s) => root.querySelector(s);
export const qa = (root, s) => [...root.querySelectorAll(s)];
export function node(html, parent) {
  const d = document.createElement('div'); d.innerHTML = html.trim();
  const e = d.firstElementChild; if (parent) parent.appendChild(e); return e;
}
// cached style write (cuts redundant DOM writes at 60fps x 1800 frames)
export function sst(el, prop, val) {
  const c = el._c || (el._c = {});
  if (c[prop] !== val) { c[prop] = val; el.style[prop] = val; }
}

// ---------------- animation system ----------------
// Every animation writes into a per-element state (translate / scale / opacity multipliers) so that
// entrance animations and transition effects compose instead of overwriting each other.
const ST = new Map();
export function S(el) { let s = ST.get(el); if (!s) { s = { tx: 0, ty: 0, typ: 0, sc: 1, op: 1, raw: '' }; ST.set(el, s); } return s; }
export const A = [];
export function an(el, t0, type, o = {}) {
  if (!el) throw new Error('missing el for ' + type + ' @' + t0);
  A.push({ el, t0, type, d: 0.6, ...o }); if (type === 'up' || type === 'fade' || type === 'pop' || type === 'rise') S(el); return el;
}
export function beginFrame() { for (const s of ST.values()) { s.tx = 0; s.ty = 0; s.typ = 0; s.sc = 1; s.op = 1; s.raw = ''; } }
export function runAnims(t) {
  for (const a of A) {
    const k = clamp((t - a.t0) / a.d), el = a.el;
    switch (a.type) {
      case 'up': { const s = S(el), e = eo5(k); s.op *= clamp(k * 1.6); s.ty += (1 - e) * (a.dy ?? 24); if (a.dx) s.tx += (1 - e) * a.dx; break; }
      case 'fade': S(el).op *= eo3(k); break;
      case 'pop': { const s = S(el), e = eoBack(k, 1.3); s.op *= clamp(k * 2); s.sc *= lerp(0.9, 1, e); break; }
      case 'rise': S(el).typ += (1 - eo5(k)) * 112; break;
      case 'w': el.style.width = (a.px != null ? a.px * eo5(k) + 'px' : a.to * eo5(k) + '%'); break;
      case 'draw': el.setAttribute('stroke-dashoffset', (1 - eo3(k)).toFixed(4)); break;
      case 'count': el.textContent = a.fmt(a.to * eo3(k)); break;
      case 'fn': a.fn(k, t); break;
    }
  }
}
export function commit() {
  for (const [el, s] of ST) {
    sst(el, 'opacity', s.op >= 0.9995 ? '' : s.op.toFixed(4));
    const tr = (s.raw || s.tx || s.ty || s.typ || s.sc !== 1)
      ? `${s.raw} translate(${s.tx.toFixed(2)}px,${s.ty.toFixed(2)}px)${s.typ ? ` translateY(${s.typ.toFixed(2)}%)` : ''}${s.sc !== 1 ? ` scale(${s.sc.toFixed(4)})` : ''}` : '';
    sst(el, 'transform', tr);
  }
}

// ---------------- charts ----------------
let UID = 0;
export function smooth(pts) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
export function series(n, seed, base, amp, trend = 0, spikes = {}) {
  const r = rng(seed); const v = []; let w = 0;
  for (let i = 0; i < n; i++) { w = w * 0.6 + (r() - 0.5) * amp; v.push(base + w + trend * i / n + (spikes[i] || 0)); }
  return v;
}
export function chart(vals, w, h, { min, max, color, fill = true, sw = 3, dots = false } = {}) {
  const id = 'c' + (++UID);
  const lo = min ?? Math.min(...vals) * 0.9, hi = max ?? Math.max(...vals) * 1.08;
  const pts = vals.map((v, i) => [i / (vals.length - 1) * w, h - (v - lo) / (hi - lo) * h]);
  const line = smooth(pts), area = line + ` L${w},${h} L0,${h} Z`;
  return {
    pts, svg: `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" class="abs" style="left:0;top:0">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".34"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>
    <clipPath id="${id}c"><rect class="clipr" x="-10" y="-20" width="0" height="${h + 40}"/></clipPath></defs>
    ${fill ? `<path d="${area}" fill="url(#${id})" clip-path="url(#${id}c)"/>` : ''}
    <path class="ln" d="${line}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`
  };
}
// chart reveal: line draws + area clip follows
export function anChart(root, t0, d, w) {
  qa(root, 'path.ln').forEach(p => an(p, t0, 'draw', { d }));
  qa(root, 'rect.clipr').forEach(r => an(r, t0, 'fn', { d, fn: k => r.setAttribute('width', (w * eo3(k) + 10).toFixed(1)) }));
}
