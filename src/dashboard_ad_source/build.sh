#!/bin/bash
# Full pipeline: soundtrack -> 1800 frames (60 fps) -> MP4 -> QA contact sheet.
#   ./build.sh            (needs: node + `npm install`, python3 + numpy/scipy/pillow, ffmpeg, a Chromium for Playwright)
# Env: WORKERS=4 (parallel browser pages)  CHROME_PATH=/path/to/chrome (if Playwright's own Chromium is not installed)
set -e
cd "$(dirname "$0")"
mkdir -p out
python3 sound4.py > /dev/null
rm -rf frames
PAGE=index4.html FPS=60 WORKERS=${WORKERS:-4} SCALE=1 node render4.mjs frames 0 1800
ffmpeg -y -framerate 60 -i frames/f_%04d.png -i sound4.wav \
  -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -crf 15 -profile:v high -level 4.2 -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 256k -movflags +faststart -shortest out/Ecomceptive_SellerIntelligence_Ad_16x9_v4.mp4
python3 qa_video.py out/Ecomceptive_SellerIntelligence_Ad_16x9_v4.mp4 out/contact_sheet_1fps.png
node qa_dom.mjs
