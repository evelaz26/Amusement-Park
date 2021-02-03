/* sphere.js
 * 
 * Written by Emiliano Velazquez
 *  
 * This file contains code to create and draw a sphere object.
 *  
*/

var nLong = 20;     // Number of longitude triangles for the Top/Bottom of sphere
var nLat = 35;      // Number of latitude triangles for the Center of sphere

class Sphere{ 
    
	constructor(gl, program) {
		
        this.gl = gl;                   // WebGL graphics environment 
        this.program = program;         // The shader program
        var color;

		var points = [ ];	// Vertex location data 
        var colors = [ ];	// Vertex color data
        var normals = [ ];	// Vertex normal data
        var texCoords = [ ];	// Vertex texture coordinate data
        var texindex = [ ];	// Texture Index for which texture to map or not
        
        var R = 1.0;    // Radius of the sphere
        var phi = 0.0;
        var theta = 0.0;
        
        // the color of the sphere
        color = vec3(0.6, 0.6, 0.6);
        
        // Push the top vertex and color of this sphere, reused many times
        points.push(vec3(0.0, R, 0.0));
        colors.push(color); 
        texCoords.push( vec2( 1 , 1) );
        texindex.push(1.0); // Display the checkered texture

        // The center of this sphere is the origin, so the normals of the sphere are just normalized vertex positions 
        // This calucation was from Dr Angel's ShadedSphere.js programs
        normals.push(normalize(vec3(0.0, R, 0.0)));
        
        phi = Math.PI / nLat;
        var rSinPhi = R * Math.sin(phi);
        var rCosPhi = R * Math.cos(phi);
        var dTheta = 2.0 * Math.PI / nLong;
        
        // The top of the sphere
        for(var i = 0; i < nLong + 1; i++){
            theta = i * dTheta;
            points.push(vec3(rSinPhi * Math.cos(theta), rCosPhi, rSinPhi * Math.sin(theta)));
            normals.push(normalize(vec3(rSinPhi * Math.cos(theta), rCosPhi, rSinPhi * Math.sin(theta))));
            colors.push(color);
            texCoords.push( vec2( 0 / nLong , i / nLat ) );
            texindex.push(1.0); // Display the checkered texture
        }

        // Push the bottom vertex 
        points.push(vec3(0.0, -R, 0.0));
        normals.push(normalize(vec3(0.0, -R, 0.0)));
        colors.push(color);
        texCoords.push( vec2( 0 , 0) );
        texindex.push(1.0); // Display the checkered texture

        // The bottom of the sphere 
        for(var i = 0; i < nLong + 1; i++){
            theta = i * dTheta;
            points.push(vec3(rSinPhi * Math.cos(theta), -rCosPhi, rSinPhi * Math.sin(theta)));
            normals.push(normalize(vec3(rSinPhi * Math.cos(theta), -rCosPhi, rSinPhi * Math.sin(theta))));
            colors.push(color);
            texCoords.push( vec2( 0 / nLong , i / nLat ) );
            texindex.push(1.0); // Display the checkered texture
        }

        // Now the center triangle strips vertex positions and color 
        var phi1, phi2, rSinPhi1, rSinPhi2, rCosPhi1, rCosPhi2;
        var dPhi = Math.PI / nLat;

        for(var i = 0; i < nLat - 2; i++){
            phi1 = (i + 1) * dPhi;
            phi2 = phi1 + dPhi;
            rSinPhi1 = R * Math.sin(phi1);
            rCosPhi1 = R * Math.cos(phi1);
            rSinPhi2 = R * Math.sin(phi2);
            rCosPhi2 = R * Math.cos(phi2);

            for(var j = 0; j < nLong + 1; j++){
                theta = j * dTheta;

                // Push each triangle vertex, normal, color, and texture coordinate data
                points.push(vec3(rSinPhi1 * Math.cos(theta), -rCosPhi1, rSinPhi1 * Math.sin(theta)));
                normals.push(normalize(vec3(rSinPhi1 * Math.cos(theta), -rCosPhi1, rSinPhi1 * Math.sin(theta))));
                colors.push(color);
                texCoords.push( vec2( j / nLong , i / nLat ) ); texindex.push(1.0); // Display the checkered texture

                points.push(vec3(rSinPhi2 * Math.cos(theta), -rCosPhi2, rSinPhi2 * Math.sin(theta)));
                normals.push(normalize(vec3(rSinPhi2 * Math.cos(theta), -rCosPhi2, rSinPhi2 * Math.sin(theta))));
                texCoords.push( vec2( j / nLong , i / nLat ) ); texindex.push(1.0); // Display the checkered texture
                colors.push(color);
            }
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
	
		// Draw the sphere 
        gl.drawArrays( gl.TRIANGLE_FAN, 0, nLong + 2);
        gl.drawArrays( gl.TRIANGLE_FAN, nLong + 2, nLong + 2);

        for(var i = 0; i < nLat - 2; i++){
            var firstIndex = 2 * (nLong + 2) + i * (2 * (nLong + 1));
            gl.drawArrays(gl.TRIANGLE_STRIP, firstIndex, 2 * (nLong + 1));
        }

        return;
	} // renderSphere( )

} // class Sphere