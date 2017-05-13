
var gl;
var canvas;
var shaderProgram;

var imageNum=0;


//Create CubeMap texturn buffer
var cubeTexture;

//Create skybox vertices and normals buffer
var skyboxVBuffer;
var skyboxNBuffer;

// View parameters
var eyePt = vec3.fromValues(0.0,0.0,10.0);
var up = vec3.fromValues(0.0,1.0,0.0);
var viewPt = vec3.fromValues(0.0,0.0,0.0);

// Create the normal
var nMatrix = mat3.create();

// Create ModelView matrix
var mvMatrix = mat4.create();
var mvMatrixInv = mat4.create();

//Create Projection matrix
var pMatrix = mat4.create();

//Create ViewWorld matrix
var VWMatrix = mat4.create();

var mvMatrixStack = [];

var angle=0.0;
var teapotAngle=0.0;

// Keyboard flags.0 means not pressed
var KeyA = 0;
var KeyD = 0;
var KeyLeft = 0;
var KeyRight = 0;

// ratio button
var type = 5.0;

function radBtn(val) {
    if (val == "0")
    {
        type = 5.0;
    }
    else
    {
        type = 50.0;
    }
}
/**
 *Raise the flag of certain key presses when those keys are hold down.
 */
document.onkeydown=function(e){
    if (e.keyCode===65){
        KeyA = 1;
    }else
    if (e.keyCode===68){
        KeyD=1;
    }else
    if (e.keyCode===37){
        KeyLeft=1;
    }else if (e.keyCode===39){
        KeyRight=1;
    }
};

/**
 *Clear the flags of all key presses when any key is released.
 */
document.onkeyup=function(e){
    KeyD=0;
    KeyA=0;
    KeyLeft=0;
    KeyRight=0;
};

//-------------------------------------------------------------------------
/**
 * Sends Modelview matrix to shader
 */
function uploadModelViewMatrixToShader() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function uploadModelViewInverseMatrixToShader() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixInvUniform, false, mvMatrixInv);
}
//-------------------------------------------------------------------------
/**
 * Sends projection matrix to shader
 */
function uploadProjectionMatrixToShader() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,
        false, pMatrix);
}

//-------------------------------------------------------------------------
/**
 * Generates and sends the normal matrix to the shader
 */
function uploadNormalMatrixToShader() {
    mat3.fromMat4(nMatrix,mvMatrix);
    mat4.transpose(nMatrix,nMatrix);
    mat4.invert(nMatrix,nMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}


//-------------------------------------------------------------------------
/**
 * Sends the view world matrix to the shader
 */
function uploadVWMatrixToShader() {
    gl.uniformMatrix4fv(shaderProgram.VWMatrixUniform,
        false, VWMatrix);
}

//----------------------------------------------------------------------------------
/**
 * Pushes matrix onto modelview matrix stack
 */
function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}


//----------------------------------------------------------------------------------
/**
 * Pops matrix off of modelview matrix stack
 */
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

//----------------------------------------------------------------------------------
/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms(val) {
    uploadModelViewMatrixToShader();
    uploadModelViewInverseMatrixToShader();
    uploadNormalMatrixToShader();
    uploadProjectionMatrixToShader();
    uploadVWMatrixToShader();
    gl.uniform1f(shaderProgram.typeUniform, val);
}

//----------------------------------------------------------------------------------
/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

//----------------------------------------------------------------------------------
/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
    var names = ["webgl", "experimental-webgl"];
    var context = null;
    for (var i=0; i < names.length; i++) {
        try {
            context = canvas.getContext(names[i]);
        } catch(e) {}
        if (context) {
            break;
        }
    }
    if (context) {
        context.viewportWidth = canvas.width;
        context.viewportHeight = canvas.height;
    } else {
        alert("Failed to create WebGL context!");
    }
    return context;
}

