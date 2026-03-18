import Enemy from './Enemy.js'
import { Area } from "../../Skill/SkillEntity.js";
import Buff from "../../Skill/Buff.js";

export class Zombie extends Enemy{
    constructor(id, position, events, waypoint, tick) {
        super(
            id, 'Zombie', position, 0.8, 10, 50, 0, 'rgba(170, 170, 0, 1)',
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
                'rgba(0, 100, 0, 0.5)', this.position, 2,
                (unit) => {
                    unit.addBuff(buff);
                },
                60,
                10
            )

            this.events.emit('enemy_skill_entity:created', { entity: poison });
        };
    }
}