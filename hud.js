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
			
			tracker: jQuery("#tracker"),
			message: jQuery("#message"),

			legend: jQuery("#legend"),
			
			scent: {
				box: jQuery("#scent"),
				text: jQuery("#scent-text"),
				value: jQuery("#scent-value")
			},
			
			inventory: jQuery("#inventory td"),
			
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
		
		that.dom.scent.box.offset({
			left: (GAS.display.width - that.dom.scent.box.width()) * 0.5
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
		set food cloud contents/concentration
		
		@method setScent
		@param value number, concentration (0..1)
		@param store string, content of food cloud
	**/
	
	setScent: function(value, store) {
		this.dom.scent.text.html(store);
		this.dom.scent.value.html(Math.round(value * 100) + "%");
	},

	/**
		update current player ingredient inventory
		
		@method setInventory
	**/
	
	setInventory: function(store) {
		for (var i = 0, il = store.length; i < il; i++) {
			this.dom.inventory[i].innerHTML = store[i];
		}
	}
	
	
};
