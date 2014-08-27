'use strict'

var createBuffer  = require('gl-buffer')
var createVAO     = require('gl-vao')
var glslify       = require('glslify')
var normals       = require('normals')
var mat4          = require('gl-mat4')
var closestPoint  = require('./lib/closest-point')

var createMeshShaderGLSLify = glslify({
  vertex:   './lib/triangle-vertex.glsl', 
  fragment: './lib/triangle-fragment.glsl'
})
var createWireShaderGLSLify = glslify({
  vertex:   './lib/edge-vertex.glsl',
  fragment: './lib/edge-fragment.glsl'
})
var createPointShaderGLSLify = glslify({
  vertex:   './lib/point-vertex.glsl',
  fragment: './lib/point-fragment.glsl'
})
var createPickShaderGLSLify = glslify({
  vertex:   './lib/pick-vertex.glsl', 
  fragment: './lib/pick-fragment.glsl'
})
var createPointPickShaderGLSLify = glslify({
  vertex:   './lib/pick-point-vertex.glsl', 
  fragment: './lib/pick-fragment.glsl'
})

var identityMatrix = mat4.identity(mat4.create())

function SimplicialMesh(gl,
  triShader, lineShader, pointShader,
  pickShader, pointPickShader,
  trianglePositions, triangleColors, triangleNormals, triangleIds, triangleVAO,
  edgePositions, edgeColors, edgeIds, edgeVAO,
  pointPositions, pointColors, pointSizes, pointIds, pointVAO) {
  
  this.gl = gl
  this.cells     = []
  this.positions = []

  this.triShader         = triShader
  this.lineShader        = lineShader
  this.pointShader       = pointShader
  this.pickShader        = pickShader
  this.pointPickShader   = pointPickShader

  this.trianglePositions = trianglePositions
  this.triangleColors    = triangleColors
  this.triangleNormals   = triangleNormals
  this.triangleIds       = triangleIds
  this.triangleVAO       = triangleVAO
  this.triangleCount     = 0
  
  this.lineWidth         = 1
  this.edgePositions     = edgePositions
  this.edgeColors        = edgeColors
  this.edgeIds           = edgeIds
  this.edgeVAO           = edgeVAO
  this.edgeCount         = 0
  
  this.pointPositions    = pointPositions
  this.pointColors       = pointColors
  this.pointSizes        = pointSizes
  this.pointIds          = pointIds
  this.pointVAO          = pointVAO
  this.pointCount        = 0

  this.pickId       = 0
  this.bounds       = [[Infinity,Infinity,Infinity], [-Infinity,-Infinity,-Infinity]]
  this.clipBounds   = [[-Infinity,-Infinity,-Infinity], [Infinity,Infinity,Infinity]]

  this._model       = identityMatrix
  this._view        = identityMatrix
  this._projection  = identityMatrix
  this._resolution  = [1,1]
}

var proto = SimplicialMesh.prototype

