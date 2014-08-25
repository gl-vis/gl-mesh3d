precision mediump float;

uniform vec3 clipBounds[2];

varying vec4 f_color;
varying vec3 f_data;

void main() {
  if(any(lessThan(f_data, clipBounds[0])) || 
     any(greaterThan(f_data, clipBounds[1]))) {
    discard;
  }

  gl_FragColor = f_color;
}