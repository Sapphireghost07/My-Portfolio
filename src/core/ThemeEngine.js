/**
 * ThemeEngine — Day/Night lofi room theme switcher
 * Controls CSS vars + WebGL lighting uniforms + localStorage
 */
import { gsap } from 'gsap';

const THEME_KEY = 'sab-lofi-theme';

export const THEMES = {
  dark: {
    name: 'night',
    bg:         0x1a1008,
    fog:        0x1a1008,
    wall:       0x2a1f14,
    floor:      0x3d2b1f,
    lampColor:  0xffb347,
    lampIntensity: 5.0,
    winColor:   0x4466aa,
    winIntensity: 1.2,
    ambColor:   0x251808,
    ambIntensity: 0.55,
    screenColor:0x00ffcc,
    // CSS
    css: {
      '--c-bg':       '#1A1008',
      '--c-wall':     '#2A1F14',
      '--c-floor':    '#3D2B1F',
      '--c-accent':   '#FFB347',
      '--c-accent2':  '#00FFCC',
      '--c-accent3':  '#FF6B6B',
      '--c-text':     '#FFF8E7',
      '--c-muted':    '#A0896B',
      '--c-card':     'rgba(42,31,20,0.85)',
      '--c-border':   'rgba(255,179,71,0.18)',
      '--c-glow':     'rgba(255,179,71,0.35)',
      '--c-glow2':    'rgba(0,255,204,0.25)',
      '--c-screen':   '#00FFCC',
      '--c-comment':  '#A0896B',
    },
  },
  light: {
    name: 'day',
    bg:         0xf5edd6,
    fog:        0xf5edd6,
    wall:       0xede0c4,
    floor:      0xc8a97e,
    lampColor:  0xfffaee,
    lampIntensity: 0,
    winColor:   0xfffaee,
    winIntensity: 2.0,
    ambColor:   0xf5edd6,
    ambIntensity: 0.8,
    screenColor:0x0066aa,
    css: {
      '--c-bg':       '#F5EDD6',
      '--c-wall':     '#EDE0C4',
      '--c-floor':    '#C8A97E',
      '--c-accent':   '#4A90D9',
      '--c-accent2':  '#0066AA',
      '--c-accent3':  '#E05A5A',
      '--c-text':     '#2C1810',
      '--c-muted':    '#6B4C30',
      '--c-card':     'rgba(237,224,196,0.92)',
      '--c-border':   'rgba(74,144,217,0.2)',
      '--c-glow':     'rgba(74,144,217,0.25)',
      '--c-glow2':    'rgba(0,102,170,0.2)',
      '--c-screen':   '#0066AA',
      '--c-comment':  '#8B6848',
    },
  },
};

class ThemeEngine {
  constructor() {
    this.current = 'dark';
    this.lights = {};
    this.renderer = null;
    this.scene = null;
    this._listeners = [];
  }

  init(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    this.apply(saved, true);
    return this;
  }

  // Called by AGENT 1 to register lighting objects
  registerLights(lights) {
    this.lights = lights;
  }

  apply(theme, instant = false) {
    this.current = theme;
    localStorage.setItem(THEME_KEY, theme);
    const t = THEMES[theme];

    // CSS vars
    const root = document.documentElement;
    Object.entries(t.css).forEach(([k, v]) => root.style.setProperty(k, v));
    document.body.classList.toggle('theme-day',   theme === 'light');
    document.body.classList.toggle('theme-night', theme === 'dark');

    // WebGL bg + fog
    if (this.renderer) this.renderer.setClearColor(t.bg, 1);
    if (this.scene?.fog) this.scene.fog.color.set(t.fog);

    // Lamps
    if (this.lights.lamp) {
      if (instant) {
        this.lights.lamp.color.set(t.lampColor);
        this.lights.lamp.intensity = t.lampIntensity;
      } else {
        gsap.to(this.lights.lamp, { intensity: t.lampIntensity, duration: 0.8 });
        gsap.to(this.lights.lamp.color, {
          r: ((t.lampColor >> 16) & 255) / 255,
          g: ((t.lampColor >> 8) & 255) / 255,
          b: (t.lampColor & 255) / 255,
          duration: 0.8,
        });
      }
    }
    if (this.lights.window) {
      if (instant) {
        this.lights.window.color.set(t.winColor);
        this.lights.window.intensity = t.winIntensity;
      } else {
        gsap.to(this.lights.window, { intensity: t.winIntensity, duration: 0.8 });
      }
    }
    if (this.lights.ambient) {
      if (instant) {
        this.lights.ambient.color.set(t.ambColor);
        this.lights.ambient.intensity = t.ambIntensity;
      } else {
        gsap.to(this.lights.ambient, { intensity: t.ambIntensity, duration: 0.8 });
      }
    }

    // Notify listeners
    this._listeners.forEach(fn => fn(theme, t));
  }

  toggle() {
    this.apply(this.current === 'dark' ? 'light' : 'dark');
  }

  onChange(fn) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(l => l !== fn); };
  }
}

export const themeEngine = new ThemeEngine();
export default themeEngine;
