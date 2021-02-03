/* shortCube.js
 * 
 * Written by Emiliano Velazquez from a template provided by John Bell for CS 425
 *  
 * This file contains code to create and draw a short cube object.
 *  
*/
class ShortCube{ 
    
	constructor(gl, program, color) {
		
        this.gl = gl;                   // WebGL graphics environment 
        this.program = program;         // The shader program
        this.color = color;
        this.cubeVertices = 36;     // Every horse's body has 36 triangle vectors

		var points = [ ];	// Vertex location data 
        var colors = [ ];	// Vertex color data
        var normals = [ ];	// Vertex normal data
        var texCoords = [ ];	// Vertex texture coordinate data
        var texindex = [ ];	// Texture Index for which texture to map or not
        
        // Check if the color is valid, if not generate a random vec3 of one per sector
		var validColor = false;		
		if ( Array.isArray( color ) && color.length == 3 
			&& color[0] >= 0 && color[1] >= 0 && color[2] >=0
			&& color[0] <= 1 && color[1] <= 1 && color[2] <=1 ) {	
			validColor = true;															 
		}

        // Push cube vertices and normals as 6 vertices per face (2 triangles per face). Described below as facing the z-axis.
        // This chunk of code is derived from Prof. Angel's cube.js class, but the cube top is shortened to fit the cone 

        // Front face
        points.push(vec3( -0.5, 0.2, 0.5)); points.push(vec3( -0.5, -0.5, 0.5)); points.push(vec3( 0.5, -0.5, 0.5));
        points.push(vec3( -0.5, 0.2, 0.5)); points.push(vec3( 0.5, -0.5, 0.5)); points.push(vec3( 0.5, 0.2, 0.5));
        normals.push(vec3( 0, 0, 1)); normals.push(vec3( 0, 0, 1)); normals.push(vec3( 0, 0, 1)); 
        normals.push(vec3( 0, 0, 1)); normals.push(vec3( 0, 0, 1)); normals.push(vec3( 0, 0, 1)); 
        
        
        // Right face
        points.push(vec3( 0.5, 0.2, 0.5)); points.push(vec3( 0.5, -0.5, 0.5)); points.push(vec3( 0.5, -0.5, -0.5));
        points.push(vec3( 0.5, 0.2, 0.5)); points.push(vec3( 0.5, -0.5, -0.5)); points.push(vec3( 0.5, 0.2, -0.5));
        normals.push(vec3( 1, 0, 0)); normals.push(vec3( 1, 0, 0)); normals.push(vec3( 1, 0, 0)); 
        normals.push(vec3( 1, 0, 0)); normals.push(vec3( 1, 0, 0)); normals.push(vec3( 1, 0, 0)); 

        // Bottom face
        points.push(vec3( 0.5, -0.5, 0.5)); points.push(vec3( -0.5, -0.5, 0.5)); points.push(vec3( -0.5, -0.5, -0.5));
        points.push(vec3( 0.5, -0.5, 0.5)); points.push(vec3( -0.5, -0.5, -0.5)); points.push(vec3( 0.5, -0.5, -0.5));
        normals.push(vec3( 0, -1, 0)); normals.push(vec3( 0, -1, 0)); normals.push(vec3( 0, -1, 0)); 
        normals.push(vec3( 0, -1, 0)); normals.push(vec3( 0, -1, 0)); normals.push(vec3( 0, -1, 0)); 

        // Top face
        points.push(vec3( 0.5, 0.2, -0.5)); points.push(vec3( -0.5, 0.2, -0.5)); points.push(vec3( -0.5, 0.2, 0.5));
        points.push(vec3( 0.5, 0.2, -0.5)); points.push(vec3( -0.5, 0.2, 0.5)); points.push(vec3( 0.5, 0.2, 0.5));
        normals.push(vec3( 0, 1, 0)); normals.push(vec3( 0, 1, 0)); normals.push(vec3( 0, 1, 0)); 
        normals.push(vec3( 0, 1, 0)); normals.push(vec3( 0, 1, 0)); normals.push(vec3( 0, 1, 0)); 

        // Back face
        points.push(vec3( -0.5, -0.5, -0.5)); points.push(vec3( -0.5, 0.2, -0.5)); points.push(vec3( 0.5, 0.2, -0.5));
        points.push(vec3( -0.5, -0.5, -0.5)); points.push(vec3( 0.5, 0.2, -0.5)); points.push(vec3( 0.5, -0.5, -0.5));
        normals.push(vec3( 0, 0, -1)); normals.push(vec3( 0, 0, -1)); normals.push(vec3( 0, 0, -1)); 
        normals.push(vec3( 0, 0, -1)); normals.push(vec3( 0, 0, -1)); normals.push(vec3( 0, 0, -1)); 

        // Left face
        points.push(vec3( -0.5, 0.2, -0.5)); points.push(vec3( -0.5, -0.5, -0.5)); points.push(vec3( -0.5, -0.5, 0.5));
        points.push(vec3( -0.5, 0.2, -0.5)); points.push(vec3( -0.5, -0.5, 0.5)); points.push(vec3( -0.5, 0.2, 0.5));
        normals.push(vec3( -1, 0, 0)); normals.push(vec3( -1, 0, 0)); normals.push(vec3( -1, 0, 0)); 
        normals.push(vec3( -1, 0, 0)); normals.push(vec3( -1, 0, 0)); normals.push(vec3( -1, 0, 0)); 
        
        // Push a vec3 color for every vertex of the cube
        for (var i = 0; i < this.cubeVertices + 1 ; i++){ 
            colors.push(vec3(color)); 
        }
        
        // Push the texture coordinate for each vertex
        // Since orientation does not matter for our texture, same vertices for each face
        for (var i = 0; i < 36 ; i++){ 
            texCoords.push( vec2( 1.0, 1.0 ) ); texCoords.push( vec2( 0.0, 1.0 ) ); texCoords.push( vec2( 0.0, 0.0 ) );
            texCoords.push( vec2( 1.0, 1.0 ) ); texCoords.push( vec2( 0.0, 0.0 ) ); texCoords.push( vec2( 1.0, 0.0 ) ); 
            texindex.push(1.0); // Display the checkered texture
        }

        
		// Push Vertex Location Data to GPU	
		this.vbufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vbufferID );
		gl.bufferData( gl.ARRAY_BUFFER, flatten( points ), gl.STATIC_DRAW );
		
