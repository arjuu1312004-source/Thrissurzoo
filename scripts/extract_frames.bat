@echo off
REM ==============================================================================
REM Thrissur Zoological Park - Hero Scroll Video Frame Extraction (Windows Batch)
REM ==============================================================================

if not exist frames\desktop mkdir frames\desktop
if not exist frames\mobile mkdir frames\mobile

set SOURCE=assets\video\TZP-VIDEO-NEW.mp4
set START=00:00:00
set DURATION=10

echo Extracting Desktop Frames (1600px, 11 fps, WebP Q55)...
ffmpeg -ss %START% -t %DURATION% -i "%SOURCE%" -vf "fps=11,crop=in_w*0.93:in_h*0.92:in_w*0.02:in_h*0.05,scale=1600:-2" -c:v libwebp -quality 55 frames\desktop\frame_%%04d.webp

echo Extracting Mobile Frames (800px, 11 fps, WebP Q48)...
ffmpeg -ss %START% -t %DURATION% -i "%SOURCE%" -vf "fps=11,crop=in_w*0.93:in_h*0.92:in_w*0.02:in_h*0.05,scale=800:-2" -c:v libwebp -quality 48 frames\mobile\frame_%%04d.webp

echo Frame extraction complete!
