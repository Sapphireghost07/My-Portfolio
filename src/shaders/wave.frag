// Wave fragment shader — color shifts with elevation
varying vec2 vUv;
varying float vElevation;

uniform vec3 uColorLow;
uniform vec3 uColorHigh;
uniform float uTime;

void main() {
  float t = smoothstep(-0.3, 0.3, vElevation);
  vec3 col = mix(uColorLow, uColorHigh, t);
  
  // Shimmer
  float shimmer = sin(vUv.x * 20.0 + uTime * 2.0) * 0.03 + 1.0;
  col *= shimmer;
  
  gl_FragColor = vec4(col, 0.85);
}
