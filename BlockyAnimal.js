// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;  
  void main() {
    gl_FragColor = u_FragColor;
  }`


// Global vars for setup
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

// SETUP --------------------------------------------------------------------------
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);

}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Modelmatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_Modelmatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const PIC = 3;

// Globals for UI
let g_AngleX = 0;
let g_camSlider = 0;
let g_AngleY = 0;

let g_frontLeft = 0;
let g_frontRight = 0;
let g_backLeft = 0;
let g_backRight = 0;
let g_base = 0;
let g_middle = 0;
let g_tip = 0;
let g_animate = false;
let shift_key = false;
let g_hat = 0;
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function addActionForHtmlUI() {
  // Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_camSlider = this.value; renderScene(); });

  document.getElementById('frontLeft').addEventListener('mousemove', function () { g_frontLeft = this.value; renderScene(); });
  document.getElementById('frontRight').addEventListener('mousemove', function () { g_frontRight = this.value; renderScene(); });
  document.getElementById('backLeft').addEventListener('mousemove', function () { g_backLeft = this.value; renderScene(); });
  document.getElementById('backRight').addEventListener('mousemove', function () { g_backRight = this.value; renderScene(); });
  document.getElementById('base').addEventListener('mousemove', function () { g_base = this.value; renderScene(); });
  document.getElementById('middle').addEventListener('mousemove', function () { g_middle = this.value; renderScene(); });
  document.getElementById('tip').addEventListener('mousemove', function () { g_tip = this.value; renderScene(); });

  // Buttons
  document.getElementById('on').addEventListener('click', function () { g_animate = true; });
  document.getElementById('off').addEventListener('click', function () { g_animate = false; });

}

// MAIN --------------------------------------------------------------------------
var xyCoord = [0,0];
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionForHtmlUI();
  canvas.onmousedown = click;
  canvas.onmousemove = function (ev) { 
    if (ev.buttons == 1) { 
      click(ev, 1) 
    } else {
      if (xyCoord[0] != 0){
        xyCoord = [0,0];
      }
    }
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);
}

function click(ev, check){
  // if shfit click then animate party hat
  if(ev.shiftKey){
    shift_key = true;
  } 
  // make rotation on y and x axis
  let [x, y] = convertCoordinatesEventToGL(ev);
  if (xyCoord[0] == 0){
    xyCoord = [x, y];
  }
  g_AngleX += xyCoord[0]-x;
  g_AngleY += xyCoord[1]-y;
  if (Math.abs(g_AngleX / 360) > 1){
    g_AngleX = 0;
  }
  if (Math.abs(g_AngleY / 360) > 1){
    g_AngleY = 0;
  }
}

// TICK --------------------------------------------------------------------------
let time = 0;
function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAnimationAngles();
  if (shift_key) {
    g_hat = (10 * Math.sin(3*time));
    time+=0.1;
    if (time >= 1) {
      time = 0;
      shift_key = false;
    }
  }
  renderScene();
  requestAnimationFrame(tick);
}

// UPDATE ANIMATION ANGLES -------------------------------------------------------
function updateAnimationAngles() {
  if (g_animate) {
    //legs
    g_frontLeft = (25 * Math.sin(g_seconds));
    g_frontRight = (25 * Math.sin(g_seconds));
    g_backLeft = (10 * Math.sin(g_seconds));
    g_backRight = (10 * Math.sin(g_seconds));
    //tail
    g_base = (10 * Math.sin(g_seconds));
    // g_middle = (5 * Math.sin(g_seconds));
    //g_tip = (25 * Math.sin(g_seconds));
  }
}

// RENDER --------------------------------------------------------------------------

function renderScene() {
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_AngleX, 0, 1, 0);
  globalRotMat.rotate(g_camSlider, 0, 1, 0);
  globalRotMat.rotate(g_AngleY, -1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var light = [0.95294, 0.88627, 0.92549, 1.0];
  var taupe = [0.51765, 0.49412, 0.53725, 1.0];
  var darkLiver = [0.33725, 0.28627, 0.29804, 1.0];

  // body 
  var body = new Cube();
  body.color = light;
  body.matrix.scale(0.275, 0.35, 0.6);
  body.matrix.translate(-.5, -0.3, -0.25);
  body.render();

  // head
  var head = new Cube();
  head.color = light;
  //head.matrix.rotate(-head_animation, 1, 0, 0);
  head.matrix.scale(0.35, 0.25, 0.35);
  head.matrix.translate(-.5, 0.25, -1.25);
  head.render();

  // snout
  var snout = new Cube();
  snout.color = taupe;
  // face.matrix.rotate(-10, 1, 0, 0);
  //face.matrix.rotate(-head_animation, 1, 0, 0);
  snout.matrix.scale(0.175, 0.125, 0.03);
  snout.matrix.translate(-.5, 0.475, -15.5);
  snout.render();

  // scruff
  var scruff = new Cube();
  scruff.color = light;
  scruff.matrix.scale(0.2, 0.15, 0.1);
  scruff.matrix.translate(-.5, -0.55, -2.5);
  scruff.render();

  // left ear
  var lEar = new Cube();
  lEar.color = taupe;
  lEar.matrix.scale(0.1, 0.1, 0.15);
  lEar.matrix.translate(-1.5, 2.8, -1.6);
  lEar.render();

  // right ear
  var rEar = new Cube();
  rEar.color = taupe;
  rEar.matrix.scale(0.1, 0.1, 0.15);
  rEar.matrix.translate(0.5, 2.8, -1.6);
  rEar.render();

  // left front leg
  var lfleg = new Cube();
  lfleg.color = darkLiver;
  lfleg.matrix.rotate(g_frontLeft, 1, 0, 0);
  lfleg.matrix.scale(0.1, 0.2, 0.1);
  lfleg.matrix.translate(-1.5, -1, -1);
  lfleg.render();

  // right front leg
  var rfleg = new Cube();
  rfleg.color = taupe;
  rfleg.matrix.rotate(-g_frontRight, 1, 0, 0);
  rfleg.matrix.scale(0.1, 0.2, 0.1);
  rfleg.matrix.translate(0.5, -1, -1);
  rfleg.render();

  // left back leg
  var lbleg = new Cube();
  lbleg.color = taupe;
  lbleg.matrix.rotate(-g_backLeft, 1, 0, 0);
  lbleg.matrix.scale(0.1, 0.2, 0.1);
  lbleg.matrix.translate(-1.5, -1, 3.55);
  lbleg.render();

  // right back leg
  var rbleg = new Cube();
  rbleg.color = darkLiver;
  rbleg.matrix.rotate(g_backRight, 1, 0, 0);
  rbleg.matrix.scale(0.1, 0.2, 0.1);
  rbleg.matrix.translate(0.5, -1, 3.55);
  rbleg.render();

  // tail base
  var tailb = new Cube();
  tailb.color = darkLiver;
  tailb.matrix.setRotate(45, 1, 0, 0);
  tailb.matrix.rotate(g_base, 0, 0, 1);
  var middleCoord = new Matrix4(tailb.matrix);
  //var tipCoord = new Matrix4(tailb.matrix);
  tailb.matrix.scale(0.05, 0.05, 0.3);
  tailb.matrix.translate(-0.5, 8, 0.5);
  tailb.render();

  // tail middle
  var tailm = new Cube();
  tailm.color = taupe;
  tailm.matrix = middleCoord;
  //tailm.matrix.setRotate(-45, 1, 0, 0);
  tailm.matrix.rotate(g_middle, 0, 1, 1);
  var tipCoord = new Matrix4(tailm.matrix);
  tailm.matrix.scale(0.05, 0.05, 0.2);
  tailm.matrix.translate(-0.5, 8, 2.25);
  tailm.render();

  // tail tip
  var tailt = new Cube();
  tailt.color = darkLiver;
  tailt.matrix = tipCoord;
  tailt.matrix.rotate(g_tip, 0, 1, 1);
  tailt.matrix.scale(0.05, 0.05, 0.05);
  tailt.matrix.translate(-0.5, 8, 13);
  tailt.render();

  // left eye
  var lefteye = new Cube();
  lefteye.color = [1, 1, 1, 1];
  // lefteye.matrix.rotate(-10, 1, 0, 0);
  //lefteye.matrix.rotate(-head_animation, 1, 0, 0);
  lefteye.matrix.scale(0.1, 0.061, 0.04);
  lefteye.matrix.translate(-1.5, 3.5, -10.95);
  lefteye.render();

  var lefteyeblack = new Cube();
  lefteyeblack.color = [0, 0, 0, 1];
  // lefteyeblack.matrix.rotate(-10, 1, 0, 0);
  //lefteyeblack.matrix.rotate(-head_animation, 1, 0, 0);
  lefteyeblack.matrix.scale(0.05, 0.061, 0.04);
  lefteyeblack.matrix.translate(1, 3.5, -11);
  lefteyeblack.render();

  // right eye
  var righteye = new Cube();
  righteye.color = [1, 1, 1, 1];
  // righteye.matrix.rotate(-10, 1, 0, 0);
  //righteye.matrix.rotate(-head_animation, 1, 0, 0);
  righteye.matrix.scale(0.1, 0.061, 0.04);
  righteye.matrix.translate(0.5, 3.5, -10.95);
  righteye.render();

  var righteyeblack = new Cube();
  righteyeblack.color = [0, 0, 0, 1];
  // righteyeblack.matrix.rotate(-10, 1, 0, 0);
  //righteyeblack.matrix.rotate(-head_animation, 1, 0, 0);
  righteyeblack.matrix.scale(0.05, 0.061, 0.04);
  righteyeblack.matrix.translate(-2, 3.5, -11);
  righteyeblack.render();

  //nose
   var nose = new Cube();
   nose.color = darkLiver;
   // righteye.matrix.rotate(-10, 1, 0, 0);
   //righteye.matrix.rotate(-head_animation, 1, 0, 0);
   nose.matrix.scale(0.08, 0.05, 0.04);
   nose.matrix.translate(-0.5, 2.75, -11.95);
   nose.render();

   // party hat
   var party = new Cone();
   party.color = [0.70196, 0.85098, 1.00000,1];
   party.matrix.rotate(90,1,0,0);
   party.matrix.rotate(g_hat, 1, 0, 0);
   //party.matrix.scale(2,2, 2);
   party.matrix.translate(0, -0.275, -0.5);
   party.render()

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}