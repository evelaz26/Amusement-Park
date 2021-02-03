/* AmusementPark.js
 *	
 * Written by Emiliano Velazquez
 *	
 * The driver class for the amusement park, consisting of a merry-go-round and a sign.
 *
 * This file is an extension of multiObject.js, employing functions in cone.js, 
 * cylinder.js, horse.js and merryGoRound.js.
*/

// Object-independent variables
var gl;					// WebGL graphics environment
var program;			// The shader program
var time = 0.0;			// For the animation in render()
var exit = false;		// To keep track if the program was quitted

var theMerryGoRound;	// The Merry-Go-Round Object
var theSign;			// The billboard sign

// Camera variables 
var eye = vec4(20.0, 2.0, 15.0);
var originalEye = vec4(20.0, 2.0, 15.0);;
var cameraXform = mat4( );			// The camera transformation matrix					
var lookEYE = vec3( -3, 3, -3 );	// The camera eye is positioned
var lookAT = vec3( 6, 0, 6 );		// The point at which the camera is pointed
var lookUP = vec3( 0, 1, 0);		// Restricts location about the eye->at vector


// Initialization function runs whenever the page is loaded
window.onload = function init( ) {
	
	// Listens for when any key on the keyobard is pressed down
	document.addEventListener("keydown", moveCamera, false);

	// Set up the canvas, viewport, and clear color
	var canvas = document.getElementById( "gl-canvas" );
	gl=WebGLUtils.setupWebGL( canvas );
	if( !gl ) {
		alert( "No WebGL" );
	}
	
	gl.viewport( 0, 0, canvas.width, canvas.height );
	var aspectRatio = canvas.width / canvas.height ;
	gl.clearColor( 1.0, 1.0, 0.5, 1.0 );
	
	// Load the shaders, create a GLSL program, and use it.
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	// Send the camera perspective to the GPU, posted here because we call render() many times to animate
	var projection = perspective( 60, aspectRatio, 0.1, 100.0 );
	var vProjection = gl.getUniformLocation( program, "vProjection" );
	gl.uniformMatrix4fv( vProjection, false, flatten( projection ) );

	// The merry-go-round
	theMerryGoRound = new MerryGoRound(gl, program);
	theSign = new Sign(gl, program);
	
	// We create 2 texture objects for our 2 texture maps
	
	// First the red-blue checkered 32 x 32 map
	var texDataCheckered = fillArrayCheckered( );
	var textureCheckered = gl.createTexture( );
	gl.activeTexture( gl.TEXTURE0 );	// The first texture in our textures
	gl.bindTexture( gl.TEXTURE_2D, textureCheckered );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, texDataCheckered );

	// Generate a bitmap for this texture and set parameters to handle any size polygon
	gl.uniform1i( gl.getUniformLocation( program, "texMapCheckered" ), 0 );
	gl.generateMipmap( gl.TEXTURE_2D );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

	gl.bindBuffer( gl.ARRAY_BUFFER, null );

	// Then the MGR sign 32 x 32 map
	var texDataMGR = fillArrayMGR( );
	var textureMGR = gl.createTexture( );
	gl.activeTexture( gl.TEXTURE1 );	// The second texture in our textures
	gl.bindTexture( gl.TEXTURE_2D, textureMGR );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, texDataMGR );

	// Generate a bitmap for this texture and set parameters to handle any size polygon
	gl.uniform1i( gl.getUniformLocation( program, "texMapMGR" ), 1 );
	gl.generateMipmap( gl.TEXTURE_2D );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

	gl.bindBuffer( gl.ARRAY_BUFFER, null );

	gl.enable( gl.DEPTH_TEST );	
	
	// Initialization is done.  Now initiate first rendering
	render( );
}

