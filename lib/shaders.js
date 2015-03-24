var glslify       = require('glslify')

exports.meshShader = glslify({
  vertex:   './triangle-vertex.glsl', 
  fragment: './triangle-fragment.glsl',
  sourceOnly: true
})
exports.wireShader = glslify({
  vertex:   './edge-vertex.glsl',
  fragment: './edge-fragment.glsl',
  sourceOnly: true
})
exports.pointShader = glslify({
  vertex:   './point-vertex.glsl',
  fragment: './point-fragment.glsl',
  sourceOnly: true
})
exports.pickShader = glslify({
  vertex:   './pick-vertex.glsl', 
  fragment: './pick-fragment.glsl',
  sourceOnly: true
})
exports.pointPickShader = glslify({
  vertex:   './pick-point-vertex.glsl', 
  fragment: './pick-fragment.glsl',
  sourceOnly: true
})
exports.contourShader = glslify({
  vertex:   './contour-vertex.glsl',
  fragment: './contour-fragment.glsl',
  sourceOnly: true
})