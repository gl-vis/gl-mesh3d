precision mediump float;

#pragma glslify: outOfRange = require(./reversed-scenes-out-of-range.glsl)

uniform vec3 clipBounds[2];
uniform sampler2D texture;
uniform float opacity;

varying vec4 f_color;
varying vec3 f_data;
varying vec2 f_uv;

void main() {
  if ((outOfRange(clipBounds[0].x, clipBounds[1].x, f_data.x)) ||
      (outOfRange(clipBounds[0].y, clipBounds[1].y, f_data.y)) ||
      (outOfRange(clipBounds[0].z, clipBounds[1].z, f_data.z))) discard;

  gl_FragColor = f_color * texture2D(texture, f_uv) * opacity;
}