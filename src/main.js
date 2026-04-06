/**
 * main.js — Portfolio Boot Sequence
 * Lofi Dev Room — S Abdul Baasit
 */
import './styles/index.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import sceneManager from './core/SceneManager.js';
import scrollEngine from './core/ScrollEngine.js';
import cameraRig from './core/CameraRig.js';
import themeEngine from './core/ThemeEngine.js';
import cursor from './core/Cursor.js';
import postProcessing from './core/PostProcessing.js';

import { buildRoom, buildDustMotes, animateDust } from './sections/Room.js';
import {
  buildDesk, buildComputer, buildMug, buildVinyl,
  buildDeskLamp, buildStickyNotes, buildDeskBooks, animateProps,
} from './sections/RoomProps.js';
import { buildHero } from './sections/HeroSection.js';
import { buildProjects } from './sections/ProjectsSection.js';
import { buildSkills } from './sections/SkillsSection.js';
import { buildContact, animateRain } from './sections/ContactSection.js';

import { PERSONAL, STICKY_FACTS } from './data/content.js';
import { isPaused } from './utils/mobile.js';

gsap.registerPlugin(ScrollTrigger);

// ── PRELOADER ─────────────────────────────────────────────────
const preloader = document.getElementById('preloader');
const preloaderProgress = document.getElementById('preloaderProgress');
const preloaderText = document.getElementById('preloaderText');

let loadProgress = 0;
function setProgress(p) {
  loadProgress = p;
  if (preloaderProgress) preloaderProgress.style.width = `${p}%`;
  if (preloaderText) preloaderText.textContent = `brewing your portfolio... ${Math.round(p)}%`;
}

// ── BOOT ──────────────────────────────────────────────────────
async function boot() {
  const canvas = document.getElementById('bg3d');
  if (!canvas) return;

  setProgress(5);

  // Init core systems
  sceneManager.init(canvas);
  const { renderer, scene, camera, clock } = sceneManager;

  setProgress(15);

  // Scroll engine (must be first)
  scrollEngine.init();

  // Theme — apply before building anything visual
  themeEngine.init(renderer, scene);
  setProgress(20);

  // Build the room shell
  buildRoom(scene);
  setProgress(30);

  // Build all props
  const { group: desk } = { group: buildDesk(scene) };
  const computer = buildComputer(scene);
  const { group: mug, steam } = buildMug(scene);
  const vinyl = buildVinyl(scene);
  const { group: lamp, light: lampLight } = buildDeskLamp(scene);
  const notes = buildStickyNotes(scene, STICKY_FACTS);
  buildDeskBooks(scene);
  setProgress(45);

  // Build sections
  const hero = buildHero(scene);
  const { floppies } = buildProjects(scene);
  const { books } = buildSkills(scene);
  const { rain } = buildContact(scene);
  setProgress(60);

  // Build dust motes
  const dust = buildDustMotes(scene, 300);
  setProgress(65);

  // Lighting
  // HemisphereLight — key light for entire room, warm ceiling/cool floor
  const hemi = new THREE.HemisphereLight(0xffb347, 0x3d2b1f, 0.9);
  scene.add(hemi);

  const ambientLight = new THREE.AmbientLight(0x251808, 0.55);
  scene.add(ambientLight);

  // Window cool light
  const windowLight = new THREE.PointLight(0x4466aa, 1.2, 30, 1.0);
  windowLight.position.set(0, 5, -4);
  scene.add(windowLight);

  // Monitor glow
  const monitorLight = new THREE.PointLight(0x00ffcc, 2.5, 7, 1.5);
  monitorLight.position.set(0, 1.65, -3.8);
  scene.add(monitorLight);

  // Fill light over the desk area (warm key)
  const fillLight = new THREE.PointLight(0xffb347, 2.0, 12, 1.5);
  fillLight.position.set(0, 4.5, -2);
  scene.add(fillLight);

  // Register lights with ThemeEngine
  themeEngine.registerLights({
    lamp: lampLight,
    window: windowLight,
    ambient: ambientLight,
  });

  // Re-apply theme to set correct light intensities
  themeEngine.apply(themeEngine.current, true);
  setProgress(75);

  // Post-processing
  postProcessing.init(renderer, scene, camera);
  setProgress(82);

  // Camera rig
  cameraRig.init(camera);

  // Cursor
  cursor.init();
  setProgress(90);

  // Warm up GPU
  renderer.compile(scene, camera);
  setProgress(98);

  // Wire theme toggle button
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDay = themeEngine.current === 'light';
      themeEngine.toggle();
      postProcessing.setDay(!isDay);

      // Lamp squash animation
      gsap.to(lamp.scale, {
        y: 0.85,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => {
          gsap.to(lamp.scale, { y: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        },
      });
    });
  }

  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Nav dots
  initNavDots();

  // Side nav items
  initSideNav();

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      scrollEngine.scrollTo(target);
    });
  });

  // Raycaster for 3D hover on floppies, books
  initRaycaster(camera, scene, floppies, books);

  // Hide preloader
  setProgress(100);
  setTimeout(hidePreloader, 600);

  // ── ANIMATION LOOP ─────────────────────────────────────────
  const propState = {
    vinyl, steam, notes,
    mugPos: mug.position.clone(),
  };

  // Store base rotations for notes
  notes.forEach(n => { n.userData.baseRotZ = n.rotation.z; });

  let lastTime = 0;
  function tick(time) {
    if (isPaused()) { requestAnimationFrame(tick); return; }

    const elapsed = clock.getElapsedTime();

    // Update systems
    cursor.update();
    cameraRig.update(elapsed);
    postProcessing.update(elapsed, themeEngine.current === 'light');

    // Animate props
    animateProps(propState, elapsed);
    animateDust(dust, elapsed);

    // Animate rain in contact section
    if (themeEngine.current === 'dark') {
      animateRain(rain, elapsed);
    }

    // Monitor glow pulse
    monitorLight.intensity = 0.8 + Math.sin(elapsed * 1.5) * 0.12;

    // Render via post-processing
    postProcessing.render();

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// ── PRELOADER HIDE ─────────────────────────────────────────────
function hidePreloader() {
  if (!preloader) return;
  gsap.to(preloader, {
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    onComplete: () => {
      preloader.style.display = 'none';
    },
  });
}

// ── NAV DOTS ──────────────────────────────────────────────────
function initNavDots() {
  const dots = document.querySelectorAll('.dot');
  const sections = document.querySelectorAll('section[id]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        dots.forEach(d => d.classList.toggle('active', d.dataset.target === e.target.id));
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
  dots.forEach(d => {
    d.addEventListener('click', () => {
      const target = document.getElementById(d.dataset.target);
      if (target) scrollEngine.scrollTo(target);
    });
  });
}

// ── SIDE NAV ──────────────────────────────────────────────────
function initSideNav() {
  // Nav items handled via CSS + dots above
}

// ── RAYCASTER for 3D interactions ─────────────────────────────
function initRaycaster(camera, scene, floppies, books) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let lastHovered = null;

  // Get all interactive objects
  const allInteractive = [
    ...floppies,
    ...books,
  ];

  window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(allInteractive, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object.parent;
      if (hit !== lastHovered) {
        if (lastHovered?.userData.onUnhover) lastHovered.userData.onUnhover();
        if (hit?.userData.onHover) hit.userData.onHover();
        lastHovered = hit;
      }
    } else {
      if (lastHovered?.userData.onUnhover) lastHovered.userData.onUnhover();
      lastHovered = null;
    }
  }, { passive: true });

  window.addEventListener('click', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(allInteractive, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object.parent;
      if (hit?.userData.onClick) hit.userData.onClick();
      else if (hit?.userData.project) {
        showProjectModal(hit.userData.project);
      }
    }
  });
}

