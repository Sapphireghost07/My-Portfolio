/**
 * SkillsSection.js — Bookshelf with clay books representing skills
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { SKILLS, BOOK_TITLES } from '../data/content.js';
import { clayMat } from './Room.js';
import { applyClayImperfection } from '../utils/math.js';

const CATEGORY_COLORS = {
  frontend: [0xe53935, 0xef5350, 0xf44336, 0xc62828, 0xff7043, 0xff8a65, 0xff5722, 0xff6e40, 0xdd2c00, 0xff3d00, 0xff6d00, 0xff9100, 0xffa726, 0xfb8c00],
  backend:  [0x1e88e5, 0x42a5f5, 0x1565c0, 0x0d47a1],
  tools:    [0x6d4c41, 0xa1887f, 0x8d6e63, 0x78909c, 0x90a4ae, 0x546e7a],
};

export function buildSkills(scene) {
  const group = new THREE.Group();
  group.name = 'skills';

  // Tall bookshelf
  const shelf = buildBookshelf();
  shelf.position.set(-4, 0, -35);
  scene.add(shelf);
  group.add(shelf);

  // Books for each skill group
  const allSkills = SKILLS.slice(0, 18); // limit for visual clarity
  const books = allSkills.map((skill, i) => {
    const book = buildSkillBook(skill, i);
    const row = Math.floor(i / 6);
    const col = i % 6;

    book.position.set(
      -2.5 + col * 0.62,
      1.1 + row * 1.35,
      -34.88
    );
    book.userData.shelfPos = book.position.clone();
    scene.add(book);
    group.add(book);
    return book;
  });

  // Idle sway
  books.forEach((b, i) => {
    gsap.to(b.rotation, {
      z: (Math.random() - 0.5) * 0.04,
      duration: 2 + i * 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  });

  // Cactus on shelf
  const cactus = buildCactus();
  cactus.position.set(-3.5, 2.2, -34.5);
  scene.add(cactus);
  group.add(cactus);

  // Cassette tape
  const cassette = buildCassette();
  cassette.position.set(-2.8, 0.85, -34.5);
  scene.add(cassette);
  group.add(cassette);

  scene.add(group);
  return { group, books };
}

function buildBookshelf() {
  const g = new THREE.Group();

  // Back panel
  const back = new THREE.Mesh(
    applyClayImperfection(new THREE.BoxGeometry(6, 4, 0.12, 8, 6, 2), 0.02, 3),
    clayMat(0x4a3018, 0.88)
  );
  back.position.z = -0.06;
  back.receiveShadow = true;
  g.add(back);

  // Shelves (3 horizontal)
  for (let shelf = 0; shelf < 3; shelf++) {
    const s = new THREE.Mesh(
      applyClayImperfection(new THREE.BoxGeometry(6, 0.1, 0.5, 8, 2, 4), 0.015, 4),
      clayMat(0x5c3d22, 0.85)
    );
    s.position.y = 0.8 + shelf * 1.35;
    s.castShadow = true;
    s.receiveShadow = true;
    g.add(s);
  }

  // Side panels
  [-3, 3].forEach(x => {
    const side = new THREE.Mesh(
      applyClayImperfection(new THREE.BoxGeometry(0.12, 4.2, 0.55, 2, 6, 4), 0.015, 4),
      clayMat(0x4a3018, 0.88)
    );
    side.position.x = x;
    side.castShadow = true;
    g.add(side);
  });

  return g;
}

function buildSkillBook(skill, idx) {
  const catColors = CATEGORY_COLORS[skill.category] || CATEGORY_COLORS.tools;
  const color = catColors[idx % catColors.length];
  const height = 0.55 + (skill.level / 100) * 0.5; // height ∝ skill level

  const g = new THREE.Group();
  g.name = `book-${skill.name}`;
  g.userData.skill = skill;
  g.userData.isOut = false;

  const geo = applyClayImperfection(
    new THREE.BoxGeometry(0.1 + Math.random() * 0.04, height, 0.36, 3, 5, 4), 0.018, 5
  );
  const book = new THREE.Mesh(geo, clayMat(color, 0.85));
  book.castShadow = true;
  book.receiveShadow = true;
  g.add(book);

  // Spine highlight
  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(0.002, height * 0.6, 0.34),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, opacity: 0.2, transparent: true })
  );
  spine.position.set(0.052, 0, 0);
  g.add(spine);

  // Hover: tilt forward
  g.userData.onHover = () => {
    gsap.to(g.rotation, { x: -0.35, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  };
  g.userData.onUnhover = () => {
    if (!g.userData.isOut) {
      gsap.to(g.rotation, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    }
  };
  // Click: pull out / push back
  g.userData.onClick = (overlay) => {
    if (g.userData.isOut) {
      gsap.to(g.position, { z: g.userData.shelfPos.z, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      gsap.to(g.rotation, { x: 0, duration: 0.5 });
      g.userData.isOut = false;
      overlay?.hide();
    } else {
      gsap.to(g.position, { z: g.userData.shelfPos.z + 0.4, duration: 0.5, ease: 'power2.out' });
      g.userData.isOut = true;
      overlay?.show(skill);
    }
  };

  return g;
}

function buildCactus() {
  const g = new THREE.Group();

  // Pot
  const pot = new THREE.Mesh(
    applyClayImperfection(new THREE.CylinderGeometry(0.14, 0.1, 0.22, 10), 0.015, 5),
    new THREE.MeshPhysicalMaterial({ color: 0xe05a5a, roughness: 0.85, metalness: 0 })
  );
  pot.position.y = 0.11;
  g.add(pot);

  // Soil
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.04, 10),
    new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.95 })
  );
  soil.position.y = 0.23;
  g.add(soil);

  // Main stem
  const stem = new THREE.Mesh(
    applyClayImperfection(new THREE.CylinderGeometry(0.07, 0.075, 0.4, 8), 0.02, 4),
    new THREE.MeshPhysicalMaterial({ color: 0x4caf50, roughness: 0.8, metalness: 0 })
  );
  stem.position.y = 0.45;
  g.add(stem);

  // Arms
  [-0.12, 0.12].forEach((x, i) => {
    const arm = new THREE.Mesh(
      applyClayImperfection(new THREE.CylinderGeometry(0.045, 0.05, 0.22, 8), 0.015, 4),
      new THREE.MeshPhysicalMaterial({ color: 0x388e3c, roughness: 0.82, metalness: 0 })
    );
    arm.position.set(x, 0.52 + i * 0.04, 0);
    arm.rotation.z = x > 0 ? Math.PI / 4 : -Math.PI / 4;
    g.add(arm);
  });

  return g;
}

function buildCassette() {
  const g = new THREE.Group();

  const body = new THREE.Mesh(
    applyClayImperfection(new THREE.BoxGeometry(0.36, 0.22, 0.08, 4, 3, 2), 0.01, 6),
    clayMat(0x1a237e, 0.8)
  );
  g.add(body);

  // Reels
  for (let dx of [-0.09, 0.09]) {
    const reel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.084, 12),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5 })
    );
    reel.rotation.x = Math.PI / 2;
    reel.position.set(dx, 0.03, 0);
    g.add(reel);
  }

  // Label
  const label = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.1, 0.082),
    clayMat(0xffd54f, 0.9)
  );
  label.position.y = -0.04;
  g.add(label);

  return g;
}
