/**
	maintain a section of space tumbleweed
	
	@namespace GAS
	@class weeds
**/

GAS.weeds = {

	SYMMETRY: 11,

	texture: {},

	rotor: SOAR.freeRotor.create(),
	
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
			["noise"]
		);
		
		this.mesh = SOAR.mesh.create(GAS.display, GAS.display.gl.TRIANGLE_STRIP);
		this.mesh.add(this.shader.position, 3);
		this.mesh.add(this.shader.texturec, 2);
		
		var p = SOAR.vector.create(24, 0, 0);
		var f = SOAR.vector.create(0, 0, -1);
		var r = SOAR.vector.create(-1, 0, 0);
		var d = SOAR.vector.create();
		for (i = 0, j = 0; i < 20000; i++) {
		
			this.mesh.set(p.x - 0.05 * r.x, p.y - 0.05 * r.y, p.z - 0.05 * r.z, i % 2, 0);
			this.mesh.set(p.x + 0.05 * r.x, p.y + 0.05 * r.y, p.z + 0.05 * r.z, i % 2, 1);

			p.x += f.x;
			p.y += f.y;
			p.z += f.z;
			
			f.x += 0.5 * (Math.random() - Math.random());
			f.y += 0.5 * (Math.random() - Math.random());
			f.z += 0.5 * (Math.random() - Math.random());
			
			f.norm();

			r.x += 0.01 * (Math.random() - Math.random());
			r.y += 0.01 * (Math.random() - Math.random());
			r.z += 0.01 * (Math.random() - Math.random());
			
			r.cross(f).cross(f).cross(f).cross(f).norm();
			
			if (p.length() < 12) {
				d.copy(p).norm().mul(0.5);
				f.add(d);
			}

			if (p.length() > 50) {
				d.copy(p).norm().neg().mul(0.5);
				f.add(d);
			}
			
		}
		this.mesh.build();
		
		var ctx = GAS.texture.context;
		var w = 256;
		var h = 32;
		ctx.clearRect(0, 0, w, h);
		ctx.globalCompositeOperation = "source-over";

		var sp, x, y;
		for (i = 0; i < 1000; i++) {
			x = GAS.random(0, w);
			y = GAS.random(6, h - 6);
			sp = ctx.createRadialGradient(x + 2, y + 2, 4, x, y, 8);
			sp.addColorStop(0, "rgb(64, 192, 64)");
			sp.addColorStop(0.9, "rgb(16, 64, 16)");
			sp.addColorStop(1, "rgba(16, 64, 16, 0)");
			ctx.fillStyle = sp;
			ctx.fillRect(0, 0, w, h);
		}

		this.texture.noise = SOAR.texture.create(GAS.display, ctx.getImageData(0, 0, w, h));
		
	},

	/**
		draw the plant
		
		@method draw
	**/
	 
	draw: function() {
		var gl = GAS.display.gl;
		var shader = this.shader;
		var camera = GAS.player.camera;
		var i, r;

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		
		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.projector());
		gl.uniformMatrix4fv(shader.modelview, false, camera.modelview());
		this.texture.noise.bind(0, shader.noise);
		
		this.rotor.rotation.set(0, 0, 0, 1);
		this.rotor.turn(0, 0, 0);
		for (i = 0, r = SOAR.PIMUL2 / this.SYMMETRY; i < this.SYMMETRY; i++) {
			gl.uniformMatrix4fv(shader.rotations, false, this.rotor.matrix.rotations);
			this.mesh.draw();
			this.rotor.turn(0, r, 0);
		}
		
		gl.disable(gl.BLEND);
		
	}

};