// DOM utilities
export const $ = (s, ctx = document) => ctx.querySelector(s);
export const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

// Convert screen coordinates to world space
export function screenToWorld(screenX, screenY, depth, camera) {
  const v = {
    x: (screenX / window.innerWidth) * 2 - 1,
    y: -(screenY / window.innerHeight) * 2 + 1,
  };
  // Use Three.js Vector3 unproject approach
  return v;
}

// Throttle
export function throttle(fn, wait) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) { last = now; fn(...args); }
  };
}

// Wait for dom ready
export function domReady(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}
