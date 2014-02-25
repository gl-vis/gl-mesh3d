"use strict"

var createBuffer = require("gl-buffer")
var createVAO = require("gl-vao")
var glslify = require("glslify")
var glm = require("gl-matrix")
var normals = require("normals")
var mat4 = glm.mat4

var createMeshShaderGLSLify = glslify({
  vertex: "./lib/triangle-vertex.glsl", 
  fragment: "./lib/triangle-fragment.glsl"
})
var createWireShaderGLSLify = glslify({
  vertex: "./lib/edge-vertex.glsl",
  fragment: "./lib/edge-fragment.glsl"
})
var createPointShaderGLSLify = glslify({
  vertex: "./lib/point-vertex.glsl",
  fragment: "./lib/point-fragment.glsl"
})


var identityMatrix = mat4.identity(mat4.create())

function SimplicialMesh(gl,
  trianglePositions, triangleColors, triangleNormals, triangleVAO,
  edgePositions, edgeColors, edgeVAO,
  pointPositions, pointColors, pointSizes, pointVAO) {
  
  this.gl = gl
  
  this.trianglePositions = trianglePositions
  this.triangleColors = triangleColors
  this.triangleNormals = triangleNormals
  this.triangleVAO = triangleVAO
  this.triangleCount = 0
  
  this.edgePositions = edgePositions
  this.edgeColors = edgeColors
  this.edgeVAO = edgeVAO
  this.edgeCount = 0
  
  this.pointPositions = pointPositions
  this.pointColors = pointColors
  this.pointSizes = pointSizes
  this.pointVAO = pointVAO
  this.pointCount = 0
}

SimplicialMesh.prototype.update = function(params) {
  params = params || {}
  var gl = this.gl
  
  var cells = params.cells
  var positions = params.positions

  //Data for buffers
  var tPos = []
  var tCol = []
  var tNor = []
  var ePos = []
  var eCol = []
  var pPos = []
  var pCol = []
  var pSiz = []
  
  //Compute normals
  var vertexNormals = params.vertexNormals
  var cellNormals = params.cellNormals
  if(params.useCellNormals && !cellNormals) {
    cellNormals = normals.facetNormals(cells, positions)
  }
  if(!cellNormals && !vertexNormals) {
    vertexNormals = normals.vertexNormals(cells, positions)
  }
  
  //Compute colors
  var vertexColors = params.vertexColors
  var cellColors = params.cellColors
  var meshColor = params.meshColor || [0.7, 0.5, 0.2]
  if(meshColor.length !== 3) {
    throw new Error("bad mesh color")
  }
  
  //Point size
  var pointSizes = params.pointSizes
  var meshPointSize = params.pointSize || 1.0
  
  //Pack cells into buffers
  var triangleCount = 0
  var edgeCount = 0
  var pointCount = 0
  for(var i=0; i<cells.length; ++i) {
    var c = cells[i]
    var n = cells[i].length
    switch(n) {
      case 1:
        ++pointCount
        pPos.push.apply(pPos, positions[c[0]])
        if(vertexColors) {
          pCol.push.apply(pCol, vertexColors[c[0]])
        } else if(cellColors) {
          pCol.push.apply(pCol, cellColors[i])
        } else {
          pCol.push.apply(pCol, meshColor)
        }
        if(pointSizes) {
          pSiz.push(pointSizes[c[0]])
        } else {
          pSiz.push(meshPointSize)
        }
      break
      
      case 2:
        ++edgeCount
        for(var j=0; j<2; ++j) {
          var v = c[j]
          ePos.push.apply(ePos, positions[v])
          if(vertexColors) {
            eCol.push.apply(eCol, vertexColors[v])
          } else if(cellColors) {
            eCol.push.apply(eCol, cellColors[i])
          } else {
            eCol.push.apply(eCol, meshColor)
          }
        }
      break
      
      case 3:
        ++triangleCount
        for(var j=0; j<3; ++j) {
          var v = c[j]
          tPos.push.apply(tPos, positions[v])
          if(vertexColors) { 
            tCol.push.apply(tCol, vertexColors[v])
          } else if(cellColors) {
            tCol.push.apply(tCol, cellColors[i])
          } else {
            tCol.push.apply(tCol, meshColor)
          }
          if(vertexNormals) {
            tNor.push.apply(tNor, vertexNormals[v])
          } else {
            tNor.push.apply(tNor, cellNormals[i])
          }
        }
      break
      
      default:
        //Skip
      break
    }
  }
  
  this.pointCount = pointCount
  this.edgeCount = edgeCount
  this.triangleCount = triangleCount
  
  //Update buffer data
  this.pointPositions.update(pPos)
  this.pointColors.update(pCol)
  this.pointSizes.update(pSiz)
  this.edgePositions.update(ePos)
  this.edgeColors.update(eCol)
  this.trianglePositions.update(tPos)
  this.triangleColors.update(tCol)
  this.triangleNormals.update(tNor)
}

