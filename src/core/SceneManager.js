/**
 * SceneManager — single persistent renderer, scene, cameras
 * The one and only Three.js renderer for the entire portfolio
 */
import * as THREE from 'three';
import { PERF } from '../utils/mobile.js';

class SceneManager {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = new THREE.Clock();
    this.canvas = null;
    this._onResize = this._onResize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !PERF.IS_MOBILE,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(PERF.pixelRatio);
    this.renderer.setSize(W, H);
    this.renderer.shadowMap.enabled = PERF.shadowMap;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x1a1008, 0.004);

    // Camera — 60 FOV, cinematic
    this.camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 300);
    this.camera.position.set(0, 2.0, 7);
    this.camera.lookAt(0, 1.2, -3);

    window.addEventListener('resize', this._onResize, { passive: true });
    return this;
  }

  _onResize() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H);
  }

  setFogColor(hex) {
    this.scene.fog.color.set(hex);
  }

  get elapsed() { return this.clock.getElapsedTime(); }
  get delta() { return this.clock.getDelta(); }

  dispose() {
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}

export const sceneManager = new SceneManager();
export default sceneManager;
