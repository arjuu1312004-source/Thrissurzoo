/**
 * Thrissur Zoological Park & Research Centre - Premium Interactive Controller
 * Features: Lenis Smooth Scroll + Watch Exploded Canvas Hero + Kunju Chat + Gallery Lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initWatchHeroScrubber();
  initVerticalDotNav();
  initGalleryLightbox();
  initEventsFilter();
  initVisitorTabs();
  initKunjuChat();
  initVideoModal();
  initMobileNav();
});

/* ==============================================================================
   1. LENIS SMOOTH SCROLLING & GSAP INTEGRATION
   ============================================================================== */
let lenisInstance = null;

function initSmoothScroll() {
  if (typeof Lenis !== 'undefined') {
    const isMobile = window.innerWidth < 768;
    lenisInstance = new Lenis({
      duration: isMobile ? 0.7 : 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.8,
      syncTouch: true,
    });

    if (typeof ScrollTrigger !== 'undefined') {
      lenisInstance.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }
  }
}

/* ==============================================================================
   2. SCROLL-DRIVEN WATCH EXPLODED HERO (Responsive & Fast Scrub)
   ============================================================================== */
function initWatchHeroScrubber() {
  const canvas = document.getElementById('watchCanvas');
  const container = document.getElementById('watchHeroContainer');
  const loader = document.getElementById('watchLoader');
  const progressBar = document.getElementById('watchProgressBar');
  const spillPrimary = document.getElementById('watchSpillPrimary');
  const spillGold = document.getElementById('watchSpillGold');

  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d');
  const frameCount = 299;
  const images = new Array(frameCount);
  let loadedCount = 0;
  let currentFrameIndex = 1;
  let lastRenderedIndex = -1;

  function getFrameSrc(index) {
    const pad = String(index).padStart(3, '0');
    return `assets/frame1/ezgif-frame-${pad}.jpg`;
  }

  // Find closest loaded frame to guarantee instant rendering with zero frozen gaps
  function getBestLoadedImage(targetIdx) {
    const idx = Math.max(1, Math.min(targetIdx, frameCount));
    // 1. Direct hit
    const exact = images[idx - 1];
    if (exact && exact.complete && exact.naturalWidth > 0) {
      return { img: exact, index: idx };
    }
    // 2. Search outwards for closest cached frame
    for (let dist = 1; dist < frameCount; dist++) {
      const prev = idx - dist;
      if (prev >= 1) {
        const prevImg = images[prev - 1];
        if (prevImg && prevImg.complete && prevImg.naturalWidth > 0) {
          return { img: prevImg, index: prev };
        }
      }
      const next = idx + dist;
      if (next <= frameCount) {
        const nextImg = images[next - 1];
        if (nextImg && nextImg.complete && nextImg.naturalWidth > 0) {
          return { img: nextImg, index: next };
        }
      }
    }
    return null;
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lastRenderedIndex = -1;
    render(currentFrameIndex);
  }

  function render(index) {
    const best = getBestLoadedImage(index);
    if (!best) return;

    const img = best.img;
    const bestIdx = best.index;

    if (lastRenderedIndex === bestIdx) return;
    lastRenderedIndex = bestIdx;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const imgW = img.naturalWidth || 1920;
    const imgH = img.naturalHeight || 1080;

    let renderW, renderH, offsetX, offsetY;

    if (w < h) {
      // Mobile / Tablet Portrait:
      // Fit to screen width with 1.04x scale so 96%+ of exploded gears are completely visible
      // across screen width and perfectly centered vertically
      const scale = (w / imgW) * 1.04;
      renderW = imgW * scale;
      renderH = imgH * scale;
      offsetX = (w - renderW) / 2;
      offsetY = (h - renderH) / 2;
    } else {
      // Desktop / Landscape:
      // Full bleed cover
      const scale = Math.max(w / imgW, h / imgH);
      renderW = imgW * scale;
      renderH = imgH * scale;
      offsetX = (w - renderW) / 2;
      offsetY = (h - renderH) / 2;
    }

    ctx.fillStyle = '#060E0A';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }

  function loadSingleFrame(i, onComplete) {
    if (images[i - 1]) return;
    const img = new Image();
    img.src = getFrameSrc(i);
    img.onload = () => {
      loadedCount++;
      if (progressBar && loadedCount <= 25) {
        const percent = Math.min(100, Math.round((loadedCount / 20) * 100));
        progressBar.style.width = `${percent}%`;
      }
      if (loadedCount === 1) {
        resizeCanvas();
        render(1);
      }
      if (loadedCount >= 12 && loader) {
        loader.classList.add('hidden');
      }
      if (onComplete) onComplete();
    };
    img.onerror = () => {
      if (onComplete) onComplete();
    };
    images[i - 1] = img;
  }

  // Wave 1: Rapid keyframe stride (every 4th frame + first 10 frames)
  // Provides 100% full scrub coverage from 0% to 100% in under 1.5 seconds!
  const wave1Frames = [];
  for (let i = 1; i <= 10; i++) wave1Frames.push(i);
  for (let i = 12; i <= frameCount; i += 4) wave1Frames.push(i);
  if (!wave1Frames.includes(frameCount)) wave1Frames.push(frameCount);

  wave1Frames.forEach(idx => loadSingleFrame(idx));

  // Wave 2: Interleaved in-between frames loaded progressively in background
  setTimeout(() => {
    for (let i = 1; i <= frameCount; i++) {
      if (!images[i - 1]) {
        loadSingleFrame(i);
      }
    }
  }, 250);

  // Smart resize listener (ignores mobile vertical address bar show/hide jitters)
  let prevW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - prevW) > 8) {
      prevW = window.innerWidth;
      resizeCanvas();
    } else {
      render(currentFrameIndex);
    }
  });

  resizeCanvas();

  // Safety fallback: reveal viewport after 1.2s max
  setTimeout(() => {
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
    }
  }, 1200);

  // ScrollTrigger Setup: Pin and scrub with ultra-responsive 1:1 touch on mobile
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;

    ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      pin: '.watch-pinned-viewport',
      pinSpacing: false,
      scrub: isMobile ? true : 0.05, // Instant 1:1 scrub on mobile touch, buttery 0.05 on desktop
      anticipatePin: 1,
      fastScrollEnd: true,
      onUpdate: (self) => {
        const progress = self.progress;

        // Map scroll progress smoothly across all 299 frames
        const targetFrame = Math.min(frameCount, Math.max(1, Math.round(progress * (frameCount - 1)) + 1));
        if (targetFrame !== currentFrameIndex) {
          currentFrameIndex = targetFrame;
          requestAnimationFrame(() => render(targetFrame));
        }

        // Dynamic studio lighting spills
        if (spillPrimary) {
          const spillScale = 1 + progress * 0.45;
          spillPrimary.style.transform = `translate(-50%, -50%) scale(${spillScale})`;
        }
        if (spillGold) {
          const goldOpacity = 0.35 + progress * 0.6;
          spillGold.style.opacity = String(goldOpacity);
        }
      }
    });
  }
}

