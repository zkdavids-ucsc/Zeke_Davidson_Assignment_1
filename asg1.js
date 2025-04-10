// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    // gl_PointSize = 10.0;
    gl_PointSize = u_Size;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

//Global variables
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10;
let g_selectedType = POINT;
let g_selectedSegments = 10;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById("webgl");

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }
}

function connectVariablestoGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to intialize shaders.");
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
        console.log("Failed to get the storage location of a_Position");
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    if (!u_FragColor) {
        console.log("Failed to get the storage location of u_FragColor");
        return;
    }

    u_Size = gl.getUniformLocation(gl.program, "u_Size");
    if (!u_Size) {
        console.log("failed to get the storage location of u_Size");
        return;
    }
}

function addActionsForHtmlUI() {
    document.getElementById("red").onclick = function () {
        g_selectedColor = [1, 0, 0, 1];
    };
    document.getElementById("green").onclick = function () {
        g_selectedColor = [0, 1, 0, 1];
    };

    document.getElementById("clear").onclick = function () {
        g_shapesList = [];
        gl.clearColor(0, 0, 0, 1.0);
        renderAllShapes();
    };
    document.getElementById("art").onclick = function () {
        g_shapesList = [];
        renderAllShapes();
        drawArt();
    };

    document.getElementById("point").onclick = function () {
        g_selectedType = POINT;
    };
    document.getElementById("triangle").onclick = function () {
        g_selectedType = TRIANGLE;
    };
    document.getElementById("circle").onclick = function () {
        g_selectedType = CIRCLE;
    };



    document.getElementById("redSlide").addEventListener(
        "mouseup",
        function () {
            g_selectedColor[0] = this.value / 100;
        },
    );
    document.getElementById("greenSlide").addEventListener(
        "mouseup",
        function () {
            g_selectedColor[1] = this.value / 100;
        },
    );
    document.getElementById("blueSlide").addEventListener(
        "mouseup",
        function () {
            g_selectedColor[2] = this.value / 100;
        },
    );
    // document.getElementById("alphaSlide").addEventListener(
    //     "mouseup",
    //     function () {
    //         g_selectedColor[3] = this.value / 100;
    //     },
    // );

    document.getElementById("sizeSlide").addEventListener(
        "mouseup",
        function () {
            g_selectedSize = this.value;
        },
    );

    document.getElementById("circleSlide").addEventListener(
        "mouseup",
        function () {
            g_selectedSegments = this.value;
        },
    );
}

function main() {
    setupWebGL();

    connectVariablestoGLSL();

    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function (ev) {
        if (ev.buttons == 1) click(ev);
    };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

// var g_points = []; // The array for the position of a mouse press
// var g_colors = []; // The array to store the color of a point
// var g_sizes = []; // The array of the size of the point
function click(ev) {
    [x, y] = convertCoordinatesEventToGL(ev);

    
    let point;
    if(g_selectedType == POINT){
        point = new Point();
    }
    else if(g_selectedType == TRIANGLE){
        point = new Triangle();
    }
    else if(g_selectedType == CIRCLE){
        point = new Circle();
    }
    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    point.segments = g_selectedSegments;
    g_shapesList.push(point);

    // // Store the coordinates to g_points array
    // g_points.push([x, y]);

    // g_colors.push(g_selectedColor.slice());

    // g_sizes.push(g_selectedSize);

    // Store the coordinates to g_points array
    // if (x >= 0.0 && y >= 0.0) {
    //     // First quadrant
    //     g_colors.push([1.0, 0.0, 0.0, 1.0]); // Red
    // } else if (x < 0.0 && y < 0.0) {
    //     // Third quadrant
    //     g_colors.push([0.0, 1.0, 0.0, 1.0]); // Green
    // } else {
    //     // Others
    //     g_colors.push([1.0, 1.0, 1.0, 1.0]); // White
    // }

    renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return [x, y];
}

function renderAllShapes() {
    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // var len = g_points.length;
    var len = g_shapesList.length;
    for (var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }

    var duration = performance.now() - startTime;
    sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration), "numdot");
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

