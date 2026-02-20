// import { p5 } from "./js/p5.js";
import GameManager from './src/GameManager.js';

new p5(p => {
    let gameManager;
    let mapData = null;
    let heroData = null;

    p.preload = () => {
        mapData = p.loadJSON('data/Map/Forest.json');
        heroData = p.loadJSON('data/Hero/Archmana.json');
    };

    p.setup = () => {
        console.log("Setting up the world...");
        p.createCanvas(1280, 720).elt.addEventListener('contextmenu', e => e.preventDefault());
        p.frameRate(60);

        gameManager = new GameManager(p, mapData, heroData);
        gameManager.start();
    }

    p.draw = () => {
        p.background(220);

        gameManager.loop();
    }

    p.mousePressed = (event) => {
        // Handle right click
        if (p.mouseButton === p.RIGHT) {
            const append = Boolean(event?.shiftKey);
            gameManager.handleRightClick(p.mouseX, p.mouseY, append);
            return false; // Prevent default context menu
        }
    }

    p.keyPressed = () => {
        // Example: Press 'S' to stop the hero
        gameManager.handleButton(p.key);
    }
})