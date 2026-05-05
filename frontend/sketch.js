let activeScene, menuBackground, mapOneBackground;
let msgTimer;
let audioMessage = "";
const MESSAGE_DURATION = 80;
let menuMusic;
let isMusic = true;
let musicStarted = false;
let clickNoise;
let isSound = true;
let cursorImage;
let font;
let introMusic;
let introImages = [];

function preload() {
    //preloading images
    menuBackground = loadImage("assets/menu_background.png");
    mapOneBackground = loadImage("assets/MapOne.PNG");
    generalBackground = loadImage("assets/general-background.png");
    selectDifficultyBg = loadImage("assets/select_difficulty_bg.png");
    cursorImage = loadImage("assets/cursor.png");
    introImages[0] = loadImage("assets/intro1.png");
    introImages[1] = loadImage("assets/intro2.jpg");
    introImages[2] = loadImage("assets/intro3.png");
    introImages[3] = loadImage("assets/intro4.jpg");

    //preloading sounds
    menuMusic = loadSound("assets/menu_music.mp3");
    introMusic = loadSound("assets/intro-music.mp3");
    clickNoise = loadSound("assets/general_click_noise.mp3");

    //preloading font
    font = loadFont("assets/message_font.ttf");
}

function setup() {
    createCanvas(1280, 720);
    activeScene = new MenuScene(menuBackground);
    //hiding default cursor so we can use a custom cursor
    noCursor();
}

function draw() {
    activeScene.display();
    image(cursorImage, mouseX, mouseY, 32, 32);
}


function mousePressed () {
    activeScene.mousePressed();

    if(musicStarted == false) {
        menuMusic.loop();
        menuMusic.setVolume(0.45);
        musicStarted = true;
    }
}

function playClickNoise() {
    //only play click sound if global 'isSound' variable is true
    if(isSound == true) {
       clickNoise.play();
    }
}
