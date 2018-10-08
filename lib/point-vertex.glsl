precision mediump float;

#pragma glslify: outOfRange = require(./reversed-scenes-out-of-range.glsl)

attribute vec3 position;
attribute vec4 color;
attribute vec2 uv;
attribute float pointSize;

uniform mat4 model, view, projection;
uniform vec3 clipBounds[2];

varying vec4 f_color;
varying vec2 f_uv;

void main() {
  if ((outOfRange(clipBounds[0].x, clipBounds[1].x, position.x)) ||
      (outOfRange(clipBounds[0].y, clipBounds[1].y, position.y)) ||
      (outOfRange(clipBounds[0].z, clipBounds[1].z, position.z))) {

    gl_Position = vec4(0,0,0,0);
  } else {
    gl_Position = projection * view * model * vec4(position, 1.0);
  }
  gl_PointSize = pointSize;
  f_color = color;
  f_uv = uv;
}