precision highp float;
uniform vec3 lightPosition;
uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 specular;
uniform float specularExponent;
varying vec3 f_position;
varying vec3 f_color;
varying vec3 f_normal;
varying vec3 viewDirection;
void main() {
  vec3 lightDirection = normalize(lightPosition - f_position);
  vec3 normal = normalize(f_normal);
  float diffuseIntensity = clamp(dot(normal, lightDirection), 0.0, 1.0);
  vec3 halfView = normalize(lightDirection + normalize(viewDirection));
  float specularIntensity = pow(clamp(dot(normal, halfView),0.0,1.0), specularExponent);
  gl_FragColor = vec4(f_color * (ambient + diffuse * diffuseIntensity) + specular * specularIntensity, 1.0);
}