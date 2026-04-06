/**
 * RoomProps.js — All clay furniture: desk, computer, mug, vinyl, lamps etc.
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { applyClayImperfection, randRange } from '../utils/math.js';
import { clayMat } from './Room.js';

// ── DESK ────────────────────────────────────────────────────
export function buildDesk(scene) {
  const group = new THREE.Group();
  group.name = 'desk';

  // Desk surface
  const topGeo = applyClayImperfection(
    new THREE.BoxGeometry(5.5, 0.18, 2.8, 8, 2, 6), 0.02, 4
  );
  const top = new THREE.Mesh(topGeo, clayMat(0x5c3d22, 0.82));
  top.position.y = 0.09;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // Legs (4, slightly uneven)
  const legHeights = [0.85, 0.84, 0.87, 0.85];
  const legPos = [[-2.4, -2.4, 2.4, 2.4], [1, 1.1, 0.9, 1.05]];
  const legXZ = [[-2.5, -2.5, 2.5, 2.5], [-1.2, 1.2, -1.2, 1.2]];
  for (let i = 0; i < 4; i++) {
    const h = legHeights[i];
    const geo = applyClayImperfection(
      new THREE.CylinderGeometry(0.08, 0.09, h, 8), 0.01, 6
    );
    const leg = new THREE.Mesh(geo, clayMat(0x4a3018, 0.88));
    leg.position.set(legXZ[0][i], -h / 2, legXZ[1][i]);
    leg.castShadow = true;
    group.add(leg);
  }

  group.position.set(-0.5, 0.95, -3);
  scene.add(group);
  return group;
}

// ── RETRO COMPUTER (hero object) ─────────────────────────────
export function buildComputer(scene) {
  const group = new THREE.Group();
  group.name = 'computer';

  // Monitor body (clay mac-style)
  const bodyGeo = applyClayImperfection(
    new THREE.BoxGeometry(1.8, 1.9, 0.85, 6, 6, 4), 0.025, 3
  );
  const body = new THREE.Mesh(bodyGeo, clayMat(0xd4c5a9, 0.85));
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Screen bezel
  const screenBezel = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.15, 0.05),
    clayMat(0x1a1a1a, 0.6)
  );
  screenBezel.position.set(0, 0.2, 0.46);
  group.add(screenBezel);

  // Screen surface (RectAreaLight will be placed here)
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.28, 1.05),
    new THREE.MeshStandardMaterial({ color: 0x002200, roughness: 0.1 })
  );
  screen.name = 'computerScreen';
  screen.position.set(0, 0.2, 0.49);
  group.add(screen);

  // Keyboard
  const kbGeo = applyClayImperfection(
    new THREE.BoxGeometry(2.1, 0.06, 0.72, 8, 2, 4), 0.01, 5
  );
  const keyboard = new THREE.Mesh(kbGeo, clayMat(0xc8b99a, 0.9));
  keyboard.position.set(0, -0.97, 1.2);
  keyboard.castShadow = true;
  group.add(keyboard);

  // Small key bumps on keyboard
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 10; c++) {
      const key = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.04, 0.12),
        clayMat(0xbcae94, 0.95)
      );
      key.position.set(-0.85 + c * 0.19, -0.93, 0.98 + r * 0.15);
      group.add(key);
    }
  }

  // Mouse
  const mouseGeo = applyClayImperfection(
    new THREE.CapsuleGeometry(0.12, 0.25, 6, 8), 0.015, 4
  );
  const mouse = new THREE.Mesh(mouseGeo, clayMat(0xc8b99a, 0.88));
  mouse.rotation.x = Math.PI / 2;
  mouse.position.set(1.3, -0.96, 0.9);
  mouse.castShadow = true;
  group.add(mouse);

  // Base / stand
  const standGeo = applyClayImperfection(
    new THREE.BoxGeometry(0.5, 0.15, 0.6, 4, 2, 4), 0.015, 5
  );
  const stand = new THREE.Mesh(standGeo, clayMat(0xc0b090, 0.9));
  stand.position.set(0, -0.97, 0.0);
  group.add(stand);

  group.position.set(0, 1.05, -4.8);
  scene.add(group);
  return group;
}

// ── COFFEE MUG ──────────────────────────────────────────────
export function buildMug(scene) {
  const group = new THREE.Group();
  group.name = 'mug';

  // Mug body
  const bodyGeo = applyClayImperfection(
    new THREE.CylinderGeometry(0.18, 0.16, 0.42, 12), 0.015, 4
  );
  const body = new THREE.Mesh(bodyGeo, clayMat(0xff6b6b, 0.8));
  body.castShadow = true;
  group.add(body);

  // Handle (torus section)
  const handleGeo = new THREE.TorusGeometry(0.13, 0.035, 8, 12, Math.PI);
  const handle = new THREE.Mesh(handleGeo, clayMat(0xff6b6b, 0.8));
  handle.rotation.y = -Math.PI / 2;
  handle.position.set(0.22, 0, 0);
  group.add(handle);

  // SAB text on mug side (simple plane with CSS above it)
  const mugInner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.14, 0.38, 10),
    new THREE.MeshStandardMaterial({ color: 0x1a0808, roughness: 0.1 })
  );
  mugInner.position.y = 0.01;
  group.add(mugInner);

  group.position.set(1.8, 1.23, -3.4);
  scene.add(group);

  // Steam particles
  const steam = buildSteam(group.position);
  scene.add(steam);

  // Hover: mug wobble
  group.userData.hover = () => {
    gsap.to(group.rotation, { z: 0.08, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
    gsap.to(group.rotation, { z: 0, duration: 0.6, delay: 0.3, ease: 'elastic.out(1, 0.4)' });
  };

  return { group, steam };
}

function buildSteam(origin) {
  const count = 60;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = origin.x + (Math.random() - 0.5) * 0.1;
    pos[i * 3 + 1] = origin.y + 0.25 + Math.random() * 0.8;
    pos[i * 3 + 2] = origin.z;
    phases[i] = Math.random() * Math.PI * 2;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0xfff8e7,
    transparent: true,
    opacity: 0.18,
    sizeAttenuation: true,
  });

  const steam = new THREE.Points(geo, mat);
  steam.name = 'steam';
  return steam;
}

// ── VINYL RECORD PLAYER ─────────────────────────────────────
export function buildVinyl(scene) {
  const group = new THREE.Group();
  group.name = 'vinyl';

  // Base
  const baseGeo = applyClayImperfection(
    new THREE.BoxGeometry(0.8, 0.1, 0.75, 6, 2, 5), 0.02, 5
  );
  const base = new THREE.Mesh(baseGeo, clayMat(0x3d2b1f, 0.85));
  base.castShadow = true;
  group.add(base);

  // Platter
  const platterGeo = applyClayImperfection(
    new THREE.CylinderGeometry(0.28, 0.28, 0.04, 24), 0.008, 6
  );
  const platter = new THREE.Mesh(platterGeo, clayMat(0x1a1a2e, 0.3));
  platter.position.set(-0.05, 0.07, 0);
  group.add(platter);

  // Record groove circles
  for (let r = 0; r < 4; r++) {
    const ringGeo = new THREE.RingGeometry(0.08 + r * 0.04, 0.09 + r * 0.04, 24);
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0x2a2a3e, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(-0.05, 0.092, 0);
    group.add(ring);
  }

  // Record label
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.041, 16),
    clayMat(0xff6b35, 0.7)
  );
  label.position.set(-0.05, 0.071, 0);
  platter.userData.spinning = true;
  group.add(label);

  // Arm
  const armGeo = new THREE.CylinderGeometry(0.015, 0.01, 0.5, 8);
  const arm = new THREE.Mesh(armGeo, clayMat(0xd4c5a9, 0.7));
  arm.rotation.z = Math.PI / 4;
  arm.position.set(0.25, 0.12, -0.1);
  group.add(arm);

  group.position.set(2.2, 1.19, -3.8);
  scene.add(group);

  // Store platter ref for animation
  group.userData.platter = platter;
  group.userData.label = label;

  return group;
}

// ── DESK LAMP ────────────────────────────────────────────────
export function buildDeskLamp(scene, onLight) {
  const group = new THREE.Group();
  group.name = 'lamp';

  // Base
  const base = new THREE.Mesh(
    applyClayImperfection(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 12), 0.01, 5),
    clayMat(0xd4c5a9, 0.8)
  );
  base.castShadow = true;
  group.add(base);

  // Arm lower
  const arm1 = new THREE.Mesh(
    applyClayImperfection(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8), 0.008, 6),
    clayMat(0xc4b59a, 0.82)
  );
  arm1.position.set(0, 0.32, 0);
  arm1.rotation.z = 0.18;
  arm1.castShadow = true;
  group.add(arm1);

  // Arm upper
  const arm2 = new THREE.Mesh(
    applyClayImperfection(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8), 0.008, 6),
    clayMat(0xc4b59a, 0.82)
  );
  arm2.position.set(0.12, 0.72, 0);
  arm2.rotation.z = -0.35;
  group.add(arm2);

  // Shade
  const shade = new THREE.Mesh(
    applyClayImperfection(new THREE.ConeGeometry(0.22, 0.28, 12), 0.015, 4),
    clayMat(0xffb347, 0.75)
  );
  shade.position.set(0.22, 1.0, 0);
  shade.rotation.z = Math.PI;
  shade.castShadow = true;
  group.add(shade);

  // Point light inside shade
  const light = new THREE.PointLight(0xffb347, 3.0, 12, 1.5);
  light.position.set(0.22, 0.9, 0);
  light.castShadow = true;
  light.shadow.mapSize.width = 512;
  light.shadow.mapSize.height = 512;
  group.add(light);

  group.position.set(-2.5, 0.95, -2.5);
  scene.add(group);

  // Return light ref for ThemeEngine
  return { group, light };
}

// ── STICKY NOTES ─────────────────────────────────────────────
export function buildStickyNotes(scene, facts) {
  const colors = [0xfff176, 0xff8a65, 0xa5d6a7, 0x90caf9, 0xce93d8];
  const notes = [];

  facts.forEach((text, i) => {
    const geo = applyClayImperfection(
      new THREE.BoxGeometry(0.55, 0.45, 0.015, 4, 4, 1), 0.008, 6
    );
    const mat = clayMat(colors[i % colors.length], 0.9);
    const note = new THREE.Mesh(geo, mat);
    note.rotation.y = (Math.random() - 0.5) * 0.3;
    note.rotation.z = (Math.random() - 0.5) * 0.12;
    note.position.set(
      -1.8 + i * 0.7 + (Math.random() - 0.5) * 0.2,
      1.22,
      -2.2 + (Math.random() - 0.5) * 0.3
    );
    note.castShadow = true;
    note.userData.text = text;
    scene.add(note);
    notes.push(note);
  });

  return notes;
}

// ── SMALL BOOKSHELF (mini on desk) ──────────────────────────
export function buildDeskBooks(scene) {
  const group = new THREE.Group();
  const colors = [0xe53935, 0x1e88e5, 0x43a047, 0xfb8c00, 0x8e24aa, 0x00acc1];
  const heights = [0.38, 0.44, 0.36, 0.42, 0.40, 0.35];

  for (let i = 0; i < 6; i++) {
    const thickness = 0.07 + Math.random() * 0.03;
    const geo = applyClayImperfection(
      new THREE.BoxGeometry(thickness, heights[i], 0.28, 3, 4, 3), 0.012, 5
    );
    const book = new THREE.Mesh(geo, clayMat(colors[i], 0.85));
    book.position.set(i * 0.09, heights[i] / 2, 0);
    book.rotation.z = (Math.random() - 0.5) * 0.06;
    book.castShadow = true;
    group.add(book);
  }

  group.position.set(-2.1, 0.95, -4.2);
  scene.add(group);
  return group;
}

// ── ANIMATE ALL PROPS ────────────────────────────────────────
export function animateProps(props, elapsed) {
  const { vinyl, steam, notes } = props;

  // Spin vinyl record
  if (vinyl?.userData.platter) {
    vinyl.userData.platter.rotation.y += 0.018;
    vinyl.userData.label.rotation.y += 0.018;
  }

  // Animate steam
  if (steam) {
    const pos = steam.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      pos.setY(i, y + 0.003);
      pos.setX(i, pos.getX(i) + Math.sin(elapsed * 2 + i) * 0.001);
      if (pos.getY(i) > props.mugPos.y + 1.0) {
        pos.setY(i, props.mugPos.y + 0.25);
      }
    }
    steam.material.opacity = 0.12 + Math.sin(elapsed * 0.8) * 0.06;
    pos.needsUpdate = true;
  }

  // Notes gentle idle sway
  if (notes) {
    notes.forEach((n, i) => {
      n.rotation.z = n.userData.baseRotZ + Math.sin(elapsed * 0.6 + i * 1.2) * 0.012;
    });
  }
}
