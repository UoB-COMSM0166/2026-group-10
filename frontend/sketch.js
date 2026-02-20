let activeScene, menuBackground, mapOneBackground;
let msgTimer;
let audioMessage = "";
const MESSAGE_DURATION = 80;


function preload() {
    menuBackground = loadImage("assets/menu_background.png");
    mapOneBackground = loadImage("assets/MapOne.PNG");
}

function setup() {
    createCanvas(1280, 720);
    activeScene = new MenuScene(menuBackground);
}
function draw() {
    activeScene.display();
}

function mousePressed () {
    activeScene.mousePressed();
}