//----------------------------------------------------------------------------------
/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
    var shaderScript = document.getElementById(id);

    // If we don't find an element with the specified id
    // we do an early exit
    if (!shaderScript) {
        return null;
    }

    // Loop through the children for the found DOM element and
    // build up the shader source code as a string
    var shaderSource = "";
    var currentChild = shaderScript.firstChild;
    while (currentChild) {
        if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
            shaderSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function setupShaders() {
    vertexShader = loadShaderFromDOM("shader-vs");
    fragmentShader = loadShaderFromDOM("shader-fs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Failed to setup shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition2");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal2");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.mvMatrixInvUniform = gl.getUniformLocation(shaderProgram, "inverseView");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.VWMatrixUniform = gl.getUniformLocation(shaderProgram, "uVWMatrix");
    shaderProgram.typeUniform = gl.getUniformLocation(shaderProgram, "type");
}

//-------------------------------------------------------------------------
/**
 * Parse the .obj file and generate the teapot buffers
 */
function setupBuffers() {
    readTextFile("teapot_0.obj", parseTeapotData);
}
//-------------------------------------------------------------------------
/**
 * Setup cube map environmental mapping
 */
function setupCubeMap() {
// TODO: Setup Cube Map
    cubeTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP,cubeTexture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    loadCubeMapFace(gl,gl.TEXTURE_CUBE_MAP_POSITIVE_X,cubeTexture,'posx.jpg');
    loadCubeMapFace(gl,gl.TEXTURE_CUBE_MAP_NEGATIVE_X,cubeTexture,'negx.jpg');
    loadCubeMapFace(gl,gl.TEXTURE_CUBE_MAP_POSITIVE_Y,cubeTexture,'posy.jpg');
    loadCubeMapFace(gl,gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,cubeTexture,'negy.jpg');
    loadCubeMapFace(gl,gl.TEXTURE_CUBE_MAP_POSITIVE_Z,cubeTexture,'posz.jpg');
    loadCubeMapFace(gl,gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,cubeTexture,'negz.jpg');
}


//-------------------------------------------------------------------------
/**
 * Loads a picture as face in cube map
 */
function loadCubeMapFace(gl, target, texture, url){
// TODO: Onload call function
    var image = new Image();
    image.onload = function()
    {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texImage2D(target,0,gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        imageNum ++;
        //if(imageNum == 6){
        //   gl.bindTexture(gl.TEXTURE_CUBE_MAP,texture);
        //   gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        //}
    };
    image.src = url;
}

function draw() {
    var transformVec = vec3.create();

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // We'll use perspective
    mat4.perspective(pMatrix,degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    // Rotate perspective on an orbit around the teapot within the skybox.
    eyePt[0]=10*Math.sin(degToRad(angle));
    eyePt[2]=10*Math.cos(degToRad(angle));

    // We want to look down -z, so create a lookat point in that direction
    // Then generate the lookat matrix and initialize the MV matrix to that view
    mat4.lookAt(mvMatrix,eyePt,viewPt,up);

    mvPushMatrix();
    //Enable the Textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP,cubeTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uCubeSampler2"), 0);

    //Draw Skybox
    mvPushMatrix();
    vec3.set(transformVec,0.0,-1.0,0.0);

    setMatrixUniforms(-1.0);
    drawSkybox();
    mvPopMatrix();

    //Draw Teapot
    mvPushMatrix();
    vec3.set(transformVec,0.0,-1.5,0.0);
    mat4.translate(mvMatrix,mvMatrix,transformVec);
    mat4.identity(mvMatrixInv);
    mat4.rotateY(mvMatrixInv, mvMatrixInv, 2 * degToRad(teapotAngle));
    mat4.rotateY(mvMatrix,mvMatrix,degToRad(teapotAngle));
    setMatrixUniforms(type);
    console.log(type);
    drawTeapot();

    mvPopMatrix();
}

//-------------------------------------------------------------------------
/**
 * Based on the key flags, adjust rotation parameters accordingly.
 */
function KeyboardEvents() {
    if (KeyA==1)
        teapotAngle-=1.0;
    else if (KeyD==1)
        teapotAngle+=1.0;
    else if (KeyLeft==1)
        angle-=1.0;
    else if (KeyRight==1)
        angle+=1.0;
}


function startup() {
    canvas = document.getElementById("myGLCanvas");
    gl = createGLContext(canvas);
    setupShaders();
    setupSkyboxBuffers();
    setupBuffers();
    setupCubeMap();
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);
    tick();
}

function tick() {
    requestAnimFrame(tick);
    draw();
    KeyboardEvents();
}