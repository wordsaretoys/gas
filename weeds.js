/**
	maintain a section of space tumbleweed
	
	@namespace GAS
	@class weeds
**/

GAS.weeds = {

	MAX_RADIUS: 50,
	MIN_RADIUS: 45,
	SYMMETRY: 8,

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
			["skin"]
		);
		
		this.mesh = SOAR.mesh.create(GAS.display, GAS.display.gl.TRIANGLE_STRIP);
		this.mesh.add(this.shader.position, 3);
		this.mesh.add(this.shader.texturec, 2);
		
		var p = SOAR.vector.create(this.MIN_RADIUS, 0, 0);
		var f = SOAR.vector.create(0, 0, -1);
		var r = SOAR.vector.create(-1, 0, 0);
		var d = SOAR.vector.create();
		for (i = 0, j = 0; i < 30000; i++) {
		
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
			
			r.cross(f).cross(f).neg().norm();
			
			if (p.length() < this.MIN_RADIUS) {
				d.copy(p).norm().mul(0.5);
				f.add(d);
			}

			if (p.length() > this.MAX_RADIUS) {
				d.copy(p).norm().neg().mul(0.5);
				f.add(d);
			}
			
		}
		this.mesh.build();
		
		var ctx = GAS.texture.context;
		var w = 256;
		var h = 32;
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
		ctx.fillRect(0, 0, w, h);
		
		ctx.fillStyle = "rgba(128, 255, 64, 0.025)";
		for (i = 0; i < 1000; i++) {
			ctx.fillRect(GAS.random(16, w - 16) - 8, GAS.random(12, h - 12) - 8, 16, 16);
		}
		
		this.skin = SOAR.texture.create(GAS.display, ctx.getImageData(0, 0, w, h));
		
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
		this.skin.bind(0, shader.skin);
		
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