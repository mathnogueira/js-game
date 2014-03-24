// Game configuration
// Canvas configuration
var GAME_CANVAS = "mygame-canvas";			// Canvas ID
var GAME_WIDTH = 0;							// Game width
var GAME_HEIGHT = 0;						// Game height

// Loading bar configuration
var LOADINGBAR = "mygame-loadingbar";		// Loading bar id
var LOADINGBAR_CLASS = "loadingbar";		// Loading bar class
var LOADINGBAR_WIDTH = 600;					// Loading bar width

// Directories configuration
var IMAGEPATH = document.URL.substr(0,document.URL.lastIndexOf('/'))+"/images/";
var AUDIOPATH = document.URL.substr(0,document.URL.lastIndexOf('/'))+"/audio/";

// List of all external files that have to be loaded
var EXTERNAL_FILES = [
	{ src: IMAGEPATH+"background/sky.png", id: "sky"},
	{ src: IMAGEPATH+"background/ground.png", id: "ground"  },
	{ src: IMAGEPATH+"background/Hill1.png", id: "Hill01" },
	{ src: IMAGEPATH+"background/Hill2.png", id: "Hill02" },
	{ src: IMAGEPATH+"spritesheets/player-spritesheet.png", id: "player" },
	{ src: IMAGEPATH+"spritesheets/rock.png", id: "rock"},
	{ src: IMAGEPATH+"spritesheets/coin.png", id: "coin"},
	{ src: IMAGEPATH+"orange juice 2.0.ttf", id: "font"},
	{ src: AUDIOPATH+"background.mp3", id: "soundtrack"}
];

// Speed configurations
var GROUND_SPEED_RATIO = 1;					// Player's speed * this value = actual speed (pixels/second)
var HILL_SPEED_RATIO = 0.20;				// Player's speed * this value = actual speed (pixels/second)

// User Commands
var JUMP_KEY = 32;							// Space bar = JUMP

// Buffer information
var NUMBER_OBSTACLES = 10;					// How many obstacles will be generated per time

/**
  * Game class
  */
function Game() {

	//Methods definition
	preloadExternalFiles = _preloadExternalFiles;
	render = _render;
	updateLoadingBar = _updateLoadingBar;
	reset = _reset;
	generateObstacles = _generateObstacles;
	updateObjects = _updateObjects;
	checkCommands = _checkCommands;
	this.startPlaying = _startPlaying;
	gameOver = _gameOver;

	// Prepares local storage
	if (localStorage.highscore == undefined)
		setHighscore(0);
	// Get canvas
	stage = new createjs.Stage(document.getElementById(GAME_CANVAS));
	// Get loading bar
	loadingbar = document.getElementById(LOADINGBAR);
	// Pre-load external files (images / audio)
	preloadExternalFiles();
	// Reset game to initial values
	reset();
	// Update canvas dimension based on the canvas object
	GAME_WIDTH = stage.canvas.width;
	GAME_HEIGHT = stage.canvas.height;
}

// Methods implementations
/**
  * Loads all external files and then call the method 'render'.
  * This method calls the method 'updateLoadingBar' while is loading the files.
  */
function _preloadExternalFiles()
{
	// Hide start button
	$("#start-game-button").hide();
	// Starts loading all external files
	loader = new createjs.LoadQueue(true);
	loader.addEventListener("complete", this.render);
	loader.loadManifest(EXTERNAL_FILES);
	loader.on("progress", this.updateLoadingBar);
}

/**
  * Updates loading bar width as the external files are loaded
  */
function _updateLoadingBar(event)
{
	$("#"+LOADINGBAR).css( "width", LOADINGBAR_WIDTH * loader.progress );
}

/**
  * Reset game to initial values
  */
function _reset()
{
	score = 0;					// Initial score
	started = false;			// If it is false, it means that the user didn't click on start button yet.
	obstacles = [];				// List of all active obstacles (x > 0)
}

/**
  * Start game
  */
function _startPlaying()
{
	started = true;
	// Remove main menu
	$("#main-menu").css("z-index", 0);
	$("#start-game-button").blur();
	// Hide highscore
	$("#highscore").hide();
	// Show score
	scoreHolder.alpha = 1;
	// Generate obstacles
	generateObstacles();
}

/**
  * Put all objects on screen
  */
