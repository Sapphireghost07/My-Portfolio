/**
 * Cursor — Lightweight custom cursor with lagging ring
 * DOES NOT hide the native cursor — adds a decorative ring that follows
 */
import { gsap } from 'gsap';
import { lerp } from '../utils/math.js';
import { IS_TOUCH } from '../utils/mobile.js';

class Cursor {
  constructor() {
    this.mouse = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.isHover = false;
    this._el = null;
    this._dot = null;
  }

  init() {
    if (IS_TOUCH) return this;

    // DO NOT hide native cursor — keep it visible for usability
    // Just add a decorative ring that lags behind
    this._el = document.createElement('div');
    this._el.className = 'cursor-ring';
    this._dot = document.createElement('div');
    this._dot.className = 'cursor-dot';
    document.body.appendChild(this._el);
    document.body.appendChild(this._dot);

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });

    // Hover states
    const hoverEls = 'a, button, .project-icon-3d, .book-3d, .skill-sphere, input, textarea, .magnetic';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverEls)) this._setHover(true);
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverEls)) this._setHover(false);
    });

    // Click
    window.addEventListener('mousedown', () => this._setClick(true));
    window.addEventListener('mouseup',   () => this._setClick(false));

    // Magnetic pull
    this._initMagnetic();

    return this;
  }

  _setHover(active) {
    this.isHover = active;
    if (!this._el) return;
    gsap.to(this._el, {
      scale: active ? 2.2 : 1,
      opacity: active ? 0.5 : 0.7,
      borderColor: active ? 'rgba(255,179,71,0.6)' : 'rgba(255,179,71,0.3)',
      duration: 0.35,
      ease: 'elastic.out(1,0.5)',
    });
  }

  _setClick(active) {
    this.isClick = active;
    if (!this._dot) return;
    gsap.to(this._dot, { scale: active ? 0.5 : 1, duration: 0.15, ease: 'power2.out' });
    gsap.to(this._el,  {
      scale: active ? 0.8 : (this.isHover ? 2.2 : 1),
      duration: 0.2, ease: 'power2.out',
    });
  }

  _initMagnetic() {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width/2)) * 0.15;
        const dy = (e.clientY - (r.top  + r.height/2)) * 0.15;
        gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
      });
    });
  }

  update() {
    if (IS_TOUCH || !this._el) return;
    this.target.x = lerp(this.target.x, this.mouse.x, 0.09);
    this.target.y = lerp(this.target.y, this.mouse.y, 0.09);
    this._el.style.transform  = `translate(${this.target.x - 20}px, ${this.target.y - 20}px)`;
    this._dot.style.transform = `translate(${this.mouse.x - 4}px, ${this.mouse.y - 4}px)`;
  }

  get nx() { return (this.mouse.x / window.innerWidth) * 2 - 1; }
  get ny() { return -((this.mouse.y / window.innerHeight) * 2 - 1); }
}

export const cursor = new Cursor();
export default cursor;