function render( ) {

	time += 0.8;
	
	// Clear out the color buffers and the depth buffers. Do nothing else if program was exited.
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	if(exit){ return; }
	
	// Create modelView using lookAt( eye, eye+at, up ) and push it to the GPU
	var modelView = lookAt(lookEYE,  add(lookEYE, lookAT) , lookUP);
	modelView = mult( cameraXform, modelView);							// Modify the camera view model matrix as we move around with user input
	var vModelView = gl.getUniformLocation( program, "vModelView" );
	gl.uniformMatrix4fv( vModelView, false, flatten( modelView ) );
	
	// Set the transformation matrix as a mat4 Identity matrix and send it to the GPU	
	var transformation = mat4( );
	var vTransformation = gl.getUniformLocation( program, "vTransformation" );
	gl.uniformMatrix4fv( vTransformation, false, flatten( transformation ) );

	// Set the normal transformation matrix as a mat3 Identity matrix and send it to the GPU	
	var normalTransformation =  mat3( );
	var vNormalTransformation = gl.getUniformLocation( program, "vNormalTransformation" );
	gl.uniformMatrix3fv( vNormalTransformation, false, flatten( normalTransformation ) );

	theSign.render();
	theMerryGoRound.render(time, [6, 0, 6]);	// Redraw the merry-go-round
	requestAnimFrame( render );					// Continously loop through this render function
}

/*
 * Moves the camera by updating the look and camera transform variables ModelView uses in the render funciton.
 * 
*/
function moveCamera(event) {
	
	switch(event.keyCode){
		case 87: // 'W' or 'w'
			// Move the camera forward
			lookEYE = add(lookEYE, mult(vec3(0.1, 0, 0.1), lookAT));
		break;
		case 83: // 'S' or 's'
			// Move the camera backward
			lookEYE = subtract(lookEYE, mult(vec3(0.1, 0, 0.1), lookAT));
		break;
		case 65: // 'A' or 'a'
			// Use rotate() to set the camera transformation matrix to rotate the camera left about the y-axis
			var newXform = mat4();
			newXform = rotateY(-2);  
			cameraXform = mult(newXform, cameraXform);
			
			// Adjust where the camera is pointing
			var direction = vec3(Math.cos( radians(-2)), 0, Math.sin( radians(-2) ));
			lookAT = add(direction, lookAT);

		break;
		case 68: // 'D' or 'd'
			// Use rotate() to set the camera transformation matrix to rotate the camera right about the y-axis
			var newXform = mat4();
			newXform = rotateY(2);  
			cameraXform = mult(newXform, cameraXform);
			
			// Adjust where the camera is pointing
			var direction = vec3(Math.cos( radians(2)), 0, Math.sin( radians(2) ));
			lookAT = subtract(lookAT, direction);
		break;
		case 81: // 'Q' or 'q'
			alert("Program Exited. Refresh to restart!");
			exit = true;
		break;
		case 82: // 'R' or 'r'
			// Reset camera variables
		 	lookEYE = vec3( -3, 3, -3 );
		 	lookAT = vec3( 6, 0, 6 );
			lookUP = vec3( 0, 1, 0);
			cameraXform = mat4( );
		break;
		default: // 'H' 'h' '?' or any undefined character
			alert("Use [W] [A] [S] [D] to move. \n[R] to reset.\n[Q] to quit.");
		
	}

}

