/**
	generate and draw organic ejecta from the clouds below
	
	@namespace GAS
	@class ejecta
**/

GAS.ejecta = {

	RADIUS: 30,
	HEIGHT: 120,

	center: SOAR.vector.create(),

	/**
		create and init required objects
		
		@method init
	**/

	init: function() {
		var that = this;
		var p = SOAR.vector.create();
		var i;

		this.shader = SOAR.shader.create(
			GAS.display,
			SOAR.textOf("vs-ejecta"), SOAR.textOf("fs-ejecta"),
			["position"], 
			["projector", "modelview", "center"]
		);
		
		this.mesh = SOAR.mesh.create(GAS.display, GAS.display.gl.LINES);
		this.mesh.add(this.shader.position, 3);
		
		for (i = 0; i < 100; i++) {
			p.set(GAS.rng.get(-1, 1), 0, GAS.rng.get(-1, 1))
				.norm().mul(GAS.rng.get(2, this.RADIUS));
			p.y = GAS.rng.get(0, this.HEIGHT);
			
			this.mesh.set(p.x, p.y, p.z);
			this.mesh.set(p.x, p.y + 1, p.z);
		}

		this.mesh.build();
		
		this.center.copy(GAS.player.position);
		this.center.y += -this.HEIGHT;
		
	},
	
	/**
		update the ejecta
		
		@method update
	**/
	
	update: function() {
		this.center.y += SOAR.interval * 0.1;
		if (this.center.y >= GAS.player.position.y) {
			this.center.copy(GAS.player.position);
			this.center.y += -this.HEIGHT;
		}
	},

	/**
		draw the ejecta
		
		@method draw
	**/
	 
	draw: function() {
		var gl = GAS.display.gl;
		var shader = this.shader;
		var camera = GAS.player.camera;

		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.matrix.projector);
		gl.uniformMatrix4fv(shader.modelview, false, camera.matrix.modelview);
		gl.uniform3f(shader.center, this.center.x, this.center.y, this.center.z);
		this.mesh.draw();
	}

};