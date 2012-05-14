/**
	maintain heads up display
	
	@namespace GAS
	@class hud
**/

GAS.hud = {

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
			prompts: jQuery("#prompts"),
			legend: jQuery("#legend"),
			
			cooking: {
				box: jQuery("#cook"),
				item: jQuery(".cook-item"),
				prev: jQuery("#cook-prev"),
				next: jQuery("#cook-next"),
				ok: jQuery("#cook-ok"),
				cancel: jQuery("#cook-cancel")
			},			
			
			debug: jQuery("#debug")
		};

		this.dom.prompts.resize = function() {
			var p = GAS.hud.dom.prompts;
			p.offset({
				top: (GAS.display.height - p.height()) * 0.85,
				left: (GAS.display.width - p.width()) * 0.5
			});
		};
		
		this.dom.window.bind("keydown", this.onKeyDown);
		this.dom.window.bind("resize", this.resize);			
		this.resize();
		
		// prevent highlighting of message text
		this.dom.message.bind("mousedown", function() {
			return false;
		});
		
		this.makeCookingDialog();
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
		case SOAR.KEY.E:
			// interact with something if prompted to do so
			if (that.dom.prompts.object) {
				// activate the interface
				that.dom.prompts.object.interact();
				// turn off the prompt
				that.prompt();
			}
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
		display prompt with specified message
		if no object specified, remove prompt
		
		@method prompt
		@method object object, what the prompt applies to
		@param verb string, what action is implied
	**/
	
	prompt: function(object, verb) {
		var pr = this.dom.prompts;
		var subject = "Npc";
		
		if (object) {
			pr.html("<p><span class=\"key\">E</span>&nbsp;" + verb + "</p><p>" + subject + "</p>");
			pr.resize();
			pr.css("visibility", "visible");
			pr.object = object;
		} else {
			pr.css("visibility", "hidden");
			delete pr.object;
		}
	},
	
	/**
		generate the cooking dialog
		
		convenience method for slapping in all the event handlers
		
		@method makeCookingDialog
	**/
	
	makeCookingDialog: function() {
		var cook = GAS.hud.dom.cooking;
		var ingr = GAS.game.food.INGREDIENT;
		
		cook.hideDialog = function() {
			cook.next.bind();
			cook.prev.bind();
			cook.ok.bind();
			cook.cancel.bind();
			cook.box.hide();
		};
		
		cook.showIngredients = function() {
			var i, j, il;
			for (i = 0, il = cook.item.length; i < il; i++) {
				j = i + cook.index;
				if (j < ingr.length) {
					cook.item[i].innerHTML = ingr[j];
					cook.item[i].ingredient = j;
				} else {
					cook.item[i].innerHTML = "";
					cook.item[i].ingredient = -1;
				}
			}
		};
		
		cook.next.bind("click", function() {
			var l = cook.index + cook.item.length;
			if (l < ingr.length) {
				cook.index = l;
				cook.showIngredients();
			}
		});
		cook.prev.bind("click", function() {
			var l = cook.index - cook.item.length;
			if (l >= 0) {
				cook.index = l;
				cook.showIngredients();
			}
		});
		
		cook.cancel.bind("click", function() {
			cook.hideDialog();
		});
		cook.ok.bind("click", function() {
			cook.hideDialog();
		});
		
		// prevent mouse highlight of elements
		jQuery("#cook > *").bind("mousedown", function() {
			return false;
		});
	},
	
	/**
		display the cooking dialog
		
		@method showCookingDialog
	**/
	
	showCookingDialog: function() {
		var cook = GAS.hud.dom.cooking;
		cook.index = 0;
		cook.showIngredients();
		cook.box.show();
	}
	
};
