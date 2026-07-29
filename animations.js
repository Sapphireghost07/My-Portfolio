/* ═══════════════════════════════════════════════════════════
   3D IMMERSIVE PORTFOLIO — animations.js
   Anime.js Timelines + Lenis Smooth Scroll + Scroll Reveals
   ═══════════════════════════════════════════════════════════ */

// Signal to inline fallback script that animations module is active
window.__animationsLoaded = true;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

function initAnimations() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasAnime = typeof window.anime !== 'undefined';

  // Setup Lenis Smooth Scroll
  initLenis();

  // Setup Cursor Glow Tracker
  initCursorGlow();

  if (hasAnime && !isReducedMotion) {
    // Enable anime immersive mode CSS selectors dynamically
    document.documentElement.dataset.immersive = 'anime';

    // 1. Character split for hero title
    splitHeroTitle();

    // 2. Preloader Exit & Hero Intro Timeline
    runIntroTimeline();

    // 3. Scroll-triggered animations for sections & cards
    initScrollReveals();

    // 4. Ambient floating orb physics
    initOrbPhysics();
  } else {
    // Fallback mode if anime.js CDN is unavailable or reduced motion is active
    document.documentElement.dataset.immersive = 'off';
    dismissPreloader();
    revealAllElementsImmediately();
  }
}

/* ─────────────────────────────────────────────────────────────
   1. LENIS SMOOTH SCROLLING
   ───────────────────────────────────────────────────────────── */
function initLenis() {
  if (typeof window.Lenis === 'undefined') return;

  const lenis = new window.Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Smooth scroll for nav anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      }
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   2. HERO TITLE CHARACTER SPLIT
   ───────────────────────────────────────────────────────────── */
