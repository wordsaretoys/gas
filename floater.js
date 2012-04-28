/**
	generate, animate, and display a floater
	
	paddlers are procedurally-generated creatures with
	4-fold symmetry. they are practically sessile, and
	much larger than the paddlers.
	
	@namespace GAS
	@class floater
**/

GAS.floater = {

	SHAPE: [0.7, 0.8, 0.9, 0.9, 0.9, 0.8, 0.7, 0.6],

	colorBase: 192,

	/**
		create and init objects usable by all floater instances
		
		@method init
	**/

	init: function() {
		this.shader = SOAR.shader.create(
			GAS.display,
			SOAR.textOf("vs-floater"), SOAR.textOf("fs-floater"),
			["position", "texturec"], 
			["projector", "modelview", "rotations", "center"],
			["skin"]
		);

		this.mesh = this.makeMesh();
	},
	
	/**
		generate and return a new floater object
		
		@method create
		@return object, the new floater
	**/
	
	create: function() {
		var o = Object.create(GAS.floater);
		
		o.position = SOAR.vector.create();
		o.rotator = SOAR.rotator.create();

		o.rotator.scale = 100;
		o.rotator.make();
		o.skin = this.makeSkin();

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

		base = "rgb(255, 255, 255)";
		coat = "rgb(0, 0, 0)";
		
		ctx.fillStyle = base;
		ctx.fillRect(0, 0, w, h);
		
		// top half is darker
		ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
		ctx.fillRect(0, 0, hw, h);

		// add symmetric spots
		ctx.fillStyle = coat;
		ctx.strokeStyle = "rgb(0, 0, 0)";
		ctx.lineWidth = 2;
		
		// closure function to draw a spot
		function spot(x, y, r) {
			ctx.beginPath();
			ctx.arc(x, y, r, 0, SOAR.PIMUL2, false);
			ctx.fill();
			ctx.stroke();
		}
		
		for (i = 0; i < 50; i++) {
			s = GAS.random(4, 16);
			hs = s / 2;
			x = GAS.random(hs, qw - hs);
			y = GAS.random(hs, hh - hs);

			// upper left side, top
			spot(x, y, hs);
			
			// lower left side, top
			spot(x, h - y, hs);
			
			// upper right side, top
			spot(hw - x, y, hs);

			// lower right side, top
			spot(hw - x, h - y, hs);

			// upper left side, bottom
			spot(hw + x, y, hs);

			// lower left side, bottom
			spot(hw + x, h - y, hs);

			// upper right side, bottom
			spot(w - x, y, hs);
			
			// lower right side, bottom
			spot(w - x, h - y, hs);
			
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
		
		var shaper = SOAR.noise1D.create(0, 1, 8, 9);
		shaper.interpolate = SOAR.interpolator.linear;
		shaper.map = new Float32Array(this.SHAPE);
	
		SOAR.subdivide(4, -0.5, -0.5, 0.5, 0.5, 
			function(x0, z0, x1, z1, x2, z2) {
				var y0, y1, y2;
				var tz0, tz1, tz2;
				var tx0, tx1, tx2;
				var r0, r1, r2;
				var a0, a1, a2;
			
				tz0 = z0;
				tz1 = z1;
				tz2 = z2;
				
				tx0 = x0;
				tx1 = x1;
				tx2 = x2;
				
				r0 = Math.sqrt(x0 * x0 + z0 * z0);
				r1 = Math.sqrt(x1 * x1 + z1 * z1);
				r2 = Math.sqrt(x2 * x2 + z2 * z2);
				
				a0 = Math.atan2(z0, x0);
				a1 = Math.atan2(z1, x1);
				a2 = Math.atan2(z2, x2);
				
				r0 = SOAR.clamp(r0, 0, 0.5);
				r1 = SOAR.clamp(r1, 0, 0.5);
				r2 = SOAR.clamp(r2, 0, 0.5);
				
				x0 = shaper.get(a0 * 0.5) * r0 * Math.cos(a0);
				z0 = shaper.get(a0 * 0.5) * r0 * Math.sin(a0);
				x1 = shaper.get(a1 * 0.5) * r1 * Math.cos(a1);
				z1 = shaper.get(a1 * 0.5) * r1 * Math.sin(a1);
				x2 = shaper.get(a2 * 0.5) * r2 * Math.cos(a2);
				z2 = shaper.get(a2 * 0.5) * r2 * Math.sin(a2);
				
				y0 = 0.25 - r0 * r0;
				y1 = 0.25 - r1 * r1;
				y2 = 0.25 - r2 * r2;
				
				tx0 = 0.5 * (tx0 + 0.5);
				tx1 = 0.5 * (tx1 + 0.5);
				tx2 = 0.5 * (tx2 + 0.5);

				tz0 = tz0 + 0.5;
				tz1 = tz1 + 0.5;
				tz2 = tz2 + 0.5;
				
				mesh.set(x0, y0, z0, tx0, tz0);
				mesh.set(x1, y1, z1, tx1, tz1);
				mesh.set(x2, y2, z2, tx2, tz2);

				mesh.set(x0, -0.25 * y0, z0, tx0 + 0.5, tz0);
				mesh.set(x2, -0.25 * y2, z2, tx2 + 0.5, tz2);
				mesh.set(x1, -0.25 * y1, z1, tx1 + 0.5, tz1);
			}
		);
	
		mesh.build();
		
		return mesh;
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
		this.skin.bind(0, shader.skin);
		this.mesh.draw();
		
		gl.disable(gl.CULL_FACE);
		
	}

};