//super inefficient thing to draw a moon
function drawArt(){
    gl.clearColor(0.1, 0.05, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // moon
    let point;
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [0, 0.7, 0, 0.9, 0.4, 0.7];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [0, 0.7, -0.6, 0.6, 0, 0.9];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [-0.3, 0.3, -0.6, 0.6, 0, 0.7];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [-.9, 0, -.6, .6, -.3, .3];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [-.9, 0, -.3, .3, -.3, 0];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [0, 0.7, -0.6, 0.6, 0, 0.9];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [-.9, 0, -.3, 0, -.6, -.6];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [-.6, -.6, -.3, 0, -.2, -.2];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [-.6, -.6, -.2, -.2, 0, -.3];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [-.6, -.6, 0, -.3, 0, -0.9];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [0, -.9, 0, -.3, .3, -.3];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [0, -.9, .3, -.3, .6, -.6];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [0.6, -.6, .3, -.3, .7, 0];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [.6, -.6, .7, 0, .9, 0];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.8, .8, .8, 1];
    point.position = [.9, 0, .7, 0, .7, .4];
    g_shapesList.push(point);

    //eyes
    point = new Shape();
    point.color = [0, 0, 0, 1];
    point.position = [-.6, 0, -.4, 0, -.4, -.1];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [0, 0, 0, 1];
    point.position = [-.4, 0, -.2, .1, -.4, -.1];
    g_shapesList.push(point);

    //tears
    point = new Shape();
    point.color = [0.5, 0.5, 1, 1];
    point.position = [-.5, -.4, -.4, -.2, -.4, -.5];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [0.5, 0.5, 1, 1];
    point.position = [-.9, -.8, -.8, -.6, -.8, -.9];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [0.5, 0.5, 1, 1];
    point.position = [.7, -.8, .8, -.6, .8, -.9];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [0.3, 0.3, 1, 1];
    point.position = [-.4, -.2, -.3, -.4, -.4, -.5];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [0.3, 0.3, 1, 1];
    point.position = [-.8, -.6, -.7, -.8, -.8, -.9];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [0.3, 0.3, 1, 1];
    point.position = [.8, -.6, .9, -.8, .8, -.9];
    g_shapesList.push(point);

    //stars
    point = new Shape();
    point.color = [1, 1, .6, 1];
    point.position = [-.8, .9, -.7, .8, -.8, .7];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [1, 1, .6, 1];
    point.position = [-.9, .7, -.8, .8, -.8, .7];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [1, 1, .6, 1];
    point.position = [.6, .8, .8, .8, .7, .7];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [1, 1, .6, 1];
    point.position = [.7, .8, .8, .9, .8, .8];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [1, 1, .6, 1];
    point.position = [0, .3, .2, .4, .3, .3];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [1, 1, .6, 1];
    point.position = [.2, .4, .3, .6, .3, .3];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [1, 1, .6, 1];
    point.position = [.4, .4, .6, .3, .3, .3];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [1, 1, .6, 1];
    point.position = [.3, 0, .2, .2, .3, .3];
    g_shapesList.push(point);

    point = new Shape();
    point.color = [.7, .7, .3, 1];
    point.position = [-.8, .7, -.7, .8, -.7, .6];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.7, .7, .3, 1];
    point.position = [-.7, .8, -.6, .8, -.7, .7];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.7, .7, .3, 1];
    point.position = [.7, .7, .8, .8, .9, .7];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.7, .7, .3, 1];
    point.position = [.7, .7, .8, .7, .7, .6];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.7, .7, .3, 1];
    point.position = [.3, .6, .4, .4, .3, .3];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.7, .7, .3, 1];
    point.position = [0, .3, .3, .3, .2, .2];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.7, .7, .3, 1];
    point.position = [.3, .3, .4, .2, .3, 0];
    g_shapesList.push(point);
    point = new Shape();
    point.color = [.7, .7, .3, 1];
    point.position = [.3, .3, .6, .3, .4, .2];
    g_shapesList.push(point);

    renderAllShapes();
}