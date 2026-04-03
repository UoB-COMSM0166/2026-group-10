import Skill from './Skill.js';
import Buff from './Buff.js';
import { Missile, Area, Aura } from './SkillEntity.js'

export class IcePick extends Skill {
    constructor(events) {
        super(
            'Ice Pick', 'TargetUnit',
            'Generate a ice pick that moving towards a enemy and deals damage.',
            10, 0, 150, events, 'Unit', false
        );
    }

    upgrade() {
        super.upgrade();
        this.description = 'Generate a ice pick that moving towards a enemy, deals damage and slows them.'
    }

    casted(target, caster, source, tick) {
        super.casted();

        const buffEffect = (unit) => {
            unit.speed = Math.max(0, unit.baseSpeed - 0.5);
        }

        const buff = new Buff(
            'Ice Pick',
            'Slowed down.',
            'rgba(0, 153, 255, 1)',
            60,
            buffEffect,
            false
        )

        const missile = new Missile(
            `${caster}_ice_pick_${tick}`,
            source,
            6,
            4,
            'rgba(0, 170, 170, 1)',
            target,
            this.upgraded ? 20 : 15,
            (target) => {
                if (!this.upgraded) return;
                target.addBuff(buff);
            }
        );

        console.log(`Missile Created. Head to ${target.id}`);
        this.events.emit(`skill_entity:created`, { entity: missile });
    }
}

export class StormBlast extends Skill {
    constructor(events) {
        super(
            'Storm Blast', 'Area',
            'Summon a storm that slowing down and damages enemies in the area.',
            450, 20, 200, events, 'Point', false
        );
        this.hitbox = 70;
    }

    upgrade() {
        super.upgrade();
        this.hitbox = 100;
        this.description = 'Summon a larger storm that slowing down and damages enemies in the area.';
    }

    casted(target, caster, tick) {
        super.casted();

        const buffEffect = (unit) => {
            unit.speed = Math.max(0, unit.baseSpeed - unit.baseSpeed * 0.7);
        }

        const buff = new Buff(
            'Storm Blast',
            'Slowed down.',
            'rgba(0, 153, 255, 1)',
            120,
            buffEffect,
            false
        )

        const area = new Area(
            `${caster}_storm_blast_${tick}`,
            { x: target.x, y: target.y },
            0,
            this.hitbox,
            'rgba(0, 0, 225, 0.5)',
            { x: target.x, y: target.y },
            5,
            (unit) => {
                unit.addBuff(buff);
            },
            120,
            10
        );

        console.log(`AreaEffect Created. Located on ${target.x}, ${target.y}`);
        this.events.emit(`skill_entity:created`, { entity: area });
    }
}

export class FrostShield extends Skill {
    constructor(events) {
        super(
            'FrostShield', 'SelfBuff',
            'Apply a frost shield around the target, reducing damage taken from basic attacks. While the ' +
            'shield is active, it casts frost magic on nearby enemy units every second, dealing minor damage and ' +
            'slowing them.',
            600, 50, 0, events, null, false
        );
        this.duration = 300;
        this.hitbox = 150;
        this.damage = 15;
        this.armor = 15;
        this.slowDuration = 120;
        this.effectPeriod = 60;
    }

    upgrade() {
        super.upgrade();
        this.description = 'The duration of Frost Shield is extended when an enemy is killed by it.';
    }

    casted(caster, tick) {
        super.casted();
        if (!caster) {
            return;
        }

        const slowBuffEffect = (unit) => {
            unit.speed = Math.max(0, unit.baseSpeed - unit.baseSpeed * 0.7);
        };

        const shieldBuff = new Buff(
            'Frost Shield',
            'Gain bonus armor and emit frost pulses.',
            'rgba(120, 180, 255, 1)',
            this.duration,
            (unit) => {
                unit.armor += this.armor;
            },
            true
        );

        caster.addBuff(shieldBuff);
        const appliedShieldBuff = caster.buffs.find((buff) => buff.name === 'Frost Shield') || null;
        const aura = new Aura(
            `${caster.name}_frost_shield_${tick}`,
            caster,
            this.hitbox,
            'rgba(120, 180, 255, 0.25)',
            this.damage,
            null,
            this.duration,
            this.effectPeriod
        );
        aura.extendDuration = (amount) => {
            aura.duration += amount;

            if (appliedShieldBuff) {
                appliedShieldBuff.duration += amount;
                appliedShieldBuff.remaining += amount;
            }
        };
        aura.hit = (unit) => {
            if (!unit?.alive()) {
                return;
            }

            const hpBeforeHit = unit.currentHP;
            Aura.prototype.hit.call(aura, unit);
            unit.addBuff(new Buff(
                'Frost Shield Slow',
                'Slowed by Frost Shield.',
                'rgba(0, 153, 255, 1)',
                this.slowDuration,
                slowBuffEffect,
                false
            ));

            if (this.upgraded && hpBeforeHit > 0 && !unit.alive()) {
                aura.extendDuration(60);
            }
        };

        this.events.emit('skill_entity:created', { entity: aura });
    }
}

