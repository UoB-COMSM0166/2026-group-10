import Hero from './Hero.js';
import { SplitAttack, Scarify, BattleRattle, SpinningBlade, DesperateStruggle, FirmWill } from "../../Skill/Warrior.js";

export class Warrior extends Hero {
    constructor(position, events, ui, clock) {
        super(
            'Warrior', 'Hugo Fortis', position, 1, 15, 300, 100,
            'Melee warrior.', 'strength',
            { strength: 5, agility: 8, intelligence: 10 }, { strength: 1, agility: 2, intelligence: 4 },
            events, ui, clock
        );

        this.baseHpRegen = 2;
        this.baseMpRegen = 0;
        this.hpRegen = this.baseHpRegen;
        this.mpRegen = this.baseMpRegen;
        this.mpName = 'Rage';
        this.currentMP = 0;

        const desperateStruggle = new DesperateStruggle(this.events);
        const firmWill = new FirmWill(this.events);
        this.skill.set('A', new SplitAttack(this.events));
        this.skill.set('Q', new Scarify(this.events));
        this.skill.set('W', new BattleRattle(this.events));
        this.skill.set('E', new SpinningBlade(this.events));
        this.skill.set('D', new DesperateStruggle(this.events));
        this.skill.set('F', new FirmWill(this.events));
        desperateStruggle.applyTo(this);
        firmWill.applyTo(this);
    }

    respawn() {
        this.interruptCast();
        this.position = { x: this.spawnPosition.x, y: this.spawnPosition.y };
        this.currentHP = this.maxHP;
        this.currentMP = 0;
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
