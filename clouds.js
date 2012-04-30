/**
	generate and display the clouds
	
	@namespace GAS
	@class clouds
**/

GAS.clouds = {

	texture: {},
	
	/**
		create and init required objects
		
		@method init
	**/

	init: function() {
		var that = this;
		var d;

		this.shader = SOAR.shader.create(
			GAS.display,
			SOAR.textOf("vs-cloud"), SOAR.textOf("fs-cloud"),
			["position", "texturec"], 
			["projector", "modelview"],
			["noise"]
		);
		
		this.mesh = SOAR.mesh.create(GAS.display);
		this.mesh.add(this.shader.position, 3);
		this.mesh.add(this.shader.texturec, 2);

		d = 100;
		k = 16;
		
		SOAR.subdivide(4, -1, -1, 1, 1, 
			function(x0, z0, x1, z1, x2, z2) {
			
				var y0 = (1 - x0 * x0) * (1 - z0 * z0);
				var y1 = (1 - x1 * x1) * (1 - z1 * z1);
				var y2 = (1 - x2 * x2) * (1 - z2 * z2);

				that.mesh.set(d * x0, k * y0 - 8, d * z0, 0.5 * (1 + x0), 0.5 * (1 + z0));
				that.mesh.set(d * x1, k * y1 - 8, d * z1, 0.5 * (1 + x1), 0.5 * (1 + z1));
				that.mesh.set(d * x2, k * y2 - 8, d * z2, 0.5 * (1 + x2), 0.5 * (1 + z2));
				
				that.mesh.set(d * x0, 0.25 * k * y0 - 8, d * z0, -0.5 * (1 + x0), -0.5 * (1 + z0));
				that.mesh.set(d * x2, 0.25 * k * y2 - 8, d * z2, -0.5 * (1 + x2), -0.5 * (1 + z2));
				that.mesh.set(d * x1, 0.25 * k * y1 - 8, d * z1, -0.5 * (1 + x1), -0.5 * (1 + z1));

			});
			
		this.mesh.build();
		
		var ctx = GAS.texture.context;
		var w = GAS.texture.canvas.width;
		var h = GAS.texture.canvas.height;
		ctx.clearRect(0, 0, w, h);

		var i;
		ctx.globalCompositeOperation = "lighter";
		ctx.fillStyle = "rgb(6, 4, 4)";
		for (i = 0; i < 3000; i++) {
			ctx.beginPath();
			ctx.arc(w * Math.random(), h * Math.random(), 16, 0, SOAR.PIMUL2, false);
			ctx.fill();
		}
		ctx.fillStyle = "rgb(4, 6, 4)";
		for (i = 0; i < 3000; i++) {
			ctx.beginPath();
			ctx.arc(w * Math.random(), h * Math.random(), 16, 0, SOAR.PIMUL2, false);
			ctx.fill();
		}
		ctx.fillStyle = "rgb(4, 4, 6)";
		for (i = 0; i < 3000; i++) {
			ctx.beginPath();
			ctx.arc(w * Math.random(), h * Math.random(), 16, 0, SOAR.PIMUL2, false);
			ctx.fill();
		}
		ctx.globalCompositeOperation = "source-over";

		this.texture.noise = SOAR.texture.create(GAS.display, ctx.getImageData(0, 0, w, h));
	},

	/**
		process loaded resources and perform any remaining initialization
		
		@method process
	**/
	
	process: function() {
/*	
		this.texture.noise1 = 
			SOAR.texture.create(GAS.display, GAS.resources["noise1"].data);
		this.texture.noise2 = 
			SOAR.texture.create(GAS.display, GAS.resources["noise2"].data);
*/
	},
	
	/**
		draw the clouds
		
		@method draw
	**/
	 
	draw: function() {
		var gl = GAS.display.gl;
		var shader = this.shader;
		var camera = GAS.player.camera;

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		
		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.matrix.projector);
		gl.uniformMatrix4fv(shader.modelview, false, camera.matrix.rotations);
		this.texture.noise.bind(0, shader.noise);
		this.mesh.draw();

		gl.disable(gl.BLEND);
	}

};