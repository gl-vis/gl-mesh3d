precision highp float;

attribute vec3 position, normal;
attribute vec4 color;
attribute vec2 uv;

uniform mat4 model
           , view
           , projection;
uniform vec3 eyePosition
           , lightPosition;

varying vec3 f_normal
           , f_lightDirection
           , f_eyeDirection
           , f_data;
varying vec4 f_color;
varying vec2 f_uv;

void main() {
  vec4 m_position  = model * vec4(position, 1.0);
  vec4 t_position  = view * m_position;
  gl_Position      = projection * t_position;
  f_color          = color;
  f_normal         = normal;
  f_data           = position;
  f_eyeDirection   = eyePosition   - position;
  f_lightDirection = lightPosition - position;
  f_uv             = uv;
}
