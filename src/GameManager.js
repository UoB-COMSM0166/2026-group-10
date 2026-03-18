import Game from './Game.js';
import UI from './UI.js';
import EventEmitter from './World/EventEmitter.js';
import Clock from './World/Clock.js';

const TICK_RATE = 60;
const MAX_FRAME_MS = 250;
const MAX_TICKS_PER_FRAME = 5;

export default class GameManager {
    constructor(p5, mapData, heroData, canvasSize) {
        this.tickRate = TICK_RATE;
        this.p5 = p5;
        this.mapData = mapData;
        this.heroData = heroData;
        this.canvasSize = canvasSize;
        this.events = new EventEmitter();
        this.ui = new EventEmitter();
        this.command = new EventEmitter();
        this.layers = {
            game: this.p5.createGraphics(this.canvasSize.width, this.canvasSize.height),
            ui: this.p5.createGraphics(this.canvasSize.width, this.canvasSize.height),
        };

        this.clock = new Clock(p5, TICK_RATE, MAX_FRAME_MS, MAX_TICKS_PER_FRAME);
        this.game = new Game(
            this.p5,
            this.mapData,
            this.heroData,
            this.events,
            this.ui,
            this.command,
            this.clock,
            this.layers.game
        );
        this.uiRenderer = new UI(this.layers.ui, this.game, this.ui);
    }

    start() {
        console.log("Starting the game...");
        this.game.start();
    }

    clearLayers() {
        this.layers.game.clear();
        this.layers.ui.clear();
    }

    loop() {
        this.clearLayers();
        this.game.loop();
        this.uiRenderer.draw();
    }
}
