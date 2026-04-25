import Forest from './World/Forest.js';
import Archmage from './Entity/Unit/Hero/Archmage.js';
import Objective from './Entity/Unit/Objective.js';
import Clock from './Utils/Clock.js';
import EventEmitter from './Utils/EventEmitter.js';

export default class GameManager {
    constructor() {
        this.clock = new Clock();
        this.events = new EventEmitter();

        this.world = new Forest();
        const heroSpawn = this.world.getHeroSpawn();
        const objectiveConfig = this.world.buildObjectiveConfig();
        this.hero = new Archmage(
            heroSpawn,
            this.events,
            'Ice',
            this.events,
            this.clock
        );
        this.objective = new Objective(
            objectiveConfig.position,
            objectiveConfig.hitbox,
            objectiveConfig.hp,
            this.events
        );

        this.units = new Map();
        this.enemies = new Map();
        this.skillEntities = new Map();
        this.enemySkillEntities = new Map();

        this.started = false;
        this.gameOver = false;
        this.gameWon = false;
        this.spawnCounter = 0;
        this.currentWaveIndex = 0;
        this.currentWave = null;
        this.beforeWave = 0;

        this.registerCoreUnits();
        this.registerEventHandlers();

        this.events.unitRegistry = this.units;
        this.events.enemyRegistry = this.enemies;
        this.events.skillEntityRegistry = this.skillEntities;
        this.events.enemySkillEntityRegistry = this.enemySkillEntities;

        this.clock.onTick = () => {
            this.update();
        };
    }

    registerCoreUnits() {
        this.units.set(this.hero.id, this.hero);
        this.units.set(this.objective.id, this.objective);
    }

    registerEventHandlers() {
        this.events.on('enemy:spawned', ({ newEnemy }) => {
            if (!newEnemy?.id) {
                return;
            }

            this.enemies.set(newEnemy.id, newEnemy);
            this.units.set(newEnemy.id, newEnemy);
        });

        this.events.on('enemy:killed', ({ id }) => {
            if (!id) {
                return;
            }

            this.enemies.delete(id);
            this.units.delete(id);
        });

        this.events.on('enemy:reached_objective', ({ enemy }) => {
            if (!enemy?.id) {
                return;
            }

            this.enemies.delete(enemy.id);
            this.units.delete(enemy.id);
        });

        this.events.on('skill_entity:created', ({ entity }) => {
            if (entity?.id) {
                this.skillEntities.set(entity.id, entity);
            }
        });

        this.events.on('enemy_skill_entity:created', ({ entity }) => {
            if (entity?.id) {
                this.enemySkillEntities.set(entity.id, entity);
            }
        });

        this.events.on('objective:destroyed', () => {
            this.gameOver = true;
        });

        this.events.on('game:win', () => {
            this.gameWon = true;
            this.gameOver = true;
        });
    }

    startWave() {
        if (this.currentWaveIndex >= this.world.waves.length) {
            return;
        }

        this.currentWave = this.world.createWaveState(this.currentWaveIndex);
        this.beforeWave = this.currentWave.before;
        this.events.emit('wave:start', { wave: this.currentWaveIndex + 1 });
    }

    finishWave() {
        this.events.emit('wave:end', { wave: this.currentWaveIndex + 1 });
        if (this.currentWaveIndex >= this.world.waves.length - 1) {
            this.events.emit('game:win', {});
            return;
        }

        this.currentWaveIndex += 1;
        this.startWave();
    }

    spawnEnemy(lane) {
        const EnemyClass = this.world.getEnemyClass(lane.name);
        if (!EnemyClass) {
            console.warn(`Unknown enemy type: ${lane.name}`);
            return;
        }

        const spawnPoint = lane.waypoint[0];
        if (!spawnPoint) {
            console.warn(`Lane ${lane.id} has no waypoint.`);
            return;
        }

        this.spawnCounter += 1;
        const enemyId = `${lane.id}_${lane.name}_${this.spawnCounter}`;
        const newEnemy = new EnemyClass(
            enemyId,
            { x: spawnPoint.x, y: spawnPoint.y },
            this.events,
            lane.waypoint,
            this.spawnCounter
        );

        this.events.emit('enemy:spawned', { newEnemy });
    }

    updateWave() {
        if (!this.currentWave) {
            return;
        }

        if (this.beforeWave > 0) {
            this.beforeWave -= 1;
            return;
        }

        for (const lane of this.currentWave.lanes) {
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

        const allLanesEmpty = this.currentWave.lanes.every((lane) => lane.counter <= 0);
        const noEnemies = this.enemies.size === 0;
        if (allLanesEmpty && noEnemies) {
            this.finishWave();
        }
    }

    start() {
        if (!this.started) {
            this.started = true;
            this.startWave();
        }

        this.clock.start();
    }

    stop() {
        this.clock.stop();
    }

    update() {
        if (this.gameOver) {
            return;
        }

        if (!this.started) {
            this.started = true;
            this.startWave();
        }

        this.updateWave();
        this.updateHero();
        this.updateEnemies();
        this.updateSkillEntities();
        this.updateEnemySkillEntities();
        this.cleanupFinishedEntities();
    }

    updateHero() {
        this.hero.updateRespawn();
        if (!this.hero.alive()) {
            return;
        }

        this.hero.updateBuffs();
        this.hero.updateRegeneration();
        this.hero.updateCasting();
        this.hero.updateSkill();
        this.hero.updateMovement();
    }

    updateEnemies() {
        for (const enemy of this.enemies.values()) {
            enemy.update();
        }
    }

    updateSkillEntities() {
        for (const entity of this.skillEntities.values()) {
            if (typeof entity.updateMovement === 'function' && entity.category !== 'Aura') {
                entity.updateMovement();
            }
            entity.update(this.world.size, this.enemies);
        }
    }

    updateEnemySkillEntities() {
        const alliedUnits = new Map([
            [this.hero.id, this.hero],
            [this.objective.id, this.objective]
        ]);

        for (const entity of this.enemySkillEntities.values()) {
            if (typeof entity.updateMovement === 'function' && entity.category !== 'Aura') {
                entity.updateMovement();
            }
            entity.update(this.world.size, alliedUnits);
        }
    }

    cleanupFinishedEntities() {
        for (const [id, entity] of this.skillEntities.entries()) {
            if (entity?.finished) {
                this.skillEntities.delete(id);
            }
        }

        for (const [id, entity] of this.enemySkillEntities.entries()) {
            if (entity?.finished) {
                this.enemySkillEntities.delete(id);
            }
        }

        for (const [id, enemy] of this.enemies.entries()) {
            if (enemy?.finished) {
                this.enemies.delete(id);
                this.units.delete(id);
            }
        }
    }
}
