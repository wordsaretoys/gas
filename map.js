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
	always: [],
	
	updateIndex: 0,
	updateLength: 50,
	
	dir: SOAR.vector.create(),
	
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
		return a.SORT_ORDER - b.SORT_ORDER;
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
		var fr = GAS.player.camera.front;
		var dir = this.dir;
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
			if (n) {
				// track useful player-object information
				dir.copy(n.position).sub(p);
				n.playerDistance = dir.length();
				dir.norm();
				n.playerDotProduct = dir.dot(fr);
				if (n.update) {
					n.update();
				}
			}
		}
		for (i = 0, il = this.always.length; i < il; i++) {
			n = this.always[i];
			if (n && n.update) {
				n.update();
			}
		}
		
		// notify game objects that want frame-level updates
		GAS.game.update();
	},
	
	/**
		draw everything the player can see
		
		@method draw
	**/
	
	draw: function() {
		var gl = GAS.display.gl;
		var c = 0;
		var i, il, n;

		// reset last draw
		this.lastDraw = "";
		
		// iterate through active nodes
		for (i = 0, il = this.active.length; i < il; i++) {
			n = this.active[i];
			if (n) {
				// if the object's visible
				if (!n.hidden) {
					// and close to the player or within the player's FOV, draw it
					if (n.playerDistance < n.DRAW_RADIUS * 2 || n.playerDotProduct > 0.5) {
						n.draw();
						c++;
					}
				}
			}
		}

		// draw the always-drawn objects on top of everything else
		gl.clear(gl.DEPTH_BUFFER_BIT);
		for (i = 0, il = this.always.length; i < il; i++) {
			n = this.always[i];
			if (!n.hidden) {
				n.draw();
				c++;
			}
		}
		
		//GAS.hud.debug("Drawcount: " + c + "<br>FPS: " + SOAR.fps + "<br>Display: " + GAS.display.width + ", " + GAS.display.height);
	}

};