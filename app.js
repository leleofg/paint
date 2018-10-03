function salvar() {
    window.print();
}

var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec2 vertPosition;',
'',
'void main()',
'{',
'   gl_Position = vec4(vertPosition, 0.0, 1.0);',
'',
'}'
].join('\n');

var fragmentShaderText = 
[
'precision mediump float;',
'',
'void main()',
'{',
'   gl_FragColor = vec4(0,0,1,1);', //muda a cor do triângulo
'}'
].join('\n');

function destroy(id) {

    if(id == 'all') {
        var element = document.getElementById('canvas-triangle');
        element.parentNode.removeChild(element);

        var element = document.getElementById('canvas-square');
        element.parentNode.removeChild(element);
    }

    var element = document.getElementById(id);
    element.parentNode.removeChild(element);
}

function createTriangle() {

    var canv = document.createElement('canvas');
    canv.id = 'canvas-triangle';
    canv.className = 'draggable';

    document.body.appendChild(canv);
    document.getElementById('body').appendChild(canv);

    var canvas = document.getElementById('canvas-triangle');
    canvas.style.display = 'block';
    var gl = canvas.getContext('webgl');

    if(!gl) {
        alert('Seu browser não suporta WebGL');
    }

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.validateProgram(program);

    var triangleVertices = [
        0.0, 1,
        -1, -1,
        1, -1
    ];

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        positionAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.enableVertexAttribArray(positionAttribLocation);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
};

var canvas;
var gl;
var squareVerticesBuffer;
var shaderProgram;
var vertexPositionAttribute;

function createSquare() {

    var canv = document.createElement('canvas');
    canv.id = 'canvas-square';
    canv.className = 'draggable';

    document.body.appendChild(canv);
    document.getElementById('body').appendChild(canv);

    canvas = document.getElementById("canvas-square");
    canvas.style.display = 'block';
    gl = canvas.getContext("webgl");
    if(!gl) {
        alert("Sem WebGL");
        return;
    }

    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    initShaders();
    initBuffers();
    drawScene();
}

function initBuffers() {
    squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

    var vertices = [
        1, 4, 0.0,
        -4, 4, 0.0,
        1, -4, 0.0,
        -4, -4, 0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Não pode inicializar o programa de shader');
    }

    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
}

function getShader (gl, id) {
    var shaderScript = document.getElementById(id);

    if(!shaderScript) {
        alert("Sem Shader");
        return null;
    }

    var theSource = "";
    var currentChild = shaderScript.firstChild;

    while(currentChild) {
        if(currentChild.nodeType == 3) {
            theSource += currentChild.textContent;
        }

        currentChild = currentChild.nextSibling;
    }

    var shader;

    if(shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === "x-shader/x-vertex"){
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, theSource);
    gl.compileShader(shader);

    return shader;
}