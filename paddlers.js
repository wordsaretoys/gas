/**
	generate, animate, and display paddlers
	
	paddlers are procedurally-generated creatures with
	bilateral symmetry. flaps of tissue that look like
	tentacles or wings extend from cylindrical bodies.
	continuous paddling motions of these flaps permits
	them to move through the air.
	
	@namespace GAS
	@class paddlers
**/

GAS.paddlers = {

	MAX_COUNT: 8,
	SHAPE: [0, 0.25, 0.8, 0.9, 0.7, 0.4, 0.6, 0.4],

	list: [],

	/**
		create and init required objects
		
		@method init
	**/

	init: function() {
		var i, il, p;

		this.shader = SOAR.shader.create(
			GAS.display,
			SOAR.textOf("vs-paddler"), SOAR.textOf("fs-paddler"),
			["position", "texturec"], 
			["projector", "modelview", "rotations", "center", "time"],
			["face", "skin"]
		);

		this.mesh = this.makeMesh();
		
		this.makeFace();

		for (i = 0, il = this.MAX_COUNT; i < il; i++) {
			p = {
				skin: this.makeSkin(),
				center: SOAR.vector.create(),
				rotor: SOAR.boundRotor.create(),
				offset: Math.random()
			};

			p.center.set( 
				Math.random() - Math.random(), 
				Math.random() - Math.random(), 
				Math.random() - Math.random() )
			.norm()
			.mul(5);
			
			this.list.push(p);
		}

	},
	
	/**
		generate a face texture
		
		the face texture allows us to have one single resource
		rather than creating an additional texture for each of
		the paddlers. it's blended into the skin texture right
		inside the fragment shader.
		
		@method makeFace
	**/
	
	makeFace: function() {
		var ctx = GAS.texture.context;
		var w = GAS.texture.canvas.width;
		var h = GAS.texture.canvas.height;
		
		ctx.clearRect(0, 0, w, h);

		ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
		ctx.fillRect(0, 0, w, h);
		
		// draw mouth
		ctx.fillStyle = "rgba(0, 0, 0, 1)";
		ctx.fillRect(0, h - 10, w, 10);
		// draw eye spot (duplicated by mirroring)
		ctx.fillStyle = "rgba(255, 255, 255, 1)";
		ctx.beginPath();
		ctx.arc(20, h - 20, 5, 0, SOAR.PIMUL2, false);
		ctx.fill();
		ctx.fillStyle = "rgba(0, 0, 0, 1)";
		ctx.beginPath();
		ctx.arc(20, h - 20, 4, 0, SOAR.PIMUL2, false);
		ctx.fill();
	
		this.faceTexture = SOAR.texture.create(
			GAS.display, 
			ctx.getImageData(0, 0, w, h)
		);
	},
	
	/**
		generate random skin texture
		
		@method makeSkin
		@return the texture object
	**/
	
	makeSkin: function() {
		var ctx = GAS.texture.context;
		var w = GAS.texture.canvas.width;
		var h = GAS.texture.canvas.height;
		var hw = w * 0.5;
		var hh = h * 0.5;
		var r, g, b, base, coat;
		var i, x, y, s, hs;

		ctx.clearRect(0, 0, w, h);
		r = Math.floor(GAS.random(128, 256));
		g = Math.floor(GAS.random(128, 256));
		b = Math.floor(GAS.random(128, 256));
		base = "rgb(" + r + ", " + g + ", " + b + ")";
		coat = "rgb(" + (256 - r) + ", " + (256 - g) + ", " + (256 - b) + ")";

		ctx.fillStyle = base;
		ctx.fillRect(0, 0, w, h);
		
		ctx.fillStyle = coat;
		for (i = 0; i < 150; i++) {
			s = GAS.random(8, 16);
			x = GAS.random(0, hw);
			y = GAS.random(0, h);
			ctx.fillRect(x, y, s, s);
			ctx.strokeRect(x, y, s, s);
		}

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
	
		SOAR.subdivide(5, -0.5, -0.5, 0.5, 0.5, 
			function(x0, z0, x1, z1, x2, z2) {
				var y0, y1, y2;
				var tz0, tz1, tz2;
				var r0, r1, r2;
			
				tz0 = z0 + 0.5;
				tz1 = z1 + 0.5;
				tz2 = z2 + 0.5;
				
				r0 = Math.sqrt(shaper.get(tz0));
				r1 = Math.sqrt(shaper.get(tz1));
				r2 = Math.sqrt(shaper.get(tz2));
				
				y0 = 0.25 * r0 * Math.pow(Math.cos(x0 * Math.PI), 4);
				y1 = 0.25 * r1 * Math.pow(Math.cos(x1 * Math.PI), 4);
				y2 = 0.25 * r2 * Math.pow(Math.cos(x2 * Math.PI), 4);
				
				x0 = 1.5 * x0 * r0;
				x1 = 1.5 * x1 * r1;
				x2 = 1.5 * x2 * r2;
				
				mesh.set(x0, y0, z0, Math.abs(x0), tz0);
				mesh.set(x1, y1, z1, Math.abs(x1), tz1);
				mesh.set(x2, y2, z2, Math.abs(x2), tz2);

				mesh.set(x0, -y0, z0, Math.abs(x0), tz0);
				mesh.set(x2, -y2, z2, Math.abs(x2), tz2);
				mesh.set(x1, -y1, z1, Math.abs(x1), tz1);
			}
		);
	
		mesh.build();
		
		return mesh;
	},
	
	/**
		update orientations and positions
		
		@method update
	**/

	update: function() {
		var dt = SOAR.interval * 0.001;
		var c, o;
		var i, il, p;

		for (i = 0, il = this.list.length; i < il; i++) {
		
			p = this.list[i];
		
			c = p.center;
			o = p.rotor.orientation;

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
		var center, light, time;
		var i, il, p;

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.projector());
		gl.uniformMatrix4fv(shader.modelview, false, camera.modelview());
		this.faceTexture.bind(0, shader.face);

		for (i = 0, il = this.list.length; i < il; i++) {
			p = this.list[i];
			center = p.center;
			time = p.offset + SOAR.elapsedTime * 0.01;
			gl.uniformMatrix4fv(shader.rotations, false, p.rotor.matrix.transpose);
			gl.uniform3f(shader.center, center.x, center.y, center.z);
			gl.uniform1f(shader.time, time);
			p.skin.bind(1, shader.skin);
			this.mesh.draw();
		}
		
		gl.disable(gl.CULL_FACE);
		
	}

};

