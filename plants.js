/**
	generate and display the ribbon plants
	
	@namespace GAS
	@class plants
**/

GAS.plants = {

	texture: {},
	
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
			["projector", "modelview"],
			["noise"]
		);
		
		this.mesh = SOAR.mesh.create(GAS.display, GAS.display.gl.TRIANGLE_STRIP);
		this.mesh.add(this.shader.position, 3);
		this.mesh.add(this.shader.texturec, 2);
		
		var p = SOAR.vector.create();
		var c = SOAR.freeRotor.create();
		c.turn(0, 0, 0);
		var fr = c.orientation.front;
		var rt = c.orientation.right;
		for (i = 0, j = 0; i < 100000; i++) {
		
			this.mesh.set(p.x + 0.5 * rt.x, p.y + 0.5 * rt.y, p.z + 0.5 * rt.z, (i % 256) / 16, 0);
			this.mesh.set(p.x - 0.5 * rt.x, p.y - 0.5 * rt.y, p.z - 0.5 * rt.z, (i % 256) / 16, 1);
			//p.add(fr);
			p.x += fr.x * 0.1;
			p.y += fr.y * 0.1;
			p.z += fr.z * 0.1;
			
			c.turn( 0.1 * (Math.random() - Math.random()),
				0.1 * (Math.random() - Math.random()),
				0.1 * (Math.random() - Math.random()) );
			
		}
		this.mesh.build();
		
		var ctx = GAS.texture.context;
		var w = 256;
		var h = 256;
		ctx.clearRect(0, 0, w, h);
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = "rgb(0, 255, 0)";
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = "rgb(0, 0, 0)";
		ctx.lineWidth = 2;
		for (i = 0; i < 1000; i++) {
			ctx.beginPath();
			ctx.arc(w * Math.random(), h * Math.random(), 5, 0, SOAR.PIMUL2, false);
			ctx.stroke();
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

		shader.activate();
		gl.uniformMatrix4fv(shader.projector, false, camera.projector());
		gl.uniformMatrix4fv(shader.modelview, false, camera.modelview());
		this.texture.noise.bind(0, shader.noise);
		this.mesh.draw();
	}

};