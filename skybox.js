/**
	generate and display the skybox
	
	@namespace GAS
	@class skybox
**/

GAS.skybox = {

	RADIUS: 1000,
	
	SUN_HEIGHT:  1000,
	GND_HEIGHT: -10,
	
	SUN_COLOR: new Float32Array([1, 1, 0, 1]),
	SKY_COLOR: new Float32Array([0.23, 0.72, 1, 1]),
	GND_COLOR: new Float32Array([0, 0, 0, 1]),

	mesh: {},
	shader: {},

	/**
		create and init required objects
		
		@method init
	**/

	init: function() {
		var that = this;

		this.shader.gradient = SOAR.shader.create(
			GAS.display,
			SOAR.textOf("vs-gradient"), SOAR.textOf("fs-gradient"),
			["position", "texturec"], 
			["projector", "modelview", "radius", "outerc", "innerc"]
		);
		
		this.mesh.sun = SOAR.mesh.create(GAS.display);
		this.mesh.sun.add(this.shader.gradient.position, 3);
		this.mesh.sun.add(this.shader.gradient.texturec, 2);

		this.mesh.ground = SOAR.mesh.create(GAS.display);
		this.mesh.ground.add(this.shader.gradient.position, 3);
		this.mesh.ground.add(this.shader.gradient.texturec, 2);
		
		SOAR.subdivide(0, -this.RADIUS, -this.RADIUS, this.RADIUS, this.RADIUS, 
			function(x0, z0, x1, z1, x2, z2) {

				that.mesh.sun.set(x0, that.SUN_HEIGHT, z0, x0 / that.RADIUS, z0 / that.RADIUS);
				that.mesh.sun.set(x1, that.SUN_HEIGHT, z1, x1 / that.RADIUS, z1 / that.RADIUS);
				that.mesh.sun.set(x2, that.SUN_HEIGHT, z2, x2 / that.RADIUS, z2 / that.RADIUS);

				that.mesh.ground.set(x0, that.GND_HEIGHT, z0, x0 / that.RADIUS, z0 / that.RADIUS);
				that.mesh.ground.set(x1, that.GND_HEIGHT, z1, x1 / that.RADIUS, z1 / that.RADIUS);
				that.mesh.ground.set(x2, that.GND_HEIGHT, z2, x2 / that.RADIUS, z2 / that.RADIUS);
			}
		);
		
		this.mesh.ground.build();
		this.mesh.sun.build();
	},

	/**
		draw the skybox
		
		@method draw
	**/
	 
	draw: function() {
		var gl = GAS.display.gl;
		var shader = this.shader;
		var mesh = this.mesh;
		var camera = GAS.player.camera;

		shader.gradient.activate();
		gl.uniformMatrix4fv(shader.gradient.projector, false, camera.projector());
		gl.uniformMatrix4fv(shader.gradient.modelview, false, camera.rotations());

		gl.uniform4fv(shader.gradient.innerc, this.SUN_COLOR);
		gl.uniform4fv(shader.gradient.outerc, this.SKY_COLOR);
		mesh.sun.draw();

		gl.uniform4fv(shader.gradient.innerc, this.GND_COLOR);
		gl.uniform4fv(shader.gradient.outerc, this.SKY_COLOR);
		mesh.ground.draw();
	}

};