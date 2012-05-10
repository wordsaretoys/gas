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
	
		INGREDIENT: [
			"A", "B", "C", "D",
			"E", "F", "G", "H",
			"I", "J", "K", "L",
			"M", "N", "O", "P"
		],
		
		list: [],
		
		/**
			initialize the food cloud collection
			
			@method init
		**/

		init: function() {
			var weed = GAS.game.weed;
			var i, il, c, o;
			
			for (i = 0, il = weed.list.length; i < il; i++) {
				if (Math.random() < 0.25) {
					c = weed.list[i].position;
					o = GAS.spice.create(c.x, c.y, c.z);
					this.list.push(o);
					GAS.map.add(o);
				}
			}
		
		},

		/**
			enumerate the ingredient list
			
			@method enumIngredients
			@param f object, function to call
		**/
		
		enumIngredients: function(f) {
			var i, il, n;
			
			for (i = 0, il = this.INGREDIENT.length; i < il; i++) {
				f(this.INGREDIENT[i]);
			}
		},

		/**
			gauge intensity of food scent to player
			replenish player stores if close enough
			
			game physics, for sure--but it's always
			possible that paddlers detect smells by
			some sort of spectographic analysis and
			if the source is beyond their sight, it
			isn't "smellable"
			
			@method nudge
		**/
		
		nudge: function() {
			var p = GAS.player.position;
			var r = GAS.map.EYE_RADIUS;
			var sum = 0;
			var i, il, n, d;
			for (i = 0, il = this.list.length; i < il; i++) {
				n = this.list[i];
				if (n && n.active && !n.hidden) {
					d = p.distance(n.position);
					sum = Math.max(sum, Math.pow(1 - d / r, 2));
					// if player slips inside a food cloud, hide it
					// and replenish the player food stores
					if (d < GAS.spice.DRAW_RADIUS) {
						n.hidden = true;
						this.enumIngredients(function(name) {
							GAS.player.stores[name] = true;
						});
					}
				}
			}
			GAS.hud.setScent(sum);
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
			
			this.player = GAS.player.avatar;
			
			this.soundCard = GAS.card.create("sound");
			GAS.map.always.push(this.soundCard);
			this.soundCard.scale = 10;
			
		},
		
		/**
			update the NPC's behavior
			
			@method update
		**/
		
		update: function() {
			
			if (this.actor.active) {
		
				this.distance = this.player.position.distance(this.actor.position);

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
			this.soundCard.position.copy(this.actor.position).sub(this.player.position).norm().mul(100).add(this.player.position);
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
			var p = this.scratch.p;
			var o = this.actor;

			p.copy(this.player.position).sub(o.position).norm();
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
			var p = this.scratch.p;
			var o = this.actor;
			var l;

			// point npc away from player
			this.target.copy(o.position).sub(this.player.position).norm();
			//this.target.cross(this.player.rotator.up);
			o.pointTo(this.target, 0.25);
			
			if (this.distance > this.EVADE_RADIUS) {
				this.status = this.WATCHING;
				o.haste = 0;
			}
			
		}
	
	}

};