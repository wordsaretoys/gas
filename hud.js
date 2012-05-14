/**
	maintain heads up display
	
	@namespace GAS
	@class hud
**/

GAS.hud = {

	NARRATIVE_FADE_TIME: 1 / 500,

	pauseMsg: "Press Esc To Resume",
	waitMsg: "Loading",
	hideMsg: "<div class=\"small center\"><span class=\"small key\">SPACE</span> Hide</div>",
	
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
			
			prompts: {
				box: jQuery("#prompts")
			},
			
			cooking: {
				box: jQuery("#cook"),
				item: jQuery(".cook-item"),
				prev: jQuery("#cook-prev"),
				next: jQuery("#cook-next"),
				ok: jQuery("#cook-ok"),
				cancel: jQuery("#cook-cancel")
			},
			
			narrative: {
				box: jQuery("#narrative")
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
			if (that.hideDialog) {
				that.hideDialog();
			} else {
				if (SOAR.running) {
					that.setMessage(that.pauseMsg);
					that.setCurtain(0.5);
					SOAR.running = false;
				} else {
					that.lighten();
					SOAR.running = true;
					GAS.player.mouse.invalid = true;
				}
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
			// if no dialog is being shown
			if (!that.hideDialog) {
				// fade in a blank narrative to hide what's there
				that.showNarrative("", false);
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
		// handle narrative fading
		var narr = this.dom.narrative;
		if (narr.fade) {
			narr.alpha += narr.fade * this.NARRATIVE_FADE_TIME * SOAR.interval;
			narr.box.css("opacity", narr.alpha);
			if (narr.fade === 1 && narr.alpha >= 1) {
				narr.fade = 0;
			}
			if (narr.fade === -1 && narr.alpha <= 0) {
				narr.fade = 1;
				narr.box.html(narr.html);
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
			pr.box.html("<p><span class=\"key\">E</span>&nbsp;" + verb + "</p><p>" + subject + "</p>");
			pr.resize();
			pr.box.css("visibility", "visible");
			pr.object = object;
		} else {
			pr.box.css("visibility", "hidden");
			delete pr.object;
		}
	},
	
	/**
		generate the cooking dialog
		
		convenience method for slapping in all 
		the event handlers and helper methods
		
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
			delete GAS.hud.hideDialog;
			// force display of prompt
			GAS.game.npc.prompting = false;
			// restore player control
			GAS.player.lockout = false;
		};
		
		cook.showIngredients = function() {
			var i, j, il, nm, q;
			cook.item.removeClass("cook-item-selected");
			for (i = 0, il = cook.item.length; i < il; i++) {
				j = i + cook.index;
				if (j < ingr.length) {
					nm = ingr[j];
					q = GAS.player.stores[nm] || 0;
					cook.item[i].innerHTML = ingr[j] + " (" + q + ")";
					cook.item[i].ingredient = j;
					if (cook.selected[j]) {
						cook.item[i].className += " cook-item-selected";
					}
				} else {
					cook.item[i].innerHTML = "";
					cook.item[i].ingredient = -1;
				}
			}
		};
		
		cook.item.bind("click", function() {
			var i = this.ingredient;
			cook.selected[i] = !cook.selected[i];
			cook.showIngredients();
		});
		
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
		cook.selected = [];
		cook.showIngredients();
		// allow ESC dismissal of dialog
		GAS.hud.hideDialog = cook.hideDialog;
		// prevent player from moving while dialog is displayed
		GAS.player.lockout = true;
		cook.box.show();
		GAS.hud.showNarrative("select ingredients", true);
	},
	
	/**
		display the specified narrative
		
		@method showNarrative
		@param text string, the narrative to display
		@param hide boolean, true if user can dismiss text
	**/
	
	showNarrative: function(text, hide) {
		var narr = this.dom.narrative;
		var html = hide ? text + this.hideMsg : text;
		narr.fade = -1;
		narr.alpha = 1;
		narr.html = html;
	}
	
};
