// GLSL fragment shader for hero star particles
varying float vBrightness;
varying float vDist;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

void main() {
  // Round particle
  float distToCenter = length(gl_PointCoord - 0.5);
  if (distToCenter > 0.5) discard;

  // Soft edges
  float alpha = 1.0 - smoothstep(0.3, 0.5, distToCenter);
  alpha *= vBrightness;

  // Color mix based on brightness
  vec3 col = mix(uColor2, uColor1, vBrightness);
  col = mix(col, uColor3, smoothstep(0.7, 1.0, vBrightness));

  gl_FragColor = vec4(col, alpha * 0.9);
}
