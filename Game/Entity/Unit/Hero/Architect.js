import Hero from './Hero.js';
import { ArrowTower, RockTower } from '../../Skill/Architect.js';

export class Architect extends Hero {
    constructor(position, events, ui, clock) {
        super(
            'Architect', 'Rion Steelgear', position, 0, 0, 1, 200,
            'Manipulate magical elements to deal massive damage from a distance.',
            2, 3, 0.1, events, ui, clock
        );

        this.hpRegen = 0;
        this.mpRegen = 0;

        const arrowTower = new ArrowTower(this.events);
        const rockTower = new RockTower(this.events);
        this.skillTree = new Map();
        this.skillTree.set('A', [arrowTower, rockTower]);
        this.initializeSkillSlots();
        this.skill.set('A', arrowTower);
    }

    changeSkill(slot, skill) {
        return super.changeSkill(slot, skill);
    }
}
