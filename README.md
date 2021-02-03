## Amusement-Park

A WebGL program of a 3D Merry-Go-Round and billboard sign. It incorporates computer graphics concepts including 3D modeling, lighting, shading, texture mapping, animation, and user interaction. This webpage was developed following the book *Interactive Computer Graphics - A Top-Down Approach with WebGL* by Edward Angel & Dave Shreiner. 

In this program, each object class defines the position, color, normals, texture coordinates , and texture type for each vertex pushed to the shader. Initial position calculations are calculated, then transformation calculations are done at render time. Lighting calculations are done in the shaders. *Phong* shading in the fragment shader as a point light (Red light coming from the left-front) and *Gaurand* shading in the vertex shader as a directed light (Blue light coming from the right-back).

Dr. Angel provides useful matrix and vector functions in files found in the **Common** directory. The **MerryGoRound** directory contains the following files I worked on:

* **AmusementPark.html** Main webpage that handles the model/projection transformations for final position and lighting calculations for final color. 
* **AmusementParkDriver.js** Driver file with the initialization function for the program. Initiliazes the Merry-Go-Round and Sign objects. Creates, fills, and bitmaps both textures. Contains the render function to continously loop through to create a dynamic 3D experience.
* **sign.js** Defines a Sign object: a flat square created with two triangles. A good example of the minimum required to draw an object in this program.
* **MerryGoRound.js** Defines a Merry-Go-Round object uses each of the following primitvive classes. Handles the movement position transformations for each object at render time.
* **horse.js** Defines a horse object, made up of a cone head and cube body.
* **cone.js** Defines a Cone object.
* **cylinder.js** Defines a Cylinder object.
* **shortCube.js** Defines a ShortCube object.
* **sphere.js** Defines a Sphere object.
