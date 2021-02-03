/* cone.js
 *
 * Written by Emiliano Velazquez 
 * 
 * This file contains code to create and draw a cone object.
 *  
*/
class Cone{ 

	constructor( nSectors, gl, program, color) {
		
        this.nSectors = nSectors;      // The number of triangles to draw for the cone  
        this.gl = gl;                  // WebGL graphics environment
        this.program = program;        // The shader program              
		
		var points = [ ];	// Vertex location data 
		var colors = [ ];	// Vertex color data	
		var normals = [ ];	// Vertex normal data
		var indices = [ ];	// Indices data
		var texCoords = [ ];	// Vertex texture coordinate data
		var texindex = [ ];	// Texture Index for which texture to map or not
		
        
        // Check if the color is valid, if not generate a random vec3 of one per sector
        var validColor = false;
		if ( Array.isArray( color ) && color.length == 3 
			&& color[0] >= 0 && color[1] >= 0 && color[2] >=0
			&& color[0] <= 1 && color[1] <= 1 && color[2] <=1 ) {		
			validColor = true;									
        }
         
        // Push a vec3 color for each vertex
		for( var i = 0; i < 2 * (2 * nSectors + 2); i++ ) {
			if( validColor ){
                colors.push(vec3(color));
            }			
            else{
                colors.push(vec3(Math.random(),Math.random(),Math.random()));
            }
		}

		var dTheta = radians( 360 / nSectors );
		// Bottom side vertices have different normals than the sides, so we must double those vertices
		var halfPts = 2 * nSectors + 2;	

		// The sides of the cone
		for( i = 0; i < nSectors + 1; i++ ) { // Duplicate the starting point
			var theta = i * dTheta;
			var phi = Math.atan(1.0);	// phi for a cone
			var u = i / nSectors;	// Convert section back into a value between 0-1

			// The same normal for each vertex of each triangle, so we reuse thrice
			var normal = vec3(Math.cos(theta), Math.sin(phi), Math.sin(theta));	
			normal = normalize(normal);	

			// Push the positions, normals, and texture coord of each bottom vertex 
			points.push(vec3( Math.cos(theta), 0, Math.sin(theta)));
			normals.push(normal);
			texCoords.push( vec2( u, 0.0 ) );

			// Push the positions, normals, and texture coord of each top vertex
			points.push(vec3(0, 1, 0));
			normals.push(normal);
			texCoords.push( vec2( u, 1.0 ) );

			indices.push(halfPts + 2 * i);	// Push this index to the size count
			texindex.push(1.0); texindex.push(1.0); // Display the checkered texture
		}	

		// The top and bottom of the cone
		for( i = 0; i < nSectors + 1; i++ ) { // Duplicate the starting point
			var theta = i * dTheta;
			var u = i / nSectors;

			// Push the positions, normals, and texture coord of each bottom vertex 
			points.push(vec3( Math.cos(theta), 0, Math.sin(theta)));
			normals.push(vec3(0, -1, 0));
			texCoords.push( vec2( u, 0.0 ) );

			// Push the positions, normals, and texture coord of each top vertex 
			points.push(vec3(0, 1, 0));	
			normals.push(vec3(0, 1, 0));
			texCoords.push( vec2( u, 1.0 ) );

			indices.push(halfPts + 2 * i + 1);	// Push this index to the size count
			texindex.push(1.0);texindex.push(1.0); // Display the checkered texture
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

		// Push Indices Data to GPU
		this.ibufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.ibufferID );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array( indices ), gl.STATIC_DRAW );
		
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

		// Connect the indices data to use here
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.ibufferID );

        gl.bindBuffer( gl.ARRAY_BUFFER, null );
        
		// Draw the cone        
		gl.drawArrays( gl.TRIANGLE_STRIP, 0, 2 * this.nSectors + 2 );	// Sides
		gl.drawElements(gl.TRIANGLE_FAN, this.nSectors + 1, gl.UNSIGNED_BYTE, 0);	// Top Base
		gl.drawElements(gl.TRIANGLE_FAN, this.nSectors + 1, gl.UNSIGNED_BYTE, this.nSectors + 1);	// Bottom Base
        
        return;
	} // render( )

}	// class Cone