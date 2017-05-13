
var gl;
var canvas;
var shaderProgram;

var lastSquareUpdateTime = Date.now();

// physical parameters
var gravity_factor = 200.0;
var friction_factor = 0.01;
var v0 = 20.0;

// array to store all particles
var particles = [];

// the boundary limits for bounding box
var boundX = 50.0;
var boundY = 50.0;
var boundZ = 50.0;

// Create a place to store sphere geometry
var sphereVertexPositionBuffer;

//Create a place to store normals for shading
var sphereVertexNormalBuffer;

// View parameters
var eyePt = vec3.fromValues(0.0,0.0,150.0);
var viewDir = vec3.fromValues(0.0,0.0,-1.0);
var up = vec3.fromValues(0.0,1.0,0.0);
var viewPt = vec3.fromValues(0.0,0.0,0.0);

// Create the normal
var nMatrix = mat3.create();

// Create ModelView matrix
var mvMatrix = mat4.create();

//Create Projection matrix
var pMatrix = mat4.create();
var mvMatrixStack = [];

/**
 * Gnerate a random number with given range
 * @param limit
 * @returns a random number between [-limit, limit]
 */
function rand(limit) {
    return Math.random() * limit * 2 - limit;
}

/**
 * The constructor of the Particle class
 * @constructor
 */
function Particle() {
    this.radius = Math.random() * 3;
    this.m = Math.pow(this.radius, 3) * 10;
    this.p = vec3.fromValues(rand(boundX),rand(boundY),rand(boundZ));
    //this.v = vec3.fromValues(rand(v0), rand(v0), rand(v0));
    this.v = vec3.fromValues(v0, 0, 0);
    this.ka = vec3.fromValues(Math.random(),Math.random(),Math.random());
    this.kd = vec3.fromValues(Math.random(),Math.random(),Math.random());
    this.ks = vec3.fromValues(Math.random(),Math.random(),Math.random());
}

/**
 * Update the particle's position and velocity with a force and a delta time
 * @param f force
 * @param dt delta time
 */
Particle.prototype.update = function (f, dt) {

    // updating position
    this.p[0] += this.v[0] * dt;
    this.p[1] += this.v[1] * dt;
    this.p[2] += this.v[2] * dt;


    // reflection on boundary
    if (this.p[0] >= boundX || this.p[0] <= -boundX)
    {
        this.v[0] = -this.v[0];
    }


    if (this.p[1] >= boundY || this.p[1] <= -boundY)
    {
        this.v[1] = -this.v[1];
    }


    if (this.p[2] >= boundZ || this.p[2] <= -boundZ)
    {
        this.v[2] = -this.v[2];
    }

    // Newton's second law
    var a = vec3.fromValues(f[0] / this.m, f[1] / this.m, f[2] / this.m);
    this.v[0] += a[0] * dt;
    this.v[1] += a[1] * dt;
    this.v[2] += a[2] * dt;

    // velocity limitation
    if (this.v[0] > 100) this.v[0] = 100;
    if (this.v[0] < -100) this.v[0] = -100;
    if (this.v[1] > 100) this.v[1] = 100;
    if (this.v[1] < -100) this.v[1] = -100;
    if (this.v[2] > 100) this.v[2] = 100;
    if (this.v[2] < -100) this.v[2] = -100;
};


//-------------------------------------------------------------------------
function setupSphereBuffers() {
    
    var sphereSoup=[];
    var sphereNormals=[];
    var numT=sphereFromSubdivision(6,sphereSoup,sphereNormals);
    console.log("Generated ", numT, " triangles"); 
    sphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereSoup), gl.STATIC_DRAW);
    sphereVertexPositionBuffer.itemSize = 3;
    sphereVertexPositionBuffer.numItems = numT*3;
    console.log(sphereSoup.length/9);
    
    // Specify normals to be able to do lighting calculations
    sphereVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereNormals),
                  gl.STATIC_DRAW);
    sphereVertexNormalBuffer.itemSize = 3;
    sphereVertexNormalBuffer.numItems = numT*3;
    
    console.log("Normals ", sphereNormals.length/3);     
}

