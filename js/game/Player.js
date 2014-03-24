(function(window){


	var INITIAL_SPEED = 300;
	var MAX_SPEED = 750;

	/**
	  * Player class
	  * @param spritesheet image
	  * @param position on the X axis
	  * @param position on the Y axis
	  */
	function Player(source, posX, posY)
	{

		// Attributes
		this.speed = INITIAL_SPEED;		// How many pixels the player will run per second
		this.distance = 0;				// Distance ran by player
		isJumping = false;				// Prevents double jumps
		jumpPeriod = 0;					// How much time a jump lasts

		// Method definition
		this.initView = _initView;
		this.jump = _jump;
		this.jumping = _isItJumping;
		this.updateSpeed = _updateSpeed;
		
		//initialize player's view
		this.initView(source, posX, posY);
	}


	/**
	  * Init player's view
	  */
	function _initView(source, posX, posY)
	{
		// Spritesheet
		var spritesheet = new createjs.SpriteSheet({
			"images" : [source],
			"frames" : {"regX" : 0, "height" : 292, "count" : 64, "regY" : 0, "width" : 165},
			"animations" : {"run" : [0,25, "run", 1.5], "jump" : [31,62, "run"]}
		});

		// First animation
		this.view = new createjs.Sprite(spritesheet, "run");
		this.view.setTransform(posX, posY, 0.8, 0.8);
		this.view.framerate = (this.speed / 10);
		this.view.setBounds(posX, posY, 165, 292);

		// Calculates jump period
		jumpPeriod = parseInt((spritesheet._data.jump.frames.length / this.view.framerate) * 1000);
	}

	/**
	  * Makes the player jump
	  */
	function _jump()
	{
		// If player is not jumping
		if (!isJumping)
		{
			// Jump
			isJumping = true;
			this.view.gotoAndPlay("jump");
			setTimeout(function(){
				isJumping = false;
			}, jumpPeriod);
		}
	}

	/**
	  * Turn on/off the speed boost
	  */
	function _toggleBoost()
	{
		
	}

	/**
	  * @return if player is jumping
	  */
	function _isItJumping()
	{
		return isJumping;	
	}

	/**
	  * Updates player speed
	  */
	function _updateSpeed()
	{
		var newSpeed = INITIAL_SPEED + this.distance / 100;
		this.speed = (newSpeed < MAX_SPEED)? newSpeed : MAX_SPEED;
	}

	window.Player = Player;

})(window);