SimplicialMesh.prototype.draw = function(params) {
  params = params || {}
  var gl = this.gl
  var model = params.model || identityMatrix
  var view = params.view || identityMatrix
  var projection = params.projection || identityMatrix
  
  if(this.triangleCount > 0) {
    var shader = gl.__SIMPLICIAL_MESH_SHADER
    shader.bind()
    shader.uniforms.model = model
    shader.uniforms.view = view
    shader.uniforms.projection = projection
    
    var eyePosition = mat4.invert(mat4.create(), view)
    shader.uniforms.lightPosition = params.lightPosition || [0, 100.0, 0]
    shader.uniforms.ambient = params.ambient || [0.3, 0.3, 0.3]
    shader.uniforms.diffuse = params.diffuse || [0.5, 0.5, 0.5]
    shader.uniforms.specular = params.specular || [1.0, 1.0, 1.0]
    shader.uniforms.specularExponent = params.specularExponent || 10.0
    shader.uniforms.eyePosition = [eyePosition[12], eyePosition[13], eyePosition[14]]
    
    var m = mat4.create()
    shader.uniforms.modelInverseTranspose = mat4.transpose(m, mat4.invert(m, model))
    
    this.triangleVAO.bind()
    gl.drawArrays(gl.TRIANGLES, 0, this.triangleCount*3)
    this.triangleVAO.unbind()
  }
  
  if(this.edgeCount > 0) {
    var shader = gl.__SIMPLICIAL_WIRE_SHADER
    shader.bind()
    shader.uniforms.model = model
    shader.uniforms.view = view
    shader.uniforms.projection = projection
    this.edgeVAO.bind()
    gl.drawArrays(gl.LINES, 0, this.edgeCount*2)
    this.edgeVAO.unbind()
  }
  
  if(this.pointCount > 0) {
    var shader = gl.__SIMPLICIAL_POINT_SHADER
    shader.bind()
    shader.uniforms.model = model
    shader.uniforms.view = view
    shader.uniforms.projection = projection
    this.pointVAO.bind()
    gl.drawArrays(gl.POINTS, 0, this.pointCount)
    this.pointVAO.unbind()
  }
}

SimplicialMesh.prototype.dispose = function() {
  this.triangleVAO.dispose()
  this.edgeVAO.dispose()
  this.pointVAO.dispose()
  this.trianglePositions.dispose()
  this.triangleColors.dispose()
  this.triangleNormals.dispose()
  this.edgePositions.dispose()
  this.edgeColors.dispose()
  this.pointPositions.dispose()
  this.pointColors.dispose()
  this.pointSizes.dispose()
}

function createMeshShader(gl) {
  var shader = createMeshShaderGLSLify(gl)
  shader.attributes.position.location = 0
  shader.attributes.color.location = 1
  shader.attributes.normal.location = 2
  return shader
}

function createWireShader(gl) {
  var shader = createWireShaderGLSLify(gl)
  shader.attributes.position.location = 0
  shader.attributes.color.location = 1
  return shader
}

function createPointShader(gl) {
  var shader = createPointShaderGLSLify(gl)
  shader.attributes.position.location = 0
  shader.attributes.color.location = 1
  shader.attributes.pointSize.location = 2
  return shader
}

function createSimplicialMesh(gl, params) {
  if(!gl.__SIMPLICIAL_MESH_SHADER) {
    gl.__SIMPLICIAL_MESH_SHADER = createMeshShader(gl)
  }
  if(!gl.__SIMPLICIAL_WIRE_SHADER) {
    gl.__SIMPLICIAL_WIRE_SHADER = createWireShader(gl)
  }
  if(!gl.__SIMPLICIAL_POINT_SHADER) {
    gl.__SIMPLICIAL_POINT_SHADER = createPointShader(gl)
  }
  
  var trianglePositions = createBuffer(gl, [])
  var triangleColors = createBuffer(gl, [])
  var triangleNormals = createBuffer(gl, [])
  var triangleVAO = createVAO(gl, [
    { buffer: trianglePositions,
      type: gl.FLOAT,
      size: 3
    },
    { buffer: triangleColors,
      type: gl.FLOAT,
      size: 3
    },
    { buffer: triangleNormals,
      type: gl.FLOAT,
      size: 3
    }
  ])
  
  var edgePositions = createBuffer(gl, [])
  var edgeColors = createBuffer(gl, [])
  var edgeVAO = createVAO(gl, [
    { buffer: edgePositions,
      type: gl.FLOAT,
      size: 3
    },
    { buffer: edgeColors,
      type: gl.FLOAT,
      size: 3
    }
  ])
  
  var pointPositions = createBuffer(gl, [])
  var pointColors = createBuffer(gl, [])
  var pointSizes = createBuffer(gl, [])
  var pointVAO = createVAO(gl, [
    { buffer: pointPositions,
      type: gl.FLOAT,
      size: 3
    },
    { buffer: pointColors,
      type: gl.FLOAT,
      size: 3
    },
    { buffer: pointSizes,
      type: gl.FLOAT,
      size: 1
    }
  ])
  
  var mesh = new SimplicialMesh(gl,
    trianglePositions, triangleColors, triangleNormals, triangleVAO,
    edgePositions, edgeColors, edgeVAO,
    pointPositions, pointColors, pointSizes, pointVAO)
  
  mesh.update(params)
  
  return mesh
}

module.exports = createSimplicialMesh
