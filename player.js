/**
	maintain player state and camera, handle control 
	events related to player motion and interactions
	
	@namespace GAS
	@class player
**/

GAS.player = {

	PROFILE_COUNT: 60,

	position: SOAR.vector.create(),
	
	stores: true,
	
	motion: {
		moveleft: false, moveright: false,
		movefore: false, moveback: false,
		movefast: true,
		locked: false
	},
	
	mouse: {
		down: false,
		last: {
			x: 0,
			y: 0
		},
		next: {
			x: 0,
			y: 0
		}
	},
	
	profile: {
		time: 0,
		count: 0,
		stats: [0, 0, 0, 0, 0, 0],
		period: 0,
		active: false
	},
	
	scratch: {
		d: SOAR.vector.create()
	},
	
	/**
		establish jQuery shells around player DOM objects &
		set up event handlers for player controls
		
		tracker div lies over canvas and HUD elements, which
		allows us to track mouse movements without issues in
		the mouse pointer sliding over an untracked element.
		
		@method init
	**/

	init: function() {
		var chr = GAS.lookup.cast[GAS.lookup.player];
		var dom = this.dom = {
			tracker: jQuery("#tracker"),
			window: jQuery(window)
		};
		
		dom.window.bind("keydown", this.onKeyDown);
		dom.window.bind("keyup", this.onKeyUp);

		dom.tracker.bind("mousedown", this.onMouseDown);
		dom.tracker.bind("mouseup", this.onMouseUp);
		dom.tracker.bind("mousemove", this.onMouseMove);

		// create a constrained camera for player view
		this.camera = SOAR.camera.create(GAS.display);
		this.camera.nearLimit = 0.1;
		this.camera.farLimit = GAS.map.EYE_RADIUS;
		this.camera.free = false;
		this.camera.bound.set(Math.sqrt(2) / 2, -1, 0);
		this.camera.offset.set(0, 0.5, 2);
		
		// create a player avatar
		this.avatar = GAS.paddler.create(chr.skin);
		this.avatar.position.copy(chr.start);
		GAS.map.add(this.avatar);
	},
	
	/**
		react to player controls by updating velocity and position
		
		called on every animation frame
		
		@method update
	**/

	update: function() {
		var motion = this.motion;
		var camera = this.camera;
		var mouse = this.mouse;
		var avatar = this.avatar;
		var dx, dy, dd, npc;

		// calculate mouse deltas and reset if nonzero
		dx = (mouse.next.x - mouse.last.x) / GAS.display.width;
		if (dx) {
			mouse.last.x = mouse.next.x;
		}
		dy = (mouse.next.y - mouse.last.y) / GAS.display.height;
		if (dy) {
			mouse.last.y = mouse.next.y;
		}
		
		// profiling, if active, requires normalized deltas
		if (this.profile.active) {
			this.profileRotation(dx, dy);
		}

		// rotation, however, must also be based on time delta
		dx = 250 * dx * SOAR.sinterval;
		dy = 250 * dy * SOAR.sinterval;
		
		// if we're in free motion
		if (!motion.locked) {
		
			// turn the camera by specified rotations
			if (dx || dy) {
				camera.turn(dy, dx, 0);
			}
			
			// if we're moving forward
			if (motion.movefore) {
				// always move fast
				avatar.haste = 2;
				// and force avatar to track camera movement
				avatar.rotator.track(camera, 0.1);
			} else {
				avatar.haste = 0;
			}
			
			// constrain player to map interior
			dd = avatar.position.length() - GAS.map.RADIUS;
			if (dd >= 0) {
				avatar.normal.copy(avatar.position).neg().norm().mul(dd);
			} else {
				avatar.normal.set();
			}
			
		} else {
		
			// motion locked, we don't move forward at all
			avatar.haste = 0;
		
			// if we're in a minigame
			if (GAS.game.mini.game) {
			
				// rotate avatar to follow mouse movements
				avatar.rotator.turn(dy, -dx, 0);
		
				// maintain the player and the NPC at eye-level
				npc = GAS.game.activeNpc;
				dd = avatar.position.y - npc.position.y;
				if (Math.abs(dd) > 0.01) {
					// slide avatar along NPC's bounding sphere
					this.scratch.d.copy(npc.rotator.up).mul(dd * 0.1);
					avatar.position.sub(this.scratch.d);
					// turn avatar to face NPC
					avatar.rotator.turn(0, 0.1 * (avatar.rotator.front.dot(npc.rotator.front) + 1), 0);
				}
				// turn the camera to the NPC's viewpoint
				camera.track(npc.rotator, 0.1);
			}
		}

		// avatar drives camera position
		this.position.copy(avatar.position);
		camera.position.copy(avatar.position);

		// generate camera matrixes
		// (will be cached in the camera object)
		camera.modelview();
		camera.projector();
	},
	
	/**
		handle a keypress
		
		@method onKeyDown
		@param event browser object containing event information
		@return true to enable default key behavior
	**/

	onKeyDown: function(event) {

		var that = GAS.player;
		
		switch(event.keyCode) {
			case SOAR.KEY.A:
				that.motion.moveleft = true;
				break;
			case SOAR.KEY.D:
				that.motion.moveright = true;
				break;
			case SOAR.KEY.W:
				that.motion.movefore = true;
				break;
			case SOAR.KEY.S:
				that.motion.moveback = true;
				break;
			case SOAR.KEY.SHIFT:
//				that.motion.movefast = true;
				break;
		}
		return true;
	},

	/**
		handle a key release
		
		@method onKeyUp
		@param event browser object containing event information
		@return true to enable default key behavior
	**/

	onKeyUp: function(event) {

		var that = GAS.player;

		switch(event.keyCode) {

			case SOAR.KEY.A:
				that.motion.moveleft = false;
				break;
			case SOAR.KEY.D:
				that.motion.moveright = false;
				break;
			case SOAR.KEY.W:
				that.motion.movefore = false;
				break;
			case SOAR.KEY.S:
				that.motion.moveback = false;
				break;
			case SOAR.KEY.SHIFT:
//				that.motion.movefast = false;
				break;
		}
		return true;
	},

	/**
		handle a mouse down event
		
		@method onMouseDown
		@param event browser object containing event information
		@return true to enable default mouse behavior
	**/

	onMouseDown: function(event) {
		var mouse = GAS.player.mouse;
		mouse.down = true;
		mouse.last.x = event.pageX;
		mouse.last.y = event.pageY;
		mouse.next.x = event.pageX;
		mouse.next.y = event.pageY;
		return false;
	},
	
	/**
		handle a mouse up event
		
		@method onMouseUp
		@param event browser object containing event information
		@return true to enable default mouse behavior
	**/

	onMouseUp: function(event) {
		GAS.player.mouse.down = false;
		return false;
	},

	/**
		handle a mouse move event
		
		@method onMouseMove
		@param event browser object containing event information
		@return true to enable default mouse behavior
	**/

	onMouseMove: function(event) {
		var that = GAS.player;

		if (that.mouse.down && SOAR.running) {
			that.mouse.next.x = event.pageX;
			that.mouse.next.y = event.pageY;
		}
		return false;
	},
	
	/**
		set motion lock
		
		@method setMotionLock
		@param lock boolean, true/false === lock/unlock
	**/
	
	setMotionLock: function(lock) {
		if (lock) {
			this.avatar.rotator.bound.set(Math.sqrt(2) / 2, -1, 0);
			this.avatar.rotator.free = false;
		} else {
			this.avatar.rotator.bound.set();
			this.avatar.rotator.free = true;
		}
		this.motion.locked = lock;
	},
	
	/**
		start profiling player rotations
		
		@method startProfiler
		@param t number, time in seconds to collect stats for
	**/
	
	startProfiler: function(t) {
		this.profile.watch = GAS.makeSwatch(t);
		this.profile.active = true;
		this.initProfile();
	},
	
	/**
		initialize profile data
		
		@method initProfile
	**/
	
	initProfile: function() {
		this.profile.watch.reset();
		this.profile.count = 0;
		for (var i = 0; i < this.profile.stats.length; i++) {
			this.profile.stats[i] = 0;
		}
	},		
	
	/**
		stop profiling player rotations
		
		@method stopProfiler
	**/
	
	stopProfiler: function() {
		this.profile.active = false;
	},
	
	/**
		accumulate the histogram of the player's rotations,
		and pass it to the minigame handler when it's ready
		
		@method profileRotation
		@param x number, rotation in x
		@param y number, rotation in y
	**/
	
	profileRotation: function(x, y) {
		 var p = this.profile;
		 var time = p.watch.read();
		 var r, i, il;
			
		if (time < 1) {
			r = Math.sqrt(x * x + y * y);
			if (r < 0.001) {
				p.stats[0]++;
			}
			if (r >= 0.001 && r < 0.005) {
				p.stats[1]++;
			}
			if (r >= 0.005 && r < 0.01) {
				p.stats[2]++;
			}
			if (r >= 0.01 && r < 0.05) {
				p.stats[3]++;
			}
			if (r >= 0.05 && r < 0.1) {
				p.stats[4]++;
			}
			if (r >= 0.1) {
				p.stats[5]++;
			}
			p.count++;
		} else {
			var s = "";
			for (i = 0, il = p.stats.length; i < il; i++) {
				p.stats[i] = Math.round(100 * p.stats[i] / p.count);
				s += p.stats[i] + " - ";
			}
			GAS.hud.debug(s);
			GAS.game.mini.process(p.stats);
			this.initProfile();
		}
	}
};
