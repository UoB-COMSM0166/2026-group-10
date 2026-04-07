// import { p5 } from "./js/p5.js";
import GameManager from './src/GameManager.js';

new p5(p => {
    let gameManager;
    let mapData = null;
    let heroData = null;
    let skillData = null;
    let assets = {};

    p.preload = () => {
        mapData = p.loadJSON('data/Map/Forest.json');
        heroData = p.loadJSON('data/Hero/Archmana.json');
        skillData = p.loadJSON('data/Skill/Archmana.json');

        assets.towerImg = p.loadImage('assets/tower_PNG/2.png');
        // assets.bulletImg = p.loadImage('assets/bullet.png');
        // assets.enemyImg = p.loadImage('assets/enemy.png');
        // assets.bgImg = p.loadImage('assets/grass_bg.png');
    };

    p.setup = () => {
        console.log("Setting up the world...");
        p.createCanvas(1280, 720).elt.addEventListener('contextmenu', e => e.preventDefault());
        p.frameRate(60);

        gameManager = new GameManager(p, mapData, heroData, skillData, assets);
        gameManager.start();
    }
    
    p.draw = () => {
        p.background(220);
        gameManager.loop();
    }

    p.mousePressed = (event) => {
        if (p.mouseButton === p.RIGHT) {
                const append = Boolean(event?.shiftKey);
                gameManager.controller.handleRightClick(p.mouseX, p.mouseY, append);
                return false; 
            }
        
        if (p.mouseButton === p.LEFT) {
                gameManager.mousePressed(); 
            }
    }

    p.keyPressed = () => {
        gameManager.controller.handleButton(p.key, p.mouseX, p.mouseY);
        gameManager.handleKeyPressed(p.key);
    }
})
