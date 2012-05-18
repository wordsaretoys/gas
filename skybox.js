/**
	generate and display the skybox
	
	@namespace GAS
	@class skybox
**/

GAS.skybox = {

	planes: {},
	clouds: {},

	/**
		create and init required objects
		
		@method init
	**/

	init: function() {
		var that = this;

		this.planes.shader = SOAR.shader.create(
			GAS.display,
			SOAR.textOf("vs-skybox"), SOAR.textOf("fs-plane"),
			["position", "texturec"], 
			["projector", "modelview"]
		);	
		
		this.planes.mesh = SOAR.mesh.create(GAS.display);
		this.planes.mesh.add(this.planes.shader.position, 3);
		this.planes.mesh.add(this.planes.shader.texturec, 2);

		SOAR.subdivide(4, -1, -1, 1, 1, 
			function(x0, z0, x1, z1, x2, z2) {
				var y0 = (1 - x0 * x0) * (1 - z0 * z0);
				var y1 = (1 - x1 * x1) * (1 - z1 * z1);
				var y2 = (1 - x2 * x2) * (1 - z2 * z2);
				var mesh = that.planes.mesh;
				
				mesh.set(x0, y0, z0, x0, z0);
				mesh.set(x1, y1, z1, x1, z1);
				mesh.set(x2, y2, z2, x2, z2);
				
				mesh.set(x0, -y0, z0, x0, z0);
				mesh.set(x2, -y2, z2, x2, z2);
				mesh.set(x1, -y1, z1, x1, z1);
			});
		this.planes.mesh.build();
		
		this.clouds.shader = SOAR.shader.create(
			GAS.display,
			SOAR.textOf("vs-skybox"), SOAR.textOf("fs-cloud"),
			["position", "texturec"], 
			["projector", "modelview"],
			["clouds"]
		);
		
		this.clouds.mesh = SOAR.mesh.create(GAS.display, GAS.display.gl.TRIANGLE_STRIP);
		this.clouds.mesh.add(this.clouds.shader.position, 3);
		this.clouds.mesh.add(this.clouds.shader.texturec, 2);

		var YSTEP = 2 / 20;
		var ASTEP = SOAR.PIMUL2 / 20;
		var a, r, x, y, ys, z;
		var tx, ty;
		for (y = -1; y <= 1; y += YSTEP) {
			for (a = 0; a <= SOAR.PIMUL2; a += ASTEP) {
				r = 0.5 * (1.25 - Math.abs(y));
				x = r * Math.cos(a);
				z = r * Math.sin(a);
				tx = a / SOAR.PIMUL2;
				ty = (y + 1) / 2;
				this.clouds.mesh.set(x, y, z, tx, ty);
				
				ys = y + YSTEP;
				r = 0.5 * (1.25 - Math.abs(ys));
				x = r * Math.cos(a);
				z = r * Math.sin(a);
				ty = (ys + 1) / 2;
				this.clouds.mesh.set(x, ys, z, tx, ty);
			}
		}


		this.clouds.mesh.build();
		
		var ctx = GAS.texture.context;
		var w = GAS.texture.canvas.width;
		var h = GAS.texture.canvas.height;
		var i;
		
		ctx.fillStyle = "rgb(32, 32, 32)";
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
		for (i = 0; i < 25000; i++) {
			ctx.beginPath();
			ctx.arc(GAS.random(-8, w + 8), GAS.random(0, h), GAS.random(8, 16), 0, SOAR.PIMUL2, false);
			ctx.fill();
		}
		this.clouds.texture = SOAR.texture.create(GAS.display, ctx.getImageData(0, 0, w, h)); 
	},

	/**
		draw the clouds
		
		@method draw
	**/
	 
	draw: function() {
		var gl = GAS.display.gl;
		var camera = GAS.player.camera;
		var shader;

		shader = this.planes.shader;
		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.matrix.projector);
		gl.uniformMatrix4fv(shader.modelview, false, camera.matrix.rotations);
		this.planes.mesh.draw();

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		
		shader = this.clouds.shader;
		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.matrix.projector);
		gl.uniformMatrix4fv(shader.modelview, false, camera.matrix.rotations);
		this.clouds.texture.bind(0, shader.clouds);
		this.clouds.mesh.draw();

		gl.disable(gl.BLEND);

	}

};