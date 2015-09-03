var canvas;
var gl;

function init()
{
	canvas = document.getElementById('webgl');
	gl = getWebGLContext(canvas, false);
	var vertexSource = document.getElementById('vertexShader').text;
	var fragmentSource = document.getElementById('fragmentShader').text;
	program = createProgram(gl, vertexSource, fragmentSource);
	gl.useProgram(program);

	var positionBuffer = gl.createBuffer();
	var triangleBuffer = gl.createBuffer();

	positionArray = new Float32Array(flatten(positions));
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positionArray, gl.STATIC_DRAW);

	triangleArray = new Uint16Array(flatten(triangles));
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleArray, gl.STATIC_DRAW);
}

function draw()
{
    gl.clearColor(0.0, 0.8, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	var vertexPositionLocation = gl.getAttribLocation(program, 'vertexPosition');
	gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPositionLocation);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
	gl.drawElements(gl.TRIANGLES, triangleArray.length, gl.UNSIGNED_SHORT, 0);
}