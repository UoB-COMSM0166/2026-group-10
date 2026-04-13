import Enemy from './Enemy.js'
import { Area, Aura } from "../../Skill/SkillEntity.js";
import Buff from "../../Skill/Buff.js";

export class Zombie extends Enemy {
    constructor(id, position, events, waypoint, tick) {
        super(
            id, 'Zombie', position, 0.8, 10, 50, 0,
            events, waypoint, 15, 10
        )

        const buff = new Buff(
            'Poison Poll',
            'Slowed down.',
            'rgba(0, 100, 0, 0.5)',
            30,
            (unit) => {
                unit.speed = Math.max(0, unit.baseSpeed - unit.baseSpeed * 0.1);
            },
            false
        )

        this.diecry = () => {
            console.log(`${this.id} dies with a groan.`);
            const poison = new Area (
                `${this.id}_diecry_poison_${tick}`,
                this.position, 0, 20,
                this.position,
                (unit) => {
                    unit.takeDamage(2);
                    unit.addBuff(buff);
                },
                60,
                10
            )

            this.events.emit('enemy_skill_entity:created', { entity: poison });
        };
    }
}

export class Boomer extends Enemy {
    constructor(id, position, events, waypoint, tick) {
        super(
            id, 'Boomer', position, 1, 9, 40, 0,
            events, waypoint, 15, 10
        )

        this.diecry = () => {
            console.log(`${this.id} dies with a groan.`);
            const explosion = new Area(
                `${this.id}_diecry_explosion_${tick}`,
                { x: this.position.x, y: this.position.y },
                0,
                40,
                { x: this.position.x, y: this.position.y },
                (unit) => {
                    unit.takeDamage(20);
                },
                40,
                40
            );
            explosion.period = 39;

            this.events.emit('enemy_skill_entity:created', { entity: explosion });
        };
    }
}

export class Necromancer extends Enemy {
    constructor(id, position, events, waypoint, tick) {
        super(
            id, 'Necromancer', position, 0.7, 10, 55, 0,
            events, waypoint, 15, 15
        );

        this.aura = new Aura(
            `${this.id}_death_aura_${tick}`,
            this,
            40,
            1,
            null,
            Number.POSITIVE_INFINITY,
            1
        );

        this.onReachedObjective = () => {
            if (this.aura) {
                this.aura.finished = true;
            }
        };

        this.events.emit('enemy_skill_entity:created', { entity: this.aura });
    }

    die() {
        if (this.aura) {
            this.aura.finished = true;
        }

        super.die();
    }
}
