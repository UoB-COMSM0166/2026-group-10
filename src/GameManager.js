import Hero from './Systems/Entity/Hero.js';
import GameEventEmitter from './GameEventEmitter.js';

class GameManager {
    constructor() {
        this.nextID = 0;
        this.eventEmitter = null;
        this.hero = null;
        this.objective = null;
        this.enemies = [];
    }

    generateID() {
        return this.nextID++;
    }

    init() {
        this.nextID = 0;
        this.eventEmitter = new GameEventEmitter();
        this.hero = Hero.createHero(this.generateID(), { x: 0, y: 0 });
    }

    loop() {

    }
}