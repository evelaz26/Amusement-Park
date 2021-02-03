/* horse.js
 *
 * Written by Emiliano Velazquez 
 * 
 * This file contains code to create and draw a horse object consisting of a cone head and cube body.
 * 
*/
class Horse{

    constructor(gl, program, color){
    
        this.gl = gl;               // WebGL graphics environment
        this.program = program;     // The shader program     
        
        this.cube = new ShortCube(gl, program, color);
        this.cone = new Cone(30, gl, program, color); // Every horse's head has 30 triangle sectors
        return;
    }

    render(){
        this.cone.render(); // The horse head
        this.cube.render(); // The horse body
        return;
    }
}

