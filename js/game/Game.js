// Commands
var JUMP_KEY = 32;										// JUMP :: SPACE
var SPEEDUP_KEY = 82;									// SPEED UP :: R

// Global constants
var GAME_WIDTH = 800;									// Canvas Width
var GAME_HEIGHT = 600;									// Canvas Height
var GAME_FRAMERATE = 50;								// Game framerate

var SPEED_GROUND = 1;									// Player's speed * this value = Real ground movement
var SPEED_HILL = 0.2;									// Player's speed * this value = Real hill movement
var SPEED_PLAYER = 300;									// Player's speed
var SPEED_BOOST = 500;									// Player's speed after boost

var canvasID = "mygame-canvas";							// Canvas id
var loadingBarID = "mygame-loadingbar";					// Loading bar
var loadingBarWidth = 600;

// External files that must be loaded
var IMAGES_PATH = "http://127.0.0.1:8090/Project2/images/";
var AUDIO_PATH = "http://127.0.0.1:8090/Project2/audio/";
var EXTERNAL_IMAGES = [
	{ src: IMAGES_PATH+"background/sky.png", id: "sky" },
	{ src: IMAGES_PATH+"background/ground.png", id: "ground"  },
	{ src: IMAGES_PATH+"background/Hill1.png", id: "Hill01" },
	{ src: IMAGES_PATH+"background/Hill2.png", id: "Hill02" },
	{ src: IMAGES_PATH+"spritesheets/player-spritesheet.png", id: "player" },
	{ src: AUDIO_PATH+"background.mp3", id: "soundtrack"}
];


/**
  * Controls game render and objects update
  * @params your canvas's id
  */
function Game() {

	//Important information about game
	this.stage = null;									// Stage
	this.soundtrack = null;								// Background track
	this.obstacles = [];								// All obstacles in game
	this.score = 0;										// Current Score

	//All staticly generated objects that will have in game will be listed bellow:

	this.scoreHolder = null;							// Text that displays the score
	this.sky = null;									// Sky bitmap
	this.ground = null;									// Ground object
	this.hill01 = null;									// Farthest hill
	this.hill02 = null;									// Nearest hill
	this.player = null;									// Player

	// Information used by the game
	this.loader = null;									// Object responsible for loading all external files (sprites)
	this.elapsedTime = 0;								// How much time since last frame (ms)
	this.started = false;								// When user presses play, it will change to true

	this.startLoading();
}
/**
  * Starts loading all external files and then call the render function
  */
Game.prototype.startLoading = function() {
	//Hide main menu
	$("#main-menu").hide();
	//Load all objects
	loader = new createjs.LoadQueue(false);
	loader.addEventListener("complete", this.render);
	loader.loadManifest(EXTERNAL_IMAGES);
	loader.on("progress", this.updateLoadingBar);
};

Game.prototype.updateLoadingBar = function(event)
{
	$("#"+loadingBarID).css("width" , loadingBarWidth * loader.progress);
}

/**
  * Starts generating obstacles and updating score
  */
Game.prototype.startPlaying = function()
{
	setStarted(true);
};

/**
  * Changes value of variable "started"
  * @param bool new value for variable
  */
this.setStarted = function(val)
{
	this.started = val;
};



/** 
  * Render all objects on screen and start listening to user inputs.
  */
Game.prototype.render = function() {
	//Default values for variables
	this.score = 0;
	this.started = false;
	//Removes loading bar
	$(".loadingbar").remove();
	//Shows main menu
	$("#main-menu").show();

	// Tmp image
	var img;

	this.stage = new createjs.Stage(document.getElementById(canvasID));

	sky = new createjs.Shape();
	sky.graphics.beginBitmapFill(loader.getResult("sky")).drawRect(0,0, GAME_WIDTH, GAME_HEIGHT);

	// Ground
	img = loader.getResult("ground");
	ground = new createjs.Shape();
	ground.graphics.beginBitmapFill(img).drawRect(0, 0, GAME_WIDTH + img.width, img.height);
	ground.tileW = img.width;
	ground.y = GAME_HEIGHT - img.height;

	// Hill 01
	hill01 = new createjs.Bitmap(loader.getResult("Hill01"));
	hill01.setTransform(Math.random() * GAME_WIDTH, GAME_HEIGHT - hill01.image.height * 3 - img.height, 3, 3);

	// Hill 02
	hill02 = new createjs.Bitmap(loader.getResult("Hill02"));
	hill02.setTransform(Math.random() * GAME_WIDTH, GAME_HEIGHT - hill02.image.height * 3 - img.height, 3, 3);

	// Player spritesheet
	var playerSS = new createjs.SpriteSheet({
			"images" : [loader.getResult("player")],
			"frames" : {"regX" : 0, "height" : 292, "count" : 64, "regY" : 0, "width" : 165},
			"animations" : {"run" : [0,25, "run", 1.5], "jump" : [26,63, "run"]}
	});

	player = new Player(playerSS, GAME_HEIGHT - img.height - playerSS._frameHeight + 61);

	// Score holder
	scoreHolder = new createjs.Text("", "24px Game bold", "#ff6600");
	scoreHolder.x = GAME_WIDTH - 175;
	scoreHolder.y = 10;

	// Starts playing game background sound
	soundtrack = loader.getResult("soundtrack");
	soundtrack.loop = true;

	// Add all objects to stage
	this.stage.addChild(sky, ground, hill01, hill02, player.sprite, scoreHolder);

	// listener to control player's avatar
	document.onkeydown = this.checkCommands;

	// Start moving everything
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", this.updateObjects);
	soundtrack.play();
};

