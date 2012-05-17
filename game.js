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
		this.food.init();
		this.npc.init();
	
	},
	
	/**
		updates not handled by individual objects
		called on every frame
		
		@method update
	**/
	
	update: function() {
	},
	
	/**
		lazy updates not handled by individual objects
		called on every display list cleanup (1-2 seconds)
		
		@method nudge
	**/
	
	nudge: function() {
	},
	
	/**
	
		weed collection
		
	**/
	
	weed: {
	
		COUNT: 5000,
		
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
	
		food lookups, combination logic, food cloud collection
		
	**/
	
	food: {
	
		INGREDIENT: [],
		
		list: [],
		
		/**
			initialize the bolus collection
			
			@method init
		**/

		init: function() {
			var weed = GAS.game.weed;
			var i, il, c, o;
			
			// TEMP testing entries
			for (i = 0; i < 16; i++) {
				var s = "";
				for (var j = 0; j < 5; j++) {
					s += "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(GAS.random(0, 26)));
				}
				this.INGREDIENT[i] = s;
			}
			
			for (i = 0, il = weed.list.length; i < il; i++) {
				if (Math.random() < 0.25) {
					c = weed.list[i].position;
					o = GAS.bolus.create(c.x, c.y, c.z);
					o.stores = {};
					this.INGREDIENT.enumerate(function(e) {
						o.stores[e] = Math.round(Math.random());
					});
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
			// and add to player inventory (if possible)
			if (!this.hidden) {
				var that = this;
				if (this.playerDistance < GAS.bolus.DRAW_RADIUS) {
					GAS.game.food.INGREDIENT.enumerate(function(e) {
						GAS.player.stores[e] = (GAS.player.stores[e] || 0) + (that.stores[e] || 0);
					});
					this.hidden = true;
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

		scratch: {
			p: SOAR.vector.create(),
			q: SOAR.quaternion.create(),
			r: SOAR.vector.create()
		},
		
		prompting: false,
		
		/**
			initialize the NPC
			
			@method init
		**/

		init: function() {
			var r = GAS.map.RADIUS;

			this.actor = GAS.paddler.create(
//				GAS.random(-r, r), GAS.random(-r, r), GAS.random(-r, r)	);
			0, 0, -5);
			
			// paddler object already has an update method, so swap it out
			var update = this.actor.update;
			this.actor.update = this.update;
			this.actor.updateMotion = update;

			// set up remaining NPC-specific stuff
			this.actor.behavior = {
				status: this.DRIFTING,
				period: 0,
				target: SOAR.vector.create(),
				calmed: false
			};
			this.actor.haste = 2;
			this.actor.interact = GAS.hud.showCookingDialog;
/*			var that = this;
			this.actor.interact = function() {
				that.actor.behavior.calmed = true;
				that.prompting = false;
			};
*/
			GAS.map.add(this.actor);
			
			this.soundCard = GAS.card.create("sound");
			GAS.map.always.push(this.soundCard);
			this.soundCard.scale = 10;
			this.soundCard.hidden = true;
			
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

			switch (behave.status) {
			
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

				// if the player is nearby
				if (this.playerDistance < npc.WATCH_RADIUS) {
					behave.status = npc.WATCHING;
					this.haste = 0;
					npc.soundCard.hidden = true;
				}

				break;
				
			case npc.WATCHING:
			
				// point the NPC at the player
				p.copy(player.position).sub(this.position).norm();
				this.pointTo(p, 0.1);
				
				// if the player is looking at the NPC, prompt them
				if (this.playerDotProduct >= 0.8 && !npc.prompting) {
					GAS.hud.prompt(this, behave.calmed ? "Question" : "Cook For");
					npc.prompting = true;
				}
				// if the player is looking away, remove the prompt
				if (this.playerDotProduct < 0.8 && npc.prompting) {
					GAS.hud.prompt();
					npc.prompting = false;
				}
				
				// player moves too far away, back to drifting
				if (this.playerDistance > npc.WATCH_RADIUS) {
					behave.status = npc.DRIFTING;
					this.haste = behave.calmed ? 1 : 2;
					npc.soundCard.hidden = false;
				}
				// player moves too close, switch to evade
				if (this.playerDistance < npc.EVADE_RADIUS) {
					behave.status = npc.EVADING;
					this.haste = 2;
				}
				
				break;
				
			case npc.EVADING:

				// point npc away from player
				behave.target.copy(this.position).sub(player.position).norm();
				this.pointTo(behave.target, 0.5);
				
				if (this.playerDistance > npc.EVADE_RADIUS) {
					behave.status = npc.WATCHING;
					this.haste = 0;
				}
				
				break;
			
			}
			
			this.updateMotion();

			npc.soundCard.position.copy(this.position).sub(player.position).norm().mul(100).add(player.position);
		}

	}

};