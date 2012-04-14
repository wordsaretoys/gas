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
	O' = P * V * R * O transformation, plus texture coordinates
	
	@param position vertex array of positions
	@param texturec vertex array of texture coordinates
	
	@param projector projector matrix
	@param modelview modelview matrix
	@param modelview rotations matrix
	
	(passed to fragment shader for each vertex)
	@param uv		texture coordinates of fragment
	
**/

attribute vec3 position;
attribute vec2 texturec;

uniform mat4 projector;
uniform mat4 modelview;
uniform mat4 rotations;

varying vec2 uv;

void main(void) {
	gl_Position = projector * modelview * rotations * vec4(position, 1.0);
	uv = texturec;
}

</script>

<script id="fs-plant" type="x-shader/x-fragment">

/**
	plant fragment shader

	@param skin		texture for each cell
	
	@param uv		texture coordinates of fragment
	
**/

precision mediump float;

uniform sampler2D skin;

varying vec2 uv;

void main(void) {
	gl_FragColor = texture2D(skin, uv);
}

</script>

<script id="vs-ejecta" type="x-shader/x-vertex">

/**
	ejecta vertex shader
	O' = P * V * O transformation
	
	@param position vertex array of positions
	
	@param projector projector matrix
	@param modelview modelview matrix
	@param center center of distribution
	
**/

attribute vec3 position;

uniform mat4 projector;
uniform mat4 modelview;
uniform vec3 center;

void main(void) {
	gl_Position = projector * modelview * vec4(position + center, 1.0);
}

</script>

<script id="fs-ejecta" type="x-shader/x-fragment">

/**
	ejecta fragment shader

**/

precision mediump float;

void main(void) {
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}

</script>

<script id="vs-clump" type="x-shader/x-vertex">

/**
	clump vertex shader
	O' = P * V * R * O transformation, plus texture coordinates
	
	@param position vertex array of positions
	@param texturec vertex array of texture coordinates
	
	@param projector projector matrix
	@param modelview modelview matrix
	@param modelview rotations matrix
	
	(passed to fragment shader for each vertex)
	@param uv		texture coordinates of fragment
	
**/

attribute vec3 position;
attribute vec2 texturec;

uniform mat4 projector;
uniform mat4 modelview;
uniform mat4 rotations;

varying vec2 uv;

void main(void) {
	gl_Position = projector * modelview * rotations * vec4(position, 1.0);
	uv = texturec;
}

</script>

<script id="fs-clump" type="x-shader/x-fragment">

/**
	clump fragment shader

	@param skin		texture for each clump
	
	@param uv		texture coordinates of fragment
	
**/

precision mediump float;

uniform sampler2D skin;

varying vec2 uv;

void main(void) {
	gl_FragColor = texture2D(skin, uv);
}

</script>

<script id="vs-paddler" type="x-shader/x-vertex">

/**
	paddler vertex shader
	O' = P * V * (M * O + c) transformation, plus texture coordinates
	
	@param position vertex array of positions
	@param texturec vertex array of texture coordinates
	
	@param projector projector matrix
	@param modelview modelview matrix
	@param rotations rotations matrix
	@param center model center vector
	@param time time base for vertex animations
	
	(passed to fragment shader for each vertex)
	@param uv		texture coordinates of fragment
	@param object	fragment position in object space
	
**/

attribute vec3 position;
attribute vec2 texturec;

uniform mat4 projector;
uniform mat4 modelview;
uniform mat4 rotations;
uniform vec3 center;
uniform float time;

varying vec2 uv;

void main(void) {
	// create paddling motions
	vec3 pos = position;
	pos.y += 25.0 * pow(0.5 * abs(pos.x), 4.0) * sin(time);
	pos.z += 25.0 * pow(0.5 * abs(pos.x), 4.0) * cos(time);
	
	// open and close mouth
	if (pos.z < -0.48) {
		pos.y = pos.y * abs(sin(time));
	}
	
	// transform the vertex
	vec4 rotpos = rotations * vec4(pos, 1.0) + vec4(center, 0.0);
	vec4 mvpos = modelview * rotpos;
	gl_Position = projector * mvpos;
	uv = texturec;
}

</script>

<script id="fs-paddler" type="x-shader/x-fragment">

/**
	paddler fragment shader
	
	@param skin		specific skin texture

	@param uv		texture coordinates of fragment
	@param object	fragment position in object space
	
**/

precision mediump float;

uniform sampler2D skin;

varying vec2 uv;

void main(void) {
	gl_FragColor = texture2D(skin, uv);
}

</script>

