/**
	manage non-player characters
	
	@namespace GAS
	@class npc
**/

GAS.npc = {

	COMFORT_RADIUS: 25,
	WATCH_RADIUS: 10,
	EVADE_RADIUS: 3,
	
	DRIFTING: 0,
	WATCHING: 1,
	EVADING: 2,

	list: [],
	
	scratch: {
		p: SOAR.vector.create(),
		q: SOAR.quaternion.create(),
		r: SOAR.vector.create()
	},

	/**
		init npc objects
		
		@method init
	**/
	
	init: function() {

		var i, p, o;
		var x, y, z;
		
		for (i = 0; i < 3; i++) {

			x = GAS.random(-GAS.map.MAP_RADIUS, GAS.map.MAP_RADIUS);
			y = GAS.random(-GAS.map.MAP_HEIGHT, GAS.map.MAP_HEIGHT);
			z = GAS.random(-GAS.map.MAP_RADIUS, GAS.map.MAP_RADIUS);
		
			p = SOAR.vector.create(x, y, z);
			o = GAS.paddler.create();
			o.position.copy(p);
			o.haste = 1;

			this.list.push( {
				center: p,
				object: o,
				status: this.DRIFTING,
				target: SOAR.vector.create(),
				period: 0,
				active: false
			} );
			GAS.map.add(o.position, GAS.paddler.RADIUS, 1, o);
		}

		this.soundCard = GAS.card.create("sound");
		GAS.map.addOnTop(this.soundCard);
		this.soundCard.scale = 10;
		//this.soundCard.hidden = true;

		this.player = GAS.player.avatar;
		
	},
	
	/**
		update npc objects
		
		@method update
	**/
	
	update: function() {
		var i, il, n;
		
		for (i = 0, il = this.list.length; i < il; i++) {
			n = this.list[i];
			n.distance = this.player.position.distance(n.object.position);
			if (n.distance <= GAS.map.EYE_RADIUS) {
			
				// handle npc behaviors
				switch (n.status) {
				
				case this.DRIFTING:
					this.drift(n);
					break;
					
				case this.WATCHING:
					this.watch(n);
					break;
					
				case this.EVADING:
					this.evade(n);
					break;
				
				}
				
				// actually move the object
				n.object.update();
				
			}
		
		}
		
		// deal with sound indicator
		this.soundCard.center.copy(this.list[0].object.position).sub(this.player.position).norm().mul(100).add(this.player.position);
		
	},
	
	/**
		implement stochastic "drifting" behavior
		
		@method drift
		@param o object, the npc object
	**/
	
	drift: function(o) {
		var eye = p = this.scratch.p;
		var ray = this.scratch.r;
		var rot = o.object.rotator;

		// if npc is leaving e's comfort zone, pull em back in
		p.copy(o.center).sub(o.object.position);
		if (p.length() > this.COMFORT_RADIUS) {
			p.norm().mul(0.01);
			o.target.add(p).norm();
		}
		// if it's been too long since e changed direction, pick a new target
		if (o.period <= 0) {
			o.period = GAS.random(5, 10);
			o.target.set( GAS.random(-1, 1), GAS.random(-0.5, 0.5), GAS.random(-1, 1) ).norm();
		}
		
		// keep em pointed at the target and counting down the seconds to the next target
		o.object.pointTo(o.target, 0.05);
		o.period -= SOAR.interval * 0.001;

		// if the player is nearby
		if (o.distance < this.WATCH_RADIUS) {
			o.status = this.WATCHING;
			o.object.haste = 0;
			console.log("drifting -> watching");
		}
		
	},

	/**
		implement watching behavior
		
		@method watch
		@param o object, the npc object
	**/
	
	watch: function(o) {
		var p = this.scratch.p;

		p.copy(this.player.position).sub(o.object.position).norm();
		o.object.pointTo(p, 0.1);
		
		if (o.distance > this.WATCH_RADIUS) {
			o.status = this.DRIFTING;
			o.object.haste = 1;
			console.log("watching -> drifting");
		}
		if (o.distance < this.EVADE_RADIUS) {
			o.status = this.EVADING;
			console.log("watching -> evading");
		}
	},

	/**
		implement evasive behavior
		
		@method evade
		@param o object, the npc object
	**/
	
	evade: function(o) {
		var p = this.scratch.p;
		var l;

		// point npc away from player
		o.target.copy(o.object.position).sub(this.player.position).norm();
		o.target.cross(this.player.rotator.up);
		
		// match speed with player
		o.object.haste = this.player.haste || 1;

		// if npc is leaving e's comfort zone, pull em back in
		p.copy(o.center).sub(o.object.position);
		l = p.length() - this.COMFORT_RADIUS;
		if (l > 0) {
			p.norm().mul(l * 0.05);
			o.target.add(p).norm();
		} 
		
		o.object.pointTo(o.target, 0.25);
		
		if (o.distance > this.EVADE_RADIUS) {
			o.status = this.WATCHING;
			o.object.haste = 0;
			console.log("evading -> watching");
		}
		
	},

};