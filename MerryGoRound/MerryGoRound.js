/* merryGoRound.js
 *	
 * Written by Emiliano Velazquez
 *   
 * This file contains code to create and draw a Merry-Go-Round with 4 horses and poles. All movement tranformations handled here.
 *   
*/

class MerryGoRound{
	constructor(gl, program){
		
		this.program = program;		// The shader program
		this.gl = gl;				// WebGL graphics environment

		this.foundation = new Cone (25, gl, program, vec3(0.6, 0.6, 0.6));			// The Top and Bottom Cones of the MGR
		this.middlePole = new Cylinder(25, gl, program, vec3(0.6, 0.6, 0.6), 1.0);	// The Middle cylinder of the MGR, checkered texture
		this.topSphere = new Sphere(gl, program);		// The sphere at the top of the MGR

		// We create 4 MGR horses and their poles
		this.horses = [];										
		this.poles = [];										
		
		// The tranformation matrices for the MGR parts
		this.baseXform = mult(translate(0, 0.1, 0), scalem(5, 0.2, 5));	
		this.baseDepthXform = mult(translate(0, -0.4, 0), scalem(5, 0.5, 5));	
		this.topXform = mult(translate(0, 5, 0), scalem(5, 2, 5));			
		this.midXform =  scalem(1, 5, 1);
		this.sphereXform = translate(0, 7.5, 0);			
		

		// The horse and poles scaling and translations
		// They need to be pushed out to the sides of the MGR translations above and scaled to fit
		var poleScale = scalem(0.1, 5, 0.1);
		var horseScale = scalem(0.8, 2, 0.8);	

		var horseTranslation = [ [ 4, 2.5, 1], [ 1, 2.5, -4], [ -4, 2.5, -1], [ -1, 2.5, 4] ];
		var poleTranslation = [ [ 4, 0, 1], [ 1, 0, -4], [ -4, 0, -1], [ -1, 0, 4] ];

		var horseAxes = [ [ -1, 0, 0], [ 0, 0, 1], [ 1, 0, 0], [ 0, 0, -1] ];		// Horse rotation axes matrix to point forward as they spin
		var horseColors = [ [ 1, 0.5, 0.5], [ 0.5, 1, 0.5], [ 0.5, 0.5, 1], [ 0.5, 0.5, 0.5] ];	// Horse solid colors matrix

		// Perform the horse transformations for each of the 4 horses
		this.horseXform = [];
		for(var i = 0; i < 4; i++){
			var horseT = translate(horseTranslation[i][0], horseTranslation[i][1], horseTranslation[i][2]);
			var horseR = rotate(90, horseAxes[i]);
			var Xform = mult(horseR, horseScale);
			this.horseXform[i] = mult(horseT, Xform);
			this.horses[i] = new Horse(gl, program, vec3(0.6, 0.6, 0.6));
		}

		// Perform the pole transformations for each of the 4 poles, reuse the horse colors
		this.polesXform = [];
		for(var i = 0; i < 4; i++){
			this.polesXform[i] = mult( translate(poleTranslation[i][0], poleTranslation[i][1], poleTranslation[i][2]), poleScale);
			this.poles[i] = new Cylinder(12, gl, program, horseColors[i], 0.0);	// No texture for the poles
		}

		return;
	}

	render(time, position){
	
		var MGR_rotation = rotateY(time);	// Get the rotation matrix of the MGR
		var MGR_translation = mat4();

		// If given valid position, set the translate matrix, otherwise ignore
		if(Array.isArray(position) && position.length == 3){
			MGR_translation = translate(position[0], position[1], position[2]);
		}
	
		var MGR_Xform = mult(MGR_translation, MGR_rotation);	// The overall MGR transformation
		
		var vTransformation = gl.getUniformLocation(program, "vTransformation");
		var vNormalTransformation = gl.getUniformLocation( program, "vNormalTransformation" );

		// Transform the Bottom foundation of the MGR
		var btransformation = mult (MGR_Xform, this.baseXform);
		gl.uniformMatrix4fv( vTransformation, false, flatten( btransformation ) );
		var bnormalTransformation = normalMatrix(btransformation, true);
		gl.uniformMatrix3fv( vNormalTransformation, false, flatten( bnormalTransformation ) );
		this.foundation.render(); 

		// Transform the Bottom Depth pole of the MGR
		var bdtransformation = mult (MGR_Xform, this.baseDepthXform);
		gl.uniformMatrix4fv( vTransformation, false, flatten( bdtransformation ) );
		var bdnormalTransformation = normalMatrix(bdtransformation, true);
		gl.uniformMatrix3fv( vNormalTransformation, false, flatten( bdnormalTransformation ) );
		this.middlePole.render();
		
		// Transform the Top piece and render it
		var ttransformation = mult(MGR_Xform, this.topXform);
		gl.uniformMatrix4fv( vTransformation, false, flatten( ttransformation ) );
		var tnormalTransformation = normalMatrix(ttransformation, true);
		gl.uniformMatrix3fv( vNormalTransformation, false, flatten( tnormalTransformation ) );
		this.foundation.render();
 
		// Transform the Middle piece and render it
		var mtransformation = mult(MGR_Xform, this.midXform);
		gl.uniformMatrix4fv( vTransformation, false, flatten( mtransformation ) );
		var mnormalTransformation = normalMatrix(mtransformation, true);
		gl.uniformMatrix3fv( vNormalTransformation, false, flatten( mnormalTransformation ) );
		this.middlePole.render();

		// Transform the Sphere piece and render it
		var stransformation = mult(MGR_Xform, this.sphereXform);
		gl.uniformMatrix4fv( vTransformation, false, flatten( stransformation ) );
		var snormalTransformation = normalMatrix(stransformation, true);
		gl.uniformMatrix3fv( vNormalTransformation, false, flatten( snormalTransformation ) );
		this.topSphere.render();
			
		for(var i = 0; i < 4; i++){
			// Combine with the MGR transformation to get final position of the pole, render it
			var ptransformation = mult(MGR_Xform,this.polesXform[i]);
			gl.uniformMatrix4fv( vTransformation, false, flatten( ptransformation ) );
			var pnormalTransformation = normalMatrix(ptransformation, true);
			gl.uniformMatrix3fv( vNormalTransformation, false, flatten( pnormalTransformation ) );
			this.poles[i].render();
		}

		for(var i = 0; i < 4; i++){
			// Generates the overall transformation of the horse relative to the MGR and moves it up and down
			var htransformation = mult(translate(0, Math.sin(0.03 * (time + i * 90)), 0), this.horseXform[i]);	

			// Combine with the MGR transformation to get final position of the horse, render it
			htransformation = mult(MGR_Xform,htransformation);
			gl.uniformMatrix4fv( vTransformation, false, flatten( htransformation ) );
			var hnormalTransformation = normalMatrix(htransformation, true);
			gl.uniformMatrix3fv( vNormalTransformation, false, flatten( hnormalTransformation ) );
			this.horses[i].render();
		}

	}
}