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
let introVoices = [];
let characterImages = [];
let characterVoices = [];

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
    introVoices[0] = loadSound("assets/introVoiceOne.mp3");
    introVoices[1] = loadSound("assets/introVoiceTwo.mp3");
    introVoices[2] = loadSound("assets/introVoiceThree.mp3");
    introVoices[3] = loadSound("assets/introVoiceFour.mp3");
    characterImages[0] = loadImage("assets/elf_img.jpg");
    characterImages[1] = loadImage("assets/warrior_img.jpg");
    characterImages[2] = loadImage("assets/mage_img.jpg");
    characterVoices[0] = loadSound("assets/elf_narration.mp3");
    characterVoices[1] = loadSound("assets/warrior_narration.mp3");
    characterVoices[2] = loadSound("assets/mage_narration.mp3");

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
        menuMusic.setVolume(0.15);
        menuMusic.loop();
        musicStarted = true;
    }
}

function playClickNoise() {
    //only play click sound if global 'isSound' variable is true
    if(isSound == true) {
       clickNoise.setVolume(0.29);
       clickNoise.play();
    }
}
