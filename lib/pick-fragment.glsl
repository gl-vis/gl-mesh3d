precision mediump float;

uniform vec3  clipBounds[2];
uniform float pickId;

varying vec3 f_position;
varying vec4 f_id;

bool outOfRange(float a, float b, float p) {
  if (p > max(a, b)) return true;
  if (p < min(a, b)) return true;
  return false;
}

void main() {
  if ((outOfRange(clipBounds[0].x, clipBounds[1].x, f_position.x)) ||
      (outOfRange(clipBounds[0].y, clipBounds[1].y, f_position.y)) ||
      (outOfRange(clipBounds[0].z, clipBounds[1].z, f_position.z))) discard;

  gl_FragColor = vec4(pickId, f_id.xyz);
}