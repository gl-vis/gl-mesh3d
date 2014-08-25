precision mediump float;

attribute vec3 position;
attribute vec4 color;
attribute vec3 normal;

uniform mat4 model, modelInverseTranspose, view, projection;
uniform vec3 eyePosition;

varying vec4 f_color;
varying vec3 f_position, f_normal, viewDirection, f_data;

void main() {
  vec4 m_position = model * vec4(position, 1.0);
  vec4 t_position = view * m_position;
  gl_Position = projection * t_position;
  f_color = color;
  f_normal = normalize((modelInverseTranspose * vec4(normal, 0.0)).xyz);
  f_position = m_position.xyz/m_position.w;
  f_data = position;
  viewDirection = eyePosition - f_position;
}