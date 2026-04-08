export default class World {
    constructor({ name, size, mode, heroPosition, objective, waves, enemyTypes }) {
        console.log('Loading map:', name);
        this.name = name;
        this.size = size;
        this.mode = mode;
        this.heroPosition = heroPosition;
        this.objective = objective;
        this.waves = waves;
        this.enemyTypes = enemyTypes;
    }

    getHeroSpawn() {
        return { x: this.heroPosition.x, y: this.heroPosition.y };
    }

    buildObjectiveConfig() {
        return {
            position: { x: this.objective.position.x, y: this.objective.position.y },
            hitbox: this.objective.hitbox,
            hp: this.objective.hp
        };
    }

    getEnemyClass(enemyName) {
        return this.enemyTypes?.[enemyName] ?? null;
    }

    createWaveState(index) {
        const wave = this.waves[index];
        if (!wave) {
            return null;
        }

        return {
            before: wave.before,
            lanes: wave.lanes.map((lane) => ({
                id: lane.id,
                name: lane.name,
                cd: lane.cd,
                timer: lane.cd,
                counter: lane.amount,
                waypoint: lane.waypoint.map((point) => ({ x: point.x, y: point.y }))
            }))
        };
    }
}

export class Wave {
    constructor(before, lanes) {
        this.before = before;
        this.lanes = [];
        for (const lane of lanes) {
            this.lanes.push(new Lane(
                lane.id, lane.name, lane.cd, lane.amount, lane.waypoint
            ));
        }
    }
}

export class Lane {
    constructor(id, name, cd, amount, waypoint) {
        this.id = id;
        this.name = name;
        this.cd = cd;
        this.amount = amount;
        this.waypoint = waypoint;
    }
}
