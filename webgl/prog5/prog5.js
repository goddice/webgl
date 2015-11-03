//-------------------------------------------------------------------------------------------
// Project 5 - Textured Model Rendering
// Celong Liu - 11/03/2015
// In this script, the Shader and Model object are created.
// And using the texture to set the model's color
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

    // create Shader object for chestShader
    chestShader = new Shader('vertexShader', 'fragmentShader'); // initialize shader
    chestShader.lightPosition = [-1.0, 1.0, 1.0]; // default light position
    chestModel = new Model(); // create Model object for plane
    chestModel.initTex("http://i.imgur.com/7thU1gD.jpg");  // initialize texture with image source


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

    ////////// sliders action//////

    var xRangeIn  = document.getElementById("xRangeIn");
    var yRangeIn  = document.getElementById("yRangeIn");
    var zRangeIn  = document.getElementById("zRangeIn");
    var xRangeOut = document.getElementById("xRangeOut");
    var yRangeOut = document.getElementById("yRangeOut");
    var zRangeOut = document.getElementById("zRangeOut");

    function update() {

        // Get the current slider value.

        var x = parseFloat(xRangeIn.value);
        var y = parseFloat(yRangeIn.value);
        var z = parseFloat(zRangeIn.value);


        // Set the current numerical display.

        xRangeOut.innerHTML = x.toFixed(1);
        yRangeOut.innerHTML = y.toFixed(1);
        zRangeOut.innerHTML = z.toFixed(1);

        // Update the light position.

        chestShader.lightPosition = [x, y, z]; // use slider's value to set light position
        draw();
    }

    xRangeIn.oninput = update;
    yRangeIn.oninput = update;
    zRangeIn.oninput = update;

    update();
}

function draw()
{
    // clear buffer
    gl.clearColor(1.0, 1.0, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    chestModel.draw(chestShader); // draw chest with chestShader
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
    this.lightPosition = []; // store the light position

    // get locations of uniform variables and attribute variables
    this.use();
    this.addUniform("projectionMatrix");
    this.addUniform("viewMatrix");
    this.addUniform("modelMatrix");
    this.addUniform("lightPosition");
    this.addUniform("lightColor");
    this.addAttribute("vertexPosition");
    this.addAttribute("vertexNormal");
    this.addAttribute("vertexTexCoord");
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
    viewMatrix.translate(0, 0, -3);

    // set the model matrix
    var modelMatrix = new Matrix4();
    modelMatrix.rotate(modelRotationX, 1, 0, 0);
    modelMatrix.rotate(modelRotationY, 0, 1, 0);
    modelMatrix.translate(0, 0, 0);

    // set uniform variables value in shader
    if (this.location["projectionMatrix"]) gl.uniformMatrix4fv(this.location["projectionMatrix"], false, projectionMatrix.elements);
    if (this.location["viewMatrix"]      ) gl.uniformMatrix4fv(this.location["viewMatrix"], false, viewMatrix.elements);
    if (this.location["modelMatrix"]     ) gl.uniformMatrix4fv(this.location["modelMatrix"], false, modelMatrix.elements);
    if (this.location["lightPosition"]   ) gl.uniform4f(this.location["lightPosition"], this.lightPosition[0], this.lightPosition[1], this.lightPosition[2], 1.0);
    if (this.location["lightColor"]      ) gl.uniform3f(this.location["lightColor"], 1.0, 1.0, 1.0);
};

// Shader.setAttributes (name)
// set the value of attribute variable
Shader.prototype.setAttributes = function (name, size)
{
    if (this.location[name] >= 0)
    {
        gl.vertexAttribPointer(this.location[name], size, gl.FLOAT, false, 0, 0);
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
var Model = function ()
{
    // create buffer objects
    this.positionBuffer = gl.createBuffer();
    this.normalsBuffer = gl.createBuffer();
    this.triangleBuffer = gl.createBuffer();
    this.texCoordBuffer = gl.createBuffer();

    // write vertex position information to positionBuffer
    this.positionArray = new Float32Array(flatten(positions));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positionArray, gl.STATIC_DRAW);

    // write vertex normal information to normalsBuffer
    this.normalsArray = new Float32Array(flatten(normals));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.normalsArray, gl.STATIC_DRAW);

    // write triangle information to triangleBuffer
    this.triangleArray = new Uint16Array(flatten(triangles));
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.triangleArray, gl.STATIC_DRAW);

    // write texture information to texCoordBuffer
    this.texCoordArray = new Float32Array(flatten(texCoords));
    gl.bindBuffer(gl.ARRAY_BUFFER ,this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.texCoordArray, gl.STATIC_DRAW);
};

// Model.initTex (imageURL)
// initialize the texture image

Model.prototype.initTex = function (imageURL)
{

    var image = new Image;
    image.crossOrigin = "anonymous";
    image.onload = function()
    {
        var texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        requestAnimationFrame( function() { draw() });
    }
    image.src = imageURL;
}

// Model.draw (shader)
// draw model with shader
Model.prototype.draw = function (shader)
{
    shader.use();

    // set the value of uniform variables
    shader.setUniforms();

    // Set the value of vertexPosition in shader
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    shader.setAttributes("vertexPosition", 3);

    // Set the value of vertexNormal in shader
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    shader.setAttributes("vertexNormal",3 );

    // Set the value of vertexTexCoord in shader
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    shader.setAttributes("vertexTexCoord", 2);

    gl.enable(gl.DEPTH_TEST);

    // draw scene
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleBuffer);
    gl.drawElements(gl.TRIANGLES, this.triangleArray.length, gl.UNSIGNED_SHORT, 0);
    shader.unUse();
};