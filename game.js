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
		var actor, p, r, a, b;
		
		// if there's prose in the scene
		if (scene.prose) {
			// display it
			GAS.hud.showProse(scene.prose, true);
			// if there's an active NPC, get them talking
			if (this.activeNpc) {
				this.activeNpc.talking = true;
			}
		} else {
			// nope, clean up after the last one
			GAS.hud.showProse();
			// shut up, active NPC
			if (this.activeNpc) {
				this.activeNpc.talking = false;
			}
		}
		
		// if we must release the active NPC
		if (scene.release && this.activeNpc) {
			delete this.activeNpc;
		}
		
		// if an NPC is to start shouting
		if (scene.shout) {
			// track shouting NPC
			this.trackNpc = cast[scene.shout].model;
			// set shouting behavior
			this.trackNpc.update = GAS.game.npc.shout;
		}
		
		// if an NPC is to start wandering
		if (scene.wander) {
			// set wandering behavior
			cast[scene.wander].model.update = GAS.game.npc.wander;
		}
		
		// if an NPC is to descend
		if (scene.descend) {
			actor = cast[scene.descend].model;
			// set target and leaving behavior
			actor.behavior.target.set(0, -1, 0);
			actor.update = GAS.game.npc.leave;
		}
		
		// if an NPC is to exit through the side door
		if (scene.exit) {
			actor = cast[scene.exit].model;
			// set target and leaving behavior
			actor.behavior.target.set(1, 0, 0);
			actor.update = GAS.game.npc.leave;
		}
		
		// if a character is to be distanced from the player
		if (scene.warp) {
			actor = cast[scene.warp].model;
			// set new position far from player
			p = GAS.player.position;
			r = GAS.map.RADIUS;
			actor.position.set(r - p.x, r - p.y, r - p.z).norm().mul(r);
		}
		
		// if two characters are to be swapped
		if (scene.swap) {
			a = cast[scene.swap[0]].model;
			b = cast[scene.swap[1]].model;
			if (a === this.activeNpc) {
				this.activeNpc = b;
			} else if (b === this.activeNpc) {
				this.activeNpc = a;
			}
			
			p = a.position;
			a.position = b.position;
			b.position = p;
			
			p = a.update;
			a.update = b.update;
			b.update = p;
		}
		
		// if a minigame needs starting
		if (scene.mini) {
			this.mini.start(scene.mini);
		}
		
		// if the scene is to be faded in/out
		if (scene.fade) {
			GAS.hud.setFade(scene.fade.time * 1000, scene.fade.alpha);
		}
		
		// if we're ending
		if (scene.stop) {
			GAS.hud.showProse(scene.stop, false);
		}
		
		// next scene
		this.scene++;
	},
	
	/**
	
		weed collection
		
	**/
	
	weed: {
	
		/**
			generate all the weeds in the map
			
			@method init
		**/
		
		init: function() {
			var rm = GAS.map.RADIUS;
			var rw = 1.25 * GAS.weeds.DRAW_RADIUS;
			var rng = SOAR.random.create(123069);
			var x, y, z, r, o;
			// for all places in the map that can hold a weed
			for (x = -rm; x <= rm; x += rw) {
				for (y = -rm; y <= rm; y += rw) {
					for (z = -rm; z <= rm; z += rw) {
						// calculate a normalized distance to the center of the map
						r = Math.sqrt(x * x + y * y + z * z) / rm;
						// if the distance conforms to a spherical volume
						if (r < 1) {
							// add a new weed
							GAS.map.add(GAS.weeds.create(x, y, z));
						}
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
				
				// TEMP: place in test position
//				o.position.set(GAS.rng.get(-1, 1), GAS.rng.get(-1, 1), GAS.rng.get(-1, 1)).norm().mul(10);
//				o.position.set(0, 0, -2);
				
				// store off the paddler's update method
				o.updateMotion = GAS.paddler.update;
				// and set to wandering behavior
				o.update = this.wander;

				// set up remaining NPC-specific stuff
				o.name = n.name;
				o.behavior = {
					period: GAS.makeSwatch(1),
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
			GAS.map.add(this.marker);
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
				if (behave.period.read() > 1) {
					// set new target and new period between 10-20 s
					behave.period.reset( GAS.rng.get(10, 20) );
					behave.target.set( GAS.rng.get(-1, 1), GAS.rng.get(-0.5, 0.5), GAS.rng.get(-1, 1) ).norm();
				}
			}
			
			// keep em pointed at the target
			this.pointTo(behave.target, 0.05);

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
				if (behave.period.read() > 1) {
					// set new target and new period between 2.5-5 s
					behave.period.reset( GAS.rng.get(2.5, 5) );
					behave.target.set( GAS.rng.get(-1, 1), GAS.rng.get(-0.5, 0.5), GAS.rng.get(-1, 1) ).norm();
				}
			}
			
			// keep em pointed at the target
			this.pointTo(behave.target, 0.05);

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
				if (marker.phase > 1.5) {
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
			start a minigame
			
			@method start
			@param game object, game parameters
		**/
		
		start: function(game) {
			this.game = game;
			GAS.hud.showProse(game.help, false);
			GAS.player.startProfiler();
		},
		
		/**
			update mini game progress
			
			@method update
		**/
		
		update: function(stats) {
			var p = GAS.player.profile;
			var g = this.game.graph;
			var total = p.xn + p.xp + p.yn + p.yp;
			var progr = total / this.game.total;
			var error, score;
			
			// update the progress bar
			GAS.hud.showProgress(progr);

			// has the player moved enough?
			if (progr >= 1) {
			
				GAS.player.stopProfiler();
				GAS.hud.showProgress(-1);
				
				// normalize stats
				p.xn /= total;
				p.xp /= total;
				p.yn /= total;
				p.yp /= total;
				
				function ftrim(n) { return Math.round(n * 100) / 100; }
				
				//GAS.hud.debug("xn: " + ftrim(p.xn) + "<br>xp: " + ftrim(p.xp) + "<br>yn: " + ftrim(p.yn) + "<br>yp: " + ftrim(p.yp));
				
				// compare to targets and sum errors to find score
				error = 0.25 * (Math.abs(p.xn - g.xn) + Math.abs(p.xp - g.xp) + 
					Math.abs(p.yn - g.yn) + Math.abs(p.yp - g.yp));
				score = Math.max(1, Math.round(5 * Math.pow(1 - error, 2)));
			
				// show final score
				GAS.hud.showRating(score);

				// disable minigame and advance the plot
				delete this.game;
				GAS.game.advance();
			}
		}
	}

};