gl-simplicial-complex
=====================
Basic module for drawing a simplicial complex.  This code can be used to get something on the screen quickly.  It is useful for debugging and prototyping, though in a real 3d engine you would probably want to write your own shaders and vertex formats.

Example
=======

```javascript
var shell = require("gl-now")()
var camera = require("game-shell-orbit-camera")(shell)
var mat4 = require("gl-matrix").mat4
var bunny = require("bunny")
var createSimplicialComplex = require("gl-simplicial-complex")

var mesh

shell.on("gl-init", function() {
  var gl = shell.gl
  gl.enable(gl.DEPTH_TEST)
  bunnyMesh = createSimplicialComplex(gl, bunny)
})

shell.on("gl-render", function() {
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
```

[Try out the example in your browser](http://mikolalysenko.github.io/gl-simplicial-complex/)

Install
=======

    npm instal gl-simplicial-complex
    
API
===

```javascript
var createSimplicialComplex = require("gl-simplicial-complex")
```

### `var mesh = createSimplicialComplex(gl, params)`
Creates a simplicial complex that can be drawn directly in a WebGL context.

* `gl` - is a handle to a WebGL context
* `params` is an object that has the following properties:

    + `cells` *(Required)* An indexed list of vertices, edges and/or faces.
    + `positions` *(Required)* An array of positions for the mesh, encoded as arrays
    + `vertexColors` A list of per vertex color attributes encoded as length 3 rgb arrays
    + `cellColors` A list of per cell color attributes
    + `meshColor` A constant color for the entire mesh
    + `vertexNormals` An array of per vertex normals
    + `cellNormals` An array of per cell normals
    + `useFacetNormals` A flag which if set to `true` forces `cellNormals` to be computed
    + `pointSizes` An array of point sizes
    + `pointSize` A single point size float

**Returns** A renderable mesh object

### `mesh.draw(params)`
Draws the mesh to the current buffer using a Phong material.

* `params` is an object that has the following properties
    + `model` The model matrix for the object
    + `view` The view matrix for the camera
    + `projection` The projection matrix for the display
    + `lightPosition` The position of the light source
    + `ambient` The intensity/color value of the ambient light
    + `diffuse` The intensity/color value of the diffuse light
    + `specular` The intensity/color value of the specular light
    + `specularExponent` The specular exponent in the Blinn/Phong model

### `mesh.update(params)`
Updates the contents of the simplicial complex in place.

* `params` is a list of parameters which are in the same format as `createSimplicialComplex`

### `mesh.drawPick(params)`
Draws the mesh for the purposes of point picking and selection.

### `mesh.pick(pickData)`
Using the output from gl-select finds the point on the mesh closest to the given pick data.

**Returns** An object with the following properties:

* `positions` the position of the picked point on the mesh
* `cellId`  the index of the closest cell
* `cell` the cell of the closest point
* `index` the index of the closest vertex

### `mesh.dispose()`
Destroys the mesh object and releases all resources assigned to it.

# Credits
(c) 2013 Mikola Lysenko. MIT License
