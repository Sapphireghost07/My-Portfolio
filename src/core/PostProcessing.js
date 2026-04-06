/**
 * PostProcessing — EffectComposer with lofi-tuned effects
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { PERF } from '../utils/mobile.js';

// Film Grain Shader
const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime:    { value: 0 },
    uAmount:  { value: 0.035 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAmount;
    varying vec2 vUv;
    float random(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float noise = random(vUv + fract(uTime * 0.5)) * uAmount;
      color.rgb += noise - uAmount * 0.5;
      gl_FragColor = color;
    }
  `,
};

// Warm Color Grade Shader (lofi: slight sepia, warm shadows)
const ColorGradeShader = {
  uniforms: {
    tDiffuse:  { value: null },
    uWarmth:   { value: 0.08 },
    uVignette: { value: 0.5 },
    uIsDay:    { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uWarmth;
    uniform float uVignette;
    uniform float uIsDay;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      // Sepia shift
      float r = color.r * (1.0 - uWarmth * 0.3) + color.g * uWarmth * 0.2 + color.b * uWarmth * 0.1;
      float g = color.r * uWarmth * 0.05 + color.g * (1.0 - uWarmth * 0.1);
      float b = color.b * (1.0 - uWarmth * 0.2);
      // Warm push in shadows
      float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      float warmPush = (1.0 - lum) * 0.04;
      r += warmPush;
      // Vignette
      vec2 uv2 = vUv * 2.0 - 1.0;
      float vig = 1.0 - dot(uv2, uv2) * uVignette * 0.6;
      // Day: brighter, less warm
      float dayFactor = uIsDay;
      vec3 finalCol = mix(vec3(r, g, b), color.rgb, dayFactor * 0.7);
      finalCol *= vig;
      gl_FragColor = vec4(finalCol, color.a);
    }
  `,
};

class PostProcessing {
  constructor() {
    this.composer = null;
    this.bloomPass = null;
    this.grainPass = null;
    this.gradePass = null;
  }

  init(renderer, scene, camera) {
    const W = window.innerWidth;
    const H = window.innerHeight;

    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    // Bloom — warm, soft, low threshold so room objects are visible
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(W, H),
      PERF.bloomStrength,
      0.8,  // radius
      0.18  // threshold — LOW so the room actually glows
    );
    this.composer.addPass(this.bloomPass);

    // Color grade + vignette
    if (PERF.colorGrade) {
      this.gradePass = new ShaderPass(ColorGradeShader);
      this.composer.addPass(this.gradePass);
    }

    // Film grain
    if (PERF.filmGrain) {
      this.grainPass = new ShaderPass(FilmGrainShader);
      this.grainPass.renderToScreen = true;
      this.composer.addPass(this.grainPass);
    } else {
      // Mark last pass as renderToScreen
      const passes = this.composer.passes;
      passes[passes.length - 1].renderToScreen = true;
    }

    window.addEventListener('resize', () => {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });

    return this;
  }

  update(elapsed, isDay = false) {
    if (this.grainPass) {
      this.grainPass.uniforms.uTime.value = elapsed;
    }
    if (this.gradePass) {
      this.gradePass.uniforms.uIsDay.value = isDay ? 1 : 0;
    }
  }

  setDay(isDay) {
    if (this.gradePass) {
      this.gradePass.uniforms.uIsDay.value = isDay ? 1 : 0;
      this.gradePass.uniforms.uWarmth.value = isDay ? 0.04 : 0.08;
      this.gradePass.uniforms.uVignette.value = isDay ? 0.35 : 0.5;
    }
    if (this.bloomPass) {
      this.bloomPass.strength = isDay ? 0.25 : PERF.bloomStrength;
    }
  }

  render() {
    this.composer.render();
  }
}

export const postProcessing = new PostProcessing();
export default postProcessing;
