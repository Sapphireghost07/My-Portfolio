/**
 * ProjectsSection.js — Monitor screen becomes project gallery
 * Retro OS desktop on the computer screen
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { PROJECTS } from '../data/content.js';
import { clayMat } from './Room.js';
import { applyClayImperfection } from '../utils/math.js';

const FLOPPY_COLORS = [0xff6b6b, 0x00d2ff, 0x7cfc00, 0xffd700];

export function buildProjects(scene) {
  const group = new THREE.Group();
  group.name = 'projects';

  // Floppy disk icons on the monitor (as 3D objects near monitor face)
  const floppies = PROJECTS.map((proj, i) => {
    const floppy = buildFloppyDisk(proj, i);
    const col = i % 2;
    const row = Math.floor(i / 2);
    floppy.position.set(
      -0.44 + col * 0.52,
      0.55 - row * 0.52,
      -4.29
    );
    scene.add(floppy);
    group.add(floppy);
    return floppy;
  });

  // Idle float for each floppy
  floppies.forEach((f, i) => {
    gsap.to(f.position, {
      y: f.position.y + 0.04,
      duration: 1.4 + i * 0.3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  });

  scene.add(group);
  return { group, floppies };
}

function buildFloppyDisk(project, idx) {
  const g = new THREE.Group();
  g.name = `floppy-${project.id}`;
  g.userData.project = project;

  // Disk body
  const bodyGeo = applyClayImperfection(
    new THREE.BoxGeometry(0.34, 0.38, 0.04, 4, 4, 2), 0.012, 5
  );
  const body = new THREE.Mesh(bodyGeo, clayMat(FLOPPY_COLORS[idx % FLOPPY_COLORS.length], 0.82));
  body.castShadow = true;
  g.add(body);

  // Metal slider
  const slider = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.1, 0.042),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 })
  );
  slider.position.set(0, -0.12, 0);
  g.add(slider);

  // Label sticker
  const label = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.18, 0.042),
    clayMat(0xffffff, 0.95)
  );
  label.position.set(0, 0.07, 0.001);
  g.add(label);

  // Hover interaction
  g.userData.onHover = () => {
    gsap.to(g.rotation, { z: 0.12, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
    gsap.to(g.scale, { x: 1.12, y: 1.12, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
  };
  g.userData.onUnhover = () => {
    gsap.to(g.rotation, { z: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    gsap.to(g.scale, { x: 1, y: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  };

  return g;
}