/* ==============================================================================
   3. VERTICAL DOT NAVIGATION (Goodwish style)
   ============================================================================== */
function initVerticalDotNav() {
  const dots = document.querySelectorAll('.dot-nav-item');
  const sections = [
    document.getElementById('watchHeroContainer') || document.getElementById('heroSection'),
    document.getElementById('quickAccessSection'),
    document.getElementById('welcomeSection'),
    document.getElementById('gallerySection'),
    document.getElementById('visitorInfoSection')
  ].filter(Boolean);

  if (dots.length === 0 || sections.length === 0) return;

  function updateDots() {
    const scrollY = window.scrollY + window.innerHeight * 0.4;
    sections.forEach((sec, idx) => {
      if (!sec) return;
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        dots.forEach(d => d.classList.remove('active'));
        if (dots[idx]) dots[idx].classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateDots, { passive: true });
  updateDots();

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      const target = sections[idx];
      if (target) {
        if (lenisInstance) {
          lenisInstance.scrollTo(target);
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

/* ==============================================================================
   4. GALLERY LIGHTBOX & EVENTS FILTER
   ============================================================================== */
function initGalleryLightbox() {
  const overlay = document.getElementById('lightboxOverlay') || document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImage') || document.getElementById('lightboxModalImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('closeLightbox');
  const prevBtn = document.getElementById('prevLightbox');
  const nextBtn = document.getElementById('nextLightbox');

  if (!overlay || !lightboxImg) return;

  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const eventCards = Array.from(document.querySelectorAll('.event-card'));
  const allMediaItems = galleryItems.length > 0 ? galleryItems : eventCards;

  let currentIndex = 0;

  function showMediaAtIndex(idx) {
    if (idx < 0) idx = allMediaItems.length - 1;
    if (idx >= allMediaItems.length) idx = 0;
    currentIndex = idx;

    const item = allMediaItems[currentIndex];
    const img = item.querySelector('img');
    const title = item.querySelector('.event-title');
    const caption = item.getAttribute('data-caption') || (title ? title.textContent : (img ? img.alt : ''));

    if (img && lightboxImg) {
      lightboxImg.src = img.src;
      lightboxImg.alt = caption;
      if (lightboxCaption) lightboxCaption.textContent = caption;
      overlay.classList.add('active');
    }
  }

  allMediaItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      showMediaAtIndex(index);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showMediaAtIndex(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showMediaAtIndex(currentIndex + 1);
    });
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('lightbox-modal')) {
      overlay.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') overlay.classList.remove('active');
    if (e.key === 'ArrowLeft') showMediaAtIndex(currentIndex - 1);
    if (e.key === 'ArrowRight') showMediaAtIndex(currentIndex + 1);
  });
}

function initEventsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const eventCards = document.querySelectorAll('.event-card');

  if (filterBtns.length === 0 || eventCards.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      eventCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.35s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==============================================================================
   5. VISITOR INFORMATION MINIMAL UNDERLINE TABS
   ============================================================================== */
function initVisitorTabs() {
  const triggers = document.querySelectorAll('.visitor-tab-trigger');
  const panes = document.querySelectorAll('.tab-pane-content');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('data-target');

      triggers.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      trigger.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/* ==============================================================================
   6. KUNJU CHAT ASSISTANT (White with Green & Gold Accents)
   ============================================================================== */
function initKunjuChat() {
  const trigger = document.getElementById('kunjuTrigger');
  const panel = document.getElementById('kunjuChatPanel');
  const closeBtn = document.getElementById('closeKunjuChat');
  const chatBody = document.getElementById('kunjuChatBody');
  const faqTray = document.getElementById('kunjuFaqTray');

  if (!trigger || !panel) return;

  trigger.addEventListener('click', () => {
    panel.classList.toggle('active');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('active');
    });
  }

  // Official 7 FAQs from tzp-cds.com
  const kunjuFAQs = [
    {
      q: "Operating Hours & Ticket Counters",
      a: "The park loops are open from 09:00 AM to 05:00 PM daily. However, our main ticketing pass collection terminals close sharply at 04:00 PM."
    },
    {
      q: "Weekly Closed Days Schedule",
      a: "Thrissur Zoological Park remains completely closed on Mondays for regular biological habitat health-care audits and landscape upkeep."
    },
    {
      q: "Online Ticket Booking Validation",
      a: "You can book instant electronic entry passes directly via our 'Book Tickets' terminal portal page. Present the issued QR code token at our gate scanners."
    },
    {
      q: "DSLR Camera Permit Regulations",
      a: "Personal smartphones tracking clips are free! SLR or DSLR units require a custom data permit validation pass layout fee (₹350 for Still Camera & ₹750 for Video Camera)."
    },
    {
      q: "Cancellation & Refund Policy",
      a: "Bilateral booking passes can be formally cancelled up to 24 hours prior to your scheduled visit layout window. Processed refunds will experience a 10% gateway deduction and credit back to your source account within 5–7 banking operational days."
    },
    {
      q: "Eco Transport & Availability",
      a: "An electric bus operates at regular intervals inside the Park tracks to assist your journey layout bounds safely."
    },
    {
      q: "Vehicle Parking Terminal Allocation",
      a: "Our automated logistics parking bay accommodates up to 500 cars and 1000 two-wheelers. Base tariffs start at ₹50 for cars and ₹20 for motorcycles for the initial 3-hour operational block."
    }
  ];

  if (faqTray && chatBody) {
    kunjuFAQs.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'faq-chip-btn';
      btn.textContent = item.q;
      btn.addEventListener('click', () => {
        // User message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message msg-user';
        userMsg.textContent = item.q;
        chatBody.appendChild(userMsg);
        chatBody.scrollTop = chatBody.scrollHeight;
        faqTray.style.pointerEvents = 'none';

        // Kunju answer
        setTimeout(() => {
          const kunjuMsg = document.createElement('div');
          kunjuMsg.className = 'chat-message msg-kunju';
          kunjuMsg.textContent = item.a;
          chatBody.appendChild(kunjuMsg);
          faqTray.style.pointerEvents = 'auto';
          chatBody.scrollTop = chatBody.scrollHeight;
        }, 350);
      });
      faqTray.appendChild(btn);
    });
  }
}

/* ==============================================================================
   7. VIDEO MODAL PLAYER (TZP-VIDEO-NEW.mp4 lightbox)
   ============================================================================= */
function initVideoModal() {
  const triggers = document.querySelectorAll('[data-open-zoo-video]');
  const modal = document.getElementById('videoModalOverlay');
  const closeBtn = document.getElementById('closeVideoModal');
  const video = document.getElementById('zooModalVideo');

  if (!modal) return;

  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('open');
      if (video) {
        video.play().catch(e => console.log('Autoplay prevented:', e));
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    }
  });
}

/* ==============================================================================
   8. MOBILE NAVIGATION DRAWER
   ============================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const closeBtn = document.getElementById('closeMobileNav');
  const drawer = document.getElementById('mobileNavDrawer');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!drawer) return;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  links.forEach(l => l.addEventListener('click', closeDrawer));
}
