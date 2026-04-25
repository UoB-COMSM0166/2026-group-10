import Hero from './Hero.js';
import { AgilityBonus, Arrow, ChargedShot, HuntingBonus, Trap, WindWalk, Musket } from '../../Skill/Ranger.js';

export class Ranger extends Hero {
    constructor(position, events, ui, clock) {
        super(
            'Ranger', 'Celer Sunsentinel', position, 1, 15, 180, 220,
            'Fast, ranged damage', 'agility',
            { strength: 5, agility: 11, intelligence: 6 }, { strength: 2, agility: 4, intelligence: 2 },
            events, ui, clock
        );

        this.baseHpRegen = 1;
        this.baseMpRegen = 2;
        this.hpRegen = this.baseHpRegen;
        this.mpRegen = this.baseMpRegen;

        this.mpName = 'Focus';
        this.mpColor = 'rgb(0,156,0)';

        const agilityBonus = new AgilityBonus(events);
        const huntingBonus = new HuntingBonus(events);

        this.skill.set('A', new Arrow(events));
        this.skill.set('Q', new ChargedShot(events));
        this.skill.set('W', new WindWalk(events));
        this.skill.set('E', new Trap(events));
        this.skill.set('R', new Musket(events));
        this.skill.set('D', huntingBonus);
        this.skill.set('F', agilityBonus);

        huntingBonus.applyTo(this);
        agilityBonus.applyTo(this);
    }

    respawn() {
        this.interruptCast();
        this.position = { x: this.spawnPosition.x, y: this.spawnPosition.y };
        this.currentHP = this.maxHP;
        this.currentMP = this.maxMP;
        this.remainingRespawnCD = 0;
        this.stop();
        this.clearWaypoints();
        this.events.emit('hero:respawn', { hero: this });
        this.ui.emit('hero:respawn', { hero: this });
    }

    updateRespawn() {
        if (this.alive() || this.remainingRespawnCD <= 0) {
            return;
        }

        this.remainingRespawnCD -= 1;
        if (this.remainingRespawnCD <= 0) {
            this.respawn();
        }
    }
}
