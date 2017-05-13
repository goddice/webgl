// Buffers
var teapotVertexBuffer;
var teapotNormalBuffer;
var teapotFaceBuffer;

// Vertex Array
var teapotV=[];
// Face Array
var teapotF=[];
// Normal Array
var teapotN=[];

//Count the number of faces and vertices of teapot model
var numF=0;
var numV=0;

/**
 *Parse the wavefront object file; call helper functions to calculate teapot normals of vertices; setup the teapot buffers;
 *@param {string} readText the content of the .obj file in a string, passed in via function in readText.js
 *@return none
 */
function parseTeapotData(readText){

    var lineArray=readText.split('\n');
    for(var i=0; i<lineArray.length;i++){
        var temp=lineArray[i];
        var col=temp.split(' ');
        if(col[0]=='v'){ //this row is for a vertex
            teapotV.push(parseFloat(col[1]));
            teapotV.push(parseFloat(col[2]));
            teapotV.push(parseFloat(col[3]));
            numV++;
            //populate the normal buffer
            teapotN.push(0.0);
            teapotN.push(0.0);
            teapotN.push(0.0);
        }//end if vertex
        else if (col[0]=='f'){//this row is for a face
            teapotF.push(parseInt(col[2])-1);//need to change to 0-indexed
            teapotF.push(parseInt(col[3])-1);//the face lines appear to have double spaces
            teapotF.push(parseInt(col[4])-1);//after the first f
            numF++;
        }
    }//end for all lines in file

    //Add all faces' normalized normal vectors to all of their vertices
    for(var i=0;i<numF;i++){
        var tempN=calcNorm(i,teapotF,teapotV);
        var idx1=teapotF[3*i];
        var idx2=teapotF[3*i+1];
        var idx3=teapotF[3*i+2];
        teapotN[idx1*3]+=tempN[0];
        teapotN[idx1*3+1]+=tempN[1];
        teapotN[idx1*3+2]+=tempN[2];
        teapotN[idx2*3]+=tempN[0];
        teapotN[idx2*3+1]+=tempN[1];
        teapotN[idx2*3+2]+=tempN[2];
        teapotN[idx3*3]+=tempN[0];
        teapotN[idx3*3+1]+=tempN[1];
        teapotN[idx3*3+2]+=tempN[2];
    }

    //Normalize all vertices' normals
    for(var i=0;i<numV;i++){
        unifom(i,teapotN);
    }

    //Setup buffers for teapot
    teapotVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,teapotVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(teapotV),gl.STATIC_DRAW);
    teapotVertexBuffer.numItems=numV;

    teapotNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,teapotNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(teapotN),gl.STATIC_DRAW);
    teapotNormalBuffer.itemSize=3;
    teapotNormalBuffer.numItems=numF;

    teapotFaceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,teapotFaceBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(teapotF),gl.STATIC_DRAW);
    teapotFaceBuffer.numItems=numF*3;

}

/**
 *Calculate the normal vector of one face in the face array.
 *@param {number} faceIdx index into the passed in face array
 *@param {array} teapotF the face array from which one face will be selected, its normal calculated
 *@param {array} teapotV the vertex array from which vertices' data will be read
 *@return the normal vector of the face selected
 */
function calcNorm(faceIdx,teapotF,teapotV){
    var idx1=teapotF[3*faceIdx];
    var idx2=teapotF[3*faceIdx+1];
    var idx3=teapotF[3*faceIdx+2];
    var x1=teapotV[idx1*3];
    var y1=teapotV[idx1*3+1];
    var z1=teapotV[idx1*3+2];
    var x2=teapotV[idx2*3];
    var y2=teapotV[idx2*3+1];
    var z2=teapotV[idx2*3+2];
    var x3=teapotV[idx3*3];
    var y3=teapotV[idx3*3+1];
    var z3=teapotV[idx3*3+2];
    var nx = (y2-y1)*(z3-z1)-((z2-z1)*(y3-y1));
    var ny = (z2-z1)*(x3-x1)-((x2-x1)*(z3-z1));
    var nz = (x2-x1)*(y3-y1)-((y2-y1)*(x3-x1));
    var scale = Math.sqrt(nx*nx+ny*ny+nz*nz);
    nx /= scale;
    ny /= scale;
    nz /= scale;
    var retval = [nx,ny,nz];
    return retval;    
}

/**
 *Scale the normal of a given vertex down to 1; that is to normalize it
 *@param {number} vertIdx the number of the selected vertice
 *@param {array} teapotN contains normals of all vertices
 *@return nothing
 *changes the values in the normal array to be normalized
 */
function unifom(vertIdx,teapotN){
    var vx=teapotN[3*vertIdx];
    var vy=teapotN[3*vertIdx+1];
    var vz=teapotN[3*vertIdx+2];
    var scale = Math.sqrt(vx*vx+vy*vy+vz*vz);
    vx /= scale;
    vy /= scale;
    vz /= scale;
    teapotN[3*vertIdx]=vx;
    teapotN[3*vertIdx+1]=vy;
    teapotN[3*vertIdx+2]=vz;
}


/**
 *Draw the Teapot by binding buffers and call drawElements
 */
function drawTeapot(){
    gl.bindBuffer(gl.ARRAY_BUFFER,teapotVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,teapotNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,teapotFaceBuffer);
    gl.drawElements(gl.TRIANGLES,numF*3,gl.UNSIGNED_SHORT,0);
}