//-------------------------------------------------------------------------
function drawSphere(){
 gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

 // Bind normal buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           sphereVertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);
 gl.drawArrays(gl.TRIANGLES, 0, sphereVertexPositionBuffer.numItems);      
}

//-------------------------------------------------------------------------
function uploadModelViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//-------------------------------------------------------------------------
function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, 
                      false, pMatrix);
}

//-------------------------------------------------------------------------
function uploadNormalMatrixToShader() {
  mat3.fromMat4(nMatrix,mvMatrix);
  mat3.transpose(nMatrix,nMatrix);
  mat3.invert(nMatrix,nMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}

//----------------------------------------------------------------------------------
function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}


//----------------------------------------------------------------------------------
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

//----------------------------------------------------------------------------------
function setMatrixUniforms() {
    uploadModelViewMatrixToShader();
    uploadNormalMatrixToShader();
    uploadProjectionMatrixToShader();
}

//----------------------------------------------------------------------------------
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

//----------------------------------------------------------------------------------
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

//----------------------------------------------------------------------------------
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

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    
  shaderProgram.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");    
  shaderProgram.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");  
  shaderProgram.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
  shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
    
  shaderProgram.uniformAmbientMatColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientMatColor");  
  shaderProgram.uniformDiffuseMatColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseMatColor");
  shaderProgram.uniformSpecularMatColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularMatColor");    
    
}


//-------------------------------------------------------------------------
function uploadLightsToShader(loc,a,d,s) {
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}

//-------------------------------------------------------------------------
function uploadMaterialToShader(a,d,s) {
  gl.uniform3fv(shaderProgram.uniformAmbientMatColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseMatColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularMatColorLoc, s);
}


//----------------------------------------------------------------------------------
function setupBuffers() {
    setupSphereBuffers();     
}

//----------------------------------------------------------------------------------
function draw() {
    var transformVec = vec3.create();
  
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // We'll use perspective 
    mat4.perspective(pMatrix,degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);

    // We want to look down -z, so create a lookat point in that direction    
    vec3.add(viewPt, eyePt, viewDir);
    // Then generate the lookat matrix and initialize the MV matrix to that view
    mat4.lookAt(mvMatrix,eyePt,viewPt,up);    
 
    // Set up light parameters
    var Ia = vec3.fromValues(1.0,1.0,1.0);
    var Id = vec3.fromValues(1.0,1.0,1.0);
    var Is = vec3.fromValues(1.0,1.0,1.0);
    
    var lightPosEye4 = vec4.fromValues(0.0,0.0,50.0,1.0);
    lightPosEye4 = vec4.transformMat4(lightPosEye4,lightPosEye4,mvMatrix);
    //console.log(vec4.str(lightPosEye4))
    var lightPosEye = vec3.fromValues(lightPosEye4[0],lightPosEye4[1],lightPosEye4[2]);

    for (var i = 0; i < particles.length; i++)
    {
        var p = particles[i];
        // Set up material parameters
        mvPushMatrix();
        mat4.translate(mvMatrix, mvMatrix,p.p);
        vec3.set(transformVec,p.radius,p.radius,p.radius);
        mat4.scale(mvMatrix, mvMatrix,transformVec);
        uploadLightsToShader(lightPosEye,Ia,Id,Is);
        uploadMaterialToShader(p.ka,p.kd,p.ks);
        setMatrixUniforms();
        drawSphere();
        mvPopMatrix();
    }
  
}

//
var KeyA = 0;
var KeyD = 0;
var KeyW = 0;
var KeyS = 0;
var KeySpace = 0;
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
    if (e.keyCode===87){
        KeyW=1;
    }else if (e.keyCode===83){
        KeyS=1;
    }
    if (e.keyCode == 32)
    {
        KeySpace = 1;
    }
};
//-------------------------------------------------------------------------
/**
 * Based on the key flags, adjust rotation parameters accordingly.
 */
