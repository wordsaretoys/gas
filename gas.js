/**

	Sargasso: a WebGL game
	
	@module gas
	@author cpgauthier

**/

var GAS = {

	resources: {
		noise1: {
			type: "image",
			path: "res/noise1.jpg"
		}
	},
	
	I: new Float32Array([1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1]),
	
	/**
		generate random number in defined range
		
		@method random
		@param l number, lower bound
		@param u number, upper bound
		@return random number between l & u
	**/
	
	random: function(l, u) {
		return l + (u - l) * Math.random();
	},

	/**
		determine if one volume completely contains another
		
		@method contains
		@param x0, y0, z0 number, center of volume 0
		@param l0 number, length of volume 0
		@param x1, y1, z1 number, center of volume 1
		@param l1 number, length of volume 1
		@return true if volume 0 completely contains volume 1
	**/
	
	contains: function(x0, y0, z0, l0, x1, y1, z1, l1) {
		var r0 = l0 * 0.5, r1 = l1 * 0.5;
		return (x0 - r0 <= x1 - r1) && (x0 + r0 >= x1 + r1)
			&& (y0 - r0 <= y1 - r1) && (y0 + r0 >= y1 + r1)
			&& (z0 - r0 <= z1 - r1) && (z0 + r0 >= z1 + r1);
	},
	
	/**
		create GL context, set up game objects, load resources

		@method start
	**/

	start: function() {

		var gl;

		// create the GL display
		try {
			GAS.display = SOAR.display.create("gl");
		} catch (e) {
			jQuery("#glerror").show();
			return;
		}

		// set initial display dimensions
		GAS.display.setSize(
			document.body.clientWidth, 
			document.body.clientHeight
		);

		// set up any webgl stuff that's not likely to change
		gl = GAS.display.gl;
		gl.clearDepth(1.0);
		gl.depthFunc(gl.LEQUAL);
		gl.enable(gl.DEPTH_TEST);
		
		// create an offscreen canvas for texture generation
		GAS.texture = {};
		GAS.texture.canvas = document.createElement("canvas");
		GAS.texture.canvas.width = 512;
		GAS.texture.canvas.height = 512;
		GAS.texture.context = GAS.texture.canvas.getContext("2d");

		// init the HUD and put up a wait message
		GAS.hud.init();
		GAS.hud.setCurtain(0.9);
		GAS.hud.setMessage(GAS.hud.waitMsg);
		
		// begin async loading of resources from the server
		SOAR.loadResources(GAS.resources, function() {

			// this function is called when resource load is complete
			
			// allow game objects to process loaded resources
			
			// schedule animation frame functions
			SOAR.schedule(GAS.update, 0, true);
			SOAR.schedule(GAS.draw, 0, true);

			// resize display & redraw if window size changes
			window.addEventListener("resize", function() {
				GAS.display.setSize(
					document.body.clientWidth, 
					document.body.clientHeight
				);
				GAS.draw();
			}, false);
			
			// tell the player what's going on
			GAS.hud.lighten();
			
			// start the message pump
			SOAR.run();
			
		});
		
		// while waiting for resource load, initialize game objects
		GAS.clouds.init();
		GAS.ejecta.init();
		GAS.weeds.init();
		GAS.paddler.init();
		GAS.player.init();
		GAS.map.init();
		
	},
	
	/**
		update all game objects that require it
		
		@method update
	**/
	
	update: function() {
		//GAS.hud.clearDebug();
		GAS.map.update();
		GAS.player.update();
		GAS.ejecta.update();
	},

	/**
		draw all game objects that require it
		
		draw and update are separated so that the
		game can redraw the display when the game
		is paused (i.e., not updating) and resize
		events are being generated
		
		@method draw
	**/
	
	draw: function() {
		var gl = GAS.display.gl;
	
		gl.clearColor(0.23, 0.72, 1, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		GAS.clouds.draw();
		gl.clear(gl.DEPTH_BUFFER_BIT);

		GAS.map.draw();
		
		GAS.ejecta.draw();
		
		GAS.player.avatar.draw();
	}

};
