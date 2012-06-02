/**
	maintain heads up display
	
	@namespace GAS
	@class hud
**/

GAS.hud = {

	SPEECH_FADE_TIME: 250,
	CONTINUE_TIMEOUT: 5000,
	RATING_TIMEOUT: 5000,

	/**
		establish jQuery shells around UI DOM objects &
		assign methods for simple behaviors (resize, etc)
		
		@method init
	**/
	
	init: function() {

		this.dom = {
			window: jQuery(window),
			body: jQuery(document.body),
			
			tracker: jQuery("#tracker"),
			
			prompts: {
				box: jQuery("#prompts")
			},
			
			speech: {
				box: jQuery("#speech"),
				name: jQuery("#speech-name"),
				text: jQuery("#speech-text"),
				cont: jQuery("#speech-cont"),
				time: 0
			},
			
			progress: {
				box: jQuery("#progress"),
				bar: jQuery("#progress-bar")
			},
			
			rating: {
				box: jQuery("#rating"),
				bar: jQuery("#rating-bar"),
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
				GAS.player.mouse.invalid = true;
			}
			break;
		case SOAR.KEY.TAB:
			// prevent accidental TAB keypress from changing focus
			return false;
			break;
		case SOAR.KEY.E:
			// interact with something if prompted to do so
			if (that.dom.prompts.object) {
				// activate the interface
				that.dom.prompts.object.interact();
				// turn off the prompt
				that.prompt();
			}
			break;
		case SOAR.KEY.SPACE:
			// if a dialogue is active
			if (that.dom.speech.active) {
				// continue it
				that.continueDialogue();
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
		var speech = this.dom.speech;
		var rating = this.dom.rating;
		
		// if a speech is active
		if (speech.active) {
			// update the timeout value
			speech.time -= SOAR.interval;
			// if timeout is under a second
			if (speech.time < 1000) {
				// blink the continue indicator at half-second intervals
				if (speech.time > 500) {
					speech.cont.css("visibility", "visible");
				} else {
					speech.cont.css("visibility", "hidden");
					if (speech.time < 0) {
						speech.time = 1000;
					}
				}
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
		change HUD curtain opacity
		
		@method setCurtain
		@param opacity number, transparency value (0..1)
	**/
	
	setCurtain: function(opacity) {
		this.dom.tracker.css("background-color", "rgba(0, 0, 0, " + opacity + ")");
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
		display a line in the speech box with optional continue
		
		assumes the speech box is already displayed. 
		
		if text begins with a name followed by a colon, the
		name will be displayed in the name box above the text.
		ex: "BOB:line goes here"
		
		@method showSpeech
		@param text string, the line to display
		@param cont boolean, true if continue prompt is to be shown
	**/
	
	showSpeech: function(text, cont) {
		var speech = this.dom.speech;
		var index = text.indexOf(":");
		if (index !== -1) {
			speech.name.show();
			speech.name.html(text.slice(0, index));
			text = text.slice(index + 1);
			speech.text.css("border-top", "solid 1px white");
		} else {
			speech.text.css("border-top", "none");
		}
		speech.text.html(text);
		speech.cont.css("visibility", cont ? "visible" : "hidden");
	},
	
	/**
		begins a dialogue (or monologue) by displaying the
		speech box and setting up for an extended speech.
		
		@method beginDialogue
		@param list array, collection of speeches
	**/
	
	beginDialogue: function(list) {
		var speech = this.dom.speech;
		speech.box.fadeTo(this.SPEECH_FADE_TIME, 0.75);
		speech.active = list;
		speech.index = 0;
		this.continueDialogue();
	},
	
	/**
		continues a dialogue by displaying the current line
		must have been proceeded by call to beginDialogue
		
		@method continueDialogue
	**/
	
	continueDialogue: function() {
		var speech = this.dom.speech;
		// if there are still speeches in the active dialogue
		if (speech.index < speech.active.length) {
			// show the next entry and advance the counter
			this.showSpeech(speech.active[speech.index], true);
			speech.index++;
			speech.time = this.CONTINUE_TIMEOUT;
		} else {
			// no more entries? remove the properties
			delete speech.index;
			delete speech.active;
			// hand the event to the game script
			GAS.game.advance();
		}
	},
	
	/**
		ends a dialogue by hiding the speech box
		
		@method endDialogue
	**/
	
	endDialogue: function() {
		var speech = this.dom.speech;
		speech.box.fadeTo(this.SPEECH_FADE_TIME, 0);
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
		@param value number, value to display, range {0..1}
	**/
	
	showRating: function(value) {
		var rating = this.dom.rating;
		// update the bar's width (as a percentage of parent)
		rating.bar.css("width", Math.floor(100 * value) + "%");
		// set timeout
		rating.time = this.RATING_TIMEOUT;
		// and display rating
		rating.box.fadeTo(250, 1);
	}
	
};
