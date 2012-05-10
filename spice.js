/**
	generate and draw a cloud of spices
	
	@namespace GAS
	@class spice
**/

GAS.spice = {

	DRAW_RADIUS: 1,
	SORT_ORDER: 1,
	
	FRAG_RADIUS: 0.01,

	/**
		create and init objects usable by all spice instances
		
		@method init
	**/

	init: function() {
		var p = SOAR.vector.create();
		var i, j, x, y, z;
		
	
		this.shader = SOAR.shader.create(
			GAS.display,
			SOAR.textOf("vs-spice"), SOAR.textOf("fs-spice"),
			["position"], 
			["projector", "modelview", "rotations"]
		);

		this.mesh = SOAR.mesh.create(GAS.display);
		this.mesh.add(this.shader.position, 3);
		
		for (i = 0; i < 10000; i++) {
			p.set(
				Math.random() - Math.random(),
				Math.random() - Math.random(),
				Math.random() - Math.random()
			).norm().mul(GAS.random(0, this.DRAW_RADIUS));
			for (j = 0; j < 3; j++) {
				this.mesh.set(
					p.x + GAS.random(-this.FRAG_RADIUS, this.FRAG_RADIUS), 
					p.y + GAS.random(-this.FRAG_RADIUS, this.FRAG_RADIUS), 
					p.z + GAS.random(-this.FRAG_RADIUS, this.FRAG_RADIUS) 
				);
			}
		}
		
		this.mesh.build();
		
	},
	
	/**
		generate and return a new spice object
		
		@method create
		@param x, y, z numbers, the center of the spice cloud
		@return object, the new spice cloud object
	**/
	
	create: function(x, y, z) {
		var o = Object.create(GAS.spice);
		
		o.position = SOAR.vector.create(x, y, z);
		o.rotator = SOAR.rotator.create();
		
		return o;
	},
	
	/**
		draw the spice object
		
		@method draw
	**/
	
	draw: function() {
		var gl = GAS.display.gl;
		var shader = this.shader;
		var camera = GAS.player.camera;
		var matrix = this.rotator.matrix.rotations;

		if (GAS.map.lastDraw !== shader) {
			gl.disable(gl.BLEND);
			gl.disable(gl.CULL_FACE);
			shader.activate();
			gl.uniformMatrix4fv(shader.projector, false, camera.matrix.projector);
			gl.uniformMatrix4fv(shader.modelview, false, camera.matrix.modelview);
			GAS.map.lastDraw = shader;
		}
		this.rotator.turn(0, 0.01, 0);
		matrix[12] = this.position.x;
		matrix[13] = this.position.y;
		matrix[14] = this.position.z;
		gl.uniformMatrix4fv(shader.rotations, false, matrix);
		this.mesh.draw();
	}
	
};