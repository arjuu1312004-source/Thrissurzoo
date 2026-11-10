#!/bin/bash
# ==============================================================================
# Thrissur Zoological Park - Hero Scroll Video Frame Extraction
# Extracts clean aerial drone footage into WebP sequences for desktop & mobile
# Output targets: < 8 MB desktop, < 3 MB mobile
# ==============================================================================

set -e

SOURCE_VIDEO="assets/video/TZP-VIDEO-NEW.mp4"
START_TIME="00:00:00"
DURATION="10"

mkdir -p frames/desktop
mkdir -p frames/mobile

echo "Extracting Desktop Frames (1600px, 11 fps, WebP Q55)..."
ffmpeg -ss "$START_TIME" -t "$DURATION" -i "$SOURCE_VIDEO" \
  -vf "fps=11,crop=in_w*0.93:in_h*0.92:in_w*0.02:in_h*0.05,scale=1600:-2" \
  -c:v libwebp -quality 55 \
  frames/desktop/frame_%04d.webp

echo "Extracting Mobile Frames (800px, 11 fps, WebP Q48)..."
ffmpeg -ss "$START_TIME" -t "$DURATION" -i "$SOURCE_VIDEO" \
  -vf "fps=16,crop=in_w*0.93:in_h*0.92:in_w*0.02:in_h*0.05,scale=800:-2" \
  -c:v libwebp -quality 48 \
  frames/mobile/frame_%04d.webp

echo "Extraction complete! Total desktop size: $(du -sh frames/desktop | cut -f1), mobile size: $(du -sh frames/mobile | cut -f1)"
