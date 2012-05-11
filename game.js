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
		update game objects
		
		called on EVERY frame, keep updates short!
		
		@method update
	**/
	
	update: function() {
		this.npc.update();
	},
	
	/**
		update game objects occasionally
		
		called on every display list cleanup (1-2 seconds)
		
		@method nudge
	**/
	
	nudge: function() {
		this.food.nudge();
	},
	
	/**
	
		weed collection
		
	**/
	
	weed: {
	
		COUNT: 4000,
		
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
					this.list.push(o);
					GAS.map.add(o);
				}
			}
		
		},

		/**
			replenish player stores if close enough
			
			@method nudge
		**/
		
		nudge: function() {
			var p = GAS.player.position;
			var i, il, n, d;
			for (i = 0, il = this.list.length; i < il; i++) {
				n = this.list[i];
				if (n && n.active && !n.hidden) {
					d = p.distance(n.position);
					// if player slips inside a food bolus, hide it
					// and add to player inventory (if possible)
					if (d < GAS.bolus.DRAW_RADIUS) {
						this.INGREDIENT.enumerate(function(e) {
							GAS.player.stores[e] = (GAS.player.stores[e] || 0) + (n.stores[e] || 0);
						});
						n.hidden = true;
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

		scratch: {
			p: SOAR.vector.create(),
			q: SOAR.quaternion.create(),
			r: SOAR.vector.create()
		},
		
		/**
			initialize the NPC
			
			@method init
		**/

		init: function() {
			var r = GAS.map.RADIUS;

			this.actor = GAS.paddler.create(
//				GAS.random(-r, r), GAS.random(-r, r), GAS.random(-r, r)	);
			0, 0, -100);
				
			GAS.map.add(this.actor);
			
			this.status = this.DRIFTING;
			this.period = 0;
			this.target = SOAR.vector.create();
			this.actor.haste = 2;
			
			this.soundCard = GAS.card.create("sound");
			GAS.map.always.push(this.soundCard);
			this.soundCard.scale = 10;
			
		},
		
		/**
			update the NPC's behavior
			
			@method update
		**/
		
		update: function() {
			var player = GAS.player.avatar;
			
			if (this.actor.active) {
		
				this.distance = player.position.distance(this.actor.position);

				switch (this.status) {
				
				case this.DRIFTING:
					this.drift();
					break;
					
				case this.WATCHING:
					this.watch();
					break;
					
				case this.EVADING:
					this.evade();
					break;
				
				}
				
				this.actor.update();
			}
			this.soundCard.position.copy(this.actor.position).sub(player.position).norm().mul(100).add(player.position);
		},
		
		/**
			implement stochastic "drifting" behavior
			
			@method drift
		**/
		
		drift: function() {
			var p = this.scratch.p;
			var o = this.actor;
			
			// if npc is about to exit the reef, pull em back
			if (o.position.length() > GAS.map.RADIUS) {
				p.copy(o.position).neg().norm().mul(0.01);
				this.target.add(p).norm();
			}
			// if it's been too long since e changed direction, pick a new target
			if (this.period <= 0) {
				this.period = GAS.random(2, 5);
				this.target.set( GAS.random(-1, 1), GAS.random(-0.5, 0.5), GAS.random(-1, 1) ).norm();
			}
			
			// keep em pointed at the target and counting down the seconds to the next target
			o.pointTo(this.target, 0.05);
			this.period -= SOAR.interval * 0.001;

			// if the player is nearby
			if (this.distance < this.WATCH_RADIUS) {
				this.status = this.WATCHING;
				o.haste = 0;
				this.soundCard.hidden = true;
			}
			
		},

		/**
			implement watching behavior
			
			@method watch
		**/
		
		watch: function() {
			var player = GAS.player.avatar;
			var p = this.scratch.p;
			var o = this.actor;

			p.copy(player.position).sub(o.position).norm();
			o.pointTo(p, 0.1);
			
			if (this.distance > this.WATCH_RADIUS) {
				this.status = this.DRIFTING;
				o.haste = 2;
				this.soundCard.hidden = false;
			}
			if (this.distance < this.EVADE_RADIUS) {
				this.status = this.EVADING;
				o.haste = 2;
			}
		},

		/**
			implement evasive behavior
			
			@method evade
		**/
		
		evade: function() {
			var player = GAS.player.avatar;
			var p = this.scratch.p;
			var o = this.actor;
			var l;

			// point npc away from player
			this.target.copy(o.position).sub(player.position).norm();
			//this.target.cross(player.rotator.up);
			o.pointTo(this.target, 0.25);
			
			if (this.distance > this.EVADE_RADIUS) {
				this.status = this.WATCHING;
				o.haste = 0;
			}
			
		}
	
	}

};