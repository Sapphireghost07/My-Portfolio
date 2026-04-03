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

// Three.js state (declared early so theme code can reference threeReady)
let renderer, scene, camera, clock;
let starsPoints, nebulaPoints, tubePoints;
let shape1, shape2, shape3, shape4;
let threeReady = false;
let rafId;

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
  if (threeReady) updateSceneColors();
};

// One-time migration: clear stale theme from old portfolio version
const MIGRATION_KEY = 'sab-v2-migrated';
if (!localStorage.getItem(MIGRATION_KEY)) {
  localStorage.removeItem(THEME_KEY);
  localStorage.setItem(MIGRATION_KEY, '1');
}

const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  // Default: dark theme for full 3D immersion
  applyTheme('dark');
}

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    applyTheme(bodyEl.classList.contains('light') ? 'dark' : 'light');
  });
}

// ─────────────────────────────────────────────────────────────
// THREE.JS — GALAXY SCENE
// ─────────────────────────────────────────────────────────────

// Scroll-tracked camera targets
let targetCamZ  = 4;
let targetCamX  = 0;
let targetCamY  = 0;
let currentCamZ = 4;
let currentCamX = 0;
let currentCamY = 0;

// Mouse
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

  const W = window.innerWidth;
  const H = window.innerHeight;
  const colors = getSceneColors();

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(colors.bg, 1);

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(colors.fog, 0.018);

  // Camera — starts at z=4, will fly backward as user scrolls
  camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 200);
  camera.position.set(0, 0, 4);

  clock = new THREE.Clock();

  // ── STAR TUNNEL ─────────────────────────────────────
  // Arrange 4000 stars in a long cylindrical tunnel from z=+10 to z=-80
  const STAR_COUNT = 4000;
  const posArr  = new Float32Array(STAR_COUNT * 3);
  const colArr  = new Float32Array(STAR_COUNT * 3);
  const c1 = new THREE.Color(colors.stars);
  const c2 = new THREE.Color(colors.stars2);
  const c3 = new THREE.Color(colors.stars3);
  const pal = [c1, c2, c3];

  for (let i = 0; i < STAR_COUNT; i++) {
    // Cylinder distribution
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 22;
    posArr[i * 3]     = Math.cos(angle) * radius;
    posArr[i * 3 + 1] = Math.sin(angle) * radius + (Math.random() - 0.5) * 8;
    posArr[i * 3 + 2] = 8 - Math.random() * 90; // stretch along Z

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

  // ── DISTANT NEBULA CLOUD ─────────────────────────────
  const NEB_COUNT = 800;
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

  // ── WIREFRAME SHAPES along the Z tunnel ──────────────
  // Each shape sits at a different Z depth, at the camera waypoints

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

// ── UPDATE when theme changes ──────────────────────────────
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

// ── ANIMATION LOOP ─────────────────────────────────────────
function ticker() {
  rafId = requestAnimationFrame(ticker);
  if (!renderer || !scene || !camera) return;

  const t = clock.getElapsedTime();

  // Smooth camera Z (flying-through effect)
  currentCamZ = lerp(currentCamZ, targetCamZ, 0.04);
  currentCamX = lerp(currentCamX, targetCamX + mouseNX * 2.5, 0.04);
  currentCamY = lerp(currentCamY, targetCamY + mouseNY * 1.5, 0.04);

  camera.position.set(currentCamX, currentCamY, currentCamZ);
  camera.lookAt(currentCamX * 0.3, currentCamY * 0.3, currentCamZ - 10);

  // Rotate star field slowly
  if (starsPoints) {
    starsPoints.rotation.z = t * 0.01;
  }

  // Animate shapes
  if (shape1) { shape1.rotation.x = t * 0.25; shape1.rotation.y = t * 0.18; }
  if (shape2) { shape2.rotation.y = t * 0.3;  shape2.rotation.z = t * 0.15; shape2.position.y = -1 + Math.sin(t * 0.7) * 0.7; }
  if (shape3) { shape3.rotation.x = t * 0.35; shape3.rotation.y = t * 0.22; shape3.position.y = -2 + Math.cos(t * 0.5) * 0.5; }
  if (shape4) { shape4.rotation.x = t * 0.2;  shape4.rotation.z = t * 0.12; }

  renderer.render(scene, camera);
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

  // Progress bar
  if (progressBar) progressBar.style.width = `${progress * 100}%`;

  // Camera Z target from active section
  const activeId = getActiveSectionId();
  if (SECTION_CAM_Z[activeId] !== undefined) {
    targetCamZ = SECTION_CAM_Z[activeId];
  }

  // Dots
  dots.forEach((d) => {
    d.classList.toggle('active', d.dataset.target === activeId);
  });

  // Reveal scroll animations
  revealAll();

  // Top nav shadow
  const nav = $('#topNav');
  if (nav) nav.style.boxShadow = scrollY > 40 ? '0 4px 40px rgba(0,0,30,0.5)' : '';
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

// Force hero elements visible immediately (they're in viewport on load)
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
// SMOOTH ANCHOR SCROLL (side/top nav)
// ─────────────────────────────────────────────────────────────
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ─────────────────────────────────────────────────────────────
// 3D TILT ON CARDS
// ─────────────────────────────────────────────────────────────
function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return; // skip on touch

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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
  };
  const shut = () => { modal.hidden = true; bodyEl.style.overflow = ''; };

  thumb.addEventListener('dblclick', open);
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
  // Safety: fully remove it from layout after transition
  setTimeout(() => { if (pre) pre.style.display = 'none'; }, 700);
}

// ─────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────
function boot() {
  // Hide preloader first so content is visible
  hidePreloader();

  // Reveal hero content immediately (it's already in viewport)
  revealHero();

  // Start observing all other reveal elements
  revealAll();

  // Three.js scene
  if (typeof THREE !== 'undefined') {
    buildThreeScene();
  }

  initCardTilt();
  initPillTilt();
  initTyping();
  initAwardModal();
  onScroll();
}

// Run on DOMContentLoaded; also try immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// Belt-and-suspenders: also on window load
window.addEventListener('load', hidePreloader);
