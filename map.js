/**
	generate and maintain the playable map
	
	@namespace GAS
	@class map
**/

GAS.map = {

	WEED_COUNT: 7500,
	MAP_RADIUS: 1000,
	MAP_HEIGHT: 300,
	EYE_RADIUS: 200,
	
	node: [],
	
	updateIndex: 0,
	updateLength: 500,
	
	dir: SOAR.vector.create(),

	/**
		initialize map objects and generate map
		
		@method init
	**/
	
	init: function() {
		var i, il;
		var x, y, z, o;
	
		// generate weed objects and map nodes for them
		for (i = 0, il = this.WEED_COUNT; i < il; i++) {
			x = GAS.random(-this.MAP_RADIUS, this.MAP_RADIUS);
			y = GAS.random(-this.MAP_HEIGHT, this.MAP_HEIGHT);
			z = GAS.random(-this.MAP_RADIUS, this.MAP_RADIUS);
			this.node.push( {
				object: GAS.weeds.create(x, y, z),
				center: SOAR.vector.create(x, y, z),
				radius: GAS.weeds.BASE_RADIUS,
				active: false
			} );
		}
		
	},
	
	/**
		update the map nodes active status
		
		@method update
	**/
	
	update: function() {
		var r = this.EYE_RADIUS;
		var i = this.updateIndex;
		var l = this.node.length;
		var c = this.updateLength;
		var p = GAS.player.camera.position;
		
		while (c) {
			var n = this.node[i];
			n.active = n.center.distance(p) < r + n.radius;
			c--;
			if (++i >= l) {
				i = 0;
			}
		}
		
		this.updateIndex = i;
	},
	
	/**
		draw everything the player can see
		
		@method draw
	**/
	
	draw: function() {
		var i, il, n;
		var cp = GAS.player.camera.position;
		var fr = GAS.player.camera.orientation.front;
		var dir = this.dir;
		var c = 0;

		// reset last draw
		this.lastDraw = "";
		
		// iterate through all nodes
		for (i = 0, il = this.node.length; i < il; i++) {
			n = this.node[i];
			if (n.active) {
				dir.copy(n.center).sub(cp);
				if (dir.length() < 100) {
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
		GAS.hud.debug(c);
	}

};