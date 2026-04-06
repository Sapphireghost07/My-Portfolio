// Mobile/device detection and performance scaling
// Use pointer:fine to detect real mouse — ontouchstart fires on Windows touch laptops
export const HAS_MOUSE = window.matchMedia('(pointer: fine)').matches;
export const IS_TOUCH  = !HAS_MOUSE;
export const IS_MOBILE = window.matchMedia('(pointer: coarse)').matches;
export const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const PERF = {
  starCount:    IS_MOBILE ? 2000  : 8000,
  dustCount:    IS_MOBILE ? 80    : 400,
  shadowMap:    IS_MOBILE ? false : true,
  postBloom:    IS_MOBILE ? true  : true,
  bloomStrength:IS_MOBILE ? 0.3  : 0.55,
  filmGrain:    IS_MOBILE ? false : true,
  colorGrade:   IS_MOBILE ? false : true,
  dof:          IS_MOBILE ? false : false, // off everywhere for perf
  pixelRatio:   Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2),
};

// Visibility pause
let _paused = false;
document.addEventListener('visibilitychange', () => {
  _paused = document.hidden;
});
export const isPaused = () => _paused;