function splitHeroTitle() {
  const heroNameEl = document.querySelector('.hero-name');
  if (!heroNameEl) return;

  const childNodes = Array.from(heroNameEl.childNodes);
  heroNameEl.innerHTML = '';

  childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const frag = document.createDocumentFragment();
      for (let char of text) {
        if (char === ' ') {
          frag.appendChild(document.createTextNode(' '));
        } else {
          const span = document.createElement('span');
          span.className = 'hero-char';
          span.textContent = char;
          frag.appendChild(span);
        }
      }
      heroNameEl.appendChild(frag);
    } else {
      heroNameEl.appendChild(node.cloneNode(true));
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   3. INTRO TIMELINE & PRELOADER EXIT
   ───────────────────────────────────────────────────────────── */
function runIntroTimeline() {
  const anime = window.anime;
  if (!anime) {
    dismissPreloader();
    revealAllElementsImmediately();
    return;
  }

  const preloader = document.getElementById('preloader');
  const preloaderRing = document.querySelector('.preloader-ring');
  const preloaderText = document.querySelector('.preloader-text');

  const tl = anime.timeline({
    easing: 'easeOutExpo',
  });

  // Step 1: Preloader Ring & Text Scale Out
  if (preloaderRing && preloaderText) {
    tl.add({
      targets: preloaderRing,
      scale: 1.3,
      opacity: 0,
      duration: 600,
      easing: 'easeInQuad',
    }).add({
      targets: preloaderText,
      scale: 0.8,
      opacity: 0,
      duration: 400,
      easing: 'easeInQuad',
    }, '-=400');
  }

  // Step 2: Preloader Container Fade Out
  if (preloader) {
    tl.add({
      targets: preloader,
      opacity: 0,
      duration: 700,
      complete: () => {
        preloader.classList.add('hidden');
        preloader.style.display = 'none';
      },
    }, '-=200');
  }

  // Step 3: Top Nav Brand Reveal
  tl.add({
    targets: '.nav-brand',
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 800,
  }, '-=300');

  // Step 4: Hero Photo Wrap Spin & Reveal
  tl.add({
    targets: '.hero-photo-wrap',
    opacity: [0, 1],
    scale: [0.7, 1],
    rotate: [15, 0],
    duration: 900,
    easing: 'easeOutElastic(1, .6)',
  }, '-=600');

  // Step 5: Hero Title Characters Staggered Entrance
  const heroChars = document.querySelectorAll('.hero-char');
  if (heroChars.length > 0) {
    tl.add({
      targets: heroChars,
      opacity: [0, 1],
      translateY: [40, 0],
      rotateX: [90, 0],
      duration: 800,
      delay: anime.stagger(35),
      easing: 'easeOutBack',
    }, '-=700');
  }

  // Step 6: Hero Sub, Role, Bio, Links Reveal
  tl.add({
    targets: [
      '#hero .hero-sub',
      '#hero .hero-role',
      '#hero .hero-bio',
      '#hero .hero-links',
    ],
    opacity: [0, 1],
    translateY: [25, 0],
    duration: 800,
    delay: anime.stagger(120),
  }, '-=600');

  // Step 7: Scroll Hint Reveal
  tl.add({
    targets: '.scroll-down-hint',
    opacity: [0, 0.7],
    translateY: [15, 0],
    duration: 700,
  }, '-=300');
}

/* ─────────────────────────────────────────────────────────────
   4. SCROLL REVEALS & STAGGER ANIMATIONS
   ───────────────────────────────────────────────────────────── */
function initScrollReveals() {
  const anime = window.anime;
  if (!anime) return;

  const sections = document.querySelectorAll('.content-section');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sec = entry.target;

          // Reveal standard reveal targets in section
          const revealEls = sec.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
          revealEls.forEach((el) => el.classList.add('visible'));

          // Stagger pills in skills section
          const pills = sec.querySelectorAll('.pill');
          if (pills.length > 0 && pills[0].style.opacity === '') {
            anime({
              targets: pills,
              opacity: [0, 1],
              translateY: [20, 0],
              scale: [0.9, 1],
              duration: 600,
              delay: anime.stagger(25),
              easing: 'easeOutQuad',
            });
          }

          // Stagger timeline items
          const tlCards = sec.querySelectorAll('.timeline-card');
          if (tlCards.length > 0) {
            anime({
              targets: tlCards,
              opacity: [0, 1],
              translateX: (el) => (el.closest('.reveal-left') ? [-40, 0] : [40, 0]),
              duration: 800,
              delay: anime.stagger(150),
              easing: 'easeOutCubic',
            });

            // Expand timeline progress bar
            const tlProgress = sec.querySelector('.timeline-progress');
            if (tlProgress) {
              anime({
                targets: tlProgress,
                scaleY: [0, 1],
                opacity: [0, 1],
                duration: 1200,
                easing: 'easeInOutQuad',
              });
            }
          }

          // Stagger project cards
          const projectCards = sec.querySelectorAll('.project-card');
          if (projectCards.length > 0) {
            anime({
              targets: projectCards,
              opacity: [0, 1],
              translateY: [35, 0],
              rotateX: [12, 0],
              duration: 850,
              delay: anime.stagger(120),
              easing: 'easeOutCubic',
            });

            // Tech tags stagger inside project cards
            const techTags = sec.querySelectorAll('.tech-tags span');
            if (techTags.length > 0) {
              anime({
                targets: techTags,
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 450,
                delay: anime.stagger(20, { start: 300 }),
                easing: 'easeOutBack',
              });
            }
          }

          // Stagger education cards
          const eduCards = sec.querySelectorAll('.edu-card');
          if (eduCards.length > 0) {
            anime({
              targets: eduCards,
              opacity: [0, 1],
              translateY: [30, 0],
              duration: 750,
              delay: anime.stagger(100),
              easing: 'easeOutCubic',
            });
          }

          // Stagger certification cards
          const certCards = sec.querySelectorAll('.cert-card');
          if (certCards.length > 0) {
            anime({
              targets: certCards,
              opacity: [0, 1],
              translateX: [-25, 0],
              duration: 650,
              delay: anime.stagger(80),
              easing: 'easeOutCubic',
            });
          }

          // Footer reveal
          const footer = document.querySelector('.site-footer');
          if (footer) {
            anime({
              targets: footer,
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 800,
              easing: 'easeOutQuad',
            });
          }

          observer.unobserve(sec);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  sections.forEach((sec) => observer.observe(sec));
}

/* ─────────────────────────────────────────────────────────────
   5. AMBIENT ORB PHYSICS LOOP
   ───────────────────────────────────────────────────────────── */
function initOrbPhysics() {
  const anime = window.anime;
  if (!anime) return;

  anime({
    targets: '.orb-1',
    translateX: [0, 60, -30, 0],
    translateY: [0, -40, 50, 0],
    scale: [1, 1.15, 0.9, 1],
    duration: 16000,
    loop: true,
    easing: 'easeInOutSine',
  });

  anime({
    targets: '.orb-2',
    translateX: [0, -70, 40, 0],
    translateY: [0, 50, -30, 0],
    scale: [1, 0.85, 1.1, 1],
    duration: 18000,
    loop: true,
    easing: 'easeInOutSine',
  });

  anime({
    targets: '.orb-3',
    translateX: [0, 50, -50, 0],
    translateY: [0, -30, 40, 0],
    scale: [1, 1.2, 0.95, 1],
    duration: 14000,
    loop: true,
    easing: 'easeInOutSine',
  });
}

/* ─────────────────────────────────────────────────────────────
   6. CURSOR GLOW TRACKING
   ───────────────────────────────────────────────────────────── */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let active = false;

  window.addEventListener(
    'mousemove',
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!active) {
        active = true;
        glow.classList.add('active');
      }
    },
    { passive: true }
  );

  function updateGlow() {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;

    glow.style.transform = `translate3d(${currentX - 160}px, ${currentY - 160}px, 0)`;
    requestAnimationFrame(updateGlow);
  }
  requestAnimationFrame(updateGlow);
}

/* ─────────────────────────────────────────────────────────────
   FALLBACK DISMISSAL
   ───────────────────────────────────────────────────────────── */
function dismissPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('hidden');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }
}

function revealAllElementsImmediately() {
  const els = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right, .hero-photo-wrap, .pill, .edu-card, .cert-card, .project-card, .site-footer, .nav-brand'
  );
  els.forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.classList.add('visible');
  });
}
