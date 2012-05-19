/**
	maintain heads up display
	
	@namespace GAS
	@class hud
**/

GAS.hud = {

	STORY_FADE_TIME: 1 / 250,

	/**
		establish jQuery shells around UI DOM objects &
		assign methods for simple behaviors (resize, etc)
		
		@method init
	**/
	
	init: function() {

		this.dom = {
			window: jQuery(window),
			
			tracker: jQuery("#tracker"),
			
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
			
			story: {
				box: jQuery("#story"),
				text: jQuery("#story-text"),
				skip: jQuery("#story-skip")
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
		
		this.dom.cooking.resize = function() {
			var p = GAS.hud.dom.cooking.box;
			p.offset({
				top: (GAS.display.height - p.height()) * 0.5,
				left: (GAS.display.width - p.width()) * 0.5
			});
		};

		this.dom.window.bind("keydown", this.onKeyDown);
		this.dom.window.bind("resize", this.resize);			
		this.resize();
		
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
		
		that.dom.prompts.resize();
		that.dom.cooking.resize();
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
			// cancel any active dialog
			if (that.cancel) {
				that.cancel();
			}
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
			// if no dialog is being shown
			if (!that.cancel) {
				// fade in a blank story
				that.showStory("", false);
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
		var story = this.dom.story;
		if (story.fade) {
			story.alpha += story.fade * this.STORY_FADE_TIME * SOAR.interval;
			story.box.css("opacity", story.alpha);
			if (story.fade === 1 && story.alpha >= 1) {
				story.fade = 0;
			}
			if (story.fade === -1 && story.alpha <= 0) {
				story.fade = 1;
				story.text.html(story.html);
				if (story.canSkip) {
					story.skip.show();
				} else {
					story.skip.hide();
				} 
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
		var ingr = GAS.lookup.ingredient;
		var cook = GAS.hud.dom.cooking;
		
		cook.hideDialog = function() {
			cook.next.bind();
			cook.prev.bind();
			cook.ok.bind();
			cook.cancel.bind();
			cook.box.hide();
			delete GAS.hud.cancel;
			// restore player control
			GAS.player.unlock();
		};
		
		cook.dismiss = function() {
			cook.npc.consume();
			cook.hideDialog();
		};
		
		cook.showIngredients = function() {
			var i, j, il, nm, qt, ds;
			cook.item.removeClass("cook-item-selected");
			for (i = 0, il = cook.item.length; i < il; i++) {
				j = i + cook.index;
				if (j < ingr.length) {
					nm = ingr[j].name;
					ds = ingr[j].desc;
					qt = GAS.player.stores[nm] || 0;
					cook.item[i].innerHTML = "<h2>" + nm + "(" + qt + ")</h2><p>" + ds + "</p>";
					cook.item[i].ingredient = nm;
					cook.item[i].quantity = qt;
					if (cook.dish[nm]) {
						cook.item[i].className += " cook-item-selected";
					}
				} else {
					cook.item[i].innerHTML = "";
					delete cook.item[i].ingredient;
				}
			}
		};
		
		cook.item.bind("click", function() {
			var nm = this.ingredient;
			if (nm && this.quantity) {
				cook.dish[nm] = !cook.dish[nm];
				cook.showIngredients();
			}
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
		
		cook.cancel.bind("click", cook.dismiss);
		
		cook.ok.bind("click", function() {
			cook.hideDialog();
			// submit dish to npc
			cook.npc.consume(cook.dish);
		});
		
		// prevent mouse highlight of elements
		jQuery("#cook > *").bind("mousedown", function() {
			return false;
		});
	},
	
	/**
		display the cooking dialog
		
		@method showCookingDialog
		@param npc object, reference to the calling NPC
	**/
	
	showCookingDialog: function(npc) {
		var cook = GAS.hud.dom.cooking;
		cook.npc = npc;
		cook.dish = {};
		cook.index = 0;
		cook.showIngredients();
		// allow ESC dismissal of dialog
		GAS.hud.cancel = cook.dismiss;
		// prevent player from moving while dialog is displayed
		GAS.player.lock();
		cook.box.show();
		cook.resize();
	},
	
	/**
		display the specified story text with fade in
		
		@method showStory
		@param text string, the narrative to display
		@param canSkip boolean, true if user can dismiss text
	**/
	
	showStory: function(text, canSkip) {
		var story = this.dom.story;
		story.fade = -1;
		story.alpha = 1;
		story.html = text || "";
		story.canSkip = canSkip;
	}
	
};
