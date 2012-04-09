<script id="vs-cloud" type="x-shader/x-vertex">

/**
	cloud vertex shader
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

<script id="fs-cloud" type="x-shader/x-fragment">

/**
	cloud fragment shader

	@param noise	noise texture
	
	@param uv		texture coordinates of fragment
	
**/

precision mediump float;

uniform sampler2D noise;

varying vec2 uv;

void main(void) {
//	float alpha = pow(clamp(0.1 + texture2D(noise, uv).a, 0.0, 1.0), 32.0);
//	gl_FragColor = vec4(0.99, 0.99, 0.99, alpha);
	gl_FragColor = texture2D(noise, uv);
}

</script>
