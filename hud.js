/**
	maintain heads up display
	
	@namespace GAS
	@class hud
**/

GAS.hud = {

	COMMENT_FADE_TIME: 250,
	COMMENT_READ_TIME: 5000,
	
	pauseMsg: "Press Esc To Resume",
	waitMsg: "Loading",
	
	/**
		establish jQuery shells around UI DOM objects &
		assign methods for simple behaviors (resize, etc)
		
		@method init
	**/
	
	init: function() {

		this.dom = {
			window: jQuery(window),
			
			comment: jQuery("#comment"),
			tracker: jQuery("#tracker"),
			message: jQuery("#message"),

			legend: jQuery("#legend"),
			
			food: jQuery("#food"),
			
			debug: jQuery("#debug")
		};

		this.dom.window.bind("keydown", this.onKeyDown);
		this.dom.window.bind("resize", this.resize);			
		this.resize();
		
		// prevent highlighting of message text
		this.dom.message.bind("mousedown", function() {
			return false;
		});
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
		
		that.dom.message.offset({
			top: (GAS.display.height - that.dom.message.height()) * 0.5,
			left: (GAS.display.width - that.dom.message.width()) * 0.5
		});
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
			if (SOAR.running) {
				that.setMessage(that.pauseMsg);
				that.setCurtain(0.5);
				SOAR.running = false;
			} else {
				that.lighten();
				SOAR.running = true;
				GAS.player.mouse.invalid = true;
			}
			break;
		case SOAR.KEY.TAB:
			// prevent accidental TAB keypress from changing focus
			return false;
			break;
		default:
			//console.log(event.keyCode);
			break;
		}
		return true;
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
		change HUD message
		
		@method setMessage
		@param msg string, message to display
	**/
	
	setMessage: function(msg) {
		msg = msg || "";
		this.dom.message.html(msg);
		this.resize();
	},
	
	/**
		darken the HUD with wait message
		
		used when the UI will be temporarily unresponsive
		
		@method darken
	**/
	
	darken: function() {
		this.setCurtain(0.5);
		this.setMessage(this.waitMsg);
	},
	
	/**
		make the HUD fully visible again
		
		@method lighten
	**/
	
	lighten: function() {
		this.setCurtain(0);
		this.setMessage();
	},
	
	/**
		add an entry to the HUD commentary

		entries are appended to the comment box,
		growing as they fade in, then fading out
		after a delay. they are removed from the
		DOM once they are no longer visible.
		
		@method comment
		@param msg string, message to display
	**/

	comment: function(msg) {
		var div = jQuery(document.createElement("div"));
		div.html(msg);
		div.css("display", "none");
		this.dom.comment.append(div);
		div.fadeTo(this.COMMENT_FADE_TIME, 0.75)
			.delay(this.COMMENT_READ_TIME)
			.hide(this.COMMENT_FADE_TIME, function() {
				div.remove();
			});
	},
	
	/**
		set food scent/concentration
		
		@method setScent
		@param con number, concentration (0..1)
	**/
	
	setScent: function(con) {
		this.dom.food.html(Math.round(con * 100) + "%");
	}
	
};
