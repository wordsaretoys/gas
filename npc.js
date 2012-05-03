/**
	manage non-player characters
	
	@namespace GAS
	@class npc
**/

GAS.npc = {

	COMFORT_RADIUS: 25,
	WATCH_RADIUS: 15,
	REACT_RADIUS: 5,
	
	DRIFTING: 0,
	WATCHING: 1,
	DANCING: 2,
	EVADING: 3,

	list: [],
	
	scratch: {
		p: SOAR.vector.create(),
		q: SOAR.quaternion.create()
	},

	/**
		init npc objects
		
		@method init
	**/
	
	init: function() {
	
		// generate test paddler
		var p = SOAR.vector.create(0, 0, -25);
		var o = GAS.paddler.create();
		o.position.copy(p);
		o.haste = 1;

		this.list.push( {
			center: p,
			object: o,
			status: this.DRIFTING,
			target: SOAR.vector.create(),
			period: 0,
			health: 0,
			damage: 0
		} );
		GAS.map.add(o.position, GAS.paddler.RADIUS, o);
	
	},
	
	/**
		update npc objects
		
		@method update
	**/
	
	update: function() {
		var proximity = false;
		var i, il, n;
		
		for (i = 0, il = this.list.length; i < il; i++) {
			n = this.list[i];
			n.distance = GAS.player.position.distance(n.object.position);
			
			// handle npc behaviors
			switch (n.status) {
			
			case this.DRIFTING:
				if (n.distance < this.WATCH_RADIUS) {
					n.status = this.WATCHING;
					n.object.haste = 0;
					console.log("drifting -> watching");
				}
				this.drift(n);
				break;
				
			case this.WATCHING:
				if (n.distance > this.WATCH_RADIUS) {
					n.status = this.DRIFTING;
					n.object.haste = 1;
					console.log("watching -> drifting");
				}
				if (n.distance < this.REACT_RADIUS) {
					n.status = this.EVADING;
					n.object.haste = 2;
					console.log("watching -> evading");
					proximity = true;
				}
				this.watch(n);
				break;
				
			case this.DANCING:
				this.dance(n);
				break;
				
			case this.EVADING:
				if (n.distance > this.REACT_RADIUS) {
					n.status = this.WATCHING;
					n.object.haste = 0;
					console.log("evading -> watching");
					proximity = true;
				}
				this.evade(n);
				break;
			
			}
			
			// actually move the object
			n.object.update();
			
		}
		
		// advise player of npc proximity
		GAS.player.motion.movefast = !proximity;
	
	},
	
	/**
		implement stochastic "drifting" behavior
		
		@method drift
		@param o object, the npc object
	**/
	
	drift: function(o) {
		var p = this.scratch.p;
		p.copy(o.center).sub(o.object.position);
		if (p.length() > this.COMFORT_RADIUS) {
			p.norm().mul(0.01);
			o.target.add(p).norm();
		}
		if (o.period <= 0) {
			o.period = GAS.random(5, 10);
			o.target.set( GAS.random(-1, 1), GAS.random(-0.5, 0.5), GAS.random(-1, 1) ).norm();
		}
		
		o.object.pointTo(o.target, 0.05);
		o.period -= SOAR.interval * 0.001;
	},

	/**
		implement watching behavior
		
		@method watch
		@param o object, the npc object
	**/
	
	watch: function(o) {
		var p = this.scratch.p;
		p.copy(GAS.player.position).sub(o.object.position).norm();
		o.object.pointTo(p, 0.1);
	},

	/**
		implement dancing behavior
		
		@method dance
		@param o object, the npc object
	**/
	
	dance: function(o) {
	
	},

	/**
		implement evasive behavior
		
		@method evade
		@param o object, the npc object
	**/
	
	evade: function(o) {
		var p = this.scratch.p;
		p.copy(o.object.position).sub(GAS.player.position).norm();
		o.object.pointTo(p, 0.25);
	},

};