this.updateObjects = function(event)
{
	// Calculates movement based on player's speed
	var groundSpeed = player.speed * SPEED_GROUND;
	var hillSpeed = player.speed * SPEED_HILL;
	
	// How much time passed from last frame
	elapsedTime = event.delta/1000;

	// Moves ground
	ground.x = (ground.x - elapsedTime * groundSpeed) % ground.tileW;

	// Moves hills
	hill01.x = (hill01.x - elapsedTime * hillSpeed);
	if (hill01.x + hill01.image.width * hill01.scaleX <= 0) hill01.x = GAME_WIDTH;

	hill02.x = (hill02.x - elapsedTime * hillSpeed * 1.5);
	if (hill02.x + hill02.image.width * hill02.scaleX <= 0) hill02.x = GAME_WIDTH;

	if (this.started)
	{
		// Score
		this.score += parseInt(groundSpeed * elapsedTime);
		scoreHolder.text = "Score: "+this.score;
	}

	//Updates stage
	this.stage.update(event);
};

/**
  * Decides which action will be done based on user input
  */
this.checkCommands = function(event)
{
	switch(event.keyCode)
	{
		case JUMP_KEY: player.jump(); break;
		case SPEEDUP_KEY: player.setSpeed(SPEED_BOOST); break;
	}
};

/**
  * Player class.
  * Contains all information about the player's avatar
  */
 function Player(spritesheet, posY)
 {
 	this.life = 100;			// Player's health
 	this.speed = SPEED_PLAYER;	// Player's speed (pixels/second)
 	this.isJumping = false;		// Prevents double jumps
 	this.jumpHeight = 50;		// How height can the player jump (pixels)
 	this.originalY = posY;		// Initial Y position
 	this.durationJump = 0;		// How many miliseconds the jump lasts

 	// Animated sprite
 	Player.prototype.sprite = new createjs.Sprite(spritesheet, "run");
 	Player.prototype.sprite.setTransform(100, posY, 0.8, 0.8);
 	Player.prototype.sprite.framerate = this.speed / 10;

 	this.durationJump = parseInt((spritesheet._data.jump.frames.length / this.sprite.framerate) * 1000);
 };

//Inheritance from Sprite
Player.prototype = new createjs.Sprite;

/**
  * Makes player jump
  */
Player.prototype.jump = function()
{
	//Cannot do double jumps, so just jump when player is not jumping
	if (!Player.prototype.isJumping)
	{
		// Time that player jumped
		Player.prototype.startTime = Date.now();
		setJumping(true);
		this.sprite.gotoAndPlay("jump");
		setTimeout(function(){
			//When time finishes, player can jump again
			this.setJumping(false);
			window.clearInterval(Player.prototype.intervalId);
		}, this.durationJump);
		this.spriteJump();
	}
};

/**
  * Updates player's speed
  */
Player.prototype.setSpeed = function(newSpeed)
{
	this.speed = newSpeed;
	this.sprite.framerate = this.speed/10;
};

/**
  * Moves sprite when player jumps, to avoid collision with objects on ground
  */
Player.prototype.spriteJump = function()
{
	Player.prototype.intervalId = setInterval(this.moveY, 100);
}

/** 
  * Moves player's sprite on Y axis (jump)
 */
Player.prototype.moveY = function()
{
	//Gets data in miliseconds
	var time = Date.now() - Player.prototype.startTime;
	var variation = Math.cos(time);
	Player.prototype.sprite.y -= variation;
	console.log(Player.prototype.sprite);
};

/**
  * Changes value of variable "isJumping"
  * @param bool new value for variable
  */
setJumping = function(val)
{
	Player.prototype.isJumping = val;
};
