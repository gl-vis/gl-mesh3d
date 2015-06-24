var glslify       = require('glslify')

var triVertSrc = glslify('./triangle-vertex.glsl')
var triFragSrc = glslify('./triangle-fragment.glsl')
var edgeVertSrc = glslify('./edge-vertex.glsl')
var edgeFragSrc = glslify('./edge-fragment.glsl')
var pointVertSrc = glslify('./point-vertex.glsl')
var pointFragSrc = glslify('./point-fragment.glsl')
var pickVertSrc = glslify('./pick-vertex.glsl')
var pickFragSrc = glslify('./pick-fragment.glsl')
var pickPointVertSrc = glslify('./pick-point-vertex.glsl')
var contourVertSrc = glslify('./contour-vertex.glsl')
var contourFragSrc = glslify('./contour-fragment.glsl')

exports.meshShader = {
  vertex:   triVertSrc,
  fragment: triFragSrc
}
exports.wireShader = {
  vertex:   edgeVertSrc,
  fragment: edgeFragSrc
}
exports.pointShader = {
  vertex:   pointVertSrc,
  fragment: pointFragSrc
}
exports.pickShader = {
  vertex:   pickVertSrc,
  fragment: pickFragSrc
}
exports.pointPickShader = {
  vertex:   pickPointVertSrc,
  fragment: pickFragSrc
}
exports.contourShader = {
  vertex:   contourVertSrc,
  fragment: contourFragSrc
}
