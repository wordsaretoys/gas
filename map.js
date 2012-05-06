/**
	generate and maintain the playable map
	
	@namespace GAS
	@class map
**/

GAS.map = {

	OBJECT_WEED: 0,

	WEED_COUNT: 7500,
	MAP_RADIUS: 1000,
	MAP_HEIGHT: 300,
	EYE_RADIUS: 200,
	
	master: [],
	active: [],
	
	updateIndex: 0,
	updateLength: 400,
	
	dir: SOAR.vector.create(),

	/**
		initialize map objects and generate map
		
		@method init
	**/
	
	init: function() {
		var i, il;
		var x, y, z, c;
	
		// generate weed objects and map nodes for them
		for (i = 0, il = this.WEED_COUNT; i < il; i++) {
			x = GAS.random(-this.MAP_RADIUS, this.MAP_RADIUS);
			y = GAS.random(-this.MAP_HEIGHT, this.MAP_HEIGHT);
			z = GAS.random(-this.MAP_RADIUS, this.MAP_RADIUS);
			this.master.push( {
				obtype: this.OBJECT_WEED,
				object: GAS.weeds.create(x, y, z),
				center: SOAR.vector.create(x, y, z),
				radius: GAS.weeds.BASE_RADIUS
			} ); 
		}
	},
	
	/**
		add drawable object to map
		
		@method add
		@param p object, coordinates of object center
		@param r number, object radius
		@param o object to add
	**/
	
	add: function(p, r, o) {
		this.master.push( {
			object: o,
			center: p,
			radius: r
		} );
	},
	
	/**
		update the list of active map nodes
		
		@method update
	**/
	
	update: function() {
		var p = GAS.player.position;
		var r = this.EYE_RADIUS;
		var b = false;
		var i, il, j, c, n;

		// search through the next segment of the master list
		// for anything newly visible & add it to active list
		i = this.updateIndex;
		il = this.master.length;
		for (c = this.updateLength; c; ) {
			n = this.master[i];
			if (!n.active && (n.center.distance(p) <= r + n.radius)) {
				n.active = true;
				this.active.push(n);
			}
			c--;
			if (++i >= il) {
				i = 0;
				b = true;
			}
		}
		this.updateIndex = i;

		// if we've completed a full refresh cycle, do some housecleaning
		if (b) {
		
			// remove anything from the active list that's out of sight
			for (i = 0, il = this.active.length; i < il; i++) {
				n = this.active[i];
				if (n && (n.center.distance(p) > r + n.radius)) {
					n.active = false;
					delete this.active[i];
				}
			}
			
			// close any gaps in the active list
			// (object will sort before undefined)
			this.active.sort();
			// find the first undefined, and chop the array off there
			for (i = 0; i < il; i++) {
				if (!this.active[i]) {
					break;
				}
			}
			this.active.length = i;
		}

//		GAS.hud.debug(this.active.length);
	},
	
	/**
		draw everything the player can see
		
		@method draw
	**/
	
	draw: function() {
		var i, il, n;
		var cp = GAS.player.position;
		var fr = GAS.player.camera.front;
		var dir = this.dir;
		var c = 0;

		// reset last draw
		this.lastDraw = "";
		
		// iterate through active nodes
		for (i = 0, il = this.active.length; i < il; i++) {
			n = this.active[i];
			if (n) {
				dir.copy(n.center).sub(cp);
				if (dir.length() < n.radius * 2) {
					n.object.draw();
					c++;
				} else {
					dir.norm();
					if (dir.dot(fr) > 0.5) {
						c++;
						n.object.draw();
					}
				}
			}
		}
//		GAS.hud.debug(c);
	}

};