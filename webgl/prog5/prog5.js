var canvas;
var gl;

var modelRotationX = 0;
var modelRotationY = 0;
var dragging = false;
var lastClientX;
var lastClientY;

function init()
{
	canvas = document.getElementById('webgl');
	gl = getWebGLContext(canvas, false);
	var vertexSource = document.getElementById('vertexShader').text; // get vertex shader's source code
	var fragmentSource = document.getElementById('fragmentShader').text; // get fragment shader's source code
	program = createProgram(gl, vertexSource, fragmentSource); // create the webgl program
	gl.useProgram(program); // use this webgl program

	positionBuffer = gl.createBuffer(); // create a buffer object to vertex positions
	triangleBuffer = gl.createBuffer(); // create a buffer object to triangle's vertex index in vertex position array
    normalsBuffer = gl.createBuffer(); // create a buffer object to vertex normals

    projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix"); // uniform mat4 projectionMatrix
    viewMatrixLocation = gl.getUniformLocation(program, "viewMatrix"); // uniform mat4 viewMatrix
    modelMatrixLocation = gl.getUniformLocation(program, "modelMatrix"); // uniform mat4 modelMatrix
    lightPositionLocation = gl.getUniformLocation(program, "lightPosition"); // uniform vec4 lightPosition
    modelColorLocation = gl.getUniformLocation(program, "modelColor"); // uniform vec3 modelColor
    lightColorLocation = gl.getUniformLocation(program, "lightColor"); // uniform vec3 lightColor

    // calculate the vertex normals

    // bind vertex position array with array buffer
	positionArray = new Float32Array(flatten(positions));
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positionArray, gl.STATIC_DRAW);

    // bind vertex normal array with array buffer
    normalsArray = new Float32Array(flatten(normals));
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normalsArray, gl.STATIC_DRAW);

    // bind triangle vertex index array with element array buffer
	triangleArray = new Uint16Array(flatten(triangles));
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleArray, gl.STATIC_DRAW);

    // when user click down the mouse
    canvas.onmousedown = function(ev){
        dragging = true;
        lastClientX = ev.clientX;
        lastClientY = ev.clientY;
    };

    // when user release the mouse
    canvas.onmouseup = function(ev){
        dragging = false;
    };

    // when user is moving the mouse
    canvas.onmousemove = function(ev) {
        if (dragging)
        {
            // calculate the moving distance of the mouse
            var dX = ev.clientX - lastClientX;
            var dY = ev.clientY - lastClientY;

            modelRotationY = modelRotationY + dX;
            modelRotationX = modelRotationX + dY;

            if (modelRotationX > 90.0)
            {
                modelRotationX = 90.0;
            }
            if (modelRotationX < -90.0)
            {
                modelRotationX = -90.0;
            }
        }

        lastClientX = ev.clientX;
        lastClientY = ev.clientY;
        draw();
    };
	draw();
}

function draw()
{
	gl.clearColor(1.0, 1.0, 0.9, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

    // set the projection matrix
    var projectionMatrix = new Matrix4();
    projectionMatrix.setPerspective(45, 1, 1, 10);

    // set the view matrix
    var viewMatrix = new Matrix4();
    viewMatrix.translate(0, 0, -5);

    // set the model matrix
    var modelMatrix = new Matrix4();
    modelMatrix.rotate(modelRotationX, 1, 0, 0);
    modelMatrix.rotate(modelRotationY, 0, 1, 0);

    // set uniform variables value in shader
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix.elements);
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix.elements);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix.elements);
    gl.uniform4f(lightPositionLocation, -1.0, 1.0, 1.0, 1.0);
    gl.uniform3f(modelColorLocation, 1.0, 1.0, 1.0);
    gl.uniform3f(lightColorLocation, 1.0, 1.0, 1.0);

    // Set the value of vertexPosition in shader
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	var vertexPositionLocation = gl.getAttribLocation(program, 'vertexPosition');
	gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPositionLocation);

    // Set the value of vertexNormal in shader
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    var vertexNormalLocation = gl.getAttribLocation(program, 'vertexNormal');
    gl.vertexAttribPointer(vertexNormalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexNormalLocation);

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // draw scene
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
	gl.drawElements(gl.TRIANGLES, triangleArray.length, gl.UNSIGNED_SHORT, 0);

}

function flatten(a)
{
	return a.reduce(function (b, v) { b.push.apply(b, v); return b}, []);
}

// vector addition
function add(a, b)
{
    return [
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2]
    ];
}

//vector subtraction
function sub(a, b)
{
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2]
    ];
}

//vector doc product
function dot(a, b)
{
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

//vector cross product
function cross(a, b)
{
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

//vector normallization
function normalize(a)
{
    var len = Math.sqrt(dot(a, a));
    return [
        a[0] / len,
        a[1] / len,
        a[2] / len
    ];
}