function KeyboardEvents() {
    if (KeyA==1)
        eyePt[0] += 1.0;
    else if (KeyD==1)
        eyePt[0] -= 1.0;
    else if (KeyW==1)
        eyePt[1] -= 1.0;
    else if (KeyS==1)
        eyePt[1] += 1.0;
    else if (KeySpace == 1)
    {
        for (var i = 0; i < 10; i++)
        {
            if (particles.length < 500)
            {
                particles.push(new Particle());
            }
        }
    }
}

/**
 *Clear the flags of all key presses when any key is released.
 */
document.onkeyup=function(e){
    KeyD=0;
    KeyA=0;
    KeyW=0;
    KeyS=0;
    KeySpace = 0;
};
//----------------------------------------------------------------------------------

/**
 * Compute the norm of a vector
 * @param v
 * @returns {number}
 */
function norm(v){
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2] + 1e-6);
}

/**
 * Add two vectors
 * @param v1
 * @param v2
 * @returns {*}
 */
function add(v1, v2) {
    return vec3.fromValues(v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]);
}

/**
 * Substract two vectors
 * @param v1
 * @param v2
 * @returns {*}
 */
function sub(v1, v2) {
    return vec3.fromValues(v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]);
}

/**
 * Compute the gravity beween two particles
 * @param p1
 * @param p2
 * @returns {*}
 */
function gravity(p1, p2) {
    var r = sub(p2.p, p1.p);
    var f = gravity_factor * p1.m * p2.m / (Math.pow(norm(r), 3) + 1e-6);
    return vec3.fromValues(f * r[0], f * r[1], f * r[2]);
}

/**
 * Compute the friction of a particle
 * @param p
 * @returns {*}
 */
function friction(p) {
    return vec3.fromValues(-friction_factor * p.v[0], -friction_factor * p.v[1], -friction_factor * p.v[2]);
}

/**
 * Compute the total force of the idx-th particle
 * @param idx
 * @returns {*}
 */
function force(idx) {
    var g = vec3.fromValues(0.0, 0.0, 0.0);
    for (var i = 0; i < particles.length; i++)
    {
        if (i != idx)
        {
            g = add(g, gravity(particles[idx], particles[i]));
        }
    }

    return add(g, friction(particles[idx]));
}

/**
 * Update All particles
 */
function update() {
    particle_number.innerHTML = "Particle Number: " + particles.length;
    var currentTime = Date.now();
    var dt = 0;
    if (lastSquareUpdateTime) {
        dt = (currentTime - lastSquareUpdateTime) / 1000;
    }
    lastSquareUpdateTime = currentTime;

    for (var i = 0; i < particles.length; i++)
    {
        particles[i].update(force(i), dt);
    }

    for (var i = 0; i < particles.length - 1; i++)
    {
        for (var j = i + 1; j < particles.length; j++)
        {
            if (norm(sub(particles[i].p, particles[j].p)) <= (particles[i].radius + particles[j].radius))
            {
                var tmp = particles[i].v;
                particles[i].v = particles[j].v;
                particles[j].v = tmp;
            }
        }
    }
}

//----------------------------------------------------------------------------------
function startup() {
    particles = [];
    for (var i = 0; i < 30; i++)
    {
        particles.push(new Particle());
    }

    canvas = document.getElementById("myGLCanvas");
    gl = createGLContext(canvas);
    setupShaders();
    setupBuffers();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    gravity_slider = document.getElementById("gravity");
    gravity_slider.onchange = function () {
        gravity_factor = Number(gravity_slider.value);
    };

    friction_slider = document.getElementById("friction");
    friction_slider.onchange = function () {
        friction_factor = Number(friction_slider.value) / 1000;
    };

    reset_btn = document.getElementById("reset_particles");
    reset_btn.onclick = function () {
        particles = [];
    };

    canvas.onclick = function () {
        particles.push(new Particle());
    };

    particle_number = document.getElementById("particle_num");
    lastSquareUpdateTime = Date.now();
    tick();
}

//----------------------------------------------------------------------------------
function tick() {
    requestAnimFrame(tick);
    draw();
    update();
    KeyboardEvents();
}