        // Push Color Data to GPU
        this.cbufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.cbufferID );
        gl.bufferData( gl.ARRAY_BUFFER, flatten( colors ), gl.STATIC_DRAW );
        
        // Push Normal Data to GPU
        this.nbufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.nbufferID );
        gl.bufferData( gl.ARRAY_BUFFER, flatten( normals ), gl.STATIC_DRAW );

        // Push Texel Data to GPU
        this.tbufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.tbufferID );
        gl.bufferData( gl.ARRAY_BUFFER, flatten( texCoords ), gl.STATIC_DRAW );

        // Push Texture Index Data to GPU
        this.tibufferID = gl.createBuffer( ); 
		gl.bindBuffer( gl.ARRAY_BUFFER, this.tibufferID );
		gl.bufferData( gl.ARRAY_BUFFER, flatten( texindex ), gl.STATIC_DRAW );
        
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
		
		return;
	}
	
	render() {
        
        var gl = this.gl;   // Since we are seperated with classes
        
        // Connect the vertex data to the program shader variables
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vbufferID );
		var vPosition = gl.getAttribLocation( this.program, "vPosition" );
		gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPosition );
		
		// Connect the color data to the program shader variables
		gl.bindBuffer( gl.ARRAY_BUFFER, this.cbufferID );
		var vColor = gl.getAttribLocation( this.program, "vColor" );
		gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vColor );
        
        // Connect the normal data to the program shader variables
        gl.bindBuffer( gl.ARRAY_BUFFER, this.nbufferID );
		var vNormal = gl.getAttribLocation( this.program, "vNormal" );
		gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vNormal );
        
        // Connect the texel data to the program shader variables
		gl.bindBuffer( gl.ARRAY_BUFFER, this.tbufferID );
		var vTexCoords = gl.getAttribLocation( this.program, "vTexCoords" );
		gl.vertexAttribPointer( vTexCoords, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vTexCoords );

        // Connect the texture index data to the program shader variables
		gl.bindBuffer( gl.ARRAY_BUFFER, this.tibufferID );
		var vTexIndex = gl.getAttribLocation( this.program, "vTexIndex" );
		gl.vertexAttribPointer( vTexIndex, 1, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vTexIndex );
        
		gl.bindBuffer( gl.ARRAY_BUFFER, null );

        // Draw the cube
        gl.drawArrays(gl.TRIANGLES, 0, this.cubeVertices ); 

        return;
	} // render( )

} // class Cube