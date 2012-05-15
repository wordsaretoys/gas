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

	DRAW_RADIUS: 1,
	SORT_ORDER: 2,

	VIEW_ANGLE: Math.cos(120 * Math.PI / 180),
	
	SHAPE: [0, 0.25, 0.5, 0.8, 0.9, 0.8, 0.7, 0.4],

	IDLE_FLAP: 0.05,
	SLOW_FLAP: 0.25,
	FAST_FLAP: 0.65,

	SLOW_SPEED: 1,
	FAST_SPEED: 10,
	
	COMFORT_ZONE: 50,

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
		this.skin = this.makeSkin();
	},
	
	/**
		generate and return a new paddler object
		
		@method create
		@param x, y, z numbers, position
		@return object, the new paddler
	**/
	
	create: function(x, y, z) {
		var o = Object.create(GAS.paddler);
		
		o.position = SOAR.vector.create(x, y, z);
		o.velocity = SOAR.vector.create();
		o.rotator = SOAR.rotator.create();
		
		o.speed = 0;
		o.haste = 0;
		
		o.skin = this.makeSkin();

		o.wing = 0;
		o.mouth = 0.25 * Math.PI;
		
		o.scratch = {
			p: SOAR.vector.create(),
			r: SOAR.vector.create()
		};
		
		o.model = [
			SOAR.vector.create(),
			SOAR.vector.create(),
			SOAR.vector.create(),
			SOAR.vector.create(),
			SOAR.vector.create(),
			SOAR.vector.create()
		];
		
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

		// closure function to draw a spot
		function spot(x, y, r) {
			ctx.beginPath();
			ctx.arc(x, y, r, 0, SOAR.PIMUL2, false);
			ctx.fill();
			ctx.stroke();
		}
		
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
			spot(x, y, hs);
			
			// right side, top
			spot(hw - x, y, hs);

			// left side, bottom
			spot(hw + x, y, hs);

			// right side, bottom
			spot(w - x, y, hs);
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
		
		var min = SOAR.vector.create();
		var max = SOAR.vector.create();
	
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
				
				max.x = Math.max(max.x, x0, x1, x2);
				max.y = Math.max(max.y, y0, y1, y2);
				max.z = Math.max(max.z, z0, z1, z2);
				
				y0 = -0.5 * y0;
				y1 = -0.5 * y1;
				y2 = -0.5 * y2;

				mesh.set(x0, y0, z0, tx0 + 0.5, tz0);
				mesh.set(x2, y2, z2, tx2 + 0.5, tz2);
				mesh.set(x1, y1, z1, tx1 + 0.5, tz1);

				min.x = Math.min(min.x, x0, x1, x2);
				min.y = Math.min(min.y, y0, y1, y2);
				min.z = Math.min(min.z, z0, z1, z2);
				
			}
		);
	
		mesh.build();
		
		mesh.bounds = {
			min: min,
			max: max
		};
		
		return mesh;
	},
	
	/**
		update kinematics
		
		@method update
	**/

	update: function() {
		var s = this.scratch;
		var m = this.model;
		var b = this.mesh.bounds;
		var dt = SOAR.interval * 0.001;
		var ds;

		// haste tells us how we're supposed to be moving
		switch(this.haste) {
		
		case 0:
		
			if (this.speed > 0) {
				// decelerate based on how fast we're going
				ds = (this.speed > this.SLOW_SPEED ? this.FAST_SPEED : this.SLOW_SPEED) * 2 * dt;
				this.speed = Math.max(0, this.speed - ds);
			}
			this.wing += this.IDLE_FLAP;
			break;
			
		case 1:
		
			if (this.speed < this.SLOW_SPEED) {
				// accelerate from zero
				ds = this.SLOW_SPEED * 2 * dt;
				this.speed = Math.min(this.SLOW_SPEED, this.speed + ds);
			} else if (this.speed > this.SLOW_SPEED) {
				// decelerate from faster speed
				ds = this.FAST_SPEED * 2 * dt;
				this.speed = Math.max(this.SLOW_SPEED, this.speed - ds);
			}
			this.wing += this.SLOW_FLAP;
			break;
			
		case 2:
		
			if (this.speed < this.FAST_SPEED) {
				// accelerate
				ds = this.FAST_SPEED * 2 * dt;
				this.speed = Math.min(this.FAST_SPEED, this.speed + ds);
				this.wing += this.FAST_FLAP;
			} else {
				this.wing += this.SLOW_FLAP;
			}
			break;
		}

		this.wing = this.wing % SOAR.PIMUL2;
		
		this.velocity.copy(this.rotator.front).mul(this.speed * dt);
		this.position.add(this.velocity);
		
		// generate bounding box model
		m[0].copy(this.rotator.right).mul(b.min.x).add(this.position);
		m[1].copy(this.rotator.right).mul(b.max.x).add(this.position);
		m[2].copy(this.rotator.up).mul(b.min.y).add(this.position);
		m[3].copy(this.rotator.up).mul(b.max.y).add(this.position);
		m[4].copy(this.rotator.front).mul(b.min.z).add(this.position);
		m[5].copy(this.rotator.front).mul(b.max.z).add(this.position);
	},
	
	/**
		orient "front" to a particular vector
		
		note: p must be normalized!
		
		@method pointTo
		@param p object, vector to align front
		@param t number, rate at which to align
	**/
	
	pointTo: function(p, t) {
		var r = this.rotator;
		var q = r.scratch.q;
		var fr = this.rotator.front;
		fr.cross(p).neg();
		q.setFromAxisAngle(fr.x, fr.y, fr.z, t).norm();
		r.product.mul(q).norm();
		// reduces roll and regenerates vectors/matrixes
		r.turn(0, 0, this.rotator.right.y);
	},
	
	/**
		determines if the paddler can see another paddler
		
		@method isSeeing
		@param o object, the second paddler object
		@return true if the other paddler is in FOV
	**/
	
	isSeeing: function(o) {
		var eye = this.scratch.p;
		var ray = this.scratch.r;

		eye.copy(this.rotator.front).add(this.rotator.up).mul(0.5).norm();
		ray.copy(this.position).sub(o.position).norm();
		return eye.dot(ray) < this.VIEW_ANGLE;
	},
	
	/**
		determines if the paddler is touching another paddler
		
		@method isTouching
		@param o object, the second paddler object
		@return true if paddlers are in contact
	**/
	
	isTouching: function(o) {

		// LATER:
		// extrapolate the two closest points on the models
		// using the bounding points as a guide--successive
		// approximation?

		var i, j, d = Infinity;
		for (i = 0; i < 6; i++) {
			for (j = 0; j < 6; j++) {
				d = Math.min(d, this.model[i].distance(o.model[j]));
			}
		}
		
		return d < 0.2;

	},
	
	/**
		draw the paddlers
		
		@method draw
	**/
	
	draw: function() {
		var gl = GAS.display.gl;
		var shader = this.shader;
		var camera = GAS.player.camera;

		if (GAS.map.lastDraw !== shader) {
			gl.disable(gl.BLEND);
			gl.enable(gl.CULL_FACE);
			gl.cullFace(gl.BACK);
			shader.activate();
			gl.uniformMatrix4fv(shader.projector, false, camera.matrix.projector);
			gl.uniformMatrix4fv(shader.modelview, false, camera.matrix.modelview);
			GAS.map.lastDraw = shader;
		}
		
		gl.uniformMatrix4fv(shader.rotations, false, this.rotator.matrix.transpose);
		gl.uniform3f(shader.center, this.position.x, this.position.y, this.position.z);
		gl.uniform1f(shader.wing, this.wing);
		gl.uniform1f(shader.mouth, this.mouth);
		this.skin.bind(0, shader.skin);
		this.mesh.draw();
	}

};