proto.update = function(params) {
  params = params || {}
  var gl = this.gl
  
  var cells = params.cells
  var positions = params.positions

  //Buffer data
  var tPos = []
  var tCol = []
  var tNor = []
  var tIds = []

  var ePos = []
  var eCol = []
  var eIds = []

  var pPos = []
  var pCol = []
  var pSiz = []
  var pIds = []

  if('clipBounds' in params) {
    this.clipBounds = params.clipBounds
  }
  if('pickId' in params) {
    this.pickId = params.pickId
  }
  if('lineWidth' in params) {
    this.lineWidth = params.lineWidth
  }

  //Save geometry data for picking calculations
  this.cells     = cells
  this.positions = positions

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
  
  //Point size
  var pointSizes = params.pointSizes
  var meshPointSize = params.pointSize || 1.0

  //Update bounds
  this.bounds       = [[Infinity,Infinity,Infinity], [-Infinity,-Infinity,-Infinity]]
  for(var i=0; i<positions.length; ++i) {
    var p = positions[i]
    for(var j=0; j<3; ++j) {
      if(isNaN(p) || !isFinite(p)) {
        continue
      }
      this.bounds[0][j] = Math.min(this.bounds[0][j], p[j])
      this.bounds[1][j] = Math.max(this.bounds[1][j], p[j])
    }
  }

  //Pack cells into buffers
  var triangleCount = 0
  var edgeCount = 0
  var pointCount = 0

fill_loop:
  for(var i=0; i<cells.length; ++i) {
    var cell = cells[i]
    switch(cell.length) {
      case 1:
        
        var v = cell[0]
        var p = positions[v]
        
        //Check NaNs
        for(var j=0; j<3; ++j) {
          if(isNaN(p[j]) || !isFinite(p[j])) {
            continue fill_loop
          }
        }

        pPos.push(p[0], p[1], p[2])

        var c
        if(vertexColors) {
          c = vertexColors[v]
        } else if(cellColors) {
          c = cellColors[i]
        } else {
          c = meshColor
        }
        if(c.length === 3) {
          pCol.push(c[0], c[1], c[2], 1)
        } else {
          pCol.push(c[0], c[1], c[2], c[3])
        }

        if(pointSizes) {
          pSiz.push(pointSizes[v])
        } else {
          pSiz.push(meshPointSize)
        }

        pIds.push(i)

        pointCount += 1
      break
      
      case 2:

        //Check NaNs
        for(var j=0; j<2; ++j) {
          var v = cell[j]
          var p = positions[v]
          for(var k=0; k<3; ++k) {
            if(isNaN(p[k]) || !isFinite(p[k])) {
              continue fill_loop
            }
          }
        }

        for(var j=0; j<2; ++j) {
          var v = cell[j]
          var p = positions[v]

          ePos.push(p[0], p[1], p[2])

          var c
          if(vertexColors) {
            c = vertexColors[v]
          } else if(cellColors) {
            c = cellColors[i]
          } else {
            c = meshColor
          }
          if(c.length === 3) {
            eCol.push(c[0], c[1], c[2], 1)
          } else {
            eCol.push(c[0], c[1], c[2], c[3])
          }

          eIds.push(i)
        }
        edgeCount += 1
      break
      
      case 3:
        //Check NaNs
        for(var j=0; j<3; ++j) {
          var v = cell[j]
          var p = positions[v]
          for(var k=0; k<3; ++k) {
            if(isNaN(p[k]) || !isFinite(p[k])) {
              continue fill_loop
            }
          }
        }

        for(var j=0; j<3; ++j) {
          var v = cell[j]

          var p = positions[v]
          tPos.push(p[0], p[1], p[2])

          var c
          if(vertexColors) { 
            c = vertexColors[v]
          } else if(cellColors) {
            c = cellColors[i]
          } else {
            c = meshColor
          }
          if(c.length === 3) {
            tCol.push(c[0], c[1], c[2], 1)
          } else {
            tCol.push(c[0], c[1], c[2], c[3])
          }

          var q
          if(vertexNormals) {
            q = vertexNormals[v]
          } else {
            q = cellNormals[i]
          }
          tNor.push(q[0], q[1], q[2])

          tIds.push(i)
        }
        triangleCount += 1
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
  this.pointIds.update(new Uint32Array(pIds))

  this.edgePositions.update(ePos)
  this.edgeColors.update(eCol)
  this.edgeIds.update(new Uint32Array(eIds))
  
  this.trianglePositions.update(tPos)
  this.triangleColors.update(tCol)
  this.triangleNormals.update(tNor)
  this.triangleIds.update(new Uint32Array(tIds)) 
}

proto.draw = function(params) {
  params = params || {}
  var gl = this.gl
  var model = params.model || identityMatrix
  var view = params.view || identityMatrix
  var projection = params.projection || identityMatrix

  var clipBounds = [[-1e6,-1e6,-1e6],[1e6,1e6,1e6]]
  for(var i=0; i<3; ++i) {
    clipBounds[0][i] = Math.max(clipBounds[0][i], this.clipBounds[0][i])
    clipBounds[1][i] = Math.min(clipBounds[1][i], this.clipBounds[1][i])
  }
  
  if(this.triangleCount > 0) {
    var shader = this.triShader
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
    shader.uniforms.clipBounds = clipBounds
    
    var m = mat4.create()
    shader.uniforms.modelInverseTranspose = mat4.transpose(m, mat4.invert(m, model))
    
    this.triangleVAO.bind()
    gl.drawArrays(gl.TRIANGLES, 0, this.triangleCount*3)
    this.triangleVAO.unbind()
  }
  
  if(this.edgeCount > 0) {
    var shader = this.lineShader
    shader.bind()
    shader.uniforms.model = model
    shader.uniforms.view = view
    shader.uniforms.projection = projection
    shader.uniforms.clipBounds = clipBounds

    this.edgeVAO.bind()
    gl.lineWidth(this.lineWidth)
    gl.drawArrays(gl.LINES, 0, this.edgeCount*2)
    this.edgeVAO.unbind()
  }
  
  if(this.pointCount > 0) {
    var shader = this.pointShader
    shader.bind()
    shader.uniforms.model = model
    shader.uniforms.view = view
    shader.uniforms.projection = projection
    shader.uniforms.clipBounds = clipBounds

    this.pointVAO.bind()
    gl.drawArrays(gl.POINTS, 0, this.pointCount)
    this.pointVAO.unbind()
  }
}


proto.drawPick = function(params) {
  params = params || {}
  var gl         = this.gl
  var model      = params.model || identityMatrix
  var view       = params.view || identityMatrix
  var projection = params.projection || identityMatrix
  var clipBounds = [[-1e6,-1e6,-1e6],[1e6,1e6,1e6]]
  for(var i=0; i<3; ++i) {
    clipBounds[0][i] = Math.max(clipBounds[0][i], this.clipBounds[0][i])
    clipBounds[1][i] = Math.min(clipBounds[1][i], this.clipBounds[1][i])
  }

  //Save camera parameters
  this._model      = [].slice.call(model)
  this._view       = [].slice.call(view)
  this._projection = [].slice.call(projection)
  this._resolution = [gl.drawingBufferWidth, gl.drawingBufferHeight]

  var shader = this.pickShader
  shader.bind()

  var uniforms = shader.uniforms
  uniforms.model      = model
  uniforms.view       = view
  uniforms.projection = projection
  uniforms.pickId     = this.pickId/255.0
  uniforms.clipBounds = clipBounds

  if(this.triangleCount > 0) {
    this.triangleVAO.bind()
    gl.drawArrays(gl.TRIANGLES, 0, this.triangleCount*3)
    this.triangleVAO.unbind()
  }
  
  if(this.edgeCount > 0) {
    this.edgeVAO.bind()
    gl.lineWidth(this.lineWidth)
    gl.drawArrays(gl.LINES, 0, this.edgeCount*2)
    this.edgeVAO.unbind()
  }
  
  if(this.pointCount > 0) {
    var shader = this.pointPickShader
    shader.bind()
    var uniforms = shader.uniforms
    uniforms.model      = model
    uniforms.view       = view
    uniforms.projection = projection
    uniforms.pickId     = this.pickId/255.0
    uniforms.clipBounds = clipBounds

    this.pointVAO.bind()
    gl.drawArrays(gl.POINTS, 0, this.pointCount)
    this.pointVAO.unbind()
  }
}


proto.pick = function(pickData) {
  if(!pickData) {
    return null
  }
  if(pickData.id !== this.pickId) {
    return null
  }

  var cellId    = pickData.value[0] + 256*pickData.value[1] + 65536*pickData.value[2]
  var cell      = this.cells[cellId]
  var positions = this.positions

  var simplex   = new Array(cell.length)
  for(var i=0; i<cell.length; ++i) {
    simplex[i] = positions[cell[i]]
  }

  var data = closestPoint(
    simplex, 
    pickData.coord, 
    this._model, 
    this._view, 
    this._projection, 
    this._resolution)
  if(!data) {
    return null
  }
  return {
    position: data[1],
    index:    cell[data[0]],
    cell:     cell,
    cellId:   cellId
  }
}


proto.dispose = function() {
  this.triShader.dispose()
  this.lineShader.dispose()
  this.pointShader.dispose()
  this.pickShader.dispose()
  this.pointPickShader.dispose()

  this.triangleVAO.dispose()
  this.edgeVAO.dispose()
  this.pointVAO.dispose()

  this.trianglePositions.dispose()
  this.triangleColors.dispose()
  this.triangleNormals.dispose()
  this.triangleIds.dispose()

  this.edgePositions.dispose()
  this.edgeColors.dispose()
  this.edgeIds.dispose()

  this.pointPositions.dispose()
  this.pointColors.dispose()
  this.pointSizes.dispose()
  this.pointIds.dispose()
}

function createMeshShader(gl) {
  var shader = createMeshShaderGLSLify(gl)
  shader.attributes.position.location = 0
  shader.attributes.color.location = 1
  shader.attributes.normal.location = 3
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
  shader.attributes.pointSize.location = 3
  return shader
}

function createPickShader(gl) {
  var shader = createPickShaderGLSLify(gl)
  shader.attributes.position.location = 0
  shader.attributes.id.location = 2
  return shader
}

function createPointPickShader(gl) {
  var shader = createPointPickShaderGLSLify(gl)
  shader.attributes.position.location = 0
  shader.attributes.id.location = 2
  shader.attributes.pointSize.location = 3
  return shader
}

function createSimplicialMesh(gl, params) {
  var triShader = createMeshShader(gl)
  var lineShader = createWireShader(gl)
  var pointShader = createPointShader(gl)
  var pickShader      = createPickShader(gl)
  var pointPickShader = createPointPickShader(gl)
  
  var trianglePositions = createBuffer(gl)
  var triangleColors = createBuffer(gl)
  var triangleNormals = createBuffer(gl)
  var triangleIds = createBuffer(gl)
  var triangleVAO = createVAO(gl, [
    { buffer: trianglePositions,
      type: gl.FLOAT,
      size: 3
    },
    { buffer: triangleColors,
      type: gl.FLOAT,
      size: 4
    },
    { buffer: triangleIds,
      type: gl.UNSIGNED_BYTE,
      size: 4,
      normalized: true
    },
    { buffer: triangleNormals,
      type: gl.FLOAT,
      size: 3
    }
  ])
  
  var edgePositions = createBuffer(gl)
  var edgeColors = createBuffer(gl)
  var edgeIds = createBuffer(gl)
  var edgeVAO = createVAO(gl, [
    { buffer: edgePositions,
      type: gl.FLOAT,
      size: 3
    },
    { buffer: edgeColors,
      type: gl.FLOAT,
      size: 4
    },
    { buffer: edgeIds,
      type: gl.UNSIGNED_BYTE,
      size: 4,
      normalized: true
    }
  ])
  
  var pointPositions = createBuffer(gl)
  var pointColors = createBuffer(gl)
  var pointSizes = createBuffer(gl)
  var pointIds = createBuffer(gl)
  var pointVAO = createVAO(gl, [
    { buffer: pointPositions,
      type: gl.FLOAT,
      size: 3
    },
    { buffer: pointColors,
      type: gl.FLOAT,
      size: 4
    },
    { buffer: pointIds,
      type: gl.UNSIGNED_BYTE,
      size: 4,
      normalized: true
    },
    { buffer: pointSizes,
      type: gl.FLOAT,
      size: 1
    }
  ])
  
  var mesh = new SimplicialMesh(gl,
    triShader, lineShader, pointShader,
    pickShader, pointPickShader,
    trianglePositions, triangleColors, triangleNormals, triangleIds, triangleVAO,
    edgePositions, edgeColors, edgeIds, edgeVAO,
    pointPositions, pointColors, pointSizes, pointIds, pointVAO)
  
  mesh.update(params)
  
  return mesh
}

module.exports = createSimplicialMesh