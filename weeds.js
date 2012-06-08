/**
	generate and draw a length of space sargasso
	
	@namespace GAS
	@class weeds
**/

GAS.weeds = {

	DRAW_RADIUS: 50,
	SORT_ORDER: 10,
	
	scratch: {
		rotation: SOAR.quaternion.create()
	},
	
	rng: SOAR.random.create(960321),
	
	/**
		create and init required objects
		
		@method init
	**/

	init: function() {
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
		
		var p = SOAR.vector.create(this.DRAW_RADIUS, 0, 0);
		var f = SOAR.vector.create(0, 0, -1);
		var r = SOAR.vector.create(-1, 0, 0);
		var d = SOAR.vector.create();
		var rng = this.rng;
		
		for (i = 0, j = 0; i < 10000; i++) {
		
			this.mesh.set(p.x - 0.1 * r.x, p.y - 0.1 * r.y, p.z - 0.1 * r.z, i % 2, 0);
			this.mesh.set(p.x + 0.1 * r.x, p.y + 0.1 * r.y, p.z + 0.1 * r.z, i % 2, 1);

			p.x += f.x;
			p.y += f.y;
			p.z += f.z;
			
			f.x += rng.get(-1, 1);
			f.y += rng.get(-1, 1);
			f.z += rng.get(-1, 1);
			
			f.norm();

			r.x += rng.get(-0.01, 0.01);
			r.y += rng.get(-0.01, 0.01);
			r.z += rng.get(-0.01, 0.01);
			
			r.cross(f).cross(f).neg().norm();
			
			if (p.length() > this.DRAW_RADIUS) {
				d.copy(p).norm().neg().mul(0.5);
				f.add(d);
			}			
			
		}
		this.mesh.build();
		
		var ctx = GAS.texture.context;
		var w = 256;
		var h = 64;
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
		ctx.fillRect(0, 0, w, h);
		
		ctx.fillStyle = "rgba(128, 255, 64, 0.025)";
		for (i = 0; i < 1000; i++) {
			ctx.fillRect(rng.get(16, w - 16) - 8, rng.get(12, h - 12) - 8, 16, 16);
		}
		
		this.skin = SOAR.texture.create(GAS.display, ctx.getImageData(0, 0, w, h));
	},

	/**
		create a new weeds object with random orientation
		
		@method create
		@param x, y, z number, center position to assign
		@return object, a drawable length of weed
	**/
	
	create: function(x, y, z) {
		var rng = this.rng;
		var q = this.scratch.rotation;
		var o = Object.create(GAS.weeds);
		o.position = SOAR.vector.create(x, y, z);
		o.matrix = new Float32Array(16);
		q.set(rng.get(-1, 1), rng.get(-1, 1), rng.get(-1, 1), rng.get(-1, 1))
			.norm()
			.toMatrix(o.matrix);
		
		o.matrix[12] = x;
		o.matrix[13] = y;
		o.matrix[14] = z;
		
		return o;
	},
	
	/**
		draw a weed
		
		@method draw
	**/
	 
	draw: function() {
		var gl = GAS.display.gl;
		var shader = this.shader;
		var camera = GAS.player.camera;

		if (GAS.map.lastDraw !== shader) {
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.disable(gl.CULL_FACE);
			shader.activate();
			gl.uniformMatrix4fv(shader.projector, false, camera.matrix.projector);
			gl.uniformMatrix4fv(shader.modelview, false, camera.matrix.modelview);
			this.skin.bind(0, shader.skin);
			GAS.map.lastDraw = shader;
		}
		gl.uniformMatrix4fv(shader.rotations, false, this.matrix);
		this.mesh.draw();
	}

};