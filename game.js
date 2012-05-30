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
		//this.food.init();
		this.npc.init();
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
		
		@method stage
	**/
	
	stage: function() {
		var scene = GAS.lookup.plot[this.scene];
		var cast = GAS.lookup.cast;
	
		// set up the new scene
		switch(scene.goal) {
		
		case "mono":
		
			GAS.hud.showStory(scene.speech, true);
			break;
			
		case "talk":
		
			GAS.player.setControlLock(true, true);
			GAS.hud.showStory(scene.speech, true);
			break;
			
		case "seek":
		
			this.trackNpc = cast[scene.actor].model;
			this.trackNpc.behavior.calmed = false;
			break;
			
		case "cook":
		
			GAS.player.setControlLock(true);
			GAS.hud.showStory(scene.speech, true);
			break;
		
		}
	},
	
	/**
		cleanup after the last scene
		
		@method clean
	**/
	
	clean: function() {
		var scene = GAS.lookup.plot[this.scene];
	
		switch(scene.goal) {
		
		case "mono":
		
			GAS.hud.showStory();
			break;
		
		case "talk":
		
			GAS.player.setControlLock();
			GAS.hud.showStory();
			break;
			
		case "seek":
		
			delete this.trackNpc;
			break;
			
		case "cook":
		
			GAS.player.setControlLock();
			GAS.hud.showStory();
			this.activeNpc.behavior.calmed = true;
			this.activeNpc.behavior.motion = GAS.game.npc.DRIFTING;
			delete this.activeNpc;
			break;
		
		}
	},
	
	/**
		advance to the next part of the plot
		
		@method advance
	**/
	
	advance: function() {
		// tear down the last scene
		this.clean();
		// advance to the next scene
		this.scene++;
		// set up the next scene
		this.stage();
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
				
				// paddler object already has an update method, so swap it out
				o.update = this.update;
				o.updateMotion = GAS.paddler.update;

				// set up remaining NPC-specific stuff
				o.name = n.name;
				o.behavior = {
					motion: this.DRIFTING,
					period: 0,
					target: SOAR.vector.create(),
					calmed: true
				};
				o.interact = this.interact;
				o.consume = this.consume;
				
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
			update an NPC's motion
			
			called for every NPC on every frame
			"this" refers to the NPC object
			
			@method update
		**/
		
		update: function() {
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

				// if npc is calm
				if (behave.calmed) {
				
					this.haste = 1;
				
					// if the player is too close
					if (this.playerDistance < npc.EVADE_RADIUS) {
						// kick up the speed and flip to evasion behavior
						behave.motion = npc.EVADING;
					}
					
				} else {
				
					this.haste = 2;
				
					// if the player is nearby
					if (this.playerDistance < npc.WATCH_RADIUS) {
						// stop and flip to player-watching behavior
						behave.motion = npc.WATCHING;
					}
					
				}

				break;
				
			case npc.WATCHING:
			
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
				
				// player moves too far away, back to drifting
				if (this.playerDistance > npc.WATCH_RADIUS) {
					behave.period = 0;
					behave.motion = npc.DRIFTING;
				}
				// player moves too close, switch to evade
				if (this.playerDistance < npc.EVADE_RADIUS) {
					behave.motion = npc.EVADING;
				}
				
				break;
				
			case npc.EVADING:

				// move quickly
				this.haste = 2;
				
				// point npc away from player
				behave.target.copy(this.position).sub(player.position).norm();
				this.pointTo(behave.target, 0.5);
				
				// if the player moves out of evasion range
				if (this.playerDistance > npc.EVADE_RADIUS) {
				
					// if npc is calm
					if (behave.calmed) {
						// back to drifting
						behave.motion = npc.DRIFTING;
					} else {
						// back to watching state
						behave.motion = npc.WATCHING;
					}
				}
				
				break;
			
			}
			
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
			
			// if the active npc is drifting and not calm
			if (npc.behavior.motion === this.DRIFTING && !npc.behavior.calmed) {
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
		
	}

};