// Fragment shader for morphing clay centerpiece
// Fresnel + warm subsurface glow

varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uColor;
uniform vec3 uLightPos;
uniform float uTime;
uniform float uIsLight; // 0=dark, 1=day

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vPosition);
  
  // Fresnel rim
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);
  
  // Warm light
  vec3 lightDir = normalize(uLightPos - vPosition);
  float diff = max(dot(normal, lightDir), 0.0) * 0.7 + 0.3;
  
  // SSS simulation: color bleeds through
  vec3 baseCol = uColor * diff;
  vec3 rimCol = mix(uColor * 1.8, vec3(1.0, 0.9, 0.6), 0.4); // warm rim
  
  vec3 finalCol = mix(baseCol, rimCol, fresnel * 0.6);
  
  // Subtle pulse
  float pulse = sin(uTime * 0.8) * 0.05 + 1.0;
  finalCol *= pulse;
  
  gl_FragColor = vec4(finalCol, 1.0);
}
