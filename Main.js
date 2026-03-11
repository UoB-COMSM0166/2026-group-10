import GameManager from './src/GameManager.js';
import AssetLoader from './src/World/AssetLoader.js';

new p5(p => {
    let gameManager;
    let assetLoader;
    let mapData = null;
    let heroData = null;
    let skillData = null;
    let enemyData = null;
    let backgroundImage;

    p.preload = () => {
        // Game background image
        backgroundImage = p.loadImage('assets/GameBackground.png');

        mapData = p.loadJSON('data/Map/Forest.json');
        heroData = p.loadJSON('data/Hero/Archmana.json');
        skillData = p.loadJSON('data/Skill/Archmana.json');
        enemyData = p.loadJSON('data/Enemy/Zombie.json');

        assetLoader = new AssetLoader(p);
        assetLoader.preload();
    };

    p.setup = () => {
        console.log("Setting up the world...");
        p.createCanvas(1280, 720).elt.addEventListener('contextmenu', e => e.preventDefault());
        p.frameRate(60);

        gameManager = new GameManager(p, mapData, heroData, skillData, enemyData, assetLoader);
        gameManager.start();
    };

    p.draw = () => {
        // loaded background image
        if (backgroundImage) {
            p.image(backgroundImage, 0, 0, p.width, p.height);
        } else {
            p.background(220, 220, 255); // Fallback background color
        }

        gameManager.loop();
    };

    p.mousePressed = (event) => {
        if (p.mouseButton === p.LEFT || p.mouseButton === undefined) {
            if (gameManager && gameManager.ui) {
                // Pass the mouse coordinates into the UI
                const uiHandledClick = gameManager.ui.handleMouseClick(p.mouseX, p.mouseY);
                
                // If the UI handled the click (like opening the menu), stop right here
                if (uiHandledClick) {
                    return false; 
                }
            }
        }

        if (p.mouseButton === p.RIGHT) {
            const append = Boolean(event?.shiftKey);
            gameManager.controller.handleRightClick(p.mouseX, p.mouseY, append);
            return false; // Prevent default context menu
        }
    };

    p.keyPressed = () => {
        // Example: Press 'S' to stop the hero
        gameManager.controller.handleButton(p.key, p.mouseX, p.mouseY);
    };
});
