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
		var that = this;
		var dom = this.dom = {
			tracker: jQuery("#tracker"),
			window: jQuery(window)
		};
		
		dom.window.bind("keydown", this.onKeyDown);
		dom.window.bind("keyup", this.onKeyUp);

		dom.tracker.bind("mousedown", this.onMouseDown);
		dom.tracker.bind("mouseup", this.onMouseUp);
		dom.tracker.bind("mousemove", this.onMouseMove);

		// create a yaw/pitch constrained camera for player view
		this.camera = SOAR.camera.create(
			GAS.display, 
			SOAR.camera.BOUND_ROTATION);
		this.camera.nearLimit = 0.01;
		this.camera.farLimit = 10000;

		// align camera to z-axis
		this.camera.yaw.set(0, 0, 0, 1);
		this.camera.turn(0, 0, 0);
		
		this.position.x = -45;
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
		this.camera.turn(dx, dy);
		mouse.last.x = mouse.next.x;
		mouse.last.y = mouse.next.y;
		
		if (this.paddling) {
			this.velocity.copy(camera.orientation.front).mul(speed * dt);
			this.constrain();
		} else {
			this.velocity.set();
		}
		this.position.add(this.velocity);

		camera.position.copy(this.position);
		scratch.direction.copy(camera.orientation.up).mul(0.75);
		camera.position.add(scratch.direction);
		scratch.direction.copy(camera.orientation.front).mul(2);
		camera.position.sub(scratch.direction); 
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
			case SOAR.KEY.W:
				that.paddling = true;
				break;
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
		
			case SOAR.KEY.W:
				that.paddling = false;
				break;
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
		return this.paddling ? (this.sprint ? this.SPRINT_SPEED : this.NORMAL_SPEED) : 0.5;
	}
};
