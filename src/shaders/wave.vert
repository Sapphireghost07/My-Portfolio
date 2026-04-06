// Wave displacement shader for contact section
uniform float uTime;
uniform float uWaveHeight;

varying vec2 vUv;
varying float vElevation;

void main() {
  vUv = uv;
  
  vec3 pos = position;
  float wave1 = sin(pos.x * 3.0 + uTime * 1.2) * uWaveHeight;
  float wave2 = cos(pos.z * 2.5 + uTime * 0.9) * uWaveHeight * 0.6;
  float wave3 = sin(pos.x * 1.5 + pos.z * 2.0 + uTime * 0.6) * uWaveHeight * 0.4;
  
  pos.y += wave1 + wave2 + wave3;
  vElevation = pos.y;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
