/**
	maintain a section of space tumbleweed
	
	@namespace GAS
	@class weeds
**/

GAS.weeds = {

	BASE_RADIUS: 75,
	
	scratch: {
		position: SOAR.vector.create()
	},
	
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
		
		var p = SOAR.vector.create();
		var f = SOAR.vector.create(0, 0, -1);
		var r = SOAR.vector.create(-1, 0, 0);
		var d = SOAR.vector.create();
		
		for (i = 0, j = 0; i < 30000; i++) {
		
			this.mesh.set(p.x - 0.05 * r.x, p.y - 0.05 * r.y, p.z - 0.05 * r.z, i % 2, 0);
			this.mesh.set(p.x + 0.05 * r.x, p.y + 0.05 * r.y, p.z + 0.05 * r.z, i % 2, 1);

			p.x += 0.5 * f.x;
			p.y += 0.5 * f.y;
			p.z += 0.5 * f.z;
			
			f.x += 1 * (Math.random() - Math.random());
			f.y += 1 * (Math.random() - Math.random());
			f.z += 1 * (Math.random() - Math.random());
			
			f.norm();

			r.x += 0.01 * (Math.random() - Math.random());
			r.y += 0.01 * (Math.random() - Math.random());
			r.z += 0.01 * (Math.random() - Math.random());
			
			r.cross(f).cross(f).neg().norm();
			
			if (p.length() > this.BASE_RADIUS) {
//			if (Math.abs(p.x) > this.BASE_RADIUS || Math.abs(p.y) > this.BASE_RADIUS || Math.abs(p.z) > this.BASE_RADIUS) {
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
			ctx.fillRect(GAS.random(16, w - 16) - 8, GAS.random(12, h - 12) - 8, 16, 16);
		}
		
		this.skin = SOAR.texture.create(GAS.display, ctx.getImageData(0, 0, w, h));
		
		this.cell = [];
		var x, y, z;
		for (i = 0; i < 27; i++) {
			x = i % 3 - 1;
			y = Math.floor(i / 3) % 3 - 1;
			z = Math.floor(i / 9) % 3 - 1;
			this.cell.push( {
				b: SOAR.vector.create(x, y, z),
				c: SOAR.vector.create(),
				q: SOAR.quaternion.create(),
				m: new Float32Array(16)
			} );
		}
		
		this.lastUpdate = SOAR.vector.create(10000, 10000, 10000);
		
		this.rng = SOAR.random.create();
		
	},

	/**
		update the cell structure based on player position
		
		@method update
	**/
	
	update: function() {
		var p = this.scratch.position;
		var radius = this.BASE_RADIUS;
		var i, cell;
	
		p.copy(GAS.player.position).nearest(radius);
		if (this.lastUpdate.distance(p) > 0) {

			console.log(p.x, p.y, p.z);
		
			for (i = 0; i < 27; i++) {
				cell = this.cell[i];
				
				cell.c.x = p.x + cell.b.x * radius;
				cell.c.y = p.y + cell.b.y * radius;
				cell.c.z = p.z + cell.b.z * radius;

				this.rng.reseed(
					Math.abs(cell.c.x * radius * radius) +
					Math.abs(cell.c.y * radius) + 
					Math.abs(cell.c.z) + 1 );
				
				cell.q.set(
					this.rng.get() - this.rng.get(),
					this.rng.get() - this.rng.get(),
					this.rng.get() - this.rng.get(), 0).norm();
				//cell.q.set(0, 0, 0, 1);
				cell.q.toMatrix(cell.m);
				
				cell.m[12] = cell.c.x;
				cell.m[13] = cell.c.y;
				cell.m[14] = cell.c.z;
			
			}
			
			this.lastUpdate.copy(p);
		}
	
	},
	
	/**
		draw the plant
		
		@method draw
	**/
	 
	draw: function() {
		var gl = GAS.display.gl;
		var shader = this.shader;
		var camera = GAS.player.camera;
		var i;
		var x, y, z;
		var m, q;

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		
		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.projector());
		gl.uniformMatrix4fv(shader.modelview, false, camera.modelview());
		this.skin.bind(0, shader.skin);
		
		for (i = 0; i < 27; i++) {
			gl.uniformMatrix4fv(shader.rotations, false, this.cell[i].m);
			this.mesh.draw();
		}
		
		gl.disable(gl.BLEND);
		
	}

};