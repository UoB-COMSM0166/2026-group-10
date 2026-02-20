import GameClock from './World/GameClock.js';
import UI from './World/UI.js';
import Map from './World/Map.js';
import Render from './World/Render.js';

import Objective from './Systems/Entity/Objective.js';
import Hero from './Systems/Entity/Hero.js';
import Enemy from './Systems/Entity/Enemy.js';
import Movement from './Systems/Movement.js';

const TICK_RATE = 60;
const FIXED_STEP_MS = 1000 / TICK_RATE;
const MAX_FRAME_MS = 250;
const MAX_TICKS_PER_FRAME = 5;

export default class GameManager {
    constructor(p5, map, hero, enemyData) {
        this.p5 = p5;
        this.nextID = 0;
        this.clock = new GameClock();
        this.ui = new UI(this.p5, this);
        this.lastFrameMs = this.p5.millis();
        this.tickSampleCount = 0;
        this.tpsSampleMs = 0;
        this.tps = 0;

        this.mapJson = map;
        this.heroJson = hero;
        this.enemyData = enemyData;
        this.map = new Map(map);
        this.objective = Objective.createObjective(this.generateID(), this.map.objective, 100);
        this.hero = Hero.createHero(this.generateID(), this.map.hero, hero);
        Hero.calculateStats(this.hero, this.heroJson, this.hero.getComponent('level'));
        
        this.heroMoveTarget = null;
        this.enemies = [];
        
        this.waveState = {
            currentWaveIndex: 0,
            waveStartTick: 0,
            pathSpawners: { A: { lastSpawnTick: 0 }, B: { lastSpawnTick: 0 } }
        };
    }

    generateID() {
        return this.nextID++;
    }

    start() {
        this.running = true;
        this.lastFrameMs = this.p5.millis();
        this.accumulatorMs = 0;
        this.tickSampleCount = 0;
        this.tpsSampleMs = 0;
        this.tps = 0;

        this.waveState = {
            currentWaveIndex: 0,
            waveStartTick: 0,
            pathSpawners: { A: { lastSpawnTick: 0 }, B: { lastSpawnTick: 0 } }
        };
    }

    stop() {
        this.running = false;
    }

    tick() {
        this.clock.updateTick();

        // Update hero movement
        if (this.heroMoveTarget) {
            const heroStats = this.hero.getComponent('stats');
            const speed = heroStats.speed;
            Movement.navigateToSpot(this.hero, this.heroMoveTarget, speed);

            const pos = this.hero.getComponent('position');
            if (pos.x === this.heroMoveTarget.x && pos.y === this.heroMoveTarget.y) {
                this.heroMoveTarget = null;
            }
        }

        // Update enemy movement along waypoints
        for (const enemy of this.enemies) {
            const speed = enemy.getComponent('speed');
            Enemy.moveAlongWaypoints(enemy, speed);
        }

        // Apply movement to all entities
        Movement.calculateMovement(this.hero);
        for (const enemy of this.enemies) {
            Movement.calculateMovement(enemy);
        }
    }

    update() {
        if (!this.running || !this.clock) {
            return;
        }

        const nowMs = this.p5.millis();
        const frameMs = Math.min(Math.max(0, nowMs - this.lastFrameMs), MAX_FRAME_MS);
        this.lastFrameMs = nowMs;

        this.accumulatorMs += frameMs;

        let ticks = 0;
        while (this.accumulatorMs >= FIXED_STEP_MS && ticks < MAX_TICKS_PER_FRAME) {
            this.tick();
            this.accumulatorMs -= FIXED_STEP_MS;
            ticks += 1;
        }

        if (ticks === MAX_TICKS_PER_FRAME && this.accumulatorMs >= FIXED_STEP_MS) {
            this.accumulatorMs = 0;
        }

        this.tickSampleCount += ticks;
        this.tpsSampleMs += frameMs;

        if (this.tpsSampleMs >= 1000) {
            this.tps = (this.tickSampleCount * 1000) / this.tpsSampleMs;
            this.tickSampleCount = 0;
            this.tpsSampleMs = 0;
        }
    }

    now(channel = 'gameplay') {
        if (!this.clock) {
            return 0;
        }

        return this.clock.now(channel);
    }

    getDisplaySeconds(channel = 'gameplay') {
        if (!this.clock) {
            return 0;
        }

        return this.clock.getDisplaySeconds(channel);
    }

    getDebugStats() {
        return {
            fps: this.p5.frameRate(),
            tps: this.tps,
            targetFps: 60,
            targetTps: TICK_RATE
        };
    }

    handleRightClick(x, y) {
        // Check if click is within canvas bounds
        if (x < 0 || x > this.map.width || y < 0 || y > this.map.height) {
            // Click is outside the canvas, ignore it
            return false;
        }
        
        // Set hero move target
        const targetSpot = { x, y };
        console.log(`Hero moving to: ${x}, ${y}`);
        this.heroMoveTarget = targetSpot;
        return true;
    }

    handleButton(key) {
        if (key === 's' || key === 'S') {
            console.log('Hero stopped');
            this.heroMoveTarget = null;
            Movement.stop(this.hero);
        }
    }

    loop() {
        this.update();
        console.log("current tick:", this.now());

        Render.renderingPath(this.p5, this.map);
        Render.renderingObjective(this.p5, this.objective);
        // Render entities
        if (this.entities && this.entities.length > 0) {
            Render.renderingEnemy(this.p5, this.enemies);
        }

        Render.renderingHero(this.p5, this.hero);

        // Render UI on top
        if (this.ui) {
            this.ui.draw();
        }
    }
}