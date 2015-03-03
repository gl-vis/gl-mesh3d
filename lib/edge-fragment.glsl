precision mediump float;

uniform vec3 clipBounds[2];
uniform sampler2D texture;
uniform float opacity;

varying vec4 f_color;
varying vec3 f_data;
varying vec2 f_uv;

void main() {
  if(any(lessThan(f_data, clipBounds[0])) || 
     any(greaterThan(f_data, clipBounds[1]))) {
    discard;
  }

  gl_FragColor = f_color * texture2D(texture, f_uv) * opacity;
}