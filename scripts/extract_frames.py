import cv2
import os
import sys
from PIL import Image

def extract_frames():
    video_path = os.path.join("assets", "video", "TZP-VIDEO-NEW.mp4")
    if not os.path.exists(video_path):
        print(f"Error: {video_path} not found.")
        sys.exit(1)

    os.makedirs(os.path.join("frames", "desktop"), exist_ok=True)
    os.makedirs(os.path.join("frames", "mobile"), exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    total_raw_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0

    target_count = 110
    max_frame = min(total_raw_frames - 1, 240)
    frame_indices = [int((i / (target_count - 1)) * max_frame) for i in range(target_count)]

    desktop_total_bytes = 0
    mobile_total_bytes = 0

    print(f"Extracting {target_count} frames: Desktop (1600px, Q55) and Mobile (800px, Q48)...")

    for i, frame_idx in enumerate(frame_indices):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            continue

        h, w, _ = frame.shape
        crop_top = int(h * 0.05)
        crop_bottom = int(h * 0.97)
        crop_left = int(w * 0.02)
        crop_right = int(w * 0.95)
        cropped = frame[crop_top:crop_bottom, crop_left:crop_right]

        rgb_frame = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb_frame)

        # 1. Desktop version: 1600px
        ch, cw = cropped.shape[:2]
        d_width = 1600
        d_height = int((ch / cw) * d_width)
        d_height = d_height if d_height % 2 == 0 else d_height + 1
        desktop_img = pil_img.resize((d_width, d_height), Image.Resampling.LANCZOS)
        desktop_filename = os.path.join("frames", "desktop", f"frame_{i+1:04d}.webp")
        desktop_img.save(desktop_filename, "WEBP", quality=55, method=4)
        desktop_total_bytes += os.path.getsize(desktop_filename)

        # 2. Mobile version: 800px
        m_width = 800
        m_height = int((ch / cw) * m_width)
        m_height = m_height if m_height % 2 == 0 else m_height + 1
        mobile_img = pil_img.resize((m_width, m_height), Image.Resampling.LANCZOS)
        mobile_filename = os.path.join("frames", "mobile", f"frame_{i+1:04d}.webp")
        mobile_img.save(mobile_filename, "WEBP", quality=48, method=4)
        mobile_total_bytes += os.path.getsize(mobile_filename)

    # Clean up any excess frames from previous run if count decreased
    for folder in [os.path.join("frames", "desktop"), os.path.join("frames", "mobile")]:
        for fname in os.listdir(folder):
            if fname.startswith("frame_"):
                f_idx = int(fname.split("_")[1].split(".")[0])
                if f_idx > target_count:
                    os.remove(os.path.join(folder, fname))

    cap.release()

    desktop_mb = desktop_total_bytes / (1024 * 1024)
    mobile_mb = mobile_total_bytes / (1024 * 1024)
    print("\n--- OPTIMIZATION RESULTS ---")
    print(f"Desktop: {target_count} frames, Total Size: {desktop_mb:.2f} MB (Target: < 8 MB) -> {'PASS ✓' if desktop_mb < 8 else 'OVER'}")
    print(f"Mobile:  {target_count} frames, Total Size: {mobile_mb:.2f} MB (Target: < 3 MB) -> {'PASS ✓' if mobile_mb < 3 else 'OVER'}")

if __name__ == "__main__":
    extract_frames()
