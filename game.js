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
		if (this.mini.game) {
			this.mini.update();
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
		and advance to the next scene
		
		@method advance
	**/
	
	advance: function() {
		var scene = GAS.lookup.plot[this.scene];
		var cast = GAS.lookup.cast;
		var actor;
		
		// if a minigame has been set up
		if (this.mini.game) {
			// start it
			this.mini.start();
			// and bug out
			return;
		}
		
		//console.log(JSON.stringify(scene));
		
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
		}
		
		// if a character is supposed to leave
		if (scene.leave) {
			actor = cast[scene.leave.npc].model;
			// set leaving target and behavior
			actor.behavior.target.copy(scene.leave.target);
			actor.update = GAS.game.npc.leave;
		}
		
		// if a character has calmed down
		if (scene.calmed) {
			// reset their behavior
			this.activeNpc.update = this.npc.wander;
			// remove the object reference
			delete this.activeNpc;
		}
		
		// set any control lockouts
		GAS.player.setControlLock(scene.lockkeys || false, scene.lockmouse || false);
		
		// if a minigame needs setting up
		if (scene.mini) {
			this.mini.setup(scene.mini, scene.speech[0]);
		}
		
		// next scene
		this.scene++;
	},
	
	/**
	
		weed collection
		
	**/
	
	weed: {
	
		COUNT: 750,
		
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
				GAS.map.add(o);
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
				
				// TEMP: place in test position
//				o.position.set(GAS.rng.get(-1, 1), GAS.rng.get(-1, 1), GAS.rng.get(-1, 1)).norm().mul(10);
				o.position.set(0, 0, -2);
				
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
				
				o.playerDistance = function() {
					return this.position.distance(GAS.player.position);
				};
				
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
			behave.period -= SOAR.sinterval;

			// if the player is too close
			if (this.playerDistance() < npc.EVADE_RADIUS) {
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
			behave.period -= SOAR.sinterval;

			// if the player is nearby
			if (this.playerDistance() < npc.WATCH_RADIUS) {
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
			var dp;
		
			// don't move, just stare
			this.haste = 0;
			
			// point the NPC at the player
			behave.target.copy(player.position).sub(this.position).norm();
			this.pointTo(behave.target, 0.1);
			
			// find alignment between player eyeline and npc
			dp = -behave.target.dot(GAS.player.camera.front);
			
			// if the player is looking at the NPC, prompt them
			if (dp >= 0.8 && !npc.prompting && !GAS.game.activeNpc) {
				GAS.hud.prompt(this, "Talk", this.name);
				npc.prompting = true;
			}
			// if the player is looking away, remove the prompt
			if (dp < 0.8 && npc.prompting) {
				GAS.hud.prompt();
				npc.prompting = false;
			}
			
			// player moves too far away, flip back to shouting
			if (this.playerDistance() > npc.WATCH_RADIUS) {
				behave.period = 0;
				this.update = npc.shout;
			}
			// player moves too close
			if (this.playerDistance() < npc.EVADE_RADIUS) {
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
			behave.target.set(-this.position.y, this.position.x, this.position.z)
				.sub(player.position).norm();
			this.pointTo(behave.target, 0.25);
			
			// if the player moves out of evasion range
			if (this.playerDistance() > npc.EVADE_RADIUS) {
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
			implements leaving behavior - the npc leaves
			the game area, ending their part in the story.
			
			@method leave
		**/
		
		leave: function() {
			var behave = this.behavior;
			var npc = GAS.game.npc;
			
			// maintain fast speed
			this.haste = 2;

			// if npc has passed way outside the game area
			if (this.position.length() >= GAS.map.RADIUS + GAS.map.EYE_RADIUS) {
				// no more updates
				this.update = function() {};
			}
			
			// keep em pointed at the target
			this.pointTo(behave.target, 0.05);

			// if the player is too close
			if (this.playerDistance() < npc.EVADE_RADIUS) {
				// store off a restore reference
				behave.restore = npc.leave;
				// flip to evasion behavior
				this.update = npc.evade;
			}
			
			// update the paddler model itself
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
			
			// if there a tracked npc and it's shouting
			if (npc && npc.update === GAS.game.npc.shout) {
				// make sure the tracking marker is visible
				marker.hidden = false;
				// update the display
				marker.phase += SOAR.sinterval;
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
			// stop tracking the NPC
			delete GAS.game.trackNpc;
			// advance the plot
			GAS.game.advance();
		}
	},
	
	/**
	
		minigame module
		
	**/
	
	mini: {
	
		/**
			setup a minigame
			
			@method setup
			@param game object, game parameters
			@param text string, game instructions
		**/
		
		setup: function(game, text) {
			this.game = game;
			this.time = this.game.period;
			this.score = 0;
			this.count = 0;
			this.howto = text;
			this.active = false;
		},
		
		/**
			start the minigame
			
			@method start
		**/
		
		start: function() {
			this.active = true;
			GAS.hud.showInstructions(this.howto, "go!");
			GAS.player.startProfiler();
		},
		
		/**
			update mini game progress
			
			@method update
		**/
		
		update: function(stats) {
			// if a game is active
			if (this.active) {
			
				// advance the progress bar
				this.time -= SOAR.sinterval;
				GAS.hud.showProgress(this.time / this.game.period);
				
				// if we've exceeded the game time
				if (this.time <= 0) {
					// hide progress
					GAS.hud.showProgress(-1);
					
					// show final score
					GAS.hud.showRating(Math.ceil(5 * this.score / this.count));

					// disable minigame and advance the plot
					delete this.game;
					this.active = false;
					GAS.player.stopProfiler();
					GAS.game.advance();
				}
			}
		},
		
		/**
			analyze player movements, calc scores
			
			called by player object whenever it's
			gathered statistics on player motions
			
			@method process
			@param stats array, the rotation distribution
		**/
		
		process: function(stats) {
			var game = this.game;
			var i, il, score = 0, blah;
			// if a game is active
			if (game) {
				// for each rotation speed, check against bounds and add up score
				for (i = 0, il = stats.length; i < il; i++) {
					if (stats[i] >= game.lbound[i] && stats[i] <= game.ubound[i]) {
						score++;
					}
				}
				// add to total score
				score = score / stats.length;
				this.score += score;
				this.count++;
				// display some helpful feedback
				blah = game.rating[ Math.round(score * 4) ];
				GAS.hud.showInstructions(this.howto, blah);
			}
		}
	}

};