uniform float uTime;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
uniform vec2 uMouse;
uniform vec2 uMouseIntro;

uniform float uIntro;
uniform float uRadius;
uniform float uStrength;
uniform float uBulge;

varying vec2 vUv;

vec2 bulge(vec2 uv, vec2 center) {

  uv -= center; // center to mouse

  float dist = length(uv) / uRadius; // amount of distortion based on mouse pos
  float distPow = pow(dist, 5.); // exponential as you ar far from the mouse
  float strengthAmount = uStrength / (1.0 + distPow); // strenght

  uv *= (1. - uBulge) + uBulge * strengthAmount; // use uBulge to smoothly reset/add effect

  uv += center; // reset pos

  return uv;
}

void main() {
    // vec2 mixMouse = mix(uMouseIntro, uMouse, uIntro);
    vec2 bulgeUv = bulge(vUv, uMouse);
    vec4 texture = texture2D(uTexture, bulgeUv);
    gl_FragColor = vec4(vec3(texture.rgb), 1.0);
}