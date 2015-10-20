//-------------------------------------------------------------------------------------------
// Project 4 - Scene Management
// Celong Liu - 10/20/2015
// In this script, the Shader and Model object are created.
//-------------------------------------------------------------------------------------------

var canvas;
var gl;

// Variables to handel mouse events
var modelRotationX = 0;
var modelRotationY = 0;
var dragging = false;
var lastClientX;
var lastClientY;

function init()
{
    // Retrieve <canvas> element
	canvas = document.getElementById('webgl');
    // Get the rendering context for WebGL
	gl = getWebGLContext(canvas, false);

    if (!gl)
    {
        console.log('Failed to get the rendering context for WebGL');
    }

    // create Shader object for lightingShader
    lightingShader = new Shader('lightingVertexShader', 'lightingFragmentShader'); // initialize shader
    lightingShader.translate = [-1, 0.5, 0.0]; // set initial modelMatrix (left-up)

    // create Shader object for rainbowShader
    rainbowShader = new Shader('rainbowVertexShader', 'rainbowFragmentShader'); // initialize shader
    rainbowShader.translate = [1, 0.5, 0.0];// set initial modelMatrix (right-up)

    // creaete Shader object for goochShader
    goochShader = new Shader('goochVertexShader', 'goochFragmentShader'); // initialize shader
    goochShader.translate = [-0.0, -1.5, 0.0];// set initial modelMatrix (down)

    planeModel = new Model(plane); // create Model object for plane
    cowModel = new Model(cow); // create Model object for cow
    teapotModel = new Model(teapot); // create Model object for teapot

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
    // clear buffer
	gl.clearColor(1.0, 1.0, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    planeModel.draw(lightingShader); // draw plane with lightingShader
    cowModel.draw(rainbowShader); // draw cow with rainbowShader
    teapotModel.draw(goochShader); // draw teapot with goochShader
}

function flatten(a)
{
	return a.reduce(function (b, v) { b.push.apply(b, v); return b}, []);
}

//-------------------------------------------------------------------------------------------
// Shader
//-------------------------------------------------------------------------------------------

// Shader object
// Constructor
var Shader = function (vertexShaderID, fragmentShaderID)
{
    var vertexSource = document.getElementById(vertexShaderID).text; // get vertex shader's source code
    var fragmentSource = document.getElementById(fragmentShaderID).text; // get fragment shader's source code
    this.program = createProgram(gl, vertexSource, fragmentSource); // create the webgl program
    this.location = []; // store locations of uniform variables and attribute variables
    this.translate = []; // store the initial modelMatrix

    // get locations of uniform variables and attribute variables
    this.use();
    this.addUniform("projectionMatrix");
    this.addUniform("viewMatrix");
    this.addUniform("modelMatrix");
    this.addAttribute("vertexPosition");
    this.addAttribute("vertexNormal");
    this.unUse();
};

// Shader.AddUniform (name)
// get uniform variable name's location in shader program, store it in location[]
Shader.prototype.addUniform = function (name)
{
    this.location[name] = gl.getUniformLocation(this.program, name);
};

// Shader.AddAttribute (name)
// get attribute variable name's location in shader program, store it in location[]
Shader.prototype.addAttribute = function (name)
{
    this.location[name] = gl.getAttribLocation(this.program, name);
};

// Shader.setUniform ()
// set the value of uniform variables
Shader.prototype.setUniforms = function()
{
    // set the projection matrix
    var projectionMatrix = new Matrix4();
    projectionMatrix.setPerspective(50, 1, 1, 10);

    // set the view matrix
    var viewMatrix = new Matrix4();
    viewMatrix.translate(0, 0, -5);

    // set the model matrix
    var modelMatrix = new Matrix4();
    modelMatrix.rotate(modelRotationX, 1, 0, 0);
    modelMatrix.rotate(modelRotationY, 0, 1, 0);
    modelMatrix.translate(this.translate[0], this.translate[1], this.translate[2]);

    // set uniform variables value in shader
    if (this.location["projectionMatrix"]) gl.uniformMatrix4fv(this.location["projectionMatrix"], false, projectionMatrix.elements);
    if (this.location["viewMatrix"]      ) gl.uniformMatrix4fv(this.location["viewMatrix"], false, viewMatrix.elements);
    if (this.location["modelMatrix"]     ) gl.uniformMatrix4fv(this.location["modelMatrix"], false, modelMatrix.elements);
};

// Shader.setAttributes (name)
// set the value of attribute variable
Shader.prototype.setAttributes = function (name)
{
    if (this.location[name] >= 0)
    {
        gl.vertexAttribPointer(this.location[name], 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.location[name]);
    }
};

// Shader.use()
// use shader program
Shader.prototype.use = function ()
{
    gl.useProgram(this.program);
};

// Shader.unUse()
// unUse shader program
Shader.prototype.unUse = function ()
{
    gl.useProgram(null);
};


//-------------------------------------------------------------------------------------------
// Model
//-------------------------------------------------------------------------------------------

// Model object
// Constructor
var Model = function (object)
{
    // create buffer objects
    this.positionBuffer = gl.createBuffer();
    this.normalsBuffer = gl.createBuffer();
    this.triangleBuffer = gl.createBuffer();

    // write vertex position information to positionBuffer
    this.positionArray = new Float32Array(flatten(object.positions));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positionArray, gl.STATIC_DRAW);

    // write vertex normal information to normalsBuffer
    this.normalsArray = new Float32Array(flatten(object.normals));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.normalsArray, gl.STATIC_DRAW);

    // write triangle information to triangleBuffer
    this.triangleArray = new Uint16Array(flatten(object.triangles));
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.triangleArray, gl.STATIC_DRAW);
};

// Model.draw (shader)
// draw model with shader
Model.prototype.draw = function (shader)
{
    shader.use();

    // set the value of uniform variables
    shader.setUniforms();

    // Set the value of vertexPosition in shader
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    shader.setAttributes("vertexPosition");

    // Set the value of vertexNormal in shader
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    shader.setAttributes("vertexNormal");

    gl.enable(gl.DEPTH_TEST);

    // draw scene
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer);
    gl.drawElements(gl.TRIANGLES, this.triangleArray.length, gl.UNSIGNED_SHORT, 0);
    shader.unUse();
};