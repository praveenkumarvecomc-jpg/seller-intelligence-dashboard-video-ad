# Soundtrack v3: techy 120 BPM, F minor. Tense hook -> brand reveal -> drop at 6.0s -> CTA resolve at 27.5s.
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000; DUR = 30.0; N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(21)
BEAT = 0.5
SB = [6.0, 9.5, 12.5, 15.5, 18.0, 20.5, 23.0, 25.0, 27.5]

def ta(d): return np.arange(int(d * SR)) / SR
def add(sig, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    s = sig[: N - i] * g
    L[i:i + len(s)] += s * np.cos((pan + 1) * np.pi / 4) * 1.414
    R[i:i + len(s)] += s * np.sin((pan + 1) * np.pi / 4) * 1.414
def flt(x, f, kind, o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def saw(f, d):
    t = ta(d); return 2 * ((f * t) % 1) - 1

def kick(g=1.0):
    t = ta(0.4); f = 46 + 120 * np.exp(-t * 32)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
    return np.tanh(1.6 * s + flt(rng.standard_normal(len(t)), 3000, 'high') * np.exp(-t * 300) * 0.15) * g
def clap(g=0.3):
    t = ta(0.25); n = flt(rng.standard_normal(len(t)), [900, 5000], 'band')
    e = np.exp(-t * 24) + 0.6 * (t > 0.012) * np.exp(-np.maximum(t - 0.012, 0) * 26) + 0.4 * (t > 0.022) * np.exp(-np.maximum(t - 0.022, 0) * 22)
    return n * e * g
def hat(d=0.06, g=0.07, open_=False):
    t = ta(0.25 if open_ else d); return flt(rng.standard_normal(len(t)), 7500, 'high', 4) * np.exp(-t * (14 if open_ else 70)) * g
def tick(f=2400, g=0.05):
    t = ta(0.03); return np.sin(2 * np.pi * f * t) * np.exp(-t * 180) * g + flt(rng.standard_normal(len(t)), 5000, 'high') * np.exp(-t * 400) * g * 0.5
def blip(m, d=0.16, g=0.12, down=False):
    t = ta(d); f = mtof(m) * (1 - 0.35 * t / d if down else 1)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sign(np.sin(ph)) * 0.25 + np.sin(ph)) * np.exp(-t * 18) * g
def pluck(m, d=0.35, g=0.12):
    t = ta(d); f = mtof(m)
    s = saw(f, d) + 0.6 * saw(f * 1.005, d)
    out = np.zeros_like(s); seg_ = 8
    for c in range(seg_):
        a, b = c * len(s) // seg_, (c + 1) * len(s) // seg_
        fc = 300 + 5000 * np.exp(-c * d / seg_ * 14)
        out[a:b] = flt(s, min(fc, 20000), 'low')[a:b]
    return out * np.exp(-t * 7) * np.minimum(t / 0.002, 1) * g
def pad(notes, d, g=0.08, cut=1400, att=0.4):
    t = ta(d); s = np.zeros_like(t)
    for m in notes:
        for det in (-0.1, 0.0, 0.1): s += saw(mtof(m) * (1 + det / 100), d)
    s = flt(s, cut, 'low')
    return s * np.minimum(t / att, 1) * np.minimum(1, (d - t) / 0.3) * g / len(notes)
def sub(m, d, g=0.3):
    t = ta(d); f = mtof(m); s = np.sin(2 * np.pi * f * t) + 0.25 * np.tanh(4 * np.sin(2 * np.pi * f * t))
    return flt(s, 400, 'low') * np.minimum(t / 0.004, 1) * np.minimum(1, (d - t) / 0.02) * np.exp(-t * 2.5) * g
def whoosh(d=0.8, g=0.25):
    t = ta(d); n = rng.standard_normal(len(t)); out = np.zeros_like(n); C = 24
    for c in range(C):
        a, b = c * len(n) // C, (c + 1) * len(n) // C; fc = 300 + 6000 * np.sin(np.pi * c / C) ** 1.5
        out[a:b] = flt(n, [fc * 0.6, min(fc * 1.5, 20000)], 'band')[a:b]
    return out * np.sin(np.pi * t / d) ** 2 * g
def riser(d, g=0.12, f0=200, f1=1800):
    t = ta(d); f = f0 * (f1 / f0) ** (t / d)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3
    n = flt(rng.standard_normal(len(t)), 1800, 'high') * 0.7
    return (tone + n) * (t / d) ** 2.4 * g
def boom(g=0.8, d=1.8):
    t = ta(d); f = 38 + 70 * np.exp(-t * 10)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    n = flt(rng.standard_normal(len(t)), 1500, 'low') * np.exp(-t * 9) * 0.4
    return np.tanh(1.8 * (s + n)) * g
def shimmer(d=1.5, g=0.08):
    t = ta(d); s = np.zeros_like(t)
    for m in (84, 88, 91, 96):
        s += np.sin(2 * np.pi * mtof(m) * t + 0.3 * np.sin(2 * np.pi * 5 * t))
    return s * np.minimum(t / 0.15, 1) * np.exp(-t * 2) * g / 4

# ---------- HOOK 0-4 ----------
add(pad([41, 48, 53, 56], 4.2, 0.10, cut=700, att=0.6), 0.0)
for i in range(8):  # heartbeat sub pulse
    add(sub(29, 0.45, 0.32), i * 0.5)
for i in range(16): add(tick(3200, 0.025), 0.125 + i * 0.25, pan=0.4 if i % 2 else -0.4)
add(blip(77, 0.2, 0.10), 0.85)  # ordered sales: up
for i in range(1, 7): add(blip(74 - i * 2, 0.18, 0.11, down=True), 0.95 + i * 0.2, pan=-0.3 + i * 0.1)
add(riser(1.2, 0.08, 120, 900), 1.25)
add(boom(0.75), 2.45); add(blip(65, 0.3, 0.12, down=True), 2.45)
add(clap(0.25), 2.95); add(pluck(68, 0.5, 0.16), 2.95); add(pluck(72, 0.5, 0.12), 3.05)
add(whoosh(0.6, 0.22), 3.65)
# ---------- BRAND 4-6 ----------
add(pad([53, 56, 60, 63], 2.2, 0.09, cut=2200, att=0.3), 4.0)
add(shimmer(1.6, 0.10), 4.1)
add(tick(1800, 0.08), 4.35); add(tick(2200, 0.08), 4.75)
add(riser(1.6, 0.14, 150, 2400), 4.4)
for k in range(8): add(hat(0.03, 0.05), 5.0 + k * 0.125, pan=0.3)
# ---------- GROOVE 6.0 - 27.5 ----------
CH = [[41, 48, 53, 56, 60, 63], [37, 44, 49, 53, 56, 60], [44, 51, 56, 60, 63], [39, 46, 51, 55, 58, 63]]  # Fm9, Dbmaj7, Ab, Eb
ROOT = [29, 25, 32, 27]
ARP = [[65, 68, 72, 75, 72, 68, 77, 72], [61, 65, 68, 72, 68, 65, 73, 68], [68, 72, 75, 80, 75, 72, 79, 75], [63, 67, 70, 75, 70, 67, 74, 70]]
bar = 0
for t0 in np.arange(6.0, 27.5, 2.0):
    c = bar % 4
    add(pad(CH[c], min(2.0, 27.5 - t0) + 0.05, 0.07, cut=1800, att=0.08), t0)
    for k in range(8):
        tt = t0 + k * 0.25
        if tt < 27.5: add(pluck(ARP[c][k], 0.3, 0.085), tt, pan=-0.4 if k % 2 else 0.4)
    for k in range(16):  # rolling 16th sub-bass, off the kick
        tt = t0 + k * 0.125
        if tt < 27.5 and k % 4 != 0: add(sub(ROOT[c] + (12 if k % 4 == 2 else 0), 0.11, 0.22), tt)
    bar += 1
for i, bt in enumerate(np.arange(6.0, 27.5, BEAT)):
    add(kick(0.85), bt)
    if i % 2 == 1: add(clap(0.28), bt, pan=0.05)
    add(hat(0.05, 0.07), bt + 0.25, pan=0.25)
    add(hat(0.03, 0.035), bt + 0.125, pan=-0.3); add(hat(0.03, 0.035), bt + 0.375, pan=-0.3)
    if i % 8 == 7: add(hat(0.2, 0.05, open_=True), bt + 0.25, pan=0.2)
add(boom(0.6, 1.4), 6.0)
# whooshes on every camera move (peak on boundary)
for b in SB[1:8]: add(whoosh(0.8, 0.26), b - 0.42)
# UI ticks on count-ups, one burst per scene
for b in [6.15] + [x + 0.15 for x in SB[1:8]]:
    for k in range(8): add(tick(2600 + k * 60, 0.022), b + k * 0.06, pan=0.2)
# moments
add(blip(84, 0.15, 0.08), 8.0)               # net profit highlight
add(blip(60, 0.25, 0.10, down=True), 11.2)   # amazon fees flagged
add(blip(60, 0.25, 0.10, down=True), 14.2)   # ads lose money
add(blip(60, 0.25, 0.10, down=True), 19.3)   # largest fall in share
add(blip(60, 0.25, 0.10, down=True), 21.8)   # out of stock
add(tick(1500, 0.12), 26.62); add(blip(88, 0.18, 0.10), 26.66)  # click
# ---------- CTA 27.5-30 ----------
add(riser(1.0, 0.12, 300, 3000), 26.5)
add(boom(0.85, 2.4), 27.5)
add(pad([41, 53, 56, 60, 63, 67], 2.5, 0.16, cut=2600, att=0.05), 27.5)
add(shimmer(2.3, 0.12), 27.6)
add(pluck(77, 0.8, 0.12), 28.72); add(pluck(84, 0.8, 0.08), 28.78)

def delay(x, ms, fb, mix):
    d = int(SR * ms / 1000); y = x.copy()
    for k in range(1, 5): y[d * k:] += x[:-d * k] * (fb ** k) * mix
    return y
L2 = delay(L, 375, 0.38, 0.2); R2 = delay(R, 250, 0.38, 0.2)
mix = np.stack([L2, R2], 1); mix = flt(mix.T, 28, 'high').T
mix = np.tanh(mix * 1.25)
fo = int(0.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = mix / np.max(np.abs(mix)) * 0.89
wavfile.write('sound3.wav', SR, (mix * 32767).astype(np.int16))
for s in range(0, 30, 3):
    seg_ = mix[s * SR:(s + 3) * SR]; print(s, round(20 * np.log10(np.sqrt((seg_ ** 2).mean())), 1))
