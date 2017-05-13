/**
 *Setup the skybox buffers
 *Uses two traingle meshes as vertices and normals
 */
function setupSkyboxBuffers(){
    skyboxVBuffer = gl.createBuffer();//defined in main .js file
    gl.bindBuffer(gl.ARRAY_BUFFER,skyboxVBuffer);
    var SkyBoxVertex = [
    //negX
      -1.0,-1.0, 1.0,
      -1.0, 1.0, 1.0,
      -1.0, 1.0,-1.0,
        
      -1.0,-1.0, 1.0,
      -1.0,-1.0,-1.0,
      -1.0, 1.0,-1.0,
    //posX
       1.0,-1.0, 1.0,
       1.0, 1.0, 1.0,
       1.0, 1.0,-1.0,
        
       1.0,-1.0, 1.0,
       1.0,-1.0,-1.0,
       1.0, 1.0,-1.0,
    //negY
       1.0,-1.0, 1.0,
      -1.0,-1.0, 1.0,
      -1.0,-1.0,-1.0,
        
       1.0,-1.0, 1.0,
       1.0,-1.0,-1.0,
      -1.0,-1.0,-1.0,
    //posY
       1.0, 1.0, 1.0,
      -1.0, 1.0, 1.0,
      -1.0, 1.0,-1.0,
        
       1.0, 1.0, 1.0,
       1.0, 1.0,-1.0,
      -1.0, 1.0,-1.0,
    //negZ
      -1.0,-1.0,-1.0,
      -1.0, 1.0,-1.0,
       1.0, 1.0,-1.0,
        
      -1.0,-1.0,-1.0,
       1.0,-1.0,-1.0,
       1.0, 1.0,-1.0,
    //posZ
      -1.0,-1.0, 1.0,
      -1.0, 1.0, 1.0,
       1.0, 1.0, 1.0,
        
      -1.0,-1.0, 1.0,
       1.0,-1.0, 1.0,
       1.0, 1.0, 1.0
    ]; //really
    
    for (var i=0;i<108;i++){
        SkyBoxVertex[i]=SkyBoxVertex[i]*10;//scale up the skybox from a tiny cube
    }
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(SkyBoxVertex), gl.STATIC_DRAW);
    skyboxVBuffer.itemSize = 3;
    skyboxVBuffer.numItems = 36;
    
    skyboxNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,skyboxNBuffer);
    var SkyBoxNormal = [
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,
        -1.0,0.0,0.0,
        
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        
        0.0,-1.0,0.0,
        0.0,-1.0,0.0,
        0.0,-1.0,0.0,
        0.0,-1.0,0.0,
        0.0,-1.0,0.0,
        0.0,-1.0,0.0,
        
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        0.0,1.0,0.0,
        
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
        0.0,0.0,-1.0,
        
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0        
    ]; //this is quite normal. Really. IT IS NORMAL.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(SkyBoxNormal), gl.STATIC_DRAW);
    skyboxNBuffer.itemSize = 3;
    skyboxNBuffer.numItems = 36;
}
/**
 *Draw the skybox by setting up the buffers and calling gl.drawArrays
 */
function drawSkybox(){
    gl.bindBuffer(gl.ARRAY_BUFFER,skyboxVBuffer); gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,skyboxVBuffer.itemSize,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,skyboxVBuffer); gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,skyboxNBuffer.itemSize,gl.FLOAT,false,0,0);
    
    //setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, skyboxVBuffer.numItems);
}