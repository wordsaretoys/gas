/**
	generate and maintain the playable map
	
	@namespace GAS
	@class map
**/

GAS.map = {

	RADIUS: 300,
	
	EYE_RADIUS: 200,
	
	master: [],
	active: [],
	
	updateIndex: 0,
	updateLength: 50,
	
	test: SOAR.vector.create(),
	
	/**
		sort function for active display list
		
		@method activeSort
		@param a, b objects to test
		@return sort order (1, 0, 1)
	**/
	
	activeSort: function(a, b) {
		if (!a) {
			return -1;
		}
		if (!b) {
			return 1;
		}
		return b.SORT_ORDER - a.SORT_ORDER;
	},

	/**
		add an object to the map
		
		the object must expose the following members:
			RADIUS, SORT_ORDER, position, draw()
		
		@method add
		@param o object
	**/
	
	add: function(o) {
		this.master.push(o);
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
			if (!n.active && (n.position.distance(p) <= r + n.DRAW_RADIUS)) {
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
				if (n && (n.position.distance(p) > r + n.DRAW_RADIUS)) {
					n.active = false;
					delete this.active[i];
				}
			}
			
			// close any gaps in the active list
			// (object will sort before undefined)
			this.active.sort(this.activeSort);
			// find the first undefined, and chop the array off there
			for (i = 0; i < il; i++) {
				if (!this.active[i]) {
					break;
				}
			}
			this.active.length = i;

			// notify any game objects that want occasional updates
			GAS.game.nudge();
			
		}
		
		// update active drawable objects
		for (i = 0, il = this.active.length; i < il; i++) {
			n = this.active[i];
			if (n && n.update) {
				n.update();
			}
		}
		
		// notify game objects that want frame-level updates
		GAS.game.update();
	},
	
	/**
		test that drawable object is within the viewing frustum
		
		@method hit
		@param n object, the drawable object
		@return true if the object should be drawn
	**/
	
	hit: function(n) {
		var camera = GAS.player.camera;
		var t = this.test;
		var d;
		// rotate and translate the point under test
		t.copy(n.position).transform(camera.matrix.modelview).neg();

		// reject anything too far away to see
		if (t.z - n.DRAW_RADIUS > this.EYE_RADIUS) {
			return false;
		}
		// reject anything too far behind the camera
		if (t.z + n.DRAW_RADIUS < 0) {
			return false;
		}
		
		// use draw radius to find nearest point on object's bounding sphere
		t.z = Math.max(t.z, -n.DRAW_RADIUS);
		t.z = Math.min(t.z, this.EYE_RADIUS + n.DRAW_RADIUS);
		t.x = Math.max(0, Math.abs(t.x) - n.DRAW_RADIUS);
		t.y = Math.max(0, Math.abs(t.y) - n.DRAW_RADIUS);
		// project it
		t.neg().transform(camera.matrix.projector);
		// return whether the results are drawable
		return (Math.abs(t.x / t.z) <= 1 && Math.abs(t.y / t.z) <= 1);
		//return true;
	},
	
	/**
		draw everything the player can see
		
		@method draw
	**/
	
	draw: function() {
		var camera = GAS.player.camera;
		var gl = GAS.display.gl;
		var c = 0;
		var i, il, n;

		// reset last draw (used for shader control)
		this.lastDraw = "";
		
		// iterate through active nodes
		for (i = 0, il = this.active.length; i < il; i++) {
			n = this.active[i];
			// if it's visible and within viewing frustum
			if (n && !n.hidden && this.hit(n)) {
				n.draw();
				c++;
			}
		}

		GAS.hud.debug("Drawcount: " + c + "<br>FPS: " + SOAR.fps + "<br>Display: " + GAS.display.width + ", " + GAS.display.height);
	}

};