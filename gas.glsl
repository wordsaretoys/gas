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
	vec3 color = texture2D(noise, uv).rgb;
	float a = clamp((color.r + color.g + color.b) / 2.0, 0.0, 1.0);
	float r = 2.0 * length(abs(uv) - 0.5);
	float alpha = (1.0 - r);
	if (uv.y > 0.0) {
		float m = pow(r, 0.25);
		alpha = mix(1.0, a * alpha, m);
		color = mix(vec3(1.0, 1.0, 1.0), color, m);
	}
	gl_FragColor = vec4(color, alpha);
}

</script>

<script id="vs-plant" type="x-shader/x-vertex">

/**
	plant vertex shader
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

<script id="fs-plant" type="x-shader/x-fragment">

/**
	plant fragment shader

	@param noise	noise texture
	
	@param uv		texture coordinates of fragment
	
**/

precision mediump float;

uniform sampler2D noise;

varying vec2 uv;

void main(void) {
	gl_FragColor = texture2D(noise, uv);
/*
	if (uv.x < 0.1 || uv.x > 0.9 || uv.y < 0.1 || uv.y > 0.9) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	} else {
		gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
	}
*/
}

</script>
