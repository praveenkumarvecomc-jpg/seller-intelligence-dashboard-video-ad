#!/bin/bash
# usage: filmstrip.sh <name> <t0> <t1> <n> [cols]   -> $SC/fs_<name>.png (n frames evenly spaced from t0..t1)
SC=/tmp/claude-0/-home-user-seller-intelligence-dashboard-video-ad/396bc201-0013-5e15-bf1f-057d8f0b3091/scratchpad
name=$1; t0=$2; t1=$3; n=$4; cols=${5:-4}
rm -rf $SC/fs_$name; 
FR=$(python3 -c "
n=$n; t0=$t0; t1=$t1
print(' '.join(str(round((t0+(t1-t0)*i/(n-1))*60)) for i in range(n)))")
PAGE=index4.html FPS=60 SCALE=0.5 FRAMES="$FR" node render4.mjs $SC/fs_$name 2>&1 | grep -v 404 | grep -v "^done"
rows=$(( (n+cols-1)/cols ))
ffmpeg -v error -y -framerate 1 -pattern_type glob -i "$SC/fs_$name/f_*.png" -vf "scale=480:-1,tile=${cols}x${rows}:padding=3:color=0x000000" -frames:v 1 $SC/fs_$name.png
echo $FR
