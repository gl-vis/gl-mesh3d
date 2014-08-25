precision mediump float;

uniform vec3 lightPosition, ambient, diffuse, specular;
uniform vec3 clipBounds[2];
uniform float specularExponent;

varying vec4 f_color;
varying vec3 f_position, f_normal, viewDirection, f_data;

void main() {
  if(any(lessThan(f_data, clipBounds[0])) || 
     any(greaterThan(f_data, clipBounds[1]))) {
    discard;
  }

  vec3 lightDirection = normalize(lightPosition - f_position);
  vec3 normal = normalize(f_normal);
  float diffuseIntensity = clamp(dot(normal, lightDirection), 0.0, 1.0);
  vec3 halfView = normalize(lightDirection + normalize(viewDirection));
  float specularIntensity = pow(clamp(dot(normal, halfView),0.0,1.0), specularExponent);
  gl_FragColor = vec4(f_color.xyz * (ambient + diffuse * diffuseIntensity) + specular * specularIntensity, f_color.a);
}