// ── PROJECT MODAL ──────────────────────────────────────────────
function showProjectModal(project) {
  const existing = document.getElementById('projectModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'projectModal';
  modal.className = 'project-modal';
  modal.innerHTML = `
    <div class="pm-inner">
      <button class="pm-close magnetic" aria-label="Close">✕</button>
      <div class="pm-window-bar">
        <span class="pm-dot red"></span>
        <span class="pm-dot yellow"></span>
        <span class="pm-dot green"></span>
        <span class="pm-title">${project.name}.exe</span>
      </div>
      <div class="pm-body">
        <h2 class="pm-name">${project.name}</h2>
        <p class="pm-sub">${project.sub}</p>
        <div class="pm-tags">
          ${project.tags.map(t => `<span class="pm-tag">${t}</span>`).join('')}
        </div>
        <ul class="pm-list">
          ${project.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
        <div class="pm-actions">
          ${project.live ? `<a href="${project.live}" target="_blank" class="pm-btn magnetic">[ LIVE DEMO ]</a>` : ''}
          ${project.source ? `<a href="${project.source}" target="_blank" class="pm-btn magnetic">[ SOURCE CODE ]</a>` : ''}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  gsap.from(modal.querySelector('.pm-inner'), {
    scale: 0.8, opacity: 0, duration: 0.5, ease: 'elastic.out(1, 0.6)',
  });

  modal.querySelector('.pm-close').addEventListener('click', () => {
    gsap.to(modal.querySelector('.pm-inner'), {
      scale: 0.8, opacity: 0, duration: 0.3,
      onComplete: () => modal.remove(),
    });
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      gsap.to(modal.querySelector('.pm-inner'), {
        scale: 0.8, opacity: 0, duration: 0.3,
        onComplete: () => modal.remove(),
      });
    }
  });
}

// Run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
