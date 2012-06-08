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
	SORT_ORDER: 5,

	VIEW_ANGLE: Math.cos(120 * Math.PI / 180),
	
	SHAPE: [0, 0.25, 0.5, 0.8, 0.9, 0.8, 0.7, 0.4],

	IDLE_FLAP: 0.05,
	SLOW_FLAP: 0.25,
	FAST_FLAP: 0.65,

	SLOW_SPEED: 1,
	FAST_SPEED: 10,
	
	colorBase: 128,
	rng: SOAR.random.create(333221),

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
		@param skin object, describes appearance
		@return object, the new paddler
	**/
	
	create: function(skin) {
		var o = Object.create(GAS.paddler);
		
		o.position = SOAR.vector.create();
		o.velocity = SOAR.vector.create();
		o.rotator = SOAR.rotator.create();
		
		o.normal = SOAR.vector.create();
		
		o.speed = 0;
		o.haste = 0;
		
		o.skin = this.makeSkin(skin.coat, skin.spot, skin.seed);

		o.wing = GAS.rng.get();
		o.mouth = 0.25 * Math.PI;
		
		o.scratch = {
			p: SOAR.vector.create(),
			r: SOAR.vector.create()
		};
		
		return o;
	},
	
	/**
		generate random skin texture
		
		@method makeSkin
		@return the texture object
	**/
	
	makeSkin: function(coat, spot, seed) {
		var ctx = GAS.texture.context;
		var rng = SOAR.random.create(seed);
		var w = 256;
		var h = 256;
		var hw = w * 0.5;
		var hh = h * 0.5;
		var i, x, y, s, hs, lg;

		// fill in the coat color
		ctx.fillStyle = coat;
		ctx.fillRect(0, 0, w, h);
		
		// add a shade gradient
		lg = ctx.createLinearGradient(0, 0, w, 0);
		lg.addColorStop(0, "rgba(0, 0, 0, 1)");
		lg.addColorStop(0.5, "rgba(0, 0, 0, 0)");
		lg.addColorStop(1, "rgba(0, 0, 0, 1)");
		ctx.fillStyle = lg;
		ctx.fillRect(0, 0, w, h);

		// add symmetric spots
		ctx.fillStyle = spot;
		ctx.strokeStyle = "rgb(0, 0, 0)";
		ctx.lineWidth = 2;
		for (i = 0; i < 100; i++) {
			s = this.rng.get(4, 16);
			hs = s / 2;
			x = this.rng.get(hs, hw - hs);
			y = this.rng.get(hs, h - hs - 20);

			// top
			ctx.beginPath();
			ctx.arc(x, y, hs, 0, SOAR.PIMUL2, false);
			ctx.fill();
			ctx.stroke();
			
			// bottom
			ctx.beginPath();
			ctx.arc(w - x, y, hs, 0, SOAR.PIMUL2, false);
			ctx.fill();
			ctx.stroke();
		}
		
		// add mouth stripe
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, h - 4, w, h);
		
		// add eye spot to top only
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.beginPath();
		ctx.arc(hw - 20, h - 15, 5, 0, SOAR.PIMUL2, false);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.beginPath();
		ctx.arc(hw - 20, h - 15, 2, 0, SOAR.PIMUL2, false);
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
				
				tx0 = 0.5 - Math.abs(x0);
				tx1 = 0.5 - Math.abs(x1);
				tx2 = 0.5 - Math.abs(x2);

				// paddler mouth should tuck inwards
				if (tz0 < 0.001)
					z0 += 0.05;
				if (tz1 < 0.001)
					z1 += 0.05;
				if (tz2 < 0.001)
					z2 += 0.05;
				
				mesh.set(x0, y0, z0, tx0, tz0);
				mesh.set(x1, y1, z1, tx1, tz1);
				mesh.set(x2, y2, z2, tx2, tz2);
				
				y0 = -0.5 * y0;
				y1 = -0.5 * y1;
				y2 = -0.5 * y2;

				mesh.set(x0, y0, z0, 1 - tx0, tz0);
				mesh.set(x2, y2, z2, 1 - tx2, tz2);
				mesh.set(x1, y1, z1, 1 - tx1, tz1);
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
		var s = this.scratch;
		var m = this.model;
		var dt = SOAR.sinterval;
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
		
		this.velocity.copy(this.rotator.front).add(this.normal).mul(this.speed * dt);
		this.position.add(this.velocity);
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

