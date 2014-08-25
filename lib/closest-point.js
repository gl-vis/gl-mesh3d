'use strict'

var barycentric = require('barycentric')

module.exports = closestPointToPickLocation

function xformMatrix(m, v) {
  var out = [0,0,0,0]
  for(var i=0; i<4; ++i) {
    for(var j=0; j<4; ++j) {
      out[j] += m[4*i + j] * v[i]
    }
  }
  return out
}

function projectVertex(v, model, view, projection, resolution) {
  var p = xformMatrix(projection,
            xformMatrix(view,
              xformMatrix(model, [v[0], v[1], v[2], 1])))
  for(var i=0; i<3; ++i) {
    p[i] /= p[3]
  }
  return [ 0.5 * resolution[0] * (1.0+p[0]), 0.5 * resolution[1] * (1.0-p[1]) ]
}

function barycentricCoord(simplex, point) {
  if(simplex.length === 2) {
    //TODO: Fix this
    return [1,0]
  } else if(simplex.length === 3) {
    return barycentric(simplex, point)
  }
  return []
}

function interpolate(simplex, weights) {
  var result = [0,0,0]
  for(var i=0; i<simplex.length; ++i) {
    var p = simplex[i]
    var w = weights[i]
    for(var j=0; j<3; ++j) {
      result[j] += w * p[j]
    }
  }
  return result
}

function closestPointToPickLocation(simplex, pixelCoord, model, view, projection, resolution) {
  if(simplex.length === 1) {
    return simplex[0].slice()
  }
  var simplex2D = new Array(simplex.length)
  for(var i=0; i<simplex.length; ++i) {
    simplex2D[i] = projectVertex(simplex[i], model, view, projection, resolution);
  }
  console.log(simplex2D, pixelCoord)
  var weights = barycentricCoord(simplex2D, pixelCoord)
  console.log(weights)
  return interpolate(simplex, weights)
}