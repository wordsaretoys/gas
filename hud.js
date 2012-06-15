/**
	maintain heads up display
	
	@namespace GAS
	@class hud
**/

GAS.hud = {

	RATING_TIMEOUT: 5000,
	
	CONTINUE_HTML: "<div id=\"prose-cont\"><span class=\"key\">SPACE</span>&nbsp;Continue</div>",
	PRSPACER_HTML: "<div id=\"prose-spacer\"></div>",

	/**
		establish jQuery shells around UI DOM objects &
		assign methods for simple behaviors (resize, etc)
		
		@method init
	**/
	
	init: function() {

		this.dom = {
			window: jQuery(window),
			body: jQuery(document.body),
			
			fader: jQuery("#fader"),
			
			tracker: jQuery("#tracker"),
			
			prompts: {
				box: jQuery("#prompts")
			},
			
			prose: {
				box: jQuery("#prose"),
				text: jQuery("#prose-text"),
				cont: jQuery("#prose-cont"),
				warn: false,
				delay: GAS.makeSwatch(10),
				blink: GAS.makeSwatch(0.5),
			},
			
			progress: {
				box: jQuery("#progress"),
				bar: jQuery("#progress-bar")
			},
			
			rating: {
				box: jQuery("#rating"),
				time: 0
			},

			debug: jQuery("#debug")
		};

		this.dom.prompts.resize = function() {
			var p = GAS.hud.dom.prompts.box;
			p.offset({
				top: (GAS.display.height - p.height()) * 0.85,
				left: (GAS.display.width - p.width()) * 0.5
			});
		};

		this.dom.window.bind("keydown", this.onKeyDown);
		this.dom.window.bind("resize", this.resize);			
		this.resize();
	},
	
	/**
		add to debug window
		
		@method debug
	**/
	
	debug: function(msg) {
		this.dom.debug.html(msg);
	},
		
	/**
		clear debug window
		
		@method clearDebug
	**/
	
	clearDebug: function() {
		this.dom.debug.html("");
	},
	
	/**
		adjust UI elements in response to browser window resize

		some elements are attached to the edges via CSS, and do
		not require manual resizing or recentering
		
		@method resize
	**/

	resize: function() {
		var that = GAS.hud;

		that.dom.fader.width(GAS.display.width);
		that.dom.fader.height(GAS.display.height);

		that.dom.tracker.width(GAS.display.width);
		that.dom.tracker.height(GAS.display.height);
		
		that.dom.prompts.resize();
	},
	
	/**
		handle a keypress
		
		note that the hud object only handles keys related to 
		HUD activity. see player.js for motion control keys
		
		@method onKeyDown
		@param event browser object containing event information
		@return true to enable default key behavior
	**/

	onKeyDown: function(event) {
		var that = GAS.hud;
	
		switch(event.keyCode) {
		case SOAR.KEY.ESCAPE:
			break;
		case SOAR.KEY.PAUSE:
			// toggle pause (dark screen/no updates)
			if (SOAR.running) {
				that.setCurtain(0.75);
				SOAR.running = false;
			} else {
				that.setCurtain(0);
				SOAR.running = true;
			}
			break;
		case SOAR.KEY.TAB:
			// prevent accidental TAB keypress from changing focus
			return false;
			break;
		case SOAR.KEY.E:
			// interact with something if prompted to do so
			if (that.dom.prompts.object && SOAR.running) {
				// activate the interface
				that.dom.prompts.object.interact();
				// turn off the prompt
				that.prompt();
			}
			break;
		case SOAR.KEY.SPACE:
			// if prose box is active
			if (that.dom.prose.warn && SOAR.running) {
				// continue the plot
				GAS.game.advance();
			}
			break;
		default:
			//console.log(event.keyCode);
			break;
		}
		return true;
	},
	
	/**
		update any HUD animations
		
		called on every animation frame
		
		@method update
	**/
	
	update: function() {
		var prose = this.dom.prose;
		var rating = this.dom.rating;
		
		var outh = prose.box.height();
		var diff = prose.text.height() - outh;
		// if the height of the prose box doesn't match the height of its content
		if (diff) {
			// ease it into the correct size
			diff = diff * 0.1;
			diff = diff > 0 ? Math.ceil(diff) : Math.floor(diff);
			prose.box.height(outh + diff);
		}

		// if the prose warning is set and we're past the delay
		if (prose.warn && prose.delay.read() > 1) {
			// if we're past the blink delay
			if (prose.blink.read() > 1) {
				// reset the blinker and toggle prompt visibility
				prose.blink.reset();
				prose.cont.css("visibility", 
					prose.cont.css("visibility") === "visible" ? "hidden" : "visible");
			}
		}

		
		// if a rating is displayed
		if (rating.time > 0) {
			rating.time -= SOAR.interval;
			if (rating.time <= 0) {
				rating.box.fadeTo(250, 0);
			}
		}
	},
	
	/**
		change mouse tracker opacity
		
		mouse tracker div sits on top of all other HUD elements.
		use for "disable" effects
		
		@method setCurtain
		@param opacity number, transparency value (0..1)
	**/
	
	setCurtain: function(opacity) {
		this.dom.tracker.css("background-color", "rgba(0, 0, 0, " + opacity + ")");
	},
	
	/**
		control fader, then advance game plot
		
		fader sits on top of GL canvas
		use for situations where the rendered scene is to be faded in/out
		
		@method setFade
		@param time number, fade time in ms
		@param opacity number, transparency value (0..1)
	**/

	setFade: function(time, opacity) {
		this.dom.fader.fadeTo(time, opacity, function() {
			GAS.game.advance()
		});
	},
	
	/**
		display prompt with specified message
		if no object specified, remove prompt
		
		@method prompt
		@method object object, what the prompt applies to
		@param verb string, what action is implied
		@param name string, who action applies to
	**/
	
	prompt: function(object, verb, name) {
		var pr = this.dom.prompts;
		
		if (object) {
			pr.box.html("<p><span class=\"key\">E</span>&nbsp;" + verb + "</p><p>" + name + "</p>");
			pr.resize();
			pr.box.css("visibility", "visible");
			pr.object = object;
		} else {
			pr.box.css("visibility", "hidden");
			delete pr.object;
		}
	},
	
	/**
		display a line in the prose box with optional continue
		will hide the prose box if the text is unspecified
		
		@method showProse
		@param text string, the line to display
		@param cont boolean, true if continue prompt is to be shown
	**/
	
	showProse: function(text, cont) {
		var prose = this.dom.prose;
		if (text) {
			if (cont) {
				prose.text.html(text + this.CONTINUE_HTML + this.PRSPACER_HTML);
				prose.cont = jQuery("#prose-cont");
				prose.delay.reset();
			} else {
				prose.text.html(text + this.PRSPACER_HTML);
			}
			prose.warn = cont;
			prose.time = this.CONTINUE_TIMEOUT;
			prose.box.css("visibility", "visible");
		} else {
			prose.text.html("");
			prose.warn = false;
		}
	},
	
	/**
		displays minigame instructions in the speech box
		
		@method showInstructions
		@param text string, the instructions
		@param help string, any feedback or help info
	**/
	
	showInstructions: function(text, help) {
		var speech = this.dom.speech;
		var str = text;
		if (help) {
			str += "<br><div class=\"big center shiny\">" + help + "</div><br>";
		}
		// display without continue
		this.showProse(str, false);
	},		
	
	/**
		show/hide/update progress bar
		
		if value is non-negative and the bar isn't visible,
		it will be displayed. if value is negative, and the
		bar is visible, it will be hidden.
		
		@method showProgress
		@param value number, value to display, range {0..1}
	**/
	
	showProgress: function(value) {
		var prog = this.dom.progress;
	
		// if value is non-negative
		if (value >= 0) {
			// if the bar isn't visible
			if (!prog.visible) {
				// show it
				prog.box.show();
				prog.visible = true;
			}
			// update the bar's width (as a percentage of parent)
			prog.bar.css("width", Math.floor(100 * value) + "%");
		} else {
			// negative, hide the bar
			prog.box.hide();
			prog.visible = false;
		}
	},
	
	/**
		show rating

		displays the rating and starts the fade timer.
		
		@method showRating
		@param score number, how many stars to display (1-5)
	**/
	
	showRating: function(score) {
		var rating = this.dom.rating;
		var i, s = "";

		// generate the star string
		for (i = 0; i < score; i++) {
			s = s + "&#9733;&nbsp;"
		}
		rating.box.html(s);
		// set timeout
		rating.time = this.RATING_TIMEOUT;
		// and display rating
		rating.box.fadeTo(250, 1);
	}
	
};
