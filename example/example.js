"use strict"

var shell = require("gl-now")()
var camera = require("game-shell-orbit-camera")(shell)
var mat4 = require("gl-matrix").mat4
var bunny = require("bunny")
var createSimplicialComplex = require("../mesh.js")

var bunnyMesh

shell.on("gl-init", function() {
  bunnyMesh = createSimplicialComplex(shell.gl, bunny)
})

shell.on("gl-render", function() {
  shell.gl.enable(shell.gl.DEPTH_TEST)
  bunnyMesh.draw({
    view: camera.view(),
    projection: mat4.perspective(mat4.create(),
          Math.PI/4.0,
          shell.width/shell.height,
          0.1,
          1000.0),
    lightPosition: [1*Math.cos(Date.now()*0.001), 100.0, 1*Math.sin(Date.now() * 0.001)]
  })
})