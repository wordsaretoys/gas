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
				itemsLeft: jQuery("#cook-items-left"),
				itemsRight: jQuery("#cook-items-right"),
				ok: jQuery("#cook-ok"),
				cancel: jQuery("#cook-cancel")
			},
			
			story: {
				box: jQuery("#story"),
				text: jQuery("#story-text"),
				cont: jQuery("#story-cont")
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
			// if a story is displayed w/continue
			if (that.continueEvent) {
				// continue the speech
				that.continueStory();
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
		generate the cooking dialog
		
		convenience method for slapping in all 
		the event handlers and helper methods
		
		@method makeCookingDialog
	**/
	
	makeCookingDialog: function() {
		var ingr = GAS.lookup.ingredient;
		var cook = GAS.hud.dom.cooking;

		// populate the ingredients list
		var side = false;
		GAS.lookup.ingredient.enumerate(function(e) {
			var div = jQuery(document.createElement("div"));
			div.html("<span class=\"big left\">" + e.name + "</span><span class=\"right\">" + e.desc + "</span>");
			div.addClass("cook-back cook-item");
			div.ingredient = e.name;
			div.bind("click", function() {
				var nm = div.ingredient;
				if (cook.dish[nm]) {
					cook.dish[nm] = false;
					div.removeClass("cook-item-selected");
				} else {
					cook.dish[nm] = true;
					div.addClass("cook-item-selected");
				}
			});
			if (side) {
				cook.itemsLeft.append(div);
			} else {
				cook.itemsRight.append(div);
			}
			side = !side;
		});
		
		
		cook.hideDialog = function() {
			// remove all selections
			jQuery(".cook-item").removeClass("cook-item-selected");
			// hide the dialog box
			cook.box.hide();
			// remove HUD dismissal flag
			delete GAS.hud.cancel;
			// restore player control
			GAS.player.unlock();
			// and drop the first mouse move event
			GAS.player.mouse.invalid = true;
		};
		
		cook.dismiss = function() {
			GAS.game.activeNpc.consume();
			cook.hideDialog();
		};
		
		cook.cancel.bind("click", cook.dismiss);
		
		cook.ok.bind("click", function() {
			cook.hideDialog();
			// submit dish to npc
			GAS.game.activeNpc.consume(cook.dish);
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
		// serve up a blank dish object
		cook.dish = {};
		// allow ESC dismissal of dialog
		GAS.hud.cancel = cook.dismiss;
		// prevent player from moving while dialog is displayed
		GAS.player.lock();
		// show the dialog box
		cook.box.show();
		// make sure it's in the right place
		cook.resize();
	},
	
	/**
		display the specified story text with fade in/out
		
		if text is a string, we display that string with an optional
		continue. if text is an array, we display the first element,
		force a continue, and iterate through the array on each call
		of the method. if text is undefined or unspecified, hide the
		story box completely.
		
		@method showStory
		@param text string | array of strings | undefined, narrative
		@param cont boooean, true if continue is displayed/signalled
	**/
	
	showStory: function(text, cont) {
		var story = this.dom.story;
		if (text) {
		
			if (text.isAString) {
				story.text.html(text);
				if (cont) {
					story.cont.show();
				} else {
					story.cont.hide();
				}
				this.continueEvent = cont;
			}
			
			if (text.isAnArray) {
				story.text.html(text[0]);
				story.cont.show();
				this.continueEvent = true;
				this.activeStory = text;
				this.storyIndex = 1;
			}
				
			story.box.fadeIn(this.STORY_FADE_TIME);
		} else {
			story.box.fadeOut(this.STORY_FADE_TIME);
			this.continueEvent = false;
		}
	},
	
	/**
		handles a continue story event
		
		called by HUD, not for external use
		
		@method continueStory
	**/

	continueStory: function() {
		// if there's an active extended story
		if (this.activeStory) {
			// and there are remaining entries in it
			if (this.storyIndex < this.activeStory.length) {
				// show the next entry and advance the counter
				this.showStory(this.activeStory[this.storyIndex], true);
				this.storyIndex++;
			} else {
				// no more entries? remove the properties
				delete this.storyIndex;
				delete this.activeStory;
				// hand the event to the game script
				GAS.game.advance();
			}
		} else {
			// no extended story, hand the event to the game script
			GAS.game.advance();
		}
	}
};
