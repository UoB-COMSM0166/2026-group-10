export default class World {
    constructor(world) {
        console.log('Loading map:', world.name);
        this.name = world.name;
        this.size = world.size;
        this.hero = world.hero;
        this.objective = world.objective;

        this.waves = [];
        for (let wave of world.waves) {
            this.waves.push(new Wave(wave));
        }
    }
}

class Wave {
    constructor(wave) {
        this.before = wave.before; // 默认120帧（约2秒）准备时间
        this.lanes = [];
        for (let lane of wave.lanes) {
            this.lanes.push(new Lane(
                lane.id, lane.name, lane.hp, lane.mp, lane.speed,
                lane.heroDamage, lane.damage, lane.hitbox,
                lane.sprite, lane.cd, lane.amount, lane.waypoint, lane.experience
            ));
        }
    }
}

class Lane {
    constructor(
        id, name, hp, mp, speed,
        heroDamage, damage, hitbox,
        sprite, cd, amount, waypoint, experience
    ) {
        this.id = id;
        this.name = name;
        this.hp = hp;
        this.mp = mp;
        this.speed = speed;
        this.heroDamage = heroDamage;
        this.damage = damage;
        this.hitbox = hitbox;
        this.sprite = sprite;
        this.cd = cd;
        this.timer = cd;
        this.counter = amount;
        this.waypoint = waypoint;
        this.experience = experience;
    }
}