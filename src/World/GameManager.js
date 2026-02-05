import { Hero } from "../Units/Hero.js";
import { Unit } from "../Units/Unit.js";

// GameManager handles the game state and logic

export default class GameManager {
    constructor() {
        this.p = null;
        this.hero = null;
        this.enemies = [];
        this.attackTarget = null;
    }

    static start() {
        const p5Ctor = window.p5;
        const gm = new GameManager();
        new p5Ctor((p) => gm.#bindP5(p));
        return gm;
    }

    #bindP5(p) {
        this.p = p;
        p.setup = () => this.setup();
        p.draw = () => this.draw();
        p.mousePressed = () => this.mousePressed();
        p.keyPressed = () => this.keyPressed();
    }

    setup() {
        this.p.createCanvas(1280, 720);
        if (this.p.canvas) this.p.canvas.oncontextmenu = () => false;
        this.hero = new Hero(this.p, 100, 100, 200);
        this.enemies = [
            new Unit(this.p, 600, 360, 0, 80, 5)
        ];
    }

    draw() {
        this.p.background(220);
        this.update();

        // draw hero
        this.p.fill(0x0);
        this.p.circle(this.hero.pos.x, this.hero.pos.y, 20);

        // draw enemies
        for (const e of this.enemies) {
            e.draw();
        }

        // highlight attack target
        if (this.attackTarget && this.attackTarget.isAlive()) {
            const pos = this.attackTarget.pos;
            this.p.noFill();
            this.p.stroke(0, 255, 0);
            this.p.circle(pos.x, pos.y, this.attackTarget.diameter + 8);
            this.p.noStroke();
        }

        // draw hero target indicator
        const target = this.hero.target;
        if (target) {
            this.p.fill(0, 0xff, 0);
            this.p.circle(target.x, target.y, 5);
        }
    }

    update() {
        this.hero.update();
    }

    heroMove(x, y) {
        this.hero.setMovingTarget(x, y);
    }

    heroStop() {
        this.hero.stop();
    }

    mousePressed() {
        // Left click: attempt to select and attack an enemy
        if (this.p.mouseButton === this.p.LEFT) {
            const clicked = this.#findEnemyAt(this.p.mouseX, this.p.mouseY);
            if (clicked) {
                this.attackTarget = clicked;
                this.hero.dealDamage(clicked);
                // remove dead enemies
                this.enemies = this.enemies.filter((e) => e.isAlive());
                if (this.attackTarget && !this.attackTarget.isAlive()) {
                    this.attackTarget = null;
                }
                return;
            }
        }

        // Other buttons (e.g., right): move hero
        if (this.p.mouseButton !== this.p.LEFT) {
            this.heroMove(this.p.mouseX, this.p.mouseY);
        }
    }

    #findEnemyAt(x, y) {
        for (const e of this.enemies) {
            if (e.containsPoint(x, y)) return e;
        }
        return null;
    }

    keyPressed() {
        if (this.p.key === "S" || this.p.key === "s") {
            this.heroStop();
        }
    }
}