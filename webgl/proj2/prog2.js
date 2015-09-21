var canvas;
var gl;

var modelRotationX = 0;
var modelRotationY = 0;
var dragging = false;
var lastClientX;
var lastClientY;

var autoRotate = 0;

function init()
{
	canvas = document.getElementById('webgl');
	gl = getWebGLContext(canvas, false);
	var vertexSource = document.getElementById('vertexShader').text;
	var fragmentSource = document.getElementById('fragmentShader').text;
	program = createProgram(gl, vertexSource, fragmentSource);
	gl.useProgram(program);

	positionBuffer = gl.createBuffer();
	triangleBuffer = gl.createBuffer();
	colorBuffre = gl.createBuffer();

    projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix");
    viewMatrixLocation = gl.getUniformLocation(program, "viewMatrix");
    modelMatrixLocation = gl.getUniformLocation(program, "modelMatrix");

	// x, y z coordinates of the vertices.
	var positions = cube.vertices;

	// vertex index
	var triangles = cube.triangles;

	//vertext color
	var colors = cube.colors;

	positionArray = new Float32Array(flatten(positions));
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positionArray, gl.STATIC_DRAW);

	triangleArray = new Uint16Array(flatten(triangles));
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleArray, gl.STATIC_DRAW);

	colorArray = new Float32Array(flatten(colors));
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffre);
	gl.bufferData(gl.ARRAY_BUFFER, colorArray, gl.STATIC_DRAW);

    canvas.onmousedown = function(ev){
        dragging = true;
        lastClientX = ev.clientX;
        lastClientY = ev.clientY;
    };

    canvas.onmouseup = function(ev){
        dragging = false;
    };

    canvas.onmousemove = function(ev) {
        if (dragging)
        {
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

	//drawScene = function(){
	//	modelRotationY = modelRotationY + 1;
	//	draw();
	//	requestAnimationFrame(drawScene);
	//};
	//requestAnimationFrame(drawScene);
	draw();
}

function draw()
{
	gl.clearColor(0.0, 0.8, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

    var projectionMatrix = new Matrix4();
    projectionMatrix.setPerspective(45, 1, 1, 10);
    var viewMatrix = new Matrix4();
    viewMatrix.translate(0, 0, -5);
    var modelMatrix = new Matrix4();
    modelMatrix.rotate(modelRotationX, 1, 0, 0);
    modelMatrix.rotate(modelRotationY, 0, 1, 0);

    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix.elements);
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix.elements);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix.elements);

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	var vertexPositionLocation = gl.getAttribLocation(program, 'vertexPosition');
	gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPositionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffre);
    var vertexColorLocation = gl.getAttribLocation(program, 'vertexColor');
    gl.vertexAttribPointer(vertexColorLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexColorLocation);

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
	gl.drawElements(gl.TRIANGLES, triangleArray.length, gl.UNSIGNED_SHORT, 0);

}

function flatten(a)
{
	return a.reduce(function (b, v) { b.push.apply(b, v); return b}, []);
}