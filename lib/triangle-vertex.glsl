attribute vec3 position;
attribute vec3 color;
attribute vec3 normal;
uniform mat4 model;
uniform mat4 modelInverseTranspose;
uniform mat4 view;
uniform vec3 eyePosition;
uniform mat4 projection;
varying vec3 f_position;
varying vec3 f_color;
varying vec3 f_normal;
varying vec3 viewDirection;
void main() {
  vec4 m_position = model * vec4(position, 1.0);
  vec4 t_position = view * m_position;
  gl_Position = projection * t_position;
  f_color = color;
  f_normal = normalize((modelInverseTranspose * vec4(normal, 0.0)).xyz);
  f_position = m_position.xyz/m_position.w;
  viewDirection = eyePosition - f_position;
}