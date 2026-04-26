import Hero from './Hero.js';
import { ArrowTower, Demolish, FlameTower, FrostTower, Poverty, RockTower } from '../../Skill/Architect.js';

export default class Architect extends Hero {
    constructor(position, events, _, clock) {
        super(
            'Architect', 'Rion Steelgear', position, 0, 0, 1, 200,
            'Manipulate magical elements to deal massive damage from a distance.',
            0, 0, 0, events, clock
        );

        this.hpRegen = 0;
        this.mpRegen = 0;
        this.invulnerable = true;
        this.spellSlotLevel = 3;
        this.skillSlotUnlocked = new Map([
            ['A', true],
            ['Q', true],
            ['W', true],
            ['E', true],
            ['R', true],
            ['P', true],
        ]);

        const arrowTower = new ArrowTower(this.events);
        const rockTower = new RockTower(this.events);
        const flameTower = new FlameTower(this.events);
        const frostTower = new FrostTower(this.events);
        const demolish = new Demolish(this.events);
        const poverty = new Poverty(this.events);
        this.skillTree = new Map();
        this.initializeSkillSlots();
        this.skill.set('A', arrowTower);
        this.skill.set('Q', rockTower);
        this.skill.set('W', flameTower);
        this.skill.set('E', frostTower);
        this.skill.set('R', demolish);
        this.skill.set('P', poverty);

        this.events.on('enemy:killed', ({ id, _ }) => {
            if (!id) {
                return;
            }

            this.restoreMP(20);
        });
    }

    appendWaypoint(_) {

    }

    respawn() {
        super.respawn();
        this.currentMP = this.maxMP;
    }
}