function _render()
{
	// Removes loading bar
	$("."+LOADINGBAR_CLASS).remove();
	// Shows start button
	$("#start-game-button").show();
	// Shows high score
	$("#highscore").html("High Score: "+getHighscore());
	// Sky image
	sky = new createjs.Shape();
	sky.graphics.beginBitmapFill(loader.getResult("sky")).drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);;

	// Ground
	var ground_img = loader.getResult("ground");
	ground = new createjs.Shape();
	ground.graphics.beginBitmapFill(ground_img).drawRect(0, 0, GAME_WIDTH + ground_img.width, ground_img.height);
	ground.tileW = ground_img.width;
	ground.y = GAME_HEIGHT - ground_img.height;

	// Hills
	// Farthest hill
	hill01 = new createjs.Bitmap(loader.getResult("Hill01"));
	hill01.setTransform(Math.random() * GAME_WIDTH, GAME_HEIGHT - hill01.image.height * 3 - ground_img.height, 3, 3);

	// Nearest hill
	hill02 = new createjs.Bitmap(loader.getResult("Hill02"));
	hill02.setTransform(Math.random() * GAME_WIDTH, GAME_HEIGHT - hill02.image.height * 3 - ground_img.height, 3, 3);

	// Player
	player = new Player(loader.getResult("player"), 50, 300);

	// Score holder
	scoreHolder = new createjs.Text("", "24px Arial bold", "#ff6600");
	scoreHolder.x = GAME_WIDTH - 175;
	scoreHolder.y = 10;

	// Add objects on stage
	stage.addChild(sky, ground, hill01, hill02, player.view, scoreHolder);

	// Checks for user inputs
	document.onkeyup = checkCommands;

	// Start playing soundtrack
	bgSound = loader.getResult("soundtrack");
	bgSound.loop = true;
	bgSound.play();
	// Update all objects on screen
	createjs.Ticker.addEventListener("tick", updateObjects);

}

/**
  * Update all objects's position every frame
  */
function _updateObjects(event)
{
	// Calculate speed of each object
	var groundSpeed = player.speed * GROUND_SPEED_RATIO;
	var hillSpeed = player.speed * HILL_SPEED_RATIO;

	var elapsedTime = event.delta/1000;

	// Update ground position
	ground.x = (ground.x - elapsedTime * groundSpeed) % ground.tileW;

	// Update hill position
	// Farthest hill
	hill01.x = (hill01.x - elapsedTime * hillSpeed);
	if (hill01.x + hill01.image.width * hill01.scaleX <= 0) hill01.x = GAME_WIDTH;
	// Nearest hill
	hill02.x = (hill02.x - elapsedTime * hillSpeed * 1.5);
	if (hill02.x + hill02.image.width * hill02.scaleX <= 0) hill02.x = GAME_WIDTH;

	// If game is going on, updates score
	if (started)
	{
		// Updates distance that player ran
		player.distance += player.speed * elapsedTime;
		score = parseInt(player.distance / 10);
		scoreHolder.text = "Score: "+score;
		// Calculates player speed
		player.updateSpeed();

		// Update obstacles position
		for (var i = 0; i < obstacles.length; i++)
		{
			var collision = obstacles[i].update(player, obstacles[i].view.x - elapsedTime * groundSpeed);
			// Removes object when it is out of screen (x <= -width)
			if (obstacles[i].view.x <= -obstacles[i].view.getBounds().width)
			{
				stage.removeChild(obstacles.view);
				obstacles.splice(i, 1);
				if (obstacles.length < 1)
				{
					generateObstacles();
				}
			}
			// If player collided with obstacle, game over
			if (collision)
				gameOver();
		}
	}

	// Updates stage
	stage.update(event);
}

/**
  * Decides which action will be done based on user input
  */
function _checkCommands(event)
{
	switch(event.keyCode)
	{
		case JUMP_KEY: player.jump(); break;
	}
}

/**
  * Game over logic
  */
function _gameOver()
{
	// Stores highscore
	if (score > getHighscore())
		setHighscore(score);
	// Update highscore
	$("#highscore").html("High Score: "+getHighscore());
	//Show highscore
	$("#highscore").show();
	// Remove all obstacles
	for(var i = 0; i < obstacles.length; i++)
		stage.removeChild(obstacles[i].view);
	// Remore score holder
	scoreHolder.alpha = 0;
	// Reset game
	reset();
	player.distance = 0;
	// Show main menu
	$("#main-menu").css("z-index", 2);
}

/**
  * Generate all obstacles in-game
  */
function _generateObstacles()
{
	var minDistance = 1000;			// Min distance between obstacles
	var maxVariation = 1000;			// This value + minDistance = MaxDistance
	for (var i = 0; i < NUMBER_OBSTACLES; i++)
	{
		obstacles[i] = new Obstacle(loader.getResult("rock"), GAME_WIDTH + (minDistance*i) + Math.random() * maxVariation, ground.y - loader.getResult("rock").height/2,false);
		stage.addChild(obstacles[i].view);
	}
}

/**
  * Show obstacles on screen
  */
function getHighscore()
{
	if (typeof(Storage) !== "undefided")
	{
		if (localStorage.highscore === "undefined") return 0;
		return localStorage.highscore;
	} 
	else
	{
		alert("This browser does't supports local storage. Your highscores will not be stored.");
	}
}

/**
  * Set new highscore
  */
function setHighscore(newScore)
{
	if (typeof(Storage) !== "undefided")
	{
		localStorage.setItem("highscore", newScore);
	} 
	else
	{
		alert("This browser does't supports local storage. Your highscores will not be stored.");
	}
}