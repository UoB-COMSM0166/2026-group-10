import Hero from './Hero.js';
import {
    Slash, BladeSpin, Sacrifice, JumpingSlash, EarthquakeSlash, Sanguivore,
    Stab, Puncture, Parry, Stride, Flaw, Focus,
    Stick, SwordEnergy, SheatheSword, ForeSight, HelmBreaker, SpiritBlade
} from "../../Skill/Warrior.js";

export default class Warrior extends Hero {
    constructor(position, events, weapon, ui, clock) {
        super(
            'Warrior', 'Hugo Fortis', position, 2, 15, 300, 100,
            'A master who can skillfully use a variety of melee weapons.',
            5, 2, 0.1, events, ui, clock
        );

        this.baseHpRegen = 1;
        this.baseMpRegen = -2;
        this.hpRegen = this.baseHpRegen;
        this.mpRegen = this.baseMpRegen;

        this.currentMP = 0;

        this.currentWeapon = weapon;

        const slash = new Slash(this.events);
        const bladeSpin = new BladeSpin(this.events);
        const sacrifice = new Sacrifice(this.events);
        const jumpingSlash = new JumpingSlash(this.events);
        const earthquakeSlash = new EarthquakeSlash(this.events);
        const sanguivore = new Sanguivore(this.events);

        const stab = new Stab(this.events);
        const puncture = new Puncture(this.events);
        const parry = new Parry(this.events);
        const stride = new Stride(this.events);
        const flaw = new Flaw(this.events);
        const focus = new Focus(this.events);

        const stick = new Stick(this.events);
        const swordEnergy = new SwordEnergy(this.events);
        const sheatheSword = new SheatheSword(this.events);
        const foreSight = new ForeSight(this.events);
        const helmBreaker = new HelmBreaker(this.events);
        const spiritBlade = new SpiritBlade(this.events);

        this.skillTree = new Map();
        this.skillTree.set('A', [slash, stab, stick]);
        this.skillTree.set('Q', [sacrifice, puncture, swordEnergy]);
        this.skillTree.set('W', [jumpingSlash, parry, sheatheSword]);
        this.skillTree.set('E', [bladeSpin, stride, foreSight]);
        this.skillTree.set('R', [earthquakeSlash, flaw, helmBreaker]);
        this.skillTree.set('P', [sanguivore, focus, spiritBlade]);
        this.initializeSkillSlots();

        if (weapon === 'Axe') {
            this.skill.set('A', slash);
            this.skill.set('Q', bladeSpin);
            this.skill.set('W', jumpingSlash);
            this.skill.set('E', sacrifice);
            this.skill.set('R', earthquakeSlash)
            this.skill.set('P', sanguivore);
        } else if (weapon === 'Rapier') {
            this.skill.set('A', stab);
            this.skill.set('Q', puncture);
            this.skill.set('W', parry);
            this.skill.set('E', stride);
            this.skill.set('R', flaw);
            this.skill.set('P', focus);
        } else if (weapon === 'Long Sword') {
            this.skill.set('A', stick);
            this.skill.set('Q', swordEnergy);
            this.skill.set('W', sheatheSword);
            this.skill.set('E', foreSight);
            this.skill.set('R', helmBreaker);
            this.skill.set('P', spiritBlade);
        }

        this.applyPassiveSkills();
        // this.skill.set('W', null);
        // this.skill.set('E', null);
        // this.skill.set('R', null);
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

    updateRegeneration() {
        super.updateRegeneration();

        if (this.mpRegen < 0) {
            this.consumeMP(-this.mpRegen / 60);
        }
    }

    changeWeapon(weapon) {
        const nextWeapon = String(weapon ?? '').trim();
        const nextSkills = new Map();

        for (const [slot, skills] of this.skillTree.entries()) {
            const nextSkill = skills.find((skill) => skill?.category === nextWeapon) ?? null;
            if (!nextSkill) {
                return null;
            }

            nextSkills.set(slot, nextSkill);
        }

        for (const skill of this.skill.values()) {
            if (skill?.toggleable && skill.active) {
                skill.toggle(this, this.clock.now());
            }
        }

        this.interruptCast();
        this.clearRenderRange();
        this.currentWeapon = nextWeapon;

        for (const [slot, skill] of nextSkills.entries()) {
            skill.slot = slot;
            this.skill.set(slot, skill);
        }

        for (const buffName of ['Sanguivore', 'Focus Passive', 'Focus', 'Spirit Blade']) {
            this.removeBuff(buffName);
        }

        this.applyPassiveSkills();

        return this.currentWeapon;
    }
}
