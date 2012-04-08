<script id="vs-gradient" type="x-shader/x-vertex">

/**
	gradient vertex shader
	O' = P * V * O transformation, plus texture coordinates
	
	@param position vertex array of positions
	@param texturec vertex array of texture coordinates
	
	@param projector projector matrix
	@param modelview modelview matrix
	
	(passed to fragment shader for each vertex)
	@param uv		texture coordinates of fragment
	
**/

attribute vec3 position;
attribute vec2 texturec;

uniform mat4 projector;
uniform mat4 modelview;

varying vec2 uv;

void main(void) {
	gl_Position = projector * modelview * vec4(position, 1.0);
	uv = texturec;
}

</script>

<script id="fs-gradient" type="x-shader/x-fragment">

/**
	gradient fragment shader

	@param radius determines size of gradient circle
	@param innerc inner gradient color
	@param outerc outer gradient color
	
	@param uv		texture coordinates of fragment
	
**/

precision mediump float;

uniform vec4 innerc;
uniform vec4 outerc;

varying vec2 uv;

void main(void) {
	float r = clamp(length(uv), 0.0, 1.0);
	gl_FragColor = mix(innerc, outerc, r);
}

</script>
