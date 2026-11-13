/**
 * Thrissur Zoological Park & Research Centre - Premium Interactive Controller
 * Features: Lenis Smooth Scroll + Watch Exploded Canvas Hero + Kunju Chat + Gallery Lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initHeroVideo();
  initNavScroll();
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
   2. CINEMATIC VIDEO HERO CONTROLLER
   ============================================================================== */
function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  const muteBtn = document.getElementById('heroMuteToggle');

  if (!video) return;

  // Autoplay handler with fallback for mobile strict policies
  const startAutoplay = () => {
    video.muted = true;
    const promise = video.play();
    if (promise !== undefined) {
      promise.catch(() => {
        // Retry playing once user taps or clicks anywhere on the page
        const resumeOnInteraction = () => {
          video.play().catch(() => {});
          document.removeEventListener('touchstart', resumeOnInteraction);
          document.removeEventListener('click', resumeOnInteraction);
        };
        document.addEventListener('touchstart', resumeOnInteraction, { passive: true, once: true });
        document.addEventListener('click', resumeOnInteraction, { once: true });
      });
    }
  };

  startAutoplay();

  // Audio mute/unmute control
  if (muteBtn) {
    const soundOnSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>`;
    const soundOffSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </svg>`;

    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      muteBtn.innerHTML = video.muted ? soundOffSvg : soundOnSvg;
      muteBtn.setAttribute('title', video.muted ? 'Unmute Sound' : 'Mute Sound');
      muteBtn.setAttribute('aria-label', video.muted ? 'Unmute Sound' : 'Mute Sound');
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

/* ==============================================================================
   9. SCROLL ADAPTIVE HEADER PILL
   ============================================================================== */
function initNavScroll() {
  const navPill = document.querySelector('.nav-pill');
  if (!navPill) return;

  const updateNav = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    if (y > 35) {
      navPill.classList.add('scrolled');
    } else {
      navPill.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', updateNav, { passive: true });
  if (typeof lenisInstance !== 'undefined' && lenisInstance) {
    lenisInstance.on('scroll', updateNav);
  }
  updateNav();
}
