/**
 * CameraRig — CatmullRomCurve3 path through the lofi room
 * Scroll drives t (0→1) which maps to a path through 5 zones
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lerp } from '../utils/math.js';

// Camera waypoints through the room (position + lookAt)
const WAYPOINTS = [
  // Zone 0: Hero — close establishing shot, desk fills frame
  { pos: new THREE.Vector3(0, 2.0, 7),    look: new THREE.Vector3(0, 1.2, -3),   label: 'hero' },
  // Zone 1: About — slight dolly in over desk
  { pos: new THREE.Vector3(-0.3, 1.7, 1), look: new THREE.Vector3(-0.2, 1.3, -9), label: 'about' },
  // Zone 2: Projects — zoom into monitor face-on
  { pos: new THREE.Vector3(0, 1.7, -9),   look: new THREE.Vector3(0, 1.5, -17),  label: 'projects' },
  // Zone 3: Skills — pan to bookshelf
  { pos: new THREE.Vector3(-3.2, 1.8, -27), look: new THREE.Vector3(0, 1.4, -33), label: 'skills' },
  // Zone 4: Contact — window area
  { pos: new THREE.Vector3(0, 1.8, -50),  look: new THREE.Vector3(0, 1.5, -60),  label: 'contact' },
];

class CameraRig {
  constructor() {
    this.camera = null;
    this.targetPos = new THREE.Vector3();
    this.targetLook = new THREE.Vector3();
    this.currentPos = new THREE.Vector3();
    this.currentLook = new THREE.Vector3();
    this.t = 0;
    this.breathTime = 0;
    this._idleTimeout = null;
    this._idleDrifting = false;
  }

  init(camera) {
    this.camera = camera;
    this.currentPos.copy(WAYPOINTS[0].pos);
    this.currentLook.copy(WAYPOINTS[0].look);
    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLook);
    this._setupScrollTrigger();
    this._setupIdleDetect();
    return this;
  }

  _setupScrollTrigger() {
    this.st = ScrollTrigger.create({
      trigger: '#scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2,
      onUpdate: (self) => {
        this.t = self.progress;
        this._idleDrifting = false;
        clearTimeout(this._idleTimeout);
        this._idleTimeout = setTimeout(() => {
          this._idleDrifting = true;
        }, 4000);
      },
    });
  }

  _setupIdleDetect() {
    ['mousemove','keydown','touchstart','wheel'].forEach(ev => {
      window.addEventListener(ev, () => {
        this._idleDrifting = false;
        clearTimeout(this._idleTimeout);
        this._idleTimeout = setTimeout(() => {
          this._idleDrifting = true;
        }, 4000);
      }, { passive: true });
    });
  }

  // Get interpolated waypoint based on t (0–1)
  _getWaypoint(t) {
    const n = WAYPOINTS.length - 1;
    const scaled = t * n;
    const i = Math.min(Math.floor(scaled), n - 1);
    const f = scaled - i;
    const a = WAYPOINTS[i];
    const b = WAYPOINTS[Math.min(i + 1, n)];
    return {
      pos: new THREE.Vector3().lerpVectors(a.pos, b.pos, f),
      look: new THREE.Vector3().lerpVectors(a.look, b.look, f),
    };
  }

  update(elapsed) {
    if (!this.camera) return;

    this.breathTime = elapsed;
    const { pos, look } = this._getWaypoint(this.t);

    // Idle cinematic drift
    if (this._idleDrifting) {
      pos.x += Math.sin(elapsed * 0.12) * 0.3;
      pos.y += Math.cos(elapsed * 0.09) * 0.08;
    }

    // Breathing — subtle vertical oscillation
    pos.y += Math.sin(elapsed * 1.26) * 0.012;

    // Smooth lerp
    this.currentPos.lerp(pos, 0.04);
    this.currentLook.lerp(look, 0.04);

    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLook);
  }

  goToZone(idx) {
    const wp = WAYPOINTS[Math.min(idx, WAYPOINTS.length - 1)];
    gsap.to(this, {
      t: idx / (WAYPOINTS.length - 1),
      duration: 2,
      ease: 'power2.inOut',
    });
  }

  get activeZone() {
    return Math.round(this.t * (WAYPOINTS.length - 1));
  }
}

export const cameraRig = new CameraRig();
export { WAYPOINTS };
export default cameraRig;
