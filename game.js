/**
	maintain game logic and supervise game objects
	
	@namespace GAS
	@class game
**/

GAS.game = {

	/**
		initialize game objects
		
		@method init
	**/
	
	init: function() {
		this.weed.init();
		//this.food.init();
		this.npc.init();
	},
	
	/**
		updates not handled by individual objects
		called on every frame
		
		@method update
	**/
	
	update: function() {
		this.npc.updateMarker();
	},
	
	/**
		lazy updates not handled by individual objects
		called on every display list cleanup (1-2 seconds)
		
		@method nudge
	**/
	
	nudge: function() {
	},
	
	/**
	
		control script
		
	**/
	
	control: {
	
		calmCounter: 0,
		calmTarget: 0,
		
		scene: 0,
		
		/**
			start the game story
			
			@method start
		**/
		
		start: function () {
			var scene = GAS.lookup.plot[0];
			var actor = GAS.lookup.character[scene];
			// add the first character
			GAS.game.npc.add(actor);
			// display the initial narration
			GAS.hud.showStory(GAS.lookup.title, true);
		},
		
		/**
			advance the plot to the next scene
			
			@method advancePlot
		**/
		
		advancePlot: function () {
			var plot = GAS.lookup.plot;
			var actor = GAS.lookup.character;
			var i, il, roster, c;

			// advance the scene
			this.scene++;
			
			// any scenes left?
			if (plot.length < this.scene) {

				// get the actor roster
				roster = plot[this.scene];
				
				// add the new actors into the setting
				for (i = 0, il = roster.length; i < il; i++) {
					c = roster[i];
					GAS.game.npc.add(GAS.lookup.character[c]);
				}
				this.calmTarget = il;
				this.calmCounter = 0;
			}
		},

		/**
			handle the calming of an NPC
			
			@method calmedNpc
		**/
		
		calmedNpc: function() {
			this.calmCounter++;
			if (this.calmCounter === this.calmTarget) {
				this.advancePlot();
			}
		},
		
		/**
			handle a story continuation signalled by the player
			
			@method continueStory
		**/
		
		continueEvent: function () {
			// if there is an active NPC
			if (this.activeNpc) {
				// continue the interaction with the NPC
				this.activeNpc.interact();
			} else {
				// hide whatever story is displayed
				GAS.hud.showStory();
			}
		}
		
	},
	
	/**
	
		weed collection
		
	**/
	
	weed: {
	
		COUNT: 750,
		
		list: [],
		
		/**
			initialize the weed collection
			
			@method init
		**/
		
		init: function() {
			var r = GAS.map.RADIUS;
			var i, il, o;
		
			for (i = 0, il = this.COUNT; i < il; i++) {
				o = GAS.weeds.create(
					GAS.random(-r, r), GAS.random(-r, r), GAS.random(-r, r)	);
				this.list.push(o);
				GAS.map.add(o);
			}
		}
	
	},
	
	/**
	
		food bolus collection
		
	**/
	
	food: {
	
		list: [],
		
		/**
			initialize the bolus collection
			
			@method init
		**/

		init: function() {
			var weed = GAS.game.weed;
			var i, il, c, o;
			
			for (i = 0, il = weed.list.length; i < il; i++) {
				if (Math.random() < 0.25) {
					c = weed.list[i].position;
					o = GAS.bolus.create(c.x, c.y, c.z);
					o.update = this.update;
					this.list.push(o);
					GAS.map.add(o);
				}
			}
		
		},
		
		/**
			update a food bolus
			
			called on EVERY frame for EVERY active bolus
			note that "this" refers to bolus object, not
			the GAS.game.food object
			
			@method update
		**/
		
		update: function() {
			// if player slips inside a food bolus, hide it
			// and replenish player stores if necessary
			if (!this.hidden) {
				if (this.playerDistance < GAS.bolus.DRAW_RADIUS) {
					if (!GAS.player.stores) {
						GAS.player.stores = true;
						this.hidden = true;
					}
				}
			}
		}

	},
	
	/**
	
		paddler NPC handling and behaviors
		
	**/
	
	npc: {

		WATCH_RADIUS: 10,
		EVADE_RADIUS: 3,
		
		DRIFTING: 0,
		WATCHING: 1,
		EVADING: 2,
		
		UNKNOWN: 0,
		RECIPE: 1,
		CALMED: 2,
		
		list: [],

		scratch: {
			p: SOAR.vector.create()
		},
		
		prompting: false,
		
		/**
			initialize the NPCs
			
			@method init
		**/

		init: function() {
			// create a marker for the NPCs
			this.marker = GAS.card.create("sound");
			this.marker.scale = 10;
			this.marker.hidden = true;
			this.marker.index = 0;
			GAS.map.always.push(this.marker);
		},
		
		/**
			add an NPC to the collection and the map
			
			@method add
			@param chr object, character record
		**/
		
		add: function(chr) {

			// create the paddler object
			var o = GAS.paddler.create(chr.model);
			
			// set character data
			o.name = chr.name;
			o.story = chr.story;
			o.solve = chr.solve;
			
			// paddler object already has an update method, so swap it out
			o.update = this.update;
			o.updateMotion = GAS.paddler.update;

			// set up remaining NPC-specific stuff
			o.behavior = {
				motion: this.DRIFTING,
				period: 0,
				target: SOAR.vector.create(),
				relate: this.UNKNOWN
			};
			o.haste = 2;
			o.interact = this.interact;
			o.consume = this.consume;

			GAS.map.add(o);
			this.list.push(o);
		},
		
		/**
			update an NPC's behavior
			
			called for every NPC on every frame
			"this" refers to the NPC object
			
			@method update
		**/
		
		update: function() {
			var p = this.scratch.p;
			var player = GAS.player.avatar;
			var behave = this.behavior;
			var npc = GAS.game.npc;

			switch (behave.motion) {
			
			case npc.DRIFTING:
			
				// if npc is about to exit the reef, pull em back
				if (this.position.length() > GAS.map.RADIUS) {
					p.copy(this.position).neg().norm().mul(0.01);
					behave.target.add(p).norm();
				}
				// if it's been too long since e changed direction, pick a new target
				if (behave.period <= 0) {
					behave.period = GAS.random(2, 5);
					behave.target.set( GAS.random(-1, 1), GAS.random(-0.5, 0.5), GAS.random(-1, 1) ).norm();
				}
				
				// keep em pointed at the target and counting down the seconds to the next target
				this.pointTo(behave.target, 0.05);
				behave.period -= SOAR.interval * 0.001;

				// if npc is not yet calmed
				if (behave.relate !== npc.CALMED) {
				
					// if the player is nearby
					if (this.playerDistance < npc.WATCH_RADIUS) {
						// stop and flip to player-watching behavior
						behave.motion = npc.WATCHING;
						this.haste = 0;
					}
					
				} else {
				
					// if the player is too close
					if (this.playerDistance < npc.EVADE_RADIUS) {
						// kick up the speed and flip to evasion behavior
						behave.motion = npc.EVADING;
						this.haste = 2;
					}
				
				}

				break;
				
			case npc.WATCHING:
			
				// point the NPC at the player
				p.copy(player.position).sub(this.position).norm();
				this.pointTo(p, 0.1);
				
				// if the player is looking at the NPC, prompt them
				if (this.playerDotProduct >= 0.8 && !npc.prompting && !GAS.game.control.activeNpc) {
					GAS.hud.prompt(this, "Talk", this.name);
					npc.prompting = true;
				}
				// if the player is looking away, remove the prompt
				if (this.playerDotProduct < 0.8 && npc.prompting) {
					GAS.hud.prompt();
					npc.prompting = false;
				}
				
				// player moves too far away, back to drifting
				if (this.playerDistance > npc.WATCH_RADIUS) {
					behave.motion = npc.DRIFTING;
					this.haste = 2;
				}
				// player moves too close, switch to evade
				if (this.playerDistance < npc.EVADE_RADIUS) {
					behave.motion = npc.EVADING;
					this.haste = 2;
				}
				
				break;
				
			case npc.EVADING:

				// point npc away from player
				behave.target.copy(this.position).sub(player.position).norm();
				this.pointTo(behave.target, 0.5);
				
				// if npc is not yet calmed
				if (behave.relate !== npc.CALMED) {
				
					// if the player moves out of evasion range
					if (this.playerDistance > npc.EVADE_RADIUS) {
						// back to watching state
						behave.motion = npc.WATCHING;
						this.haste = 0;
					}
				} else {
				
					// if the player moves out of evasion range
					if (this.playerDistance > npc.EVADE_RADIUS) {
						// back to slowly drifting
						behave.motion = npc.DRIFTING;
						this.haste = 1;
					}
				}
				
				break;
			
			}
			
			this.updateMotion();
		},
		
		/**
			used to update the NPC marker
			
			called in object context on EVERY frame
			
			@method updateMarker
		**/
		
		updateMarker: function() {
			var player = GAS.player.avatar;
			var npc = GAS.game.npc;
			var mark = this.marker;
			var n = this.list[mark.index];
			// if the indexed NPC is in a markable state and the marker is running
			if (n.behavior.motion === npc.DRIFTING && n.behavior.relate !== npc.CALMED && mark.phase <= 2) {
				// insure marker is visible
				mark.hidden = false;
				// update its phase
				mark.phase += SOAR.interval * 0.001;
				// move it to a position between player and NPC
				mark.position.copy(n.position).sub(player.position).norm().mul(100).add(player.position);
			} else {
				// make sure the marker is hidden
				mark.hidden = true;
				// go to the next NPC
				mark.index++;
				// wrap around if we've reached the list's end
				if (mark.index >= npc.list.length) {
					mark.index = 0;
				}
				// reset marker phase
				mark.phase = -1;
			}
		
		},
		
		/**
			called when the player attempts to interact with the NPC
			
			called in the NPC's context, so "this" refers to it
			
			@method interact
		**/
		
		interact: function() {
			var npc = GAS.game.npc;
			var behave = this.behavior;

			// set active NPC to me
			GAS.game.control.activeNpc = this;

			// handle according to interaction state
			switch(behave.relate) {
			
			case npc.UNKNOWN:
			
				// show introduction
				GAS.hud.showStory(this.story.intro, true);
				// advance to next state
				behave.relate = npc.RECIPE;
				// lock out player controls
				GAS.player.lock();
				
				break;
				
			case npc.RECIPE:
			
				// if the player has adequate food stores
//				if (GAS.player.stores) {
				if (true) {
					// show the recipe without a continue and let's get cooking
					GAS.hud.showStory(this.story.recipe);
					GAS.hud.showCookingDialog();
				} else {
					// tell the player they need stores
					GAS.hud.showStory(GAS.player.story.needstores, true);
					// remove me as active NPC
					delete GAS.game.control.activeNpc;
					// restore display of prompt
					GAS.game.npc.prompting = false;
					// restore player control
					GAS.player.unlock();
				}
				
				break;
				
			case npc.CALMED:
			
				// player cannot interact with calmed NPCs
			
				break;
				
			}
			
		},
		
		/**
			called when the NPC "eats" the player's dish
			decides if the ingredients are correct, and
			calms the NPC if they are
		
			@method consume
			@param dish object, collection of player-selected ingredients
		**/
		
		consume: function(dish) {
			var npc = GAS.game.npc;
			var c;
			
			// if a dish was supplied
			if (dish) {
				// deplete player stores
				GAS.player.stores = false;
			
				// enumerate through the ingredients that make up the recipe
				// count down for each one that the player selected correctly
				c = this.solve.length;
				this.solve.enumerate(function(e) {
					if (dish[e]) {
						c--;
					}
				});
				
				// if player cleared them all
				if (c === 0) {
					// tell the success story
					GAS.hud.showStory(this.story.success, true);
					// calm the NPC and set them slowly drifting
					this.behavior.relate = npc.CALMED;
					this.behavior.motion = npc.DRIFTING;
					this.haste = 1;
					// let the game know
					GAS.game.control.calmedNpc();
				} else {
					// tell the failure story
					GAS.hud.showStory(this.story.failure, true);
				}
			} else {
				// player cancelled dialog, just fade out the recipe
				GAS.hud.showStory();
			}
			
			// remove me as active NPC
			delete GAS.game.control.activeNpc;
			// restore display of prompt
			GAS.game.npc.prompting = false;
			// restore player control
			GAS.player.unlock();
		}

	}

};