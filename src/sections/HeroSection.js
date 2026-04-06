/**
 * HeroSection.js — Room overview + name sticky note + scroll CTA
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Text } from 'troika-three-text';
import { PERSONAL, SECTION_LABELS } from '../data/content.js';
import { clayMat } from './Room.js';
import { applyClayImperfection } from '../utils/math.js';

// Use Roboto from CDN — troika-three-text works with any web font URL
const FONT_URL = 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mF71Q-guwFumKzQ.woff2';

export function buildHero(scene) {
  const group = new THREE.Group();
  group.name = 'hero';

  // ── HERO STICKY NOTE ON DESK ─────────────────────────────
  const noteGroup = new THREE.Group();

  // Note background
  const noteGeo = applyClayImperfection(
    new THREE.BoxGeometry(2.4, 1.2, 0.02, 6, 4, 1), 0.008, 5
  );
  const note = new THREE.Mesh(noteGeo, clayMat(0xfff176, 0.88));
  note.castShadow = true;
  noteGroup.add(note);

  // Name text
  const nameText = new Text();
  nameText.text = PERSONAL.name;
  nameText.font = FONT_URL;
  nameText.fontSize = 0.22;
  nameText.color = 0x2c1810;
  nameText.anchorX = 'center';
  nameText.anchorY = 'middle';
  nameText.position.set(0, 0.2, 0.02);
  nameText.sync();
  noteGroup.add(nameText);

  // Role text
  const roleText = new Text();
  roleText.text = PERSONAL.title;
  roleText.font = FONT_URL;
  roleText.fontSize = 0.1;
  roleText.color = 0x6b4c30;
  roleText.anchorX = 'center';
  roleText.anchorY = 'middle';
  roleText.position.set(0, -0.1, 0.02);
  roleText.sync();
  noteGroup.add(roleText);

  // Availability badge
  const availText = new Text();
  availText.text = '● ' + PERSONAL.availability;
  availText.font = FONT_URL;
  availText.fontSize = 0.075;
  availText.color = 0x4caf50;
  availText.anchorX = 'center';
  availText.anchorY = 'middle';
  availText.position.set(0, -0.32, 0.02);
  availText.sync();
  noteGroup.add(availText);

  noteGroup.rotation.y = -0.05;
  noteGroup.rotation.z = -0.04;
  noteGroup.position.set(-0.3, 1.25, -3.1);

  // Entry animation: fall from above + squash
  noteGroup.position.y = 4;
  noteGroup.scale.set(0.8, 0.8, 0.8);
  gsap.to(noteGroup.position, {
    y: 1.25,
    duration: 1.0,
    delay: 0.5,
    ease: 'bounce.out',
  });
  gsap.to(noteGroup.scale, {
    x: 1, y: 1, z: 1,
    duration: 0.8,
    delay: 0.5,
    ease: 'elastic.out(1, 0.6)',
  });

  scene.add(noteGroup);
  group.add(noteGroup);

  // ── SCROLL CTA ────────────────────────────────────────────
  // Small clay arrow bobbing below the sticky note
  const arrowGeo = applyClayImperfection(
    new THREE.ConeGeometry(0.08, 0.2, 8), 0.01, 5
  );
  const arrow = new THREE.Mesh(arrowGeo, clayMat(0xffb347, 0.8));
  arrow.rotation.z = Math.PI; // point up, then flip
  arrow.position.set(-0.1, 0.62, -3.1);
  arrow.castShadow = true;
  scene.add(arrow);
  group.add(arrow);

  // Bob animation
  gsap.to(arrow.position, {
    y: 0.52,
    duration: 0.9,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
  gsap.to(arrow.scale, {
    y: 0.7,
    duration: 0.45,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });

  scene.add(group);
  return { group, noteGroup, arrow };
}