/*
 * Fills and returns a texture image of the Merry-Go-Round billboard sign.
 *
 * result : a 32 x 32 RGBA texture image
 * 
*/
function fillArrayMGR( ) {

	// 32 x 32 RGBA texture image
	var result = new Uint8Array( 32 * 32 * 4 );
	
	// 32 x 32 pixel image = 1024 (total pixels) x 4 (RGBA values) = 4096 total indices 
	
	for( r = 0; r < 32; r++ )	// Add 32x32 all grey rectangle
		for( c = 0; c < 32; c++ ) {	
			result[ r * 128 + c * 4 ] = 100;
			result[ r * 128 + c * 4 + 1 ] = 100;
			result[ r * 128 + c * 4 + 2 ] = 100;
			result[ r * 128 + c * 4 + 3 ] = 255;
		}
		
	for( r = 2; r < 14; r++ )	// Add white rectangles
		for( c = 0; c < 9; c++ ) {	
			result[ r * 128 + c * 4 + 8 ] = 255;	// M box
			result[ r * 128 + c * 4 + 9 ] = 255;
			result[ r * 128 + c * 4 + 10 ] = 255;
			result[ r * 128 + c * 4 + 48 ] = 255;	// G box
			result[ r * 128 + c * 4 + 49 ] = 255;
			result[ r * 128 + c * 4 + 50 ] = 255;
			result[ r * 128 + c * 4 + 88 ] = 255;	// R box
			result[ r * 128 + c * 4 + 89 ] = 255;
			result[ r * 128 + c * 4 + 90 ] = 255;
		}
		
	for( r = 0; r < 10; r++ )	// Add rectangles for the letters
		for( c = 0; c < 1; c++ ) {

			// First we draw the vertical lines
			// Start with the longest vertical lines
			result[ r * 128 + c * 4 + 396 ] = 0;	// M left line
			result[ r * 128 + c * 4 + 397 ] = 255;
			result[ r * 128 + c * 4 + 398 ] = 0;
			result[ r * 128 + c * 4 + 420 ] = 0;	// M right line
			result[ r * 128 + c * 4 + 421 ] = 255;
			result[ r * 128 + c * 4 + 422 ] = 0;
			result[ r * 128 + c * 4 + 436 ] = 0;	// G line
			result[ r * 128 + c * 4 + 437 ] = 0;
			result[ r * 128 + c * 4 + 438 ] = 255;
			result[ r * 128 + c * 4 + 476 ] = 255;	// R line
			result[ r * 128 + c * 4 + 477 ] = 0;
			result[ r * 128 + c * 4 + 478 ] = 0;
			// Then we draw the shorter vertical lines
			if( r > 2 ) {	// M Middle Drop
				result[ r * 128 + c * 4 + 408 ] = 0;
				result[ r * 128 + c * 4 + 409 ] = 255;
				result[ r * 128 + c * 4 + 410 ] = 0;
			}
			if( r > 3 ) {	// R Top Right Side
				result[ r * 128 + c * 4 + 492 ] = 255;
				result[ r * 128 + c * 4 + 493 ] = 0;
				result[ r * 128 + c * 4 + 494 ] = 0;
			}
			if( r < 4 ) {	// R Leg
				result[ r * 128 + c * 4 + 500 ] = 255;
				result[ r * 128 + c * 4 + 501 ] = 0;
				result[ r * 128 + c * 4 + 502 ] = 0;
			}
			if( r > 6 ) {	// G Hang on Top
				result[ r * 128 + c * 4 + 460 ] = 0;
				result[ r * 128 + c * 4 + 461 ] = 0;
				result[ r * 128 + c * 4 + 462 ] = 255;
			}
			if( r < 5 ) {	// G Right Leg
				result[ r * 128 + c * 4 + 460 ] = 0;
				result[ r * 128 + c * 4 + 461 ] = 0;
				result[ r * 128 + c * 4 + 462 ] = 255;
			}
			
			// Now we draw the horizontal lines
			// +128 indices for +1 horizontal ordering	

			if( r > 5 ) continue;	// Longer Lines
			result[ c * 128 + r * 4 + 1552 ] = 0;	// M Top Line
			result[ c * 128 + r * 4 + 1553 ] = 255;
			result[ c * 128 + r * 4 + 1554 ] = 0;
			result[ c * 128 + r * 4 + 436 ] = 0;	// G Bottom Line
			result[ c * 128 + r * 4 + 437 ] = 0;
			result[ c * 128 + r * 4 + 438 ] = 255;
			result[ c * 128 + r * 4 + 992 ] = 255;	// R Middle Line
			result[ c * 128 + r * 4 + 993 ] = 0;
			result[ c * 128 + r * 4 + 994 ] = 0;
			result[ c * 128 + r * 4 + 1588 ] = 0;	// G Top Line
			result[ c * 128 + r * 4 + 1589 ] = 0;
			result[ c * 128 + r * 4 + 1590 ] = 255;

			if( r > 3 ) continue;	// Shorter Lines
			result[ c * 128 + r * 4 + 960 ] = 0;	// G Middle Line
			result[ c * 128 + r * 4 + 961 ] = 0;
			result[ c * 128 + r * 4 + 962 ] = 255;
			result[ c * 128 + r * 4 + 1632 ] = 255;	// R Top Line
			result[ c * 128 + r * 4 + 1633 ] = 0;
			result[ c * 128 + r * 4 + 1634 ] = 0;
		}

		// Add the arrow above pointing down
		for( r = 0; r < 14; r++ )	// Add white middle rectangle 
			for( c = 0; c < 5; c++ ) {	
				result[ r * 128 + c * 4 + 2104 ] = 255;
				result[ r * 128 + c * 4 + 2105 ] = 255;
				result[ r * 128 + c * 4 + 2106 ] = 255;
			}
		// Add horizontal line for the arrow
		for( r = 0; r < 10; r++ )	
			for( c = 0; c < 1; c++ ) {
				if( r > 7 ) continue;	// Longest Line
				result[ c * 128 + r * 4 + 2968 ] = 255;	
				result[ c * 128 + r * 4 + 2969 ] = 255;	
				result[ c * 128 + r * 4 + 2970 ] = 255;
				result[ c * 128 + r * 4 + 3020 ] = 255;	
				result[ c * 128 + r * 4 + 3021 ] = 255;	
				result[ c * 128 + r * 4 + 3022 ] = 255;
				if( r > 6 ) continue;	
				result[ c * 128 + r * 4 + 2844 ] = 255;	
				result[ c * 128 + r * 4 + 2845 ] = 255;	
				result[ c * 128 + r * 4 + 2846 ] = 255;
				result[ c * 128 + r * 4 + 2892 ] = 255;	
				result[ c * 128 + r * 4 + 2893 ] = 255;	
				result[ c * 128 + r * 4 + 2894 ] = 255;
				if( r > 5 ) continue;	
				result[ c * 128 + r * 4 + 2720 ] = 255;	
				result[ c * 128 + r * 4 + 2721 ] = 255;	
				result[ c * 128 + r * 4 + 2722 ] = 255;
				result[ c * 128 + r * 4 + 2764 ] = 255;	
				result[ c * 128 + r * 4 + 2765 ] = 255;	
				result[ c * 128 + r * 4 + 2766 ] = 255;
				if( r > 4 ) continue;	
				result[ c * 128 + r * 4 + 2596 ] = 255;	
				result[ c * 128 + r * 4 + 2597 ] = 255;	
				result[ c * 128 + r * 4 + 2598 ] = 255;
				result[ c * 128 + r * 4 + 2636 ] = 255;	
				result[ c * 128 + r * 4 + 2637 ] = 255;	
				result[ c * 128 + r * 4 + 2638 ] = 255;
				if( r > 3 ) continue;	
				result[ c * 128 + r * 4 + 2472 ] = 255;	
				result[ c * 128 + r * 4 + 2473 ] = 255;	
				result[ c * 128 + r * 4 + 2474 ] = 255;
				result[ c * 128 + r * 4 + 2508 ] = 255;	
				result[ c * 128 + r * 4 + 2509 ] = 255;	
				result[ c * 128 + r * 4 + 2510 ] = 255;
				if( r > 2 ) continue;	
				result[ c * 128 + r * 4 + 2348 ] = 255;	
				result[ c * 128 + r * 4 + 2349 ] = 255;	
				result[ c * 128 + r * 4 + 2350 ] = 255;
				result[ c * 128 + r * 4 + 2380 ] = 255;	
				result[ c * 128 + r * 4 + 2381 ] = 255;	
				result[ c * 128 + r * 4 + 2382 ] = 255;
				if( r > 1 ) continue;	// Shortest Line
				result[ c * 128 + r * 4 + 2224 ] = 255;	
				result[ c * 128 + r * 4 + 2225 ] = 255;	
				result[ c * 128 + r * 4 + 2226 ] = 255;
				result[ c * 128 + r * 4 + 2252 ] = 255;	
				result[ c * 128 + r * 4 + 2253 ] = 255;	
				result[ c * 128 + r * 4 + 2254 ] = 255;
			}
	return result;
}

