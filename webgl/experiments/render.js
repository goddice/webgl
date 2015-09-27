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

    positionBuffer = gl.createBuffer();

}