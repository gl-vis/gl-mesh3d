precision mediump float;

attribute vec3  position;
attribute float pointSize;
attribute vec4  id;

uniform mat4 model, view, projection;
uniform vec3 clipBounds[2];

varying vec3 f_position;
varying vec4 f_id;

void main() {
  if(any(lessThan(position, clipBounds[0])) || 
     any(greaterThan(position, clipBounds[1]))) {
    gl_Position = vec4(0,0,0,0);
  } else {
    gl_Position  = projection * view * model * vec4(position, 1.0);
    gl_PointSize = pointSize;
  }
  f_id         = id;
  f_position   = position;
}