/**
 * ScrollEngine — Lenis smooth scroll + GSAP ScrollTrigger integration
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

class ScrollEngine {
  constructor() {
    this.lenis = null;
    this.progress = 0;
    this._raf = null;
  }

  init() {
    this.lenis = new Lenis({
      duration: 1.6,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // exponential
      orientation: 'vertical',
      smoothWheel: true,
    });

    // Bind Lenis to GSAP ScrollTrigger
    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Track global progress
    this.lenis.on('scroll', ({ progress }) => {
      this.progress = progress;
    });

    return this;
  }

  scrollTo(target, options = {}) {
    this.lenis?.scrollTo(target, { duration: 1.6, ...options });
  }

  get scrollY() {
    return this.lenis?.scroll || 0;
  }

  dispose() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this.lenis?.destroy();
  }
}

export const scrollEngine = new ScrollEngine();
export { ScrollTrigger };
export default scrollEngine;
