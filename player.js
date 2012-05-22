/**
	maintain player state and camera, handle control 
	events related to player motion and interactions
	
	@namespace GAS
	@class player
**/

GAS.player = {

	position: SOAR.vector.create(),
	
	stores: true,
	
	motion: {
		moveleft: false, moveright: false,
		movefore: false, moveback: false,
		movefast: true
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
		},
		invalid: true
	},
	
	scratch: {
		d: SOAR.vector.create()
	},
	
	lockout: false,
	
	debug: false,
	
	/**
		establish jQuery shells around player DOM objects &
		set up event handlers for player controls
		
		tracker div lies over canvas and HUD elements, which
		allows us to track mouse movements without issues in
		the mouse pointer sliding over an untracked element.
		
		@method init
	**/

	init: function() {
		var chr = GAS.lookup.character.player;
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
		this.avatar = GAS.paddler.create(chr.model);
		this.story = chr.story;
	},
	
	/**
		react to player controls by updating velocity and position
		
		called on every animation frame
		
		@method update
	**/

	update: function() {
		var dt = SOAR.interval * 0.001;
		var camera = this.camera;
		var mouse = this.mouse;
		var s = this.scratch;
		var dx, dy;

		dx = 0.25 * dt * (mouse.next.x - mouse.last.x);
		dy = 0.25 * dt * (mouse.next.y - mouse.last.y);
		if (dx || dy) {
			this.camera.turn(dy, dx, 0);
			mouse.last.x = mouse.next.x;
			mouse.last.y = mouse.next.y;
		}
		
		if (this.debug) {
			s.d.set();
			if (this.motion.movefore) {
				s.d.add(camera.front);
			}
			if (this.motion.moveback) {
				s.d.sub(camera.front);
			}
			if (this.motion.moveleft) {
				s.d.sub(camera.right);
			}
			if (this.motion.moveright) {
				s.d.add(camera.right);
			}
			s.d.norm().mul(2 * dt);
			this.position.add(s.d);
			camera.offset.set();
			camera.position.copy(this.position);
		} else {
			
			if (this.motion.movefore) {
				this.avatar.haste = this.motion.movefast ? 2 : 1;
				this.avatar.rotator.track(camera, 0.1);
			} else {
				this.avatar.haste = 0;
			}
			
			this.avatar.update();

			this.position.copy(this.avatar.position);
			camera.position.copy(this.avatar.position);
		}
		
		// generate camera matrixes
		// (will be cached in the camera object)
		camera.modelview();
		camera.projector();
		
	},
	
	/**
		adjust velocity and position to conform to environment
		
		@method constrain
	**/
	
	constrain: function() {
	},
	
	/**
		handle a keypress
		
		@method onKeyDown
		@param event browser object containing event information
		@return true to enable default key behavior
	**/

	onKeyDown: function(event) {

		var that = GAS.player;
		
		if (that.lockout) {
			return true;
		}
		
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

		if (that.lockout) {
			return true;
		}
		
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

		if (that.lockout) {
			return true;
		}
		
		if (that.mouse.down && SOAR.running && !that.mouse.invalid) {
			that.mouse.next.x = event.pageX;
			that.mouse.next.y = event.pageY;
		}
		that.mouse.invalid = false;
		return false;
	},
	
	/**
		lock the player's controls and cease all motion
		
		@method lock
	**/
	
	lock: function() {
		this.lockout = true;
		this.motion.movefore = false;
	},
	
	/**
		unlock the player's controls
		
		@method unlock
	**/
	
	unlock: function() {
		this.lockout = false;
	}
};
