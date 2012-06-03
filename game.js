/**
	maintain game logic and supervise game objects
	
	@namespace GAS
	@class game
**/

GAS.game = {

	scene: 0,

	/**
		initialize game objects
		
		@method init
	**/
	
	init: function() {
		this.weed.init();
		this.npc.init();
		this.mini.init();
	},
	
	/**
		updates not handled by individual objects
		called on every frame
		
		@method update
	**/
	
	update: function() {
		if (this.trackNpc) {
			this.npc.tracking();
		}
		this.mini.update();
	},
	
	/**
		lazy updates not handled by individual objects
		called on every display list cleanup (1-2 seconds)
		
		@method nudge
	**/
	
	nudge: function() {
	},
		
	/**
		stage the current scene in the plot
		and advance to the next scene
		
		@method advance
	**/
	
	advance: function() {
		var scene = GAS.lookup.plot[this.scene];
		var cast = GAS.lookup.cast;
		
		// if there's a speech in the scene
		if (scene.speech) {
			// set it up
			GAS.hud.beginDialogue(scene.speech);
		} else {
			// nope, clean up after the last one
			GAS.hud.endDialogue();
		}
		
		// if a character is supposed to be upset
		if (scene.upset) {
			// store off the character object for tracking
			this.trackNpc = cast[scene.upset].model;
			// and set their behavior to shouting
			this.trackNpc.update = GAS.game.npc.shout;
		} else {
			// if we have an upset NPC
			if (this.trackNpc) {
				// drop the character reference (stops tracking)
				delete this.trackNpc;
			}
		}
		
		// if a character has calmed down
		if (scene.calmed) {
			// reset their behavior
			this.activeNpc.update = this.npc.wander;
			// remove the object reference
			delete this.activeNpc;
		}
		
		// set any control lockouts
		if (scene.lock) {
			GAS.player.setControlLock(scene.lock.keys || false, scene.lock.mouse || false);
		}
		
		// next scene
		this.scene++;
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
		
		prompting: false,
		
		/**
			initialize the NPCs
			
			@method init
		**/

		init: function() {
			var cast = GAS.lookup.cast;
			var npcl = GAS.lookup.npc;
			var i, il, n, o;
			
			// for each NPC in the cast list
			for (i = 0, il = npcl.length; i < il; i++) {
				n = cast[ npcl[i] ];
				
				// create a paddler model
				o = GAS.paddler.create(n.skin);
				
				// start where directed
				o.position.copy(n.start);
				
				// TEMP: place in random position
				o.position.set(GAS.rng.get(-1, 1), GAS.rng.get(-1, 1), GAS.rng.get(-1, 1)).norm().mul(10);
				
				// store off the paddler's update method
				o.updateMotion = GAS.paddler.update;
				// and set to wandering behavior
				o.update = this.wander;

				// set up remaining NPC-specific stuff
				o.name = n.name;
				o.behavior = {
					period: 0,
					target: SOAR.vector.create(),
				};
				o.interact = this.interact;
				
				// add model to map and character object
				GAS.map.add(o);
				n.model = o;
			}
		
			// create a marker for the NPCs
			this.marker = GAS.card.create("sound");
			this.marker.scale = 10;
			this.marker.hidden = true;
			GAS.map.always.push(this.marker);
		},
		
		/**
			implements wandering behavior - a slow, random
			drift through the weed cluster. this is pretty
			much the default behavior for a paddler.
			
			called in the context of the NPC
			
			@method wander
		**/
		
		wander: function() {
			var behave = this.behavior;
			var npc = GAS.game.npc;
			
			// maintain slow speed
			this.haste = 1;

			// if npc is about to exit the weed cluster
			if (this.position.length() >= GAS.map.RADIUS) {
				// point them back toward its center
				behave.target.copy(this.position).neg().norm();
			} else {
				// if it's been too long since e changed direction
				if (behave.period <= 0) {
					// set new target and new period between 10-20 s
					behave.period = GAS.random(10, 20);
					behave.target.set( GAS.random(-1, 1), GAS.random(-0.5, 0.5), GAS.random(-1, 1) ).norm();
				}
			}
			
			// keep em pointed at the target and counting down the seconds to the next target
			this.pointTo(behave.target, 0.05);
			behave.period -= SOAR.interval * 0.001;

			// if the player is too close
			if (this.playerDistance < npc.EVADE_RADIUS) {
				// store off a restore reference
				behave.restore = npc.wander;
				// flip to evasion behavior
				this.update = npc.evade;
			}
			
			// update the paddler model itself
			this.updateMotion();
		},
		
		/**
			implements shouting behavior - the npc hurries
			around the weed cluster, demanding attention!
			
			called in the context of the npc
			
			@method shout
		**/
		
		shout: function() {
			var behave = this.behavior;
			var npc = GAS.game.npc;
			
			// maintain fast speed
			this.haste = 2;

			// if npc is about to exit the weed cluster
			if (this.position.length() >= GAS.map.RADIUS) {
				// point them back toward its center
				behave.target.copy(this.position).neg().norm();
			} else {
				// if it's been too long since e changed direction
				if (behave.period <= 0) {
					// set new target and new period between 2.5-5 s
					behave.period = GAS.random(2.5, 5);
					behave.target.set( GAS.random(-1, 1), GAS.random(-0.5, 0.5), GAS.random(-1, 1) ).norm();
				}
			}
			
			// keep em pointed at the target and counting down the seconds to the next target
			this.pointTo(behave.target, 0.05);
			behave.period -= SOAR.interval * 0.001;

			// if the player is nearby
			if (this.playerDistance < npc.WATCH_RADIUS) {
				// flip to player-watching behavior
				this.update = npc.watch;
			}
			
			// update the paddler model itself
			this.updateMotion();
		},
		
		/**
			implements watching behavior - immobile, the npc
			sits and watches the player
			
			called in the context of the npc
			
			@method watch
		**/
		
		watch: function() {
			var player = GAS.player;
			var behave = this.behavior;
			var npc = GAS.game.npc;
		
			// don't move, just stare
			this.haste = 0;
			
			// point the NPC at the player
			behave.target.copy(player.position).sub(this.position).norm();
			this.pointTo(behave.target, 0.1);
			
			// if the player is looking at the NPC, prompt them
			if (this.playerDotProduct >= 0.8 && !npc.prompting && !GAS.game.activeNpc) {
				GAS.hud.prompt(this, "Talk", this.name);
				npc.prompting = true;
			}
			// if the player is looking away, remove the prompt
			if (this.playerDotProduct < 0.8 && npc.prompting) {
				GAS.hud.prompt();
				npc.prompting = false;
			}
			
			// player moves too far away, flip back to shouting
			if (this.playerDistance > npc.WATCH_RADIUS) {
				behave.period = 0;
				this.update = npc.shout;
			}
			// player moves too close
			if (this.playerDistance < npc.EVADE_RADIUS) {
				// store off a restore reference
				behave.restore = npc.watch;
				// flip to evasion behavior
				this.update = npc.evade;
			}
			
			// update the paddler model itself
			this.updateMotion();
		},
		
		/**
			implements evasion behavior - the npc scrambles
			to get out of the way of the player. my suspect
			alternative to having a proper collision detect
			routine!
			
			called in the context of the npc.
			
			@method evade
		**/
		
		evade: function() {
			var player = GAS.player;
			var behave = this.behavior;
			var npc = GAS.game.npc;
		
			// maintain fast speed
			this.haste = 2;
			
			// point npc away from player
			behave.target.copy(this.position).sub(player.position).norm();
			this.pointTo(behave.target, 0.5);
			
			// if the player moves out of evasion range
			if (this.playerDistance > npc.EVADE_RADIUS) {
				// restore the previous behavior
				this.update = behave.restore;
			}
			
			// update the paddler model itself
			this.updateMotion();
		},
		
		/**
			implements dancing behavior
			
			called in the context of the npc.
			
			@method dance
		**/
		
		dance: function() {
			this.updateMotion();
		},
		
		/**
			handles the NPC tracking marker
			
			called on each frame
			
			@method tracking
		**/
		
		tracking: function() {
			var player = GAS.player.avatar;
			var npc = GAS.game.trackNpc;
			var marker = this.marker;
			
			// if the active npc is shouting
			if (npc.update === GAS.game.npc.shout) {
				// make sure the tracking marker is visible
				marker.hidden = false;
				// update the display
				marker.phase += SOAR.interval * 0.001;
				if (marker.phase > 2) {
					marker.phase = -1;
				}
				// move it to a position between player and NPC
				marker.position.copy(npc.position).sub(player.position).norm().mul(100).add(player.position);
			} else {
				// hide the marker
				marker.hidden = true;
			}
		},
		
		/**
			called when the player attempts to interact with the NPC
			
			called in the NPC's context, so "this" refers to it
			
			@method interact
		**/
		
		interact: function() {
			// set active NPC to me
			GAS.game.activeNpc = this;
			// advance the plot
			GAS.game.advance();
		}
	},
	
	/**
	
		minigame module
		
	**/
	
	mini: {
	
		MARKER_DISTANCE: 5,
	
		rotor: SOAR.rotator.create(),
	
		/**
			initialize necessary objects
			
			@method init
		**/
	
		init: function() {

			// create a marker for target following games
			this.marker = GAS.card.create("point");
			this.marker.hidden = true;
			GAS.map.add(this.marker);
		},
		
		/**
			update running minigame
			
			@method update
		**/
		
		update: function() {
			var player = GAS.player;
			var marker = this.marker;
			var rotor  = this.rotor;
			var dt = SOAR.elapsedTime * 0.001;
			
			marker.position.copy(rotor.front).mul(this.MARKER_DISTANCE).add(player.avatar.position);
			
			//rotor.turn(0, Math.sin(dt * 0.01), 0);
		}
	
	}

};