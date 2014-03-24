(function(window){


	/**
	  * Class obstacle
	  * @param spritesheet image
	  * @param position on X-axis
	  * @param position on Y-axis
	  * @param is it an animated sprite
	  */
	function Obstacle(source, posx, posy, animated)
	{
		// Chooses which function will create the view layer
		this.initView = animated? _initAniView : _initView;
		// Updates obstacle status
		this.update = _update;
		// Create view layer
		this.initView(source, posx, posy);
	}

	/**
	  * Creates an animated sprite as view layer
	  * @param spritesheet image
	  * @param position on X-axis
	  * @param position on Y-axis
	  */
	function _initAniView(source, posx, posy)
	{
		// This is not implemented yet, because in this game we will not have obstacles that have animated sprites
	}

	/**
	  * Creates a static sprite as view layer (non-animated)
	  * @param spritesheet image
	  * @param position on X-axis
	  * @param position on Y-axis
	  */
	function _initView(source, posx, posy)
	{
		this.view = new createjs.Shape();
		this.view.graphics.beginBitmapFill(source).drawRect(0, 0, source.width, source.height);
		this.view.x = posx;
		this.view.y = posy;
		this.view.setBounds(posx, posy, source.width, source.height);
	}

	/**
	  * Updates obstacle's position and check for collision with determined object
	  * @param object that will be tested for collision
	  * @param new position
	  * @return result of collision (true = we've got a collision)
	  */
	function _update(object, position)
	{
		this.view.x = position;
		var objectcenter = object.view.x + object.view.getBounds().width/2;
		// Check for collision with object
		if (this.view.x > objectcenter || this.view.x < object.view.x || object.jumping()) return false;
		return true;
	}

	window.Obstacle = Obstacle;

})(window);