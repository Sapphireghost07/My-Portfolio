/**
 * ContactSection.js — Rainy window + paper form + cork board
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { PERSONAL } from '../data/content.js';
import { clayMat } from './Room.js';
import { applyClayImperfection } from '../utils/math.js';
import waveVert from '../shaders/wave.vert';
import waveFrag from '../shaders/wave.frag';

export function buildContact(scene) {
  const group = new THREE.Group();
  group.name = 'contact';

  // ── WINDOW ────────────────────────────────────────────────
  const windowGroup = buildWindow();
  windowGroup.position.set(0, 4, -60);
  scene.add(windowGroup);
  group.add(windowGroup);

  // ── WRITING DESK ──────────────────────────────────────────
  const writingDesk = buildWritingDesk();
  writingDesk.position.set(0, 0.92, -60);
  scene.add(writingDesk);
  group.add(writingDesk);

  // ── CORK BOARD ────────────────────────────────────────────
  const corkBoard = buildCorkBoard();
  corkBoard.position.set(0, 4.5, -60.5);
  scene.add(corkBoard);
  group.add(corkBoard);

  // ── RAIN PARTICLES ────────────────────────────────────────
  const rain = buildRain();
  rain.position.set(0, 0, -59.5);
  scene.add(rain);
  group.add(rain);

  scene.add(group);

  return { group, windowGroup, rain };
}

function buildWindow() {
  const g = new THREE.Group();

  // Frame
  const frameMat = clayMat(0x5c3d22, 0.85);
  const frameGeo = applyClayImperfection(
    new THREE.BoxGeometry(4.5, 3.5, 0.18, 6, 5, 2), 0.015, 3
  );
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.castShadow = true;
  g.add(frame);

  // Glass pane (outer)
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(3.9, 2.9),
    new THREE.MeshPhysicalMaterial({
      color: 0x224455,
      roughness: 0.05,
      metalness: 0.0,
      transmission: 0.6,
      opacity: 0.7,
      transparent: true,
    })
  );
  glass.position.z = 0.06;
  g.add(glass);

  // Night sky outside
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(3.85, 2.85),
    new THREE.MeshBasicMaterial({ color: 0x050a1a })
  );
  sky.position.z = -0.05;
  g.add(sky);

  // Cross-bar
  const hBar = new THREE.Mesh(
    new THREE.BoxGeometry(4.0, 0.08, 0.22),
    frameMat
  );
  hBar.position.z = 0.04;
  g.add(hBar);
  const vBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 3.3, 0.22),
    frameMat
  );
  vBar.position.z = 0.04;
  g.add(vBar);

  return g;
}

function buildWritingDesk() {
  const g = new THREE.Group();

  // Surface
  const top = new THREE.Mesh(
    applyClayImperfection(new THREE.BoxGeometry(3.2, 0.12, 1.8, 8, 2, 5), 0.018, 3),
    clayMat(0x6d4c2a, 0.85)
  );
  top.castShadow = true;
  top.receiveShadow = true;
  g.add(top);

  // Legs
  [[-1.4, -0.78], [-1.4, 0.78], [1.4, -0.78], [1.4, 0.78]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(
      applyClayImperfection(new THREE.CylinderGeometry(0.06, 0.07, 0.9, 8), 0.01, 5),
      clayMat(0x5c3d22, 0.88)
    );
    leg.position.set(x, -0.51, z);
    leg.castShadow = true;
    g.add(leg);
  });

  return g;
}

function buildCorkBoard() {
  const g = new THREE.Group();

  // Cork backing
  const cork = new THREE.Mesh(
    applyClayImperfection(new THREE.BoxGeometry(4.5, 2.2, 0.08, 8, 5, 2), 0.015, 3),
    new THREE.MeshPhysicalMaterial({ color: 0xc19a6b, roughness: 0.95, metalness: 0 })
  );
  cork.receiveShadow = true;
  g.add(cork);

  // Frame
  const frameMat = clayMat(0x5c3d22, 0.88);
  [
    [4.5, 0.1, 0, 1.1, 0],    // top
    [4.5, 0.1, 0, -1.1, 0],   // bottom
    [0.1, 2.2, -2.25, 0, 0],  // left
    [0.1, 2.2,  2.25, 0, 0],  // right
  ].forEach(([w, h, x, y, _]) => {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.1),
      frameMat
    );
    bar.position.set(x, y, 0.01);
    g.add(bar);
  });

  // Social link cards (pins)
  const links = [
    { label: 'Email', color: 0xff6b6b, url: `mailto:${PERSONAL.email}` },
    { label: 'LinkedIn', color: 0x0077b5, url: PERSONAL.linkedin },
    { label: 'GitHub', color: 0x333333, url: PERSONAL.github },
    { label: 'Resume', color: 0xffb347, url: PERSONAL.resume },
  ];

  links.forEach((link, i) => {
    const card = new THREE.Mesh(
      applyClayImperfection(new THREE.BoxGeometry(0.85, 0.55, 0.015, 4, 3, 1), 0.008, 6),
      clayMat(0xfff8e7, 0.9)
    );
    card.position.set(-1.5 + i * 1.0, 0.2, 0.05);
    card.rotation.z = (Math.random() - 0.5) * 0.1;
    card.userData.url = link.url;
    card.userData.label = link.label;

    // Pin
    const pin = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshPhysicalMaterial({ color: link.color, roughness: 0.4 })
    );
    pin.position.set(card.position.x, card.position.y + 0.25, 0.09);
    g.add(pin);
    g.add(card);
  });

  return g;
}

function buildRain() {
  const count = 300;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 4.2;
    pos[i * 3 + 1] = (Math.random() * 3.5);
    pos[i * 3 + 2] = 0.08;
    vel[i] = 0.04 + Math.random() * 0.03;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0x6699cc,
    transparent: true,
    opacity: 0.45,
    sizeAttenuation: false,
  });

  const rain = new THREE.Points(geo, mat);
  return rain;
}

export function animateRain(rain, elapsed) {
  if (!rain) return;
  const pos = rain.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, pos.getY(i) - 0.025 - Math.sin(elapsed + i) * 0.002);
    pos.setX(i, pos.getX(i) + 0.003);
    if (pos.getY(i) < -1.5) {
      pos.setY(i, 1.8);
      pos.setX(i, (Math.random() - 0.5) * 4.2);
    }
  }
  pos.needsUpdate = true;
}
