// GLSL vertex shader for hero star particles
// Fades stars by distance from center

attribute float aSize;
attribute float aBrightness;

uniform float uTime;
uniform float uPixelRatio;

varying float vBrightness;
varying float vDist;

void main() {
  vBrightness = aBrightness;
  
  vec3 pos = position;
  // Gentle drift
  pos.x += sin(uTime * 0.3 + position.z * 0.1) * 0.08;
  pos.y += cos(uTime * 0.2 + position.x * 0.1) * 0.05;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vDist = length(pos.xy);

  gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