export class Chakra extends Skill {
    constructor(events) {
        super(
            'Chakra', 'SelfBuff', 'Gain 50 MP',
            420, 0, 0, events, null, false
        )
    }

    upgrade() {
        super.upgrade();
        this.description = 'Gain 30% fo Maximum MP';
    }

    casted(caster) {
        super.casted(caster);
        if (!caster) {
            return;
        }

        const regen = this.upgraded ? 50 : 0.3 * caster.maxMP;
        caster.restoreMP(regen);
    }
}

export class Blizzard extends Skill {
    constructor(events, size) {
        super(
            'Blizzard', 'Area',
            'Summon a Blizzard that Freezes all enemies.',
            30, 80, 0, events, null, false
        );
        this.size = size;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Summon a Blizzard that Freezes all enemies and deals damage equal to half of their maximum health.';
    }

    casted(caster, tick) {
        super.casted();

        const buffEffect = (unit) => {
            unit.speed = 0;
        }

        const x = this.size.width / 2;
        const y = this.size.height / 2;

        const buff = new Buff(
            'Blizzard',
            'Frozen.',
            'rgba(0, 153, 255, 1)',
            300,
            buffEffect,
            false
        )

        const area = new Area(
            `${caster}_blizzard_${tick}`,
            { x: x, y: y },
            0,
            Math.sqrt(x * x + y * y),
            'rgba(0, 0, 225, 0.2)',
            { x: x, y: y },
            15,
            (unit) => {
                unit.addBuff(buff);
            },
            2,
            1
        );

        console.log(`AreaEffect Created. Located on ${x}, ${y}`);
        this.events.emit(`skill_entity:created`, { entity: area });
    }
}

export class ArcaneIntelligence extends Skill {
    constructor(events) {
        super(
            'Arcane Intelligence', 'Passive',
            'Gain 20 bonus MP regen.',
            0, 0, 0, events, null, true
        );
    }

    upgrade() {
        super.upgrade();
        this.description = 'Gain 20 bonus MP regen. HP regen will also fill MP.';
    }

    applyTo(hero) {
        const buff = new Buff(
            'Arcane Intelligence',
            'Bonus mana regeneration.',
            'rgba(0, 120, 255, 1)',
            Number.POSITIVE_INFINITY,
            unit => {
                unit.mpRegen += 20;
                if (this.upgraded) unit.mpRegen += unit.hpRegen;
            },
            true
        );

        hero.addBuff(buff);
    }
}

export class ManaDrain extends Skill {
    constructor(events) {
        super(
            'Mana Drain', 'Passive',
            'Restore mana whenever an enemy is killed.',
            0, 0, 0, events, null, true
        );
    }

    upgrade() {
        super.upgrade();
        this.description = 'Restore more mana whenever an enemy is killed.';
    }

    applyTo(hero) {
        const buff = new Buff(
            'Mana Drain',
            'Restore mana on kill.',
            'rgba(80, 180, 255, 1)',
            Number.POSITIVE_INFINITY,
            () => {},
            true
        );

        hero.addBuff(buff);

        if (hero._manaDrainListenerAttached) {
            return;
        }

        hero._manaDrainListenerAttached = true;
        this.events.on('enemy:killed', () => {
            if (!hero.alive()) {
                return;
            }

            hero.restoreMP(this.upgraded ? 20 : hero.maxMP * 0.05);
        });
    }
}
