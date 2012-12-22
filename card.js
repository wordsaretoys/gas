/**
	maintain an informational icon in the 3D space
	
	@namespace GAS
	@class card
**/

GAS.card = {

	DRAW_RADIUS: 1,
	SORT_ORDER: -1,
	
	shader: {},

	/**
		initialize shaders and mesh
		
		@method init
	**/
	
	init: function() {
		var r = this.DRAW_RADIUS;
	
		// create the shaders
		this.shader.sound = SOAR.shader.create(
			GAS.display,
			SOAR.textOf("vs-card"), SOAR.textOf("fs-card-sound"),
			["position"], 
			["projector", "modelview", "rotations", "center", "scale", "time"]
		);
		this.shader.point = SOAR.shader.create(
			GAS.display,
			SOAR.textOf("vs-card"), SOAR.textOf("fs-card-point"),
			["position"], 
			["projector", "modelview", "rotations", "center", "scale"]
		);
	
		// create the mesh
		this.mesh = SOAR.mesh.create(GAS.display);
		this.mesh.add(this.shader.position, 3);
		this.mesh.set(r, r, -1, -r, -r, -1, -r, r, -1);
		this.mesh.set(r, r, -1, -r, -r, -1, r, -r, -1);
		this.mesh.build();
	},
	
	/**
		create a new card instance
		
		@method create
		@param type string, type of card
		@return object, new card
	**/
	
	create: function(type) {
		var o = Object.create(GAS.card);
		o.type = type;
		o.position = SOAR.vector.create();
		o.matrix = new Float32Array(16);
		o.scale = 1;
		o.phase = 0;
		o.shader = this.shader[type];
		return o;
	},
	
	/**
		draw the card
		
		@method draw
	**/
	
	draw: function() {
		var gl = GAS.display.gl;
		var shader = this.shader;
		var camera = GAS.player.camera;
		var matrix = this.matrix;

		if (GAS.map.lastDraw !== shader) {
			gl.disable(gl.CULL_FACE);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.clear(gl.DEPTH_BUFFER_BIT);
			shader.activate();
			gl.uniformMatrix4fv(shader.projector, false, camera.matrix.projector);
			gl.uniformMatrix4fv(shader.modelview, false, camera.matrix.modelview);
			gl.uniformMatrix4fv(shader.rotations, false, camera.matrix.transpose);
			GAS.map.lastDraw = shader;
		}
		
		// type-specific settings
		switch(this.type) {
		case "sound":
			gl.uniform1f(shader.time, this.phase);
			break;
		case "point":
			break;
		}
		gl.uniform3f(shader.center, this.position.x, this.position.y, this.position.z);
		gl.uniform1f(shader.scale, this.scale);
		this.mesh.draw();
	}

};