/**

	Gas Food Lodging: a WebGL game
	
	game initialization and frame pump
	
	@module gas
	@author cpgauthier

**/

var GAS = {

	rng: SOAR.random.create(12301969),
	
	/**
		create normalized timing object
		
		@method makeSwatch
		@param period number, time in seconds
	**/
	
	makeSwatch: function(period) {
		return {
			start: SOAR.elapsedTime,
			read: function() {
				return 0.001 * (SOAR.elapsedTime - this.start) / period;
			},
			reset: function(p) {
				this.start = SOAR.elapsedTime;
				if (p) {
					period = p;
				}
			}
		};
	},

	/**
		create GL context, set up game objects, load resources

		@method start
	**/

	start: function() {

		var gl, init, total, id;

		// create the GL display
		try {
			GAS.display = SOAR.display.create("gl");
		} catch (e) {
			jQuery("#glerror").show();
			return;
		}
		
		// resize display & redraw if window size changes
		window.addEventListener("resize", this.resize, false);
		
		// set initial display size
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

		// set up an array of all objects to be initialized
		init = [];
		init.push(GAS.hud);
		init.push(GAS.skybox);
		init.push(GAS.card);
		init.push(GAS.ejecta);
		init.push(GAS.weeds);
		init.push(GAS.paddler);
		init.push(GAS.game);
		init.push(GAS.player);
		total = init.length;
		
		// set up a function to call for the next several animation frames
		// this will perform initialization, with progress bar animations
		id = SOAR.schedule(function() {
			var il = init.length;
			var np = total - il;
			// as long as there are objects to init
			if (il > 0) {
				// init the next one
				init.shift().init();
				// update the progress bar
				GAS.hud.showProgress(np / total);
			} else {
				// unschedule the init function
				SOAR.unschedule(id);
				
				// hide the progress bar
				GAS.hud.showProgress( -1 );
				
				// schedule animation frame functions
				SOAR.schedule(GAS.update, 0, true);
				SOAR.schedule(GAS.draw, 0, true);
				
				// set display parameters
				GAS.resize();

				// advance to the start of the game script 
				GAS.game.advance();
			}
		
		}, 0, true);

		// start capturing control events
		SOAR.capture.start();

		// start the message pump
		SOAR.run();
	},
	
	/**
		handle browser resizing
		
		@method resize
	**/
	
	resize: function() {
		GAS.display.setSize(
			document.body.clientWidth, 
			document.body.clientHeight
		);
		GAS.player.camera.projector();
		GAS.draw();
	},
	
	/**
		update all game objects that require it
		
		@method update
	**/
	
	update: function() {
		SOAR.capture.update();
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
	}

};