/*
 * Fills and returns a texture image of a Blue-Red checkered pattern.
 *
 * result : a 32 x 32 RGBA texture image
 * 
*/
function fillArrayCheckered( ) {

	// This function returns a 32 x 32 RGBA texture image.
	var result = new Uint8Array( 32 * 32 * 4 );
	
	// 32 x 32 pixel image = 1024 (total pixels) x 4 (RGBA values) = 4096 total indices 
	
	for( r = 0; r < 32; r++ )	// Add 32x32 all red rectangle
		for( c = 0; c < 32; c++ ) {	
			result[ r * 128 + c * 4 ] = 255;
			result[ r * 128 + c * 4 + 1 ] = 50;
			result[ r * 128 + c * 4 + 2 ] = 50;
			result[ r * 128 + c * 4 + 3 ] = 255;
		}
		
	// Add white boxes in a checkered design
	// One line at a time consisting of 4 pixels each to create a box of 4 lines each
	for( r = 0; r < 32; r+=8 )	
		for( c = 0; c < 32; c+=8 ) {	
				result[ r * 128 + c * 4 ] = 50;
				result[ r * 128 + c * 4 + 1 ] = 50;
				result[ r * 128 + c * 4 + 2 ] = 255;
				result[ r * 128 + c * 4 + 4 ] = 50;
				result[ r * 128 + c * 4 + 5 ] = 50;
				result[ r * 128 + c * 4 + 6 ] = 255;
				result[ r * 128 + c * 4 + 8 ] = 50;
				result[ r * 128 + c * 4 + 9 ] = 50;
				result[ r * 128 + c * 4 + 10 ] = 255;
				result[ r * 128 + c * 4 + 12 ] = 50;
				result[ r * 128 + c * 4 + 13 ] = 50;
				result[ r * 128 + c * 4 + 14 ] = 255;

				result[ r * 128 + c * 4 + 128] = 50;
				result[ r * 128 + c * 4 + 129 ] = 50;
				result[ r * 128 + c * 4 + 130 ] = 255;
				result[ r * 128 + c * 4 + 132 ] = 50;
				result[ r * 128 + c * 4 + 133 ] = 50;
				result[ r * 128 + c * 4 + 134 ] = 255;			
				result[ r * 128 + c * 4 + 136] = 50;
				result[ r * 128 + c * 4 + 137 ] = 50;
				result[ r * 128 + c * 4 + 138 ] = 255;
				result[ r * 128 + c * 4 + 140 ] = 50;
				result[ r * 128 + c * 4 + 141 ] = 50;
				result[ r * 128 + c * 4 + 142 ] = 255;

				result[ r * 128 + c * 4 + 256] = 50;
				result[ r * 128 + c * 4 + 257 ] = 50;
				result[ r * 128 + c * 4 + 258 ] = 255;
				result[ r * 128 + c * 4 + 260 ] = 50;
				result[ r * 128 + c * 4 + 261 ] = 50;
				result[ r * 128 + c * 4 + 262 ] = 255;			
				result[ r * 128 + c * 4 + 264] = 50;
				result[ r * 128 + c * 4 + 265 ] = 50;
				result[ r * 128 + c * 4 + 266 ] = 255;
				result[ r * 128 + c * 4 + 268 ] = 50;
				result[ r * 128 + c * 4 + 269 ] = 50;
				result[ r * 128 + c * 4 + 270 ] = 255;

				result[ r * 128 + c * 4 + 384] = 50;
				result[ r * 128 + c * 4 + 385 ] = 50;
				result[ r * 128 + c * 4 + 386 ] = 255;
				result[ r * 128 + c * 4 + 388 ] = 50;
				result[ r * 128 + c * 4 + 389 ] = 50;
				result[ r * 128 + c * 4 + 390 ] = 255;
				result[ r * 128 + c * 4 + 392] = 50;
				result[ r * 128 + c * 4 + 393 ] = 50;
				result[ r * 128 + c * 4 + 394 ] = 255;
				result[ r * 128 + c * 4 + 396 ] = 50;
				result[ r * 128 + c * 4 + 397 ] = 50;
				result[ r * 128 + c * 4 + 398 ] = 255;
		}

	// Then do the other diagonal white box 
	for( r = 4; r < 32; r+=8 )
		for( c = 4; c < 32; c+=8 ) {	
			result[ r * 128 + c * 4 ] = 50;
			result[ r * 128 + c * 4 + 1 ] = 50;
			result[ r * 128 + c * 4 + 2 ] = 255;
			result[ r * 128 + c * 4 + 4 ] = 50;
			result[ r * 128 + c * 4 + 5 ] = 50;
			result[ r * 128 + c * 4 + 6 ] = 255;
			result[ r * 128 + c * 4 + 8 ] = 50;
			result[ r * 128 + c * 4 + 9 ] = 50;
			result[ r * 128 + c * 4 + 10 ] = 255;
			result[ r * 128 + c * 4 + 12 ] = 50;
			result[ r * 128 + c * 4 + 13 ] = 50;
			result[ r * 128 + c * 4 + 14 ] = 255;

			result[ r * 128 + c * 4 + 128] = 50;
			result[ r * 128 + c * 4 + 129 ] = 50;
			result[ r * 128 + c * 4 + 130 ] = 255;
			result[ r * 128 + c * 4 + 132 ] = 50;
			result[ r * 128 + c * 4 + 133 ] = 50;
			result[ r * 128 + c * 4 + 134 ] = 255;			
			result[ r * 128 + c * 4 + 136] = 50;
			result[ r * 128 + c * 4 + 137 ] = 50;
			result[ r * 128 + c * 4 + 138 ] = 255;
			result[ r * 128 + c * 4 + 140 ] = 50;
			result[ r * 128 + c * 4 + 141 ] = 50;
			result[ r * 128 + c * 4 + 142 ] = 255;

			result[ r * 128 + c * 4 + 256] = 50;
			result[ r * 128 + c * 4 + 257 ] = 50;
			result[ r * 128 + c * 4 + 258 ] = 255;
			result[ r * 128 + c * 4 + 260 ] = 50;
			result[ r * 128 + c * 4 + 261 ] = 50;
			result[ r * 128 + c * 4 + 262 ] = 255;			
			result[ r * 128 + c * 4 + 264] = 50;
			result[ r * 128 + c * 4 + 265 ] = 50;
			result[ r * 128 + c * 4 + 266 ] = 255;
			result[ r * 128 + c * 4 + 268 ] = 50;
			result[ r * 128 + c * 4 + 269 ] = 50;
			result[ r * 128 + c * 4 + 270 ] = 255;

			result[ r * 128 + c * 4 + 384] = 50;
			result[ r * 128 + c * 4 + 385 ] = 50;
			result[ r * 128 + c * 4 + 386 ] = 255;
			result[ r * 128 + c * 4 + 388 ] = 50;
			result[ r * 128 + c * 4 + 389 ] = 50;
			result[ r * 128 + c * 4 + 390 ] = 255;
			result[ r * 128 + c * 4 + 392] = 50;
			result[ r * 128 + c * 4 + 393 ] = 50;
			result[ r * 128 + c * 4 + 394 ] = 255;
			result[ r * 128 + c * 4 + 396 ] = 50;
			result[ r * 128 + c * 4 + 397 ] = 50;
			result[ r * 128 + c * 4 + 398 ] = 255;
		}
	
	return result;
}