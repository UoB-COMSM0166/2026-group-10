import World from './World/World.js';
import Hero from './Entity/Unit/Hero.js';
import Enemy from './Entity/Unit/Enemy/Enemy.js';
import Objective from './Entity/Unit/Objective.js';
import Render from './World/Render.js';
import Controller from './World/Controller.js';
import { Zombie } from './Entity/Unit/Enemy/Undead.js';

const TEST = false;

export default class Game {
    constructor(p5, world, hero, events, ui, command, clock, renderLayer = p5) {
        this.p5 = p5;
        this.renderLayer = renderLayer;
        this.clock = clock;
        // 游戏系统事件触发器
        this.events = events;
        // UI单独的事件系统，方便UI组件监听
        this.ui = ui;

        this.world = new World(world);
        this.objective = new Objective(world.objective, events);
        this.hero = new Hero(hero, this.world.hero, events, ui, clock);

        this.currentWaveIndex = 0;
        this.wave = null;
        this.beforeWave = 0
        this.waveAmount = Number(this.world.waves.length);

        this.running = false;

        this.enemies = new Map();
        this.entities = new Map();
        this.controller = new Controller(
            this.p5, this.events, this.ui, this.enemies, this.hero, this.objective, this.running, this.clock
        );

        this.registerEventHandlers();
    }

    registerEventHandlers() {
        this.events.on('system:pause', () => {
            if (this.running) {
                this.ui.emit('game:paused');
                this.pause();
            } else {
                this.ui.emit('game:resumed');
                this.resume();
            }
        });

        this.events.on('enemy:reached_objective', ({ enemy }) => {
            this.destroyEntity(enemy);
        });

        this.events.on('enemy:killed', ({ id, experience }) => {
            this.destroyEntity(id);
            this.hero.gainExperience(experience);
        });

        this.events.on('objective:destroyed', () => {
            this.ui.emit('game:lost', { tick: this.now() });
            this.running = false;
        });

        this.events.on('skill_entity:created', ({ entity }) => {
            // if (!this.running) return;
            this.entities.set(entity.id, entity);
            // console.log(`Entity created: ${entity.id}`);
        });

        this.events.on('enemy_skill_entity:created', ({ entity }) => {
            // if (!this.running) return;
            this.entities.set(entity.id, entity);
            // console.log(`Entity created: ${entity.id}`);
        });
    }

    // 获取当前游戏时间（以tick为单位）
    now() {
        return this.clock.now();
    }

    waveStart() {
        if (this.currentWaveIndex >= this.waveAmount) return;

        this.wave = this.world.waves[this.currentWaveIndex];
        this.beforeWave = this.wave.before;
        this.ui.emit('wave:start', { wave: this.wave.id, tick: this.now() });
    }

    waveUpdate() {
        if (this.beforeWave > 0) {
            console.log(`Wave ${this.currentWaveIndex} starts in ${this.clock.timeFormat(this.beforeWave)}...`);
            this.beforeWave -= 1;
            return;
        }

        // 生成敌人
        for (const lane of this.wave.lanes) {
            if (lane.timer > 0) {
                lane.timer -= 1;
                continue;
            }
            if (lane.counter > 0) {
                this.spawnEnemy(lane);
                lane.counter -= 1;
                lane.timer = lane.cd;
            }
        }

        // 检查当前波次是否结束
        const allLanesEmpty = this.wave.lanes.every(lane => lane.counter <= 0);
        const noEnemies = this.enemies.size === 0;
        if (allLanesEmpty && noEnemies) {
            this.waveEnd();
        }
    }

    waveEnd() {
        console.log(`Wave ${this.currentWaveIndex} ends.`);
        this.ui.emit('wave:end', { wave: this.wave.id, tick: this.now() });
        if (this.currentWaveIndex >= this.waveAmount - 1) {
            this.ui.emit('game:win', { tick: this.now() });
            this.running = false;
            return;
        }
        this.currentWaveIndex += 1;
        this.waveStart();
    }

    spawnEnemy(lane) {
        // const enemy = new Enemy(
        //     `wave_${this.currentWaveIndex+1}_lane_${lane.id}_enemy_${lane.name}_${lane.counter}`,
        //     lane.name,
        //     lane.waypoint[0],
        //     lane.speed,
        //     lane.hitbox,
        //     lane.hp,
        //     lane.mp,
        //     lane.sprite,
        //     this.events,
        //     lane.waypoint,
        //     lane.damage,
        //     lane.heroDamage,
        //     lane.experience
        // )
        const newEnemy = new Zombie (
            `wave_${this.currentWaveIndex+1}_lane_${lane.id}_enemy_${lane.name}_${lane.counter}`,
            lane.waypoint[0],
            this.events,
            lane.waypoint,
            this.clock.now()
        )
        this.enemies.set(newEnemy.id, newEnemy);
        this.events.emit('enemy:spawned', { newEnemy });
        console.log(`Spawned enemy ${newEnemy.id} at lane ${lane.id}`);
    }

    destroyEntity(entity) {
        const entityId = typeof entity === 'string' ? entity : entity?.id;
        if (!entityId) {
            return;
        }

        if (this.hero.target?.id === entityId) {
            this.hero.removeTarget();
        }

        if (this.enemies instanceof Map && this.enemies.has(entityId)) {
            this.enemies.delete(entityId);
        }

        if (this.entities instanceof Map && this.entities.has(entityId)) {
            this.entities.delete(entityId);
        }
    }

    // MARK: 游戏开始初始化
    start() {
        console.log('Game started');
        if (this.running) return;
        this.running = true;
        this.clock.start();
        this.events.emit('game:start', { tick: this.now() });
        this.ui.emit('game:start', { tick: this.now() });

        if (TEST) {
            const dummy = new Enemy(
                `dummy_enemy`,
                {"x": 640, "y": 360},
                0,
                20,
                999999,
                0,
                '#FF0000',
                this.events,
                [],
                0,
                0,
                0
            )
            this.enemies.set(dummy.id, dummy);
        }

        this.waveStart();
    }

    pause() {
        if (!this.running) return;
        this.running = false;
        this.ui.emit('game:pause', { tick: this.now(), time: this.clock.timeFormat() });
    }

    resume() {
        if (this.running) return;
        this.running = true;
        this.ui.emit('game:resume', { tick: this.now(), time: this.clock.timeFormat() });
    }

    // MARK: 游戏更新循环
    update() {
        if (!this.running) return;
        this.clock.update();
        this.hero.updateRegeneration();
        this.hero.updateBuffs();
        this.hero.updateMovement();
        this.hero.updateSkill();
        for (const enemy of this.enemies.values()) {
            enemy.updateBuffs();
            enemy.updateMovement();
        }
        for (const entity of this.entities.values()) {
            entity.updateMovement();
            if (typeof entity.update === 'function') {
                entity.update({ width: this.world.size.width, height: this.world.size.height }, this.enemies);
            }
        }
        for (const entity of Array.from(this.entities.values())) {
            if (entity.finished) {
                this.destroyEntity(entity, this.enemies);
            }
        }
        if (!TEST) this.waveUpdate();
    }

    render() {
        Render.renderMapBounds(this.renderLayer, this.world.size);
        Render.renderWaveLane(this.renderLayer, this.wave);
        Render.renderObjective(this.renderLayer, this.objective);
        Render.renderEnemies(this.renderLayer, this.enemies);
        Render.renderHero(this.renderLayer, this.hero);
        Render.renderEntities(this.renderLayer, this.entities);
        if (this.controller.virtualSkillEntityRange) {
            Render.renderVirtualEntityRange(
                this.renderLayer,
                { x: this.p5.mouseX, y: this.p5.mouseY },
                this.controller.virtualSkillEntityRange
            );
        }

    }

    loop() {
        this.update();
        this.render();
    }
}
