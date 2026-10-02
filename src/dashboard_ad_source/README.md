# Seller Intelligence Platform · 30 s 16:9 Meta ad (v4)

The whole video is a web page. `window.renderAt(t)` draws the exact frame for time `t` (seconds, 0–30), deterministically, so
frames can be rendered in any order and in parallel.

## Build

```bash
npm install                      # playwright + @fontsource fonts
pip install numpy scipy pillow   # soundtrack synth + QA
# ffmpeg must be on PATH. Playwright's Chromium: `npx playwright install chromium`
#   (or point CHROME_PATH at any Chromium/Chrome binary)
./build.sh                       # soundtrack -> 1800 frames -> MP4 -> QA
```

Manual steps (same thing):

```bash
python3 sound4.py                                              # -> sound4.wav
PAGE=index4.html FPS=60 WORKERS=4 node render4.mjs frames 0 1800
ffmpeg -framerate 60 -i frames/f_%04d.png -i sound4.wav -c:v libx264 -crf 15 -pix_fmt yuv420p \
  -c:a aac -b:a 256k -movflags +faststart -shortest out.mp4
```

Quick previews: `SCALE=0.5 FRAMES="30 150 300" node render4.mjs preview`, or `./filmstrip.sh <name> <t0> <t1> <n>` to tile a transition.

## Files

| file | what it is |
|---|---|
| `index4.html`, `fonts4.css` | page shell, design tokens (charcoal theme, orange `#F7931E`), Plus Jakarta Sans / Inter / Poppins `@font-face` (latin + latin-ext so `₹` resolves) |
| `core.js` | easing, ₹ lakh/crore formatters, chart helpers, the deterministic animation system (animations compose into one transform/opacity per element) |
| `timeline.js` | **all timing in one place**: module boundaries `SB`, transition windows `TR`, camera push-in per module, `OFFER` (early-bird text) |
| `scenes.js` | the 8 module scenes (Dashboard … Action Center) |
| `main.js` | hook, logo lockup, nav, captions, CTA, background, the camera, all transitions, shared-element morphs |
| `sound4.py` | soundtrack synth (120 BPM, F minor), one signature sound per transition |
| `render4.mjs` | parallel frame renderer (Playwright) |
| `qa_dom.mjs`, `qa_video.py`, `filmstrip.sh` | QA tools (see below) |
| `index3.html`, `scene3.js`, `sound3.py`, `render.mjs`, `fonts3.css` | the previous version (kept for reference) |

## Timeline

| time | beat | transition into it |
|---|---|---|
| 0–4 s | Hook: ledger drains ₹50,00,000 → −₹2,00,000 | |
| 4–6 s | Logo reveal; logo travels to the header | zoom-through into the red number + shockwave |
| 6.0 | 01 Dashboard (hero: net profit) | window-opening mask |
| 9.0 | 02 Finance (hero: net financial movement) | **shared element**: the net-profit card flies and re-forms as the net-movement card |
| 12.0 | 03 Advertising (hero: ROAS gauge) | **zoom-through** into the "Advertising billed" row |
| 15.0 | 04 Sales & Traffic (hero: visit→order funnel) | **masked reveal**: 7 venetian slats |
| 17.5 | 05 Search & Brand (hero: share cards) | **shared elements**: the 4 funnel stat blocks become the 4 share cards |
| 20.0 | 06 Inventory (hero: stock donut) | **masked reveal**: circular iris opening from the "Bought" ring |
| 22.5 | 07 Returns (hero: refunded ₹) | depth tilt (module falls back, next rises) |
| 25.0 | 08 Action Center (hero: ranked actions) | feathered diagonal wipe with a glowing edge |
| 27.5–30 | CTA "Stop guessing. Start knowing." | **shared element**: the clicked action button flies to become the "Claim early access" button |

Every module holds with a slow eased camera push-in (≈7 %) on its key widget; every move uses ease-in-out or ease-out curves.

## Content rules

Client is always **Demo Brand**; amounts use ₹ lakh/crore grouping (₹70,39,956); no real client names, ASINs or SKUs.

## QA

* `node qa_dom.mjs` samples every hold (outside transitions) and flags text that is off-frame, clipped by its box, or overlapping other text; it also reports how long each caption is ≥ 90 % opaque (target ≥ 1.2 s).
* `python3 qa_video.py out.mp4 contact_sheet.png` writes the 1-frame-per-second contact sheet and checks the encoded video for jumps (frame-to-frame spikes), freezes and blank frames.
