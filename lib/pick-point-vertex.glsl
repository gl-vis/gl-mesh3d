precision mediump float;

attribute vec3  position;
attribute float pointSize;
attribute vec4  id;

uniform mat4 model, view, projection;
uniform vec3 clipBounds[2];

varying vec3 f_position;
varying vec4 f_id;

bool outOfRange(float a, float b, float p) {
  if (p > max(a, b)) return true;
  if (p < min(a, b)) return true;
  return false;
}

void main() {
  if ((outOfRange(clipBounds[0].x, clipBounds[1].x, position.x)) ||
      (outOfRange(clipBounds[0].y, clipBounds[1].y, position.y)) ||
      (outOfRange(clipBounds[0].z, clipBounds[1].z, position.z))) {

    gl_Position = vec4(0,0,0,0);
  } else {
    gl_Position  = projection * view * model * vec4(position, 1.0);
    gl_PointSize = pointSize;
  }
  f_id         = id;
  f_position   = position;
}