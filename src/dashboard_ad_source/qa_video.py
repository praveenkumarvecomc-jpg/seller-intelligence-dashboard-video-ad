#!/usr/bin/env python3
"""QA on the encoded MP4.
  python3 qa_video.py out.mp4 contact_sheet.png

1. Labelled contact sheet: one frame per second (30 frames).
2. Motion check: frame-to-frame difference at 60 fps. Flags sudden spikes (a "jump") and long freezes.
3. Blank-frame check: flags any frame whose content (edge density) drops to background level between 0.3s and 29.7s.
"""
import subprocess, sys, numpy as np
from PIL import Image, ImageDraw, ImageFont

src, sheet = sys.argv[1], sys.argv[2]
FPS = 60

# ---- 1. contact sheets: exact frames at t = k (and t = k + 0.5), labelled below each tile ----
import glob, os
def make_sheet(offset_frames, out):
    cols, tw = 5, 480
    th = tw * 9 // 16
    tmp = out + '.tmp'
    subprocess.run(['rm', '-rf', tmp]); subprocess.run(['mkdir', '-p', tmp])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', f"select='eq(mod(n\\,60)\\,{offset_frames})',scale={tw}:{th}", '-vsync', '0', f'{tmp}/s_%02d.png'], check=True)
    files = sorted(glob.glob(f'{tmp}/s_*.png'))
    rows = (len(files) + cols - 1) // cols
    lab = 26
    img = Image.new('RGB', (cols * (tw + 6) + 6, rows * (th + lab + 6) + 6), (10, 10, 10))
    d = ImageDraw.Draw(img)
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
    except Exception: font = ImageFont.load_default()
    for i, f in enumerate(files):
        x, y = 6 + (i % cols) * (tw + 6), 6 + (i // cols) * (th + lab + 6)
        img.paste(Image.open(f), (x, y))
        d.text((x + 4, y + th + 3), f't = {i + offset_frames / 60:.1f} s', fill=(247, 147, 30), font=font)
    img.save(out)
    subprocess.run(['rm', '-rf', tmp])
    print('contact sheet:', out, img.size, f'({len(files)} frames)')
make_sheet(0, sheet)
make_sheet(30, sheet.replace('.png', '_half_seconds.png'))

# ---- 2/3. motion + content analysis ----
W, H = 320, 180
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
n = len(raw) // (W * H)
fr = np.frombuffer(raw, np.uint8)[: n * W * H].reshape(n, W, H * 0 + H, order='C') if False else np.frombuffer(raw, np.uint8)[: n * W * H].reshape(n, H, W).astype(np.float32)
print('frames decoded:', n, f'({n / FPS:.2f}s)')
diff = np.abs(fr[1:] - fr[:-1]).mean(axis=(1, 2))               # temporal change
edge = np.abs(np.diff(fr, axis=2)).mean(axis=(1, 2)) + np.abs(np.diff(fr, axis=1)).mean(axis=(1, 2))  # content / edge density

# jump = change much larger than the local median (+ absolute floor), ignoring the fades at 0s and 30s
k = 15
spikes = []
for i in range(k, len(diff) - k):
    t = (i + 1) / FPS
    if t < 0.25 or t > 29.7: continue
    med = np.median(diff[i - k:i + k + 1])
    if diff[i] > max(3.0 * med, med + 1.2): spikes.append((t, float(diff[i]), float(med)))
print(f'mean frame diff {diff.mean():.3f}, max {diff.max():.3f} @ {(diff.argmax() + 1) / FPS:.2f}s')
print(f'jump candidates (diff > 3x local median): {len(spikes)}')
for t, v, m in spikes[:12]: print(f'   t={t:6.2f}s  diff={v:.2f} (local median {m:.2f})')

freezes, run = [], 0
for i, v in enumerate(diff):
    if v < 0.002: run += 1
    else:
        if run >= 18: freezes.append((i - run + 1) / FPS)
        run = 0
print(f'freezes >0.3s (identical frames): {len(freezes)}', [round(x, 2) for x in freezes[:8]])

lo = [(i / FPS, float(e)) for i, e in enumerate(edge) if 0.3 < i / FPS < 29.7]
mn = min(lo, key=lambda x: x[1]); med = float(np.median([e for _, e in lo]))
print(f'content (edge density): median {med:.2f}, minimum {mn[1]:.2f} @ {mn[0]:.2f}s')
blank = [t for t, e in lo if e < 0.35 * med]
print('possible blank frames (<35% of median content):', len(blank), [round(x, 2) for x in blank[:10]])
