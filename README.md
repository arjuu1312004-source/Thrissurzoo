# Thrissur Zoological Park & Research Centre (Puthur) - Premium Redesign

A luxury eco-resort & museum inspired recreation of the official website for **Thrissur Zoological Park & Research Centre (TZP), Puthur, Thrissur, Kerala** (`https://tzp-cds.com/`).

---

## 🌿 Design Language & Philosophy

- **Color Palette (90% Neutrals / 10% Accents)**:
  - Base White: `#FFFFFF`
  - Alternate Ivory: `#F7F5F0`
  - Forest Green (Primary Brand & Footer): `#14342A`
  - Muted Luxury Gold (Rules & Accents): `#B8924A`
  - Primary Text: `#1C1C1C` (Charcoal)
  - Secondary Text: `#6B6F6A`
- **Typography**:
  - Headings: *Playfair Display* (Editorial luxury serif)
  - UI & Body: *Plus Jakarta Sans* / *Inter* (Clean modern sans-serif)
- **Surfaces & Cards**:
  - White cards with `1px solid rgba(20, 52, 42, 0.08)` borders, soft multi-layer box shadows, and 20–24px rounded corners.
  - Signature architectural arches (`border-radius: 140px 140px 20px 20px`).
- **Hero Experience**:
  - Full-screen, cinematic autoplay video hero (`assets/video/tzp-hero-video.mp4`), featuring drone footage of the sanctuary hills and canopy.
  - Studio luxury lighting spills: emerald depth spill, champagne gold specular flare, and an ambient vignette.
  - Full-bleed edge-to-edge video coverage across mobile, tablet, and desktop with zero letterboxing.
  - Floating frosted pill navigation and subtle audio toggle control.
  - Smooth Lenis scroll interpolation releasing seamlessly into the Quick-Link tiles and subsequent sections without scroll-jacking.

---

## 📁 Project Structure

```text
tsr zoo/
├── index.html               # Home / About Us (Full 11-section layout + Hero Canvas)
├── visit-us.html            # Visitor timings, weekly holiday, tariffs & parking
├── virtual-tour.html        # 360° spatial walkthrough & master layout blueprint
├── events.html              # Events & media gallery with category filters & lightbox
├── research.html            # Research scholar portal, CZA rules & registration form
├── jeevdarshini.html        # Live camera surveillance grid (9 official channels)
├── css/
│   └── theme.css            # Unified 12-column grid, typography & component styling
├── js/
│   └── main.js              # Lenis smooth scroll, GSAP frame scrubber, Kunju AI chat & lightbox
├── assets/
│   ├── images/              # Authentic logos, badges, and banners (banner1-10, tzp_master_plan)
│   └── video/               # Source video (TZP-VIDEO-NEW.mp4)
├── frames/
│   ├── desktop/             # 110 WebP frames (1600px width, 6.73 MB total < 8 MB)
│   └── mobile/              # 110 WebP frames (800px width, 2.71 MB total < 3 MB)
└── scripts/
    ├── extract_frames.py    # Python OpenCV + PIL script for WebP frame extraction
    ├── extract_frames.sh    # Bash script with ffmpeg commands
    ├── extract_frames.bat   # Windows batch script with ffmpeg commands
    └── verify_site.js       # Node.js link & asset integrity verification test
```

---

## 🎬 Frame Extraction Commands (ffmpeg)

To regenerate or extract new frame sequences from `assets/video/TZP-VIDEO-NEW.mp4`:

### Desktop Sequence (1600px wide, ~6.7 MB total)
```bash
ffmpeg -ss 00:00:00 -t 15 -i assets/video/TZP-VIDEO-NEW.mp4 \
  -vf "fps=7.5,crop=in_w*0.95:in_h*0.95:0:in_h*0.05,scale=1600:-2" \
  -c:v libwebp -quality 55 \
  frames/desktop/frame_%04d.webp
```

### Mobile Sequence (800px wide, ~2.7 MB total)
```bash
ffmpeg -ss 00:00:00 -t 15 -i assets/video/TZP-VIDEO-NEW.mp4 \
  -vf "fps=7.5,crop=in_w*0.95:in_h*0.95:0:in_h*0.05,scale=800:-2" \
  -c:v libwebp -quality 48 \
  frames/mobile/frame_%04d.webp
```

*(Alternatively, run `python scripts/extract_frames.py` which uses Python's OpenCV and Pillow to perform the same extraction with automatic cropping and optimization.)*

---

## 🚀 How to Run Locally

You can serve the project using any standard static file server:

### Using Node.js (npx)
```bash
npx serve .
# or
npx http-server -p 3000
```

### Using Python
```bash
python -m http.server 8000
```

Open `http://localhost:8000` (or `http://localhost:3000`) in your browser to experience the site.

---

## 🚢 Deployment Notes

The site is built with pure, static HTML5, CSS3, and modern vanilla JavaScript with CDN-loaded libraries (**GSAP 3.12.5**, **ScrollTrigger**, **Lenis 1.1.14**):
- **Netlify / Vercel / GitHub Pages**: Deploy directly by pushing the repository. No build step is required (publish directory: `.`).
- **Caching**: Ensure `.webp` and `.png` assets in `frames/` and `assets/` have long cache headers (`Cache-Control: public, max-age=31536000, immutable`).

