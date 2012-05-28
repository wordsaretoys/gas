/**

	Sargasso: a WebGL game
	
	game initialization and frame pump
	
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
	
	rng: SOAR.random.create(),

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

		// add any useful polyfills
		Array.prototype.pick = function() {
			return this[Math.floor(Math.random() * this.length)];
		};
		Array.prototype.isAnArray = true;
		String.prototype.isAString = true;
		
		// array random shuffle, taken from
		// http://sroucheray.org/blog/2009/11/array-sort-should-not-be-used-to-shuffle-an-array/
		Array.prototype.shuffle = function (){
			var i = this.length, j, temp;
			if ( i == 0 ) return;
			while ( --i ) {
				j = Math.floor( Math.random() * ( i + 1 ) );
				temp = this[i];
				this[i] = this[j];
				this[j] = temp;
			}
		};
		
		Array.prototype.enumerate = function(f) {
			for(var i = 0, il = this.length; i < il; i++) {
				f(this[i]);
			}
		};
		
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
				GAS.player.camera.projector();
				GAS.draw();
				//GAS.hud.debug(GAS.display.width + ", " + GAS.display.height);
			}, false);
			
			// start the game script 
			GAS.game.control.start();
			
			// start the message pump
			SOAR.run();
			
		});
		
		// while waiting for resource load, initialize game objects
		GAS.hud.init();
		GAS.skybox.init();
		GAS.card.init();
		GAS.ejecta.init();
		GAS.bolus.init();
		GAS.weeds.init();
		GAS.paddler.init();
		GAS.game.init();
		GAS.player.init();
	},
	
	/**
		update all game objects that require it
		
		@method update
	**/
	
	update: function() {
		GAS.game.update();
		GAS.map.update();
		GAS.hud.update();
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
		gl.disable(gl.BLEND);
		gl.disable(gl.CULL_FACE);
	
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		GAS.skybox.draw();
		gl.clear(gl.DEPTH_BUFFER_BIT);
		GAS.ejecta.draw();

		GAS.map.draw();
		GAS.player.avatar.draw();
	}

};
