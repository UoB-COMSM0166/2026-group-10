import GameClock from './World/GameClock.js';
import EventEmitter from './World/EventEmitter.js';
import UI from './World/UI.js';
import GameMap from './World/GameMap.js';
import Render from './World/Render.js';
import Controller from './World/Controller.js';

import Objective from './Entity/Unit/Objective.js';
import Hero from './Entity/Unit/Hero.js';
import Enemy from './Entity/Unit/Enemy.js';

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

        this.spawnTimer = 0;
        this.spawnInterval = 120;

        this.enemyData = enemyData;
        this.map = new GameMap(map);
        this.objective = new Objective(this.map.objective);
        this.hero = new Hero(hero, skillData, this.map.hero, this.map.width, this.map.height, this.events);
        this.hero.bindGameManager(this);
        this.controller = new Controller(this, this.hero);
        this.registerEventHandlers();

        this.enemies = new Map();
        this.entities = {};
        this.wave = 5;
    }

    on(...args) { return this.events.on(...args); }
    once(...args) { return this.events.once(...args); }
    off(...args) { return this.events.off(...args); }

    registerEventHandlers() {
        this.events.on('enemy:reached_objective', ({ enemy }) => {
            this.objective.takeDamage(enemy.damage);
            this.destroyEntity(enemy);
        });
        this.events.on('enemy:died', ({ enemy }) => {
            this.destroyEntity(enemy);
        });
        this.events.on('wave:completed', () => {
            this.pause();
        });
    }

    generateID() {
        return this.nextID++;
    }

    addEntity(entity) {
        if (entity && typeof entity.setEventEmitter === 'function') {
            entity.setEventEmitter(this.events);
        } else if (entity) {
            entity.events = this.events;
        }
        this.entities[entity.id] = entity;
        this.events.emit('entity:added', { entity });
    }

    destroyEntity(entity) {
        if (!entity || !entity.id) {
            return;
        }

        if (this.enemies instanceof Map && this.enemies.has(entity.id)) {
            this.enemies.delete(entity.id);
        }

        if (Object.prototype.hasOwnProperty.call(this.entities, entity.id)) {
            delete this.entities[entity.id];
        }
    }

    spawnEnemy() {
        if (this.wave <= 0) {
            // this.events.emit('wave:completed', {});
            return;
        }
        const enemy = new Enemy(
            "enemy_" + this.generateID(),
            this.map.paths.get('A').spawn, // Hardcoded to spawn from path A for now
            this.enemyData.speed,
            this.enemyData.hitbox,
            this.enemyData.hp,
            this.enemyData.mp,
            this.events,
            this.map.paths.get('A').waypoint,
            this.enemyData.damage
        )
        this.enemies.set(enemy.id, enemy);
        this.wave -= 1;
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

        this.path = this.map.paths.get('A').waypoint;
    }

    pause() {
        this.ui.pushToast("Game paused.", 60);
        this.running = false;
        this.events.emit('game:stop', { tick: this.now() });
    }

    resume() {
        if (this.running) {
            return;
        }
        this.running = true;
        this.ui.pushToast("Game Resumed.", 60);
        this.lastFrameMs = this.p5.millis();
        this.events.emit('game:resume', { tick: this.now() });
    }

    tick() {
        this.clock.updateTick();

        if (this.hero && typeof this.hero.tickBuffs === 'function') {
            this.hero.tickBuffs(1);
        }
        if (this.hero && typeof this.hero.applyRegenTick === 'function') {
            this.hero.applyRegenTick();
        }
        for (const enemy of this.enemies.values()) {
            if (enemy && typeof enemy.tickBuffs === 'function') {
                enemy.tickBuffs(1);
            }
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
        }

        for (const enemy of this.enemies.values()) {
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

        if (this.objective && this.objective.currentHP <= 0) {
            // this.events.emit('game:over', { wave: this.wave+this.enemies.size });
            this.ui.pushToast("Lose! Objective destroyed.");
            this.pause();
        }

        if (this.wave<=0 && this.enemies.size === 0) {
            // this.events.emit('wave:completed', { wave: this.wave });
            this.ui.pushToast("Win! All waves completed.");
            this.pause();
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
        Render.renderingPath(this.p5, this.map);
        // Render enemies
        if (this.enemies && this.enemies.size > 0) {
            Render.renderingEnemy(this.p5, this.enemies);
        }
        Render.renderingObjective(this.p5, this.objective);
        Render.renderingHero(this.p5, this.hero);
        Render.renderingProjectile(this.p5, this.entities);

        // Render UI on top
        if (this.ui) {
            this.ui.draw();
        }

        if (this.running) {
            this.update();
        }
    }
}
