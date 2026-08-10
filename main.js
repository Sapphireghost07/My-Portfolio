/* ═══════════════════════════════════════════════════════════
   3D IMMERSIVE PORTFOLIO — main.js
   Three.js Galaxy + Scroll-Driven Camera + All Interactions
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = 'ontouchstart' in window;
const isSmallScreen = window.innerWidth < 720;

// Three.js state
let renderer, scene, camera, clock;
let starsPoints, nebulaPoints, tubePoints;
let shape1, shape2, shape3, shape4;
let threeReady = false;
let rafId;
let tabHidden = false;

// ─────────────────────────────────────────────────────────────
// YEAR
// ─────────────────────────────────────────────────────────────
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────
const THEME_KEY = 'sab-theme';
const bodyEl = document.body;
const themeBtn = $('#themeToggle');

const applyTheme = (mode) => {
  bodyEl.classList.toggle('light', mode === 'light');
  localStorage.setItem(THEME_KEY, mode);
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', mode === 'light' ? 'true' : 'false');
    themeBtn.setAttribute('aria-label', mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }
  if (threeReady) updateSceneColors();
};

const MIGRATION_KEY = 'sab-v2-migrated';
if (!localStorage.getItem(MIGRATION_KEY)) {
  localStorage.removeItem(THEME_KEY);
  localStorage.setItem(MIGRATION_KEY, '1');
}

const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme || 'dark');

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    applyTheme(bodyEl.classList.contains('light') ? 'dark' : 'light');
  });
}

// ─────────────────────────────────────────────────────────────
// THREE.JS — GALAXY SCENE
// ─────────────────────────────────────────────────────────────
let targetCamZ  = 4;
let targetCamX  = 0;
let targetCamY  = 0;
let currentCamZ = 4;
let currentCamX = 0;
let currentCamY = 0;

let mouseNX = 0, mouseNY = 0;

const SECTION_CAM_Z = {
  hero:           4,
  skills:        -2,
  experience:    -8,
  projects:      -14,
  education:     -20,
  certifications:-24,
  awards:        -28,
};

function getSceneColors() {
  const light = bodyEl.classList.contains('light');
  return {
    bg:       light ? 0xe8f4fd : 0x03071a,
    fog:      light ? 0xe8f4fd : 0x03071a,
    stars:    light ? 0x0284c7 : 0x00c8ff,
    stars2:   light ? 0x7c3aed : 0x8b5cf6,
    stars3:   light ? 0x059669 : 0x10b981,
    nebula:   light ? 0x90cdf4 : 0x00547a,
    nebula2:  light ? 0xc4b5fd : 0x3b206b,
    wire1:    light ? 0x0284c7 : 0x00c8ff,
    wire2:    light ? 0x7c3aed : 0x8b5cf6,
    wire3:    light ? 0x059669 : 0x10b981,
    wire4:    light ? 0xf59e0b : 0xf59e0b,
  };
}

function buildThreeScene() {
  const canvas = $('#bg3d');
  if (!canvas || typeof THREE === 'undefined') return;
  // Respect reduced-motion: skip the heavy flying-camera galaxy entirely.
  if (prefersReducedMotion()) return;

  const W = window.innerWidth;
  const H = window.innerHeight;
  const colors = getSceneColors();

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmallScreen ? 1.5 : 2));
  renderer.setSize(W, H);
  renderer.setClearColor(colors.bg, 1);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(colors.fog, 0.018);

  camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 200);
  camera.position.set(0, 0, 4);

  clock = new THREE.Clock();

  // Fewer stars on small/touch screens to keep things smooth.
  const STAR_COUNT = isSmallScreen ? 1600 : 4000;
  const posArr  = new Float32Array(STAR_COUNT * 3);
  const colArr  = new Float32Array(STAR_COUNT * 3);
  const c1 = new THREE.Color(colors.stars);
  const c2 = new THREE.Color(colors.stars2);
  const c3 = new THREE.Color(colors.stars3);
  const pal = [c1, c2, c3];

  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 22;
    posArr[i * 3]     = Math.cos(angle) * radius;
    posArr[i * 3 + 1] = Math.sin(angle) * radius + (Math.random() - 0.5) * 8;
    posArr[i * 3 + 2] = 8 - Math.random() * 90;

    const c = pal[Math.floor(Math.random() * pal.length)];
    colArr[i * 3]     = c.r;
    colArr[i * 3 + 1] = c.g;
    colArr[i * 3 + 2] = c.b;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  starGeo.setAttribute('color',    new THREE.BufferAttribute(colArr, 3));

  const starMat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    opacity: bodyEl.classList.contains('light') ? 0.55 : 0.95,
    sizeAttenuation: true,
  });

  starsPoints = new THREE.Points(starGeo, starMat);
  scene.add(starsPoints);

  const NEB_COUNT = isSmallScreen ? 350 : 800;
  const nPos = new Float32Array(NEB_COUNT * 3);
  const nCol = new Float32Array(NEB_COUNT * 3);
  const nc1 = new THREE.Color(colors.nebula);
  const nc2 = new THREE.Color(colors.nebula2);

  for (let i = 0; i < NEB_COUNT; i++) {
    nPos[i * 3]     = (Math.random() - 0.5) * 60;
    nPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
    nPos[i * 3 + 2] = -30 - Math.random() * 40;

    const c = Math.random() > 0.5 ? nc1 : nc2;
    nCol[i * 3]     = c.r;
    nCol[i * 3 + 1] = c.g;
    nCol[i * 3 + 2] = c.b;
  }

  const nebGeo = new THREE.BufferGeometry();
  nebGeo.setAttribute('position', new THREE.BufferAttribute(nPos, 3));
  nebGeo.setAttribute('color',    new THREE.BufferAttribute(nCol, 3));

  nebulaPoints = new THREE.Points(nebGeo, new THREE.PointsMaterial({
    size: 0.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.25,
  }));
  scene.add(nebulaPoints);

  const mkWire = (geo, color, x, y, z, name) => {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: bodyEl.classList.contains('light') ? 0.25 : 0.2,
    }));
    m.position.set(x, y, z);
    m.name = name;
    scene.add(m);
    return m;
  };

  shape1 = mkWire(new THREE.TorusKnotGeometry(1.6, 0.45, 128, 16), colors.wire1,  5, 1.5, -2,  'shape1');
  shape2 = mkWire(new THREE.IcosahedronGeometry(1.4, 0),           colors.wire2, -5, -1,  -8,  'shape2');
  shape3 = mkWire(new THREE.OctahedronGeometry(1.2, 0),            colors.wire3,  4, -2,  -14, 'shape3');
  shape4 = mkWire(new THREE.TorusGeometry(1.5, 0.4, 16, 80),       colors.wire4, -4,  2,  -22, 'shape4');

  threeReady = true;
  ticker();
}

function updateSceneColors() {
  if (!scene) return;
  const colors = getSceneColors();
  renderer.setClearColor(colors.bg, 1);
  if (scene.fog) scene.fog.color.set(colors.fog);
  if (starsPoints) {
    starsPoints.material.opacity = bodyEl.classList.contains('light') ? 0.55 : 0.95;
  }
  [
    { obj: shape1, col: colors.wire1 },
    { obj: shape2, col: colors.wire2 },
    { obj: shape3, col: colors.wire3 },
    { obj: shape4, col: colors.wire4 },
  ].forEach(({ obj, col }) => {
    if (obj) {
      obj.material.color.set(col);
      obj.material.opacity = bodyEl.classList.contains('light') ? 0.25 : 0.2;
    }
  });
}

function ticker() {
  rafId = requestAnimationFrame(ticker);
  if (!renderer || !scene || !camera || tabHidden) return;

  const t = clock.getElapsedTime();

  currentCamZ = lerp(currentCamZ, targetCamZ, 0.04);
  currentCamX = lerp(currentCamX, targetCamX + mouseNX * 2.5, 0.04);
  currentCamY = lerp(currentCamY, targetCamY + mouseNY * 1.5, 0.04);

  camera.position.set(currentCamX, currentCamY, currentCamZ);
  camera.lookAt(currentCamX * 0.3, currentCamY * 0.3, currentCamZ - 10);

  if (starsPoints) {
    starsPoints.rotation.z = t * 0.01;
  }

  if (shape1) { shape1.rotation.x = t * 0.25; shape1.rotation.y = t * 0.18; }
  if (shape2) { shape2.rotation.y = t * 0.3;  shape2.rotation.z = t * 0.15; shape2.position.y = -1 + Math.sin(t * 0.7) * 0.7; }
  if (shape3) { shape3.rotation.x = t * 0.35; shape3.rotation.y = t * 0.22; shape3.position.y = -2 + Math.cos(t * 0.5) * 0.5; }
  if (shape4) { shape4.rotation.x = t * 0.2;  shape4.rotation.z = t * 0.12; }

  renderer.render(scene, camera);
}

// Pause the render loop when the tab is backgrounded — saves battery/CPU.
document.addEventListener('visibilitychange', () => {
  tabHidden = document.hidden;
});

// ─────────────────────────────────────────────────────────────
// AMBIENT PARTICLE FIELD (2D canvas) — lightweight, foreground layer
// ─────────────────────────────────────────────────────────────
function initParticleField() {
  const canvas = $('#particles');
  if (!canvas || prefersReducedMotion()) {
    if (canvas) canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let W, H, dpr;
  let particles = [];
  const COUNT = isSmallScreen ? 28 : 60;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.6 + Math.random() * 1.8,
      speedY: 0.08 + Math.random() * 0.22,
      drift: (Math.random() - 0.5) * 0.15,
      alpha: 0.15 + Math.random() * 0.35,
      hue: Math.random() > 0.5 ? '0,200,255' : '167,139,250',
    };
  }

  function seed() {
    particles = Array.from({ length: COUNT }, makeParticle);
  }

  function draw() {
    if (tabHidden) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, W, H);
    const light = bodyEl.classList.contains('light');
    for (const p of particles) {
      p.y -= p.speedY;
      p.x += p.drift;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.hue},${light ? p.alpha * 0.6 : p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  seed();
  draw();

  window.addEventListener('resize', () => {
    resize();
  }, { passive: true });
}

// ─────────────────────────────────────────────────────────────
// CURSOR GLOW — follows the pointer, fades in/out
// ─────────────────────────────────────────────────────────────
function initCursorGlow() {
  const glow = $('#cursorGlow');
  if (!glow || isTouch || prefersReducedMotion()) return;

  let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
  let tx = gx, ty = gy;
  let active = false;
  let hideTimer = null;

  function raf() {
    gx = lerp(gx, tx, 0.15);
    gy = lerp(gy, ty, 0.15);
    glow.style.transform = `translate(${gx - 160}px, ${gy - 160}px)`;
    requestAnimationFrame(raf);
  }
  raf();

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!active) {
      active = true;
      glow.classList.add('active');
    }
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      active = false;
      glow.classList.remove('active');
    }, 2200);
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    active = false;
    glow.classList.remove('active');
  });
}

// ─────────────────────────────────────────────────────────────
// MOBILE MENU
// ─────────────────────────────────────────────────────────────
function initMobileMenu() {
  const btn = $('#menuToggle');
  const menu = $('#mobileMenu');
  if (!btn || !menu) return;

  const openMenu = () => {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    bodyEl.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    bodyEl.style.overflow = '';
  };

  btn.addEventListener('click', () => {
    if (menu.hidden) openMenu(); else closeMenu();
  });

  $$('#mobileMenu a').forEach((a) => {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { closeMenu(); btn.focus(); }
  });

  // Close automatically if resized past the mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 960 && !menu.hidden) closeMenu();
  }, { passive: true });
}

// ─────────────────────────────────────────────────────────────
// SCROLL — Camera Z + progress bar + reveals + active dot
// ─────────────────────────────────────────────────────────────
const progressBar = $('#scrollProgress');
const sections    = $$('section[id]');
const dots        = $$('.dot');

function getActiveSectionId() {
  let best = sections[0]?.id || 'hero';
  for (const sec of sections) {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.5) best = sec.id;
  }
  return best;
}

function onScroll() {
  const scrollY   = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress  = clamp(scrollY / maxScroll, 0, 1);

  if (progressBar) progressBar.style.width = `${progress * 100}%`;

  const activeId = getActiveSectionId();
  if (SECTION_CAM_Z[activeId] !== undefined) {
    targetCamZ = SECTION_CAM_Z[activeId];
  }

  dots.forEach((d) => {
    const isActive = d.dataset.target === activeId;
    d.classList.toggle('active', isActive);
    if (isActive) d.setAttribute('aria-current', 'true');
    else d.removeAttribute('aria-current');
  });

  revealAll();

  const nav = $('#topNav');
  if (nav) nav.classList.toggle('nav-scrolled', scrollY > 40);
}

window.addEventListener('scroll', onScroll, { passive: true });

// ─────────────────────────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────────────────────────
const revealEls = $$('.reveal-up, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

function revealAll() {
  revealEls.forEach((el) => {
    if (!el.classList.contains('visible')) revealObserver.observe(el);
  });
}

function revealHero() {
  $$('#hero .reveal-up, #hero .reveal-left, #hero .reveal-right').forEach((el) => {
    el.classList.add('visible');
  });
}

revealAll();

// ─────────────────────────────────────────────────────────────
// MOUSE PARALLAX
// ─────────────────────────────────────────────────────────────
window.addEventListener('mousemove', (e) => {
  mouseNX = (e.clientX / window.innerWidth  - 0.5);
  mouseNY = (e.clientY / window.innerHeight - 0.5) * -1;
}, { passive: true });

// ─────────────────────────────────────────────────────────────
// RESIZE
// ─────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  if (!renderer || !camera) return;
  const W = window.innerWidth;
  const H = window.innerHeight;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
}, { passive: true });

// ─────────────────────────────────────────────────────────────
// LENIS SMOOTH SCROLLING
// ─────────────────────────────────────────────────────────────
let lenisInstance = null;

function initLenis() {
  if (typeof Lenis === 'undefined') return;
  if (prefersReducedMotion()) return;

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// ─────────────────────────────────────────────────────────────
// SMOOTH ANCHOR SCROLL (side/top nav)
// ─────────────────────────────────────────────────────────────
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    if (lenisInstance) {
      lenisInstance.scrollTo(target, { duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  });
});

// ─────────────────────────────────────────────────────────────
// 3D TILT ON CARDS
// ─────────────────────────────────────────────────────────────
function initCardTilt() {
  if (prefersReducedMotion() || isTouch) return;

  $$('.card-3d').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r   = card.getBoundingClientRect();
      const dx  = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy  = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(900px) rotateX(${dy * -5}deg) rotateY(${dx * 7}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ─────────────────────────────────────────────────────────────
// PILL 3D HOVER
// ─────────────────────────────────────────────────────────────
function initPillTilt() {
  if (prefersReducedMotion() || isTouch) return;

  $$('.pill').forEach((pill) => {
    pill.addEventListener('mousemove', (e) => {
      const r  = pill.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      pill.style.transform = `perspective(300px) rotateX(${dy * -12}deg) rotateY(${dx * 16}deg) translateY(-4px) scale(1.06)`;
    });
    pill.addEventListener('mouseleave', () => { pill.style.transform = ''; });
  });
}

// ─────────────────────────────────────────────────────────────
// TYPING EFFECT
// ─────────────────────────────────────────────────────────────
function initTyping() {
  const el = $('#typingRole');
  if (!el) return;

  const roles = JSON.parse(el.dataset.roles || '[]');

  if (prefersReducedMotion()) {
    el.textContent = roles[0] || '';
    return;
  }

  let ri = 0, ci = 0, del = false;

  const tick = () => {
    const cur = roles[ri];
    el.textContent = cur.slice(0, ci);

    if (!del && ci < cur.length) { ci++; setTimeout(tick, 85); }
    else if (del && ci > 0)      { ci--; setTimeout(tick, 50); }
    else {
      del = !del;
      if (!del) ri = (ri + 1) % roles.length;
      setTimeout(tick, 900);
    }
  };
  tick();
}

// ─────────────────────────────────────────────────────────────
// AWARD MODAL
// ─────────────────────────────────────────────────────────────
function initAwardModal() {
  const thumb = $('.award-thumb');
  const modal = $('#awardModal');
  const img   = $('#awardModalImage');
  const close = $('#awardModalClose');
  if (!thumb || !modal) return;

  const open = () => {
    img.src = thumb.dataset.fullSrc || thumb.src;
    img.alt = thumb.alt;
    modal.hidden = false;
    bodyEl.style.overflow = 'hidden';
    close.focus();
  };
  const shut = () => {
    modal.hidden = true;
    bodyEl.style.overflow = '';
    thumb.focus();
  };

  thumb.addEventListener('dblclick', open);
  thumb.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
  close.addEventListener('click', shut);
  modal.addEventListener('click', (e) => { if (e.target === modal) shut(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) shut(); });
}

// ─────────────────────────────────────────────────────────────
// PRELOADER
// ─────────────────────────────────────────────────────────────
function hidePreloader() {
  const pre = $('#preloader');
  if (!pre || pre.classList.contains('hidden')) return;
  pre.classList.add('hidden');
  setTimeout(() => { if (pre) pre.style.display = 'none'; }, 700);
}

// ─────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────
function boot() {
  setTimeout(hidePreloader, 700);
  ['click', 'keydown', 'scroll', 'touchstart'].forEach((e) => {
    window.addEventListener(e, hidePreloader, { once: true, passive: true });
  });
  window.addEventListener('load', hidePreloader);

  revealHero();
  revealAll();

  if (typeof THREE !== 'undefined') {
    buildThreeScene();
  }

  initLenis();
  initCardTilt();
  initPillTilt();
  initParticleField();
  initCursorGlow();
  initTyping();
  initAwardModal();
  initMobileMenu();
  onScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}