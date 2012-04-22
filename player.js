/**
	maintain player state and camera, handle control 
	events related to player motion and interactions
	
	@namespace GAS
	@class player
**/

GAS.player = {

	NORMAL_SPEED: 2,
	SPRINT_SPEED: 10,

	RADIUS: 1.5,

	position: SOAR.vector.create(),
	velocity: SOAR.vector.create(),
	
	motion: {
		moveleft: false, moveright: false,
		movefore: false, moveback: false
	},
	
	paddling: false,
	
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
		direction: SOAR.vector.create(),
		velocity: SOAR.vector.create(),
		matrix: new Float32Array(16)
	},
	
	sprint: false,

	/**
		establish jQuery shells around player DOM objects &
		set up event handlers for player controls
		
		tracker div lies over canvas and HUD elements, which
		allows us to track mouse movements without issues in
		the mouse pointer sliding over an untracked element.
		
		@method init
	**/

	init: function() {
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
		this.camera.nearLimit = 0.01;
		this.camera.farLimit = 500;
		this.camera.free = false;
		this.camera.bound.set(Math.sqrt(2) / 2, -1, 0);

	},
	
	/**
		react to player controls by updating velocity and position
		
		called on every animation frame
		
		@method update
	**/

	update: function() {
		var dt = SOAR.interval * 0.001;
		var speed = (this.sprint) ? this.SPRINT_SPEED : this.NORMAL_SPEED;
		var scratch = this.scratch;
		var camera = this.camera;
		var mouse = this.mouse;
		var dx, dy;

		dx = 0.5 * dt * (mouse.next.x - mouse.last.x);
		dy = 0.5 * dt * (mouse.next.y - mouse.last.y);
		if (dx || dy) {
			this.camera.turn(dy, dx, 0);
		}
		mouse.last.x = mouse.next.x;
		mouse.last.y = mouse.next.y;
	
		scratch.direction.set();
		if (this.motion.movefore) {
			scratch.direction.add(camera.orientation.front);
		}
		if (this.motion.moveback) {
			scratch.direction.sub(camera.orientation.front);
		}
		if (this.motion.moveleft) {
			scratch.direction.sub(camera.orientation.right);
		}
		if (this.motion.moveright) {
			scratch.direction.add(camera.orientation.right);
		}
		scratch.direction.norm();
		this.velocity.copy(scratch.direction).mul(speed * dt);
		this.position.add(this.velocity);

		
/*		
		if (this.paddling) {
			this.velocity.copy(camera.orientation.front).mul(speed * dt);
			this.constrain();
		} else {
			this.velocity.set();
		}
		this.position.add(this.velocity);
*/

		camera.position.copy(this.position);
//		scratch.direction.copy(camera.orientation.up).mul(0.75);
//		camera.position.add(scratch.direction);
//		scratch.direction.copy(camera.orientation.front).mul(2);
//		camera.position.sub(scratch.direction); 
		
		GAS.hud.debug(
			Math.floor(this.position.x * 100) / 100  
			+ ", " + Math.floor(this.position.y * 100) / 100 
			+ ", " + Math.floor(this.position.z * 100) / 100 );
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
/*		
			case SOAR.KEY.W:
				that.paddling = true;
				break;
*/
			case SOAR.KEY.SHIFT:
				that.sprint = true;
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
/*		
			case SOAR.KEY.W:
				that.paddling = false;
				break;
*/
			case SOAR.KEY.SHIFT:
				that.sprint = false;
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
		if (that.mouse.down && SOAR.running && !that.mouse.invalid) {
			that.mouse.next.x = event.pageX;
			that.mouse.next.y = event.pageY;
		}
		that.mouse.invalid = false;
		return false;
	},
	
	/**
		returns current speed for animation purposes
		
		@method getSpeed
		@return number, speed of player avatar
	**/
	
	getSpeed: function() {
		return this.paddling ? (this.sprint ? this.SPRINT_SPEED : this.NORMAL_SPEED) : 0.25;
	}
};
