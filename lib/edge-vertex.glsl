precision mediump float;

attribute vec3 position;
attribute vec4 color;

uniform mat4 model, view, projection;

varying vec4 f_color;
varying vec3 f_data;

void main() {
  gl_Position = projection * view * model * vec4(position, 1.0);
  f_color = color;
  f_data  = position;
}