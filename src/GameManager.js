import GameClock from './World/GameClock.js';
import EventEmitter from './World/EventEmitter.js';
import UI from './World/UI.js';
import GameMap from './World/GameMap.js';
import Render from './World/Render.js';
import Controller from './World/Controller.js';

import Objective from './Entity/Unit/Objective.js';
import Hero from './Entity/Unit/Hero.js';

import { Tower } from './Towerdefense/Tower.js'; 
import { Enemy as TDEnemy } from './Towerdefense/Enemy.js';
import { Bullet } from './Towerdefense/Bullet.js';

const TICK_RATE = 60;
const FIXED_STEP_MS = 1000 / TICK_RATE;
const MAX_FRAME_MS = 250;
const MAX_TICKS_PER_FRAME = 5;

export default class GameManager {
    constructor(p5, map, hero, skillData, enemyData) {
        this.p5 = p5;
        this.nextID = 0;
        this.clock = new GameClock();
        this.events = new EventEmitter();
        this.ui = new UI(this.p5, this);
        this.lastFrameMs = this.p5.millis();
        this.tickSampleCount = 0;
        this.tpsSampleMs = 0;
        this.tps = 0;

        // TEMP：Tower Defense core attributes
        this.towers = [];
        this.bullets = [];
        this.tdEnemies = [];

        this.gridSize = 40;

        this.money = 500;
        this.towerCost = 200;

        this.occupiedCells = new Set();
        this.selectedTower = null;

        this.spawnTimer = 0;
        this.spawnInterval = 120;

        // this.mapJson = map;
        // this.heroJson = hero;
        // this.enemyData = enemyData;
        this.map = new GameMap(map);
        this.objective = new Objective(this.map.objective);
        this.hero = new Hero(hero, skillData, this.map.hero, this.map.width, this.map.height, this.events);
        this.hero.bindGameManager(this);
        this.controller = new Controller(this, this.hero);

        this.enemies = {};
        this.entities = {};
        
        this.waveState = {
            currentWaveIndex: 0,
            waveStartTick: 0,
            pathSpawners: { A: { lastSpawnTick: 0 }, B: { lastSpawnTick: 0 } }
        };
    }

    on(...args) { return this.events.on(...args); }
    once(...args) { return this.events.once(...args); }
    off(...args) { return this.events.off(...args); }

    generateID() {
        return this.nextID++;
    }

    addEntity(entity) {
        this.entities[entity.id] = entity;
        this.events.emit('entity:added', { entity });
    }

    destroyEntity(entity) {
        if (entity.position.x < 0 || entity.position.x > this.map.width || entity.position.y < 0 || entity.position.y > this.map.height) {
            delete this.entities[entity.id];
        }
    }
    //TEMP: Tower Defense core method
    placeTower(x, y) {
        if (this.money < this.towerCost) return;

        let gridX = Math.floor(x / this.gridSize);
        let gridY = Math.floor(y / this.gridSize);

        let key = `${gridX},${gridY}`;

        if (this.occupiedCells.has(key)) return;

        let towerX = gridX * this.gridSize + this.gridSize / 2;
        let towerY = gridY * this.gridSize + this.gridSize / 2;

        const tower = new Tower(this.p5, towerX, towerY, this.bullets);

        this.towers.push(tower);
        this.occupiedCells.add(key);

        this.money -= this.towerCost;
        if (this.map.isPathCell(gridX, gridY)) return;
    }

    mousePressed() {
        const x = this.p5.mouseX;
        const y = this.p5.mouseY;
        this.placeTower(x, y);
    }

    spawnEnemy() {
        if (!this.path) return;
        const enemy = new TDEnemy(this.p5, this.path);
        this.tdEnemies.push(enemy);
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
        this.events.emit('game:start', { tick: this.now() });

        this.path = this.map.paths['A'].waypoints;
    }

    stop() {
        this.running = false;
        this.events.emit('game:stop', { tick: this.now() });
    }

    tick() {
        this.clock.updateTick();

        if (this.hero && typeof this.hero.tickBuffs === 'function') {
            this.hero.tickBuffs(1);
        }
        if (this.hero && typeof this.hero.applyRegenTick === 'function') {
            this.hero.applyRegenTick();
        }
        this.updateSkillCooldowns();
        this.updateMovement();
        // this.events.emit('game:tick', { tick: this.now() });
    }

    updateSkillCooldowns() {
        if (!this.hero || !this.hero.skills) {
            return;
        }

        for (const skill of Object.values(this.hero.skills)) {
            if (skill && typeof skill.tickCooldown === 'function') {
                skill.tickCooldown();
            }
        }
    }

    updateMovement() {
        const heroSpeed = this.hero.speed || 0;
        if (heroSpeed > 0) {
            this.hero.moveAlongWaypoint();
            // console.log(`Hero position: (${this.hero.position.x}, ${this.hero.position.y}), velocity: (${this.hero.velocity.vx}, ${this.hero.velocity.vy})`);
        }
        for (const enemy of Object.values(this.enemies)) {
            const enemySpeed = enemy.speed || 0;
            if (enemySpeed > 0) {
                enemy.moveAlongWaypoint();
            }
        }
        for (const entity of Object.values(this.entities)) {
            const entitySpeed = entity.speed || 0;
            if (typeof entity.update === 'function') {
                entity.update(this.map.width, this.map.height);
            } else if (entitySpeed > 0) {
                entity.calculateMovement();
            }

            if (entity.destroyed) {
                delete this.entities[entity.id];
            }
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

        // Tower defense enemy spawn
        this.spawnTimer++;

        if (this.spawnTimer > this.spawnInterval) {

            this.spawnEnemy();
            this.spawnTimer = 0;

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

    loop() {
        this.update();
        // console.log("current tick:", this.now());

        // Update TD enemies
        // tower defense update
        for (let enemy of this.tdEnemies) {
            enemy.update();
        }

        for (let tower of this.towers) {
            tower.update(this.tdEnemies);
        }

        for (let bullet of this.bullets) {
            bullet.update();
        }

        if (this.tdEnemies && this.tdEnemies.length > 0) {
            for (let enemy of this.tdEnemies) {
                enemy.update();
            }
        }

        Render.renderingPath(this.p5, this.map);
        Render.renderingObjective(this.p5, this.objective);
        // Render enemies
        if (this.enemies && Object.keys(this.enemies).length > 0) {
            Render.renderingEnemy(this.p5, this.enemies);
        }
        Render.renderingHero(this.p5, this.hero);
        Render.renderingProjectile(this.p5, this.entities);

        // draw TD
        for (let tower of this.towers) tower.show();
        for (let enemy of this.tdEnemies) enemy.show();
        for (let bullet of this.bullets) bullet.show();

        // Render UI on top
        if (this.ui) {
            this.ui.draw();
        }
    }
}
