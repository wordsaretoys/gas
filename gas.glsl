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
varying vec4 object;

void main(void) {
	object = vec4(position, 1.0);
	gl_Position = projector * modelview * object;
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
varying vec4 object;

void main(void) {
	vec3 color = texture2D(noise, uv).rgb;
	float a = clamp((color.r + color.g + color.b) / 2.0, 0.0, 1.0);
	float alpha = 1.0;
	if (uv.y > 0.0)
		alpha = a;
	gl_FragColor = vec4(color, alpha);
}

</script>
