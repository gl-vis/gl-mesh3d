"use strict"

var shell        = require('gl-now')()
var camera       = require('game-shell-orbit-camera')(shell)
var mat4         = require('gl-matrix').mat4
var createSelect = require('gl-select')
var bunny        = require('bunny')
var createAxes   = require('gl-axes')
var createSpikes = require('gl-spikes')
var sc           = require('simplicial-complex')

var createSimplicialComplex = require('../mesh.js')

var bunnyMesh, select, spikes, axes
var bounds = [[-10,-10,-10], [10,10,10]]

shell.on("gl-init", function() {
  var gl = shell.gl

  bunnyMesh = createSimplicialComplex(gl, {
    cells: bunny.cells,
    positions: bunny.positions,
    colormap: 'jet'
  })

  select = createSelect(gl, [shell.height, shell.width])
  
  axes = createAxes(gl, {
    bounds: bounds,
    tickSpacing: [1,1,1],
    textSize: 0.05
  })

  spikes = createSpikes(gl, {
    bounds: bounds,
    colors: [[1,0,0], [0,1,0], [0,0,1]],
    position: [0,0,0]
  })
})

shell.on("gl-render", function() {
  var gl = shell.gl

  var cameraParams = {
    view: camera.view(),
    projection: mat4.perspective(mat4.create(),
          Math.PI/4.0,
          shell.width/shell.height,
          0.1,
          1000.0)
  }

  gl.enable(gl.DEPTH_TEST)

  select.shape = [shell.height, shell.width]
  select.begin(shell.mouse[0], shell.mouse[1], 30)
  bunnyMesh.drawPick(cameraParams)
  var pickResult = select.end()

  if(pickResult) {
    spikes.position = bunnyMesh.pick(pickResult).position
    spikes.draw(cameraParams)
  }

  axes.draw(cameraParams)

  bunnyMesh.draw(cameraParams)
})