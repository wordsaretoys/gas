/**
	generate, animate, and display a paddler
	
	paddlers are procedurally-generated creatures with
	bilateral symmetry. flaps of tissue that look like
	tentacles or wings extend from cylindrical bodies.
	continuous paddling motions of these flaps permits
	them to move through the air.
	
	@namespace GAS
	@class paddler
**/

GAS.paddler = {

	SHAPE: [0, 0.25, 0.5, 0.8, 0.9, 0.8, 0.7, 0.4],
	
	FLAP_RATE: 0.1,
	FLAP_JERK: 10,
	BLAP_RATE: 0.5,

	colorBase: 128,

	/**
		create and init objects usable by all paddler instances
		
		@method init
	**/

	init: function() {
		this.shader = SOAR.shader.create(
			GAS.display,
			SOAR.textOf("vs-paddler"), SOAR.textOf("fs-paddler"),
			["position", "texturec"], 
			["projector", "modelview", "rotations", "center", "wing", "mouth"],
			["skin"]
		);

		this.mesh = this.makeMesh();
	},
	
	/**
		generate and return a new paddler object
		
		@method create
		@return object, the new paddler
	**/
	
	create: function() {
		var o = Object.create(GAS.paddler);
		
		o.position = SOAR.vector.create();
		o.velocity = SOAR.vector.create();
		o.rotator = SOAR.rotator.create();
		
		o.skin = this.makeSkin();

		o.wing = 0;
		o.mouth = 0.25 * Math.PI;
		
		o.flapping = false;
		o.blapping = false;
		
		o.scratch = {
			acc: SOAR.vector.create(),
			vel: SOAR.vector.create()
		};

		return o;
	},
	
	/**
		generate random skin texture
		
		@method makeSkin
		@return the texture object
	**/
	
	makeSkin: function() {
		var ctx = GAS.texture.context;
		var w = 512;
		var h = 256;
		var hw = w * 0.5;
		var hh = h * 0.5;
		var qw = hw * 0.5;
		var r, g, b, base, coat;
		var i, x, y, s, hs;

		ctx.clearRect(0, 0, w, h);
		r = ((this.colorBase + 1) * 3) % 256;
		g = ((r + 1) * 3) % 256;
		b = ((g + 1) * 3) % 256;
		base = "rgb(" + r + ", " + g + ", " + b + ")";
		coat = "rgb(" + (256 - r) + ", " + (256 - g) + ", " + (256 - b) + ")";
		this.colorBase = ((b + 1) * 3) % 256;

		ctx.fillStyle = base;
		ctx.fillRect(0, 0, w, h);
		
		// top half is darker
		ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
		ctx.fillRect(0, 0, hw, h);

		// add symmetric spots
		ctx.fillStyle = coat;
		ctx.strokeStyle = "rgb(0, 0, 0)";
		ctx.lineWidth = 2;
		for (i = 0; i < 100; i++) {
			s = GAS.random(4, 16);
			hs = s / 2;
			x = GAS.random(hs, qw - hs);
			y = GAS.random(hs, h - hs - 20);

			// left side, top
			ctx.beginPath();
			ctx.arc(x, y, hs, 0, SOAR.PIMUL2, false);
			ctx.fill();
			ctx.stroke();

			// right side, top
			ctx.beginPath();
			ctx.arc(hw - x, y, hs, 0, SOAR.PIMUL2, false);
			ctx.fill();
			ctx.stroke();

			// left side, bottom
			ctx.beginPath();
			ctx.arc(hw + x, y, hs, 0, SOAR.PIMUL2, false);
			ctx.fill();
			ctx.stroke();

			// right side, bottom
			ctx.beginPath();
			ctx.arc(w - x, y, hs, 0, SOAR.PIMUL2, false);
			ctx.fill();
			ctx.stroke();
			
		}
		
		// add mouth stripe
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, h - 4, w, h);
		
		// add eye spots to top only
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.beginPath();
		ctx.arc(qw - 20, h - 15, 5, 0, SOAR.PIMUL2, false);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(qw + 20, h - 15, 5, 0, SOAR.PIMUL2, false);
		ctx.fill();
		ctx.stroke();
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.beginPath();
		ctx.arc(qw - 20, h - 15, 2, 0, SOAR.PIMUL2, false);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(qw + 20, h - 15, 2, 0, SOAR.PIMUL2, false);
		ctx.fill();

		return SOAR.texture.create(
			GAS.display, 
			ctx.getImageData(0, 0, w, h)
		);
	},

	/**
		generate a paddler model mesh
		
		@method makeMesh
		@return object, the generated mesh
	**/

	makeMesh: function() {
		var i, r;
		
		var mesh = SOAR.mesh.create(GAS.display)
		mesh.add(this.shader.position, 3);
		mesh.add(this.shader.texturec, 2);
		
		var shaper = SOAR.noise1D.create(0, 0.5, 8, 8);
		shaper.interpolate = SOAR.interpolator.linear;
		shaper.map = new Float32Array(this.SHAPE);
	
		SOAR.subdivide(6, -0.5, -0.5, 0.5, 0.5, 
			function(x0, z0, x1, z1, x2, z2) {
				var y0, y1, y2;
				var tz0, tz1, tz2;
				var tx0, tx1, tx2;
				var r0, r1, r2;
			
				tz0 = z0 + 0.5;
				tz1 = z1 + 0.5;
				tz2 = z2 + 0.5;
				
				r0 = Math.sqrt(shaper.get(tz0));
				r1 = Math.sqrt(shaper.get(tz1));
				r2 = Math.sqrt(shaper.get(tz2));
				
				y0 = 0.25 * r0 * Math.cos(x0 * Math.PI);
				y1 = 0.25 * r1 * Math.cos(x1 * Math.PI);
				y2 = 0.25 * r2 * Math.cos(x2 * Math.PI);
				
				x0 = 1.5 * x0 * r0;
				x1 = 1.5 * x1 * r1;
				x2 = 1.5 * x2 * r2;
				
				tx0 = 0.5 * (x0 + 0.5);
				tx1 = 0.5 * (x1 + 0.5);
				tx2 = 0.5 * (x2 + 0.5);

				if (tz0 < 0.001)
					z0 += 0.05;
				if (tz1 < 0.001)
					z1 += 0.05;
				if (tz2 < 0.001)
					z2 += 0.05;
				
				mesh.set(x0, y0, z0, tx0, tz0);
				mesh.set(x1, y1, z1, tx1, tz1);
				mesh.set(x2, y2, z2, tx2, tz2);

				mesh.set(x0, -0.5 * y0, z0, tx0 + 0.5, tz0);
				mesh.set(x2, -0.5 * y2, z2, tx2 + 0.5, tz2);
				mesh.set(x1, -0.5 * y1, z1, tx1 + 0.5, tz1);
			}
		);
	
		mesh.build();
		
		return mesh;
	},
	
	/**
		update kinematics
		
		@method update
	**/

	update: function() {
		var o = this.rotator.orientation;
		var s = this.scratch;
		var dt = SOAR.interval * 0.001;
		var acc, vel;
		
		if (this.flapping) {
			this.wing += this.FLAP_RATE;
			acc = this.FLAP_JERK * Math.max(0, Math.sin(SOAR.PIMUL2 * this.wing));
			s.acc.copy(o.front).mul(acc * dt);
			this.velocity.add(s.acc);
			if (this.wing >= SOAR.PIMUL2) {
				this.flapping = false;
			}
		}
		
		if (this.blapping) {
			this.wing -= this.BLAP_RATE;
			this.velocity.mul(0.95);
			if (this.wing <= 0) {
				this.blapping = false;
			}
		}

		
		s.vel.copy(this.velocity).mul(dt);
		this.position.add(s.vel);
	},
	
	/**
		kick off a forward flap (and acceleration)
		
		@method flap
	**/
	
	flap: function() {
		if (!(this.flapping || this.blapping)) {
			this.flapping = true;
			this.wing = 0;
		}
	},
	
	/**
		kick off a backward flap (and deceleration)
		
		@method blap
	**/
	
	blap: function() {
		if (!(this.blapping || this.flapping)) {
			this.blapping = true;
			this.wing = SOAR.PIMUL2;
		}
	},
	
	/**
		draw the paddlers
		
		@method draw
	**/
	
	draw: function() {
		var gl = GAS.display.gl;
		var shader = this.shader;
		var camera = GAS.player.camera;
		var shader = this.shader;

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.projector());
		gl.uniformMatrix4fv(shader.modelview, false, camera.modelview());
		gl.uniformMatrix4fv(shader.rotations, false, this.rotator.matrix.transpose);
		gl.uniform3f(shader.center, this.position.x, this.position.y, this.position.z);
		gl.uniform1f(shader.wing, this.wing);
		gl.uniform1f(shader.mouth, this.mouth);
		this.skin.bind(0, shader.skin);
		this.mesh.draw();
		
		gl.disable(gl.CULL_FACE);
		
	}

};
