/**
 * Room.js — The physical lofi dev room: walls, floor, ceiling, ambient details
 * All geometry uses clay MeshPhysicalMaterial + imperfection noise
 */
import * as THREE from 'three';
import { applyClayImperfection } from '../utils/math.js';

// Clay material factory
export function clayMat(color, roughness = 0.85, opts = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness: 0.0,
    ...opts,
  });
}

export function buildRoom(scene) {
  const room = new THREE.Group();
  room.name = 'room';

  // Dimensions: 22 wide, 11 tall, 130 deep
  const W = 22, H = 11, D = 130;

  // ── FLOOR ──────────────────────────────────────────────
  const floorGeo = applyClayImperfection(
    new THREE.PlaneGeometry(W, D, 40, 40),
    0.015, 2.0
  );
  floorGeo.rotateX(-Math.PI / 2);
  const floorMesh = new THREE.Mesh(floorGeo, clayMat(0x3d2b1f, 0.9));
  floorMesh.position.set(0, 0, -D / 2 + 8);
  floorMesh.receiveShadow = true;
  floorMesh.name = 'floor';
  room.add(floorMesh);

  // ── BACK WALL ──────────────────────────────────────────
  const backWallGeo = applyClayImperfection(
    new THREE.PlaneGeometry(W, H, 20, 10), 0.012, 1.5
  );
  const backWall = new THREE.Mesh(backWallGeo, clayMat(0x2a1f14, 0.88));
  backWall.position.set(0, H / 2, -D / 2 + 8);
  backWall.receiveShadow = true;
  backWall.name = 'backwall';
  room.add(backWall);

  // ── LEFT WALL ──────────────────────────────────────────
  const leftWallGeo = applyClayImperfection(
    new THREE.PlaneGeometry(D, H, 40, 10), 0.012, 1.5
  );
  const leftWall = new THREE.Mesh(leftWallGeo, clayMat(0x2e2218, 0.88));
  leftWall.rotateY(Math.PI / 2);
  leftWall.position.set(-W / 2, H / 2, -D / 2 + 8);
  leftWall.receiveShadow = true;
  room.add(leftWall);

  // ── RIGHT WALL ─────────────────────────────────────────
  const rightWall = leftWall.clone();
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(W / 2, H / 2, -D / 2 + 8);
  room.add(rightWall);

  // ── CEILING ────────────────────────────────────────────
  const ceilingGeo = new THREE.PlaneGeometry(W, D, 10, 10);
  ceilingGeo.rotateX(Math.PI / 2);
  const ceiling = new THREE.Mesh(ceilingGeo, clayMat(0x1a1208, 0.95));
  ceiling.position.set(0, H, -D / 2 + 8);
  room.add(ceiling);

  scene.add(room);
  return room;
}

// Dust mote particles floating in lamp light
export function buildDustMotes(scene, count = 300) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 8;
    pos[i * 3 + 1] = Math.random() * 4 + 0.5;
    pos[i * 3 + 2] = Math.random() * 12 - 6;
    phases[i] = Math.random() * Math.PI * 2;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.025,
    color: 0xffb347,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
  });

  const dust = new THREE.Points(geo, mat);
  dust.name = 'dust';
  scene.add(dust);
  return dust;
}

// Animate dust motes
export function animateDust(dust, elapsed) {
  if (!dust) return;
  const pos = dust.geometry.attributes.position;
  const phases = dust.geometry.attributes.aPhase;
  const count = pos.count;

  for (let i = 0; i < count; i++) {
    const ph = phases.getX(i);
    const y = pos.getY(i);
    pos.setY(i, y + 0.0005);
    // Respawn at bottom
    if (pos.getY(i) > 5) pos.setY(i, 0.5);
    // Gentle drift
    pos.setX(i, pos.getX(i) + Math.sin(elapsed + ph) * 0.0008);
  }
  pos.needsUpdate = true;
}
