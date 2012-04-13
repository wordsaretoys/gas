/**
	generate, maintain, and display a collection of "clumps"
	(accumulated organic complexes of ejecta, good fer eatin')
	
	@namespace GAS
	@class clumps
**/

GAS.clumps = {

	/**
		create and init required objects
		
		@method init
	**/

	init: function() {
		var that = this;
		var i, j;

		this.shader = SOAR.shader.create(
			GAS.display,
			SOAR.textOf("vs-plant"), SOAR.textOf("fs-plant"),
			["position", "texturec"], 
			["projector", "modelview", "rotations"],
			["skin"]
		);
		
		this.mesh = SOAR.mesh.create(GAS.display, GAS.display.gl.TRIANGLE_STRIP);
		this.mesh.add(this.shader.position, 3);
		this.mesh.add(this.shader.texturec, 2);
		
		this.mesh.build();
		
		var ctx = GAS.texture.context;
		var w = 256;
		var h = 256;
		ctx.clearRect(0, 0, w, h);

		this.skin = SOAR.texture.create(GAS.display, ctx.getImageData(0, 0, w, h));
		
	},

	/**
		draw clumps
		
		@method draw
	**/
	 
	draw: function() {
		var gl = GAS.display.gl;
		var shader = this.shader;
		var camera = GAS.player.camera;
		var i, r;

		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.projector());
		gl.uniformMatrix4fv(shader.modelview, false, camera.modelview());
		gl.uniformMatrix4fv(shader.rotations, false, GAS.I);
		this.skin.bind(0, shader.skin);
		
		this.mesh.draw();
		
		gl.disable(gl.BLEND);
		
	}

};
