import Skill from './Skill.js';
import Buff from './Buff.js';
import { Aura, Projectile } from './SkillEntity.js';
import Unit from '../Unit/Unit.js';

function emitWarriorAttackHit(events, caster, skill, targets = []) {
    if (!events || !caster || !skill || !Array.isArray(targets) || targets.length === 0) {
        return;
    }

    events.emit('hero:attack:hit', {
        hero: caster,
        skill,
        targets,
    });
}

class SeeThroughDecoy extends Unit {
    constructor(id, position, duration, onTriggered) {
        super(id, position, 0, 15, 1, 0);
        this.duration = Number(duration) || 0;
        this.remaining = this.duration;
        this.finished = false;
        this.onTriggered = typeof onTriggered === 'function' ? onTriggered : null;
        this.invulnerable = true;
    }

    alive() {
        return !this.finished;
    }

    takeDamage(amount, source = null, options = {}) {
        if (this.finished) {
            return 0;
        }

        const damage = Number(amount) || 0;
        this.finished = true;
        if (this.onTriggered) {
            this.onTriggered(damage, source, options);
        }
        return 0;
    }

    update() {
        if (this.finished) {
            return;
        }

        this.remaining -= 1;
        if (this.remaining <= 0) {
            this.finished = true;
        }
    }
}

export class Slash extends Skill {
    constructor(events) {
        super(
            'Slash', 'Axe',
            'Hugo Fortis wields his battle axe damaging a target unit.',
            60, 0, 40, events, 'Unit', false, 100
        );
        this.baseDamage = 20;
        this.cleaveRadius = 50;
        this.cleaveDamageRatio = 0.6;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Slash also damages nearby enemy units around the target.';
    }

    casted(target, caster) {
        if (!target?.alive || !target.alive() || !caster) {
            return;
        }

        super.casted();

        const mainDamage = this.getAttackDamage(this.baseDamage, caster);
        target.takeDamage(mainDamage);
        emitWarriorAttackHit(this.events, caster, this, [target]);
        caster.restoreMP(15);

        if (!this.upgraded) {
            return;
        }

        const enemyRegistry = this.events?.enemyRegistry;
        if (!(enemyRegistry instanceof Map)) {
            return;
        }

        const splashDamage = this.getAttackDamage(
            this.baseDamage * this.cleaveDamageRatio,
            caster
        );

        for (const enemy of enemyRegistry.values()) {
            if (!enemy?.alive || !enemy.alive() || enemy.id === target.id) {
                continue;
            }

            const dx = enemy.position.x - target.position.x;
            const dy = enemy.position.y - target.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > this.cleaveRadius + enemy.hitbox) {
                continue;
            }

            enemy.takeDamage(splashDamage);
        }
    }
}

export class BladeSpin extends Skill {
    constructor(events) {
        super(
            'Blade Spin', 'Axe',
            'Hugo Fortis spins his battle axe, damaging all nearby enemies for a short duration.',
            600, 40, 0, events, null, false, 150
        );
        this.duration = 120;
        this.hitbox = 50;
        this.damage = 2;
        this.effectPeriod = 5;
        this.moveSpeedBonus = 2;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Blade Spin also grants bonus movement speed while the effect lasts.';
    }

    casted(caster, tick) {
        super.casted();
        if (!caster) {
            return;
        }

        if (this.upgraded) {
            caster.addBuff(new Buff(
                'Blade Spin',
                'Movement speed increased while spinning.',
                'rgba(220, 220, 220, 1)',
                this.duration,
                (unit) => {
                    unit.addStat('Speed', this.moveSpeedBonus);
                },
                true
            ));
        }

        const aura = new Aura(
            `${caster.name}_blade_spin_${tick}`,
            caster,
            this.hitbox,
            this.getAttackDamage(this.damage, caster),
            null,
            this.duration,
            this.effectPeriod
        );

        this.events.emit('skill_entity:created', { entity: aura });
    }
}

export class Sacrifice extends Skill {
    constructor(events) {
        super(
            'Sacrifice', 'Axe',
            'Consume 50 health to gain 10 attack amplification for a short duration.',
            180, 50, 0, events, null, false, 150
        );
        this.healthCost = 50;
        this.attackAmpBonus = 10;
        this.duration = 200;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Sacrifice cannot reduce Hugo Fortis below 1 health.';
    }

    casted(caster) {
        super.casted();
        if (!caster?.alive || !caster.alive()) {
            return;
        }

        if (this.upgraded) {
            caster.currentHP = Math.max(1, caster.currentHP - this.healthCost);
        } else {
            caster.takeDamage(this.healthCost);
        }

        if (!caster.alive()) {
            return;
        }

        caster.addBuff(new Buff(
            'Sacrifice',
            'Attack amplification increased by sacrifice.',
            'rgba(190, 40, 40, 1)',
            this.duration,
            (unit) => {
                unit.strength += this.attackAmpBonus;
            },
            true
        ));
    }
}

export class JumpingSlash extends Skill {
    constructor(events) {
        super(
            'Jumping Slash', 'Axe',
            'Leap to a target point and slam all enemies in the landing area.',
            360, 30, 180, events, 'Point', false, 150
        );
        this.jumpSpeed = 12;
        this.damage = 30;
        this.hitbox = 50;
        this.slowRatio = 0.2;
        this.slowDuration = 60;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Jumping Slash also slows damaged enemies by 20% for 60 ticks.';
    }

    casted(target, caster) {
        super.casted();
        if (!caster || !target) {
            return;
        }

        const destination = {
            x: Number(target.x) || 0,
            y: Number(target.y) || 0,
        };
        const dx = destination.x - caster.position.x;
        const dy = destination.y - caster.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const duration = Math.max(1, Math.ceil(distance / this.jumpSpeed));
        const totalDamage = this.getAttackDamage(this.damage, caster);
        const enemyRegistry = this.events?.enemyRegistry;

        const slowBuff = this.upgraded ? new Buff(
            'Jumping Slash Slow',
            'Slowed by Jumping Slash.',
            'rgba(180, 180, 180, 1)',
            this.slowDuration,
            (unit) => {
                unit.setStat('Speed', Math.max(0, unit.getBaseStat('Speed') - unit.getBaseStat('Speed') * this.slowRatio));
            },
            false
        ) : null;

        caster.startCast(
            duration,
            () => {
                caster.position.x = destination.x;
                caster.position.y = destination.y;
                caster.stop();

                if (!(enemyRegistry instanceof Map)) {
                    return;
                }

                for (const enemy of enemyRegistry.values()) {
                    if (!enemy?.alive || !enemy.alive()) {
                        continue;
                    }

                    const enemyDx = enemy.position.x - destination.x;
                    const enemyDy = enemy.position.y - destination.y;
                    const enemyDistance = Math.sqrt(enemyDx * enemyDx + enemyDy * enemyDy);
                    if (enemyDistance > this.hitbox + enemy.hitbox) {
                        continue;
                    }

                    enemy.takeDamage(totalDamage);
                    if (slowBuff) {
                        enemy.addBuff(slowBuff);
                    }
                }
            },
            () => {
                caster.navigateToPoint(destination);
                caster.calculateMovement();
            }
        );
    }
}

export class EarthquakeSlash extends Skill {
    constructor(events) {
        super(
            'Earthquake Slash', 'Axe',
            'Charge briefly, then smash the ground to damage and slow nearby enemies.',
            2400, 100, 0, events, null, false, 250
        );
        this.castDuration = 120;
        this.hitbox = 240;
        this.damage = 40;
        this.slowRatio = 0.3;
        this.slowDuration = 120;
        this.stunDuration = 120;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Earthquake Slash affects all enemies on the map and stuns them instead of slowing.';
    }

    casted(caster) {
        super.casted();
        if (!caster) {
            return;
        }

        const enemies = this.events?.enemyRegistry instanceof Map ? this.events.enemyRegistry : new Map();
        const totalDamage = this.getAttackDamage(this.damage, caster);
        const slowBuff = new Buff(
            'Earthquake Slash Slow',
            'Slowed by Earthquake Slash.',
            'rgba(120, 90, 60, 1)',
            this.slowDuration,
            (unit) => {
                unit.setStat('Speed', Math.max(0, unit.getBaseStat('Speed') - unit.getBaseStat('Speed') * this.slowRatio));
            },
            false
        );
        const stunBuff = new Buff(
            'Earthquake Slash Stun',
            'Stunned by Earthquake Slash.',
            'rgba(120, 90, 60, 1)',
            this.stunDuration,
            (unit) => {
                unit.setStat('Speed', 0);
            },
            false
        );

        caster.startCast(this.castDuration, () => {
            if (!caster.alive()) {
                return;
            }

            for (const enemy of enemies.values()) {
                if (!enemy?.alive || !enemy.alive()) {
                    continue;
                }

                if (!this.upgraded) {
                    const distance = caster.getDistance(enemy.position);
                    if (distance > this.hitbox + enemy.hitbox) {
                        continue;
                    }
                }

                enemy.takeDamage(totalDamage);
                if (!enemy.alive()) {
                    continue;
                }

                enemy.addBuff(this.upgraded ? stunBuff : slowBuff);
            }
        });
    }
}

export class Sanguivore extends Skill {
    constructor(events) {
        super(
            'Sanguivore', 'Axe',
            'Restore 20 health whenever an enemy unit is killed.',
            0, 0, 0, events, null, true, 70
        );
        this.healAmount = 20;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Restore health equal to the killed enemy unit\'s maximum health.';
    }

    applyTo(hero) {
        if (!hero) {
            return;
        }

        hero.addBuff(new Buff(
            'Sanguivore',
            'Restore health whenever an enemy is killed.',
            'rgba(170, 40, 40, 1)',
            Number.POSITIVE_INFINITY,
            () => {},
            true
        ));

        if (hero._sanguivoreListenerAttached) {
            return;
        }

        hero._sanguivoreListenerAttached = true;
        this.events.on('enemy:killed', ({ enemy }) => {
            if (!hero.alive() || hero.skill.get('P') !== this) {
                return;
            }

            const healAmount = this.upgraded
                ? Math.max(0, Number(enemy?.maxHP) || 0)
                : this.healAmount;
            hero.heal(healAmount);
        });
    }
}

export class Stab extends Skill {
    constructor(events) {
        super(
            'Stab', 'Rapier',
            'Stab a nearby enemy unit for heavy damage.',
            60, 0, 40, events, 'Unit', false, 100
        );
        this.damage = 30;
        this.bleedDamage = 5;
        this.bleedDuration = 60;
        this.bleedPeriod = 10;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Stab also inflicts Bleeding, dealing 5 damage every 10 ticks for 60 ticks.';
    }

    casted(target, caster) {
        super.casted();
        if (!target?.alive || !target.alive() || !caster) {
            return;
        }

        const totalDamage = this.getAttackDamage(this.damage, caster);
        target.takeDamage(totalDamage);
        emitWarriorAttackHit(this.events, caster, this, [target]);
        caster.restoreMP(15);

        if (!this.upgraded || !target.alive()) {
            return;
        }

        target.addBuff(new Buff(
            'Stab Bleeding',
            'Bleeding from Stab.',
            'rgba(150, 20, 20, 1)',
            this.bleedDuration,
            (unit) => {
                unit.takeDamage(this.bleedDamage);
            },
            false,
            this.bleedPeriod
        ));
    }
}

export class Puncture extends Skill {
    constructor(events) {
        super(
            'Puncture', 'Rapier',
            'Strike forward in a narrow line, damaging enemies in front of Hugo Fortis.',
            600, 50, 180, events, 'Point', false, 150
        );
        this.length = 100;
        this.width = 30;
        this.damage = 30;
        this.slowRatio = 0.2;
        this.slowDuration = 60;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Puncture also slows hit enemies by 20% for 60 ticks.';
    }

    casted(target, caster) {
        super.casted();
        if (!caster || !target) {
            return;
        }

        const enemyRegistry = this.events?.enemyRegistry;
        if (!(enemyRegistry instanceof Map)) {
            return;
        }

        const origin = caster.position;
        const dx = (Number(target.x) || 0) - origin.x;
        const dy = (Number(target.y) || 0) - origin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 0) {
            return;
        }

        const dirX = dx / distance;
        const dirY = dy / distance;
        const halfWidth = this.width / 2;
        const totalDamage = this.getAttackDamage(this.damage, caster);
        const slowBuff = this.upgraded ? new Buff(
            'Puncture Slow',
            'Slowed by Puncture.',
            'rgba(160, 160, 160, 1)',
            this.slowDuration,
            (unit) => {
                unit.setStat('Speed', Math.max(0, unit.getBaseStat('Speed') - unit.getBaseStat('Speed') * this.slowRatio));
            },
            false
        ) : null;
        const hitTargets = [];

        for (const enemy of enemyRegistry.values()) {
            if (!enemy?.alive || !enemy.alive()) {
                continue;
            }

            const relativeX = enemy.position.x - origin.x;
            const relativeY = enemy.position.y - origin.y;
            const forwardDistance = relativeX * dirX + relativeY * dirY;
            if (forwardDistance < -enemy.hitbox || forwardDistance > this.length + enemy.hitbox) {
                continue;
            }

            const perpendicularDistance = Math.abs(relativeX * (-dirY) + relativeY * dirX);
            if (perpendicularDistance > halfWidth + enemy.hitbox) {
                continue;
            }

            enemy.takeDamage(totalDamage);
            hitTargets.push(enemy);
            if (slowBuff && enemy.alive()) {
                enemy.addBuff(slowBuff);
            }
        }

        emitWarriorAttackHit(this.events, caster, this, hitTargets);
    }
}

export class Parry extends Skill {
    constructor(events) {
        super(
            'Parry', 'Rapier',
            'Become invulnerable for a brief moment.',
            180, 40, 0, events, null, false, 150
        );
        this.duration = 30;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Parry also reflects incoming damage back to the attacker while invulnerable.';
    }

    casted(caster) {
        super.casted();
        if (!caster) {
            return;
        }

        caster.addBuff(new Buff(
            'Parry',
            'Invulnerable and reflects incoming damage.',
            'rgba(220, 220, 255, 1)',
            this.duration,
            (unit) => {
                unit.invulnerable = true;
                if (this.upgraded) {
                    unit.onIncomingDamage = (amount, source, options = {}) => {
                        if (options?.reflected || !source?.alive || !source.alive()) {
                            return;
                        }

                        source.takeDamage(amount, unit, {
                            reflected: true,
                            ignoreReactive: true,
                        });
                    };
                }
            },
            true
        ));
    }
}

export class Stride extends Skill {
    constructor(events) {
        super(
            'Stride', 'Rapier',
            'Rush to a nearby target and strike it.',
            300, 30, 180, events, 'Unit', false, 150
        );
        this.damage = 40;
        this.moveSpeed = 14;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Stride becomes an instant teleport to the target.';
    }

    casted(target, caster) {
        super.casted();
        if (!target?.alive || !target.alive() || !caster) {
            return;
        }

        const destination = {
            x: Number(target.position?.x) || 0,
            y: Number(target.position?.y) || 0,
        };
        const totalDamage = this.getAttackDamage(this.damage, caster);

        const finishStrike = () => {
            caster.position.x = destination.x;
            caster.position.y = destination.y;
            caster.stop();

            if (target.alive()) {
                target.takeDamage(totalDamage, caster);
                emitWarriorAttackHit(this.events, caster, this, [target]);
            }
        };

        if (this.upgraded) {
            finishStrike();
            return;
        }

        const dx = destination.x - caster.position.x;
        const dy = destination.y - caster.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const duration = Math.max(1, Math.ceil(distance / this.moveSpeed));

        caster.startCast(
            duration,
            finishStrike,
            () => {
                caster.navigateToPoint(destination);
                caster.calculateMovement();
            }
        );
    }
}

export class Flaw extends Skill {
    constructor(events) {
        super(
            'Flaw', 'Rapier',
            'Expose weaknesses in an area, reducing enemy armor for a long duration.',
            2400, 100, 240, events, 'Point', false, 250
        );
        this.hitbox = 100;
        this.duration = 600;
        this.armorReduction = 10;
        this.slowRatio = 0.4;
        this.slowDuration = 600;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Flaw also slows affected enemies by 40% while the debuff lasts.';
    }

    casted(target, caster) {
        super.casted();
        if (!target || !caster) {
            return;
        }

        const enemyRegistry = this.events?.enemyRegistry;
        if (!(enemyRegistry instanceof Map)) {
            return;
        }

        const center = {
            x: Number(target.x) || 0,
            y: Number(target.y) || 0,
        };

        const flawBuff = new Buff(
            'Flaw',
            'Armor reduced by Flaw.',
            'rgba(120, 80, 80, 1)',
            this.duration,
            (unit) => {
                unit.addStat('Armor', -this.armorReduction);
            },
            false
        );

        const slowBuff = this.upgraded ? new Buff(
            'Flaw Slow',
            'Slowed by Flaw.',
            'rgba(120, 80, 80, 1)',
            this.slowDuration,
            (unit) => {
                unit.setStat('Speed', Math.max(0, unit.getBaseStat('Speed') - unit.getBaseStat('Speed') * this.slowRatio));
            },
            false
        ) : null;

        for (const enemy of enemyRegistry.values()) {
            if (!enemy?.alive || !enemy.alive()) {
                continue;
            }

            const dx = enemy.position.x - center.x;
            const dy = enemy.position.y - center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > this.hitbox + enemy.hitbox) {
                continue;
            }

            enemy.addBuff(flawBuff);
            if (slowBuff) {
                enemy.addBuff(slowBuff);
            }
        }
    }
}

export class Focus extends Skill {
    constructor(events) {
        super(
            'Focus', 'Rapier',
            'Successful attacks grant a temporary attack cooldown reduction buff.',
            0, 0, 0, events, null, true, 70
        );
        this.duration = 60;
        this.attackCooldownReduction = 0.3;
        this.qCooldownReduction = 30;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Attacks also reduce Q skill cooldown by 30 ticks.';
    }

    applyTo(hero) {
        if (!hero) {
            return;
        }

        hero.addBuff(new Buff(
            'Focus Passive',
            'Attacks grant Focus.',
            'rgba(200, 200, 255, 1)',
            Number.POSITIVE_INFINITY,
            () => {},
            true
        ));

        if (hero._focusListenerAttached) {
            return;
        }

        hero._focusListenerAttached = true;
        this.events.on('hero:attack:hit', ({ hero: eventHero }) => {
            if (eventHero !== hero || !hero.alive() || hero.skill.get('P') !== this) {
                return;
            }

            hero.addBuff(new Buff(
                'Focus',
                'Attack cooldown reduced.',
                'rgba(200, 200, 255, 1)',
                this.duration,
                (unit) => {
                    const attackSkill = unit.skill.get('A');
                    if (attackSkill) {
                        attackSkill.cooldownAcceleration = this.attackCooldownReduction;
                    }
                },
                true
            ));

            if (this.upgraded) {
                const qSkill = hero.skill.get('Q');
                if (qSkill) {
                    qSkill.currentCooldown = Math.max(0, qSkill.currentCooldown - this.qCooldownReduction);
                }
            }
        });
    }
}

export class Stick extends Skill {
    constructor(events) {
        super(
            'Stick', 'Long Sword',
            'Thrust at a nearby enemy unit.',
            60, 0, 40, events, 'Unit', false, 100
        );
        this.damage = 30;
        this.attackAmpBonus = 10;
        this.duration = 60;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Stick also grants 10 bonus attack amplification for 60 ticks.';
    }

    casted(target, caster) {
        super.casted();
        if (!target?.alive || !target.alive() || !caster) {
            return;
        }

        const totalDamage = this.getAttackDamage(this.damage, caster);
        target.takeDamage(totalDamage, caster);
        emitWarriorAttackHit(this.events, caster, this, [target]);
        caster.restoreMP(15);

        if (!this.upgraded) {
            return;
        }

        caster.addBuff(new Buff(
            'Stick',
            'Attack amplification increased by Stick.',
            'rgba(220, 220, 255, 1)',
            this.duration,
            (unit) => {
                unit.strength += this.attackAmpBonus;
            },
            true
        ));
    }
}

export class SwordEnergy extends Skill {
    constructor(events) {
        super(
            'Sword Energy', 'Long Sword',
            'Release a sword wave toward a target point.',
            600, 40, 240, events, 'Point', false, 150
        );
        this.damage = 30;
        this.projectileSpeed = 8;
        this.projectileHitbox = 20;
        this.slowRatio = 0.3;
        this.slowDuration = 40;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Sword Energy also slows enemies hit by 30% for 40 ticks.';
    }

    casted(target, caster, source, tick) {
        super.casted();
        if (!target || !caster || !source) {
            return;
        }

        const casterId = caster?.name ?? caster;
        const totalDamage = this.getAttackDamage(this.damage, caster);
        const slowBuff = this.upgraded ? new Buff(
            'Sword Energy Slow',
            'Slowed by Sword Energy.',
            'rgba(180, 180, 220, 1)',
            this.slowDuration,
            (unit) => {
                unit.setStat('Speed', Math.max(0, unit.getBaseStat('Speed') - unit.getBaseStat('Speed') * this.slowRatio));
            },
            false
        ) : null;

        const projectile = new Projectile(
            `${casterId}_sword_energy_${tick}`,
            source,
            this.projectileSpeed,
            this.projectileHitbox,
            { x: Number(target.x) || 0, y: Number(target.y) || 0 },
            totalDamage,
            (unit) => {
                emitWarriorAttackHit(this.events, caster, this, [unit]);
                if (slowBuff && unit?.alive && unit.alive()) {
                    unit.addBuff(slowBuff);
                }
            },
            this.range,
            true,
            caster
        );

        this.events.emit('skill_entity:created', { entity: projectile });
    }
}

export class SheatheSword extends Skill {
    constructor(events) {
        super(
            'Sheathe Sword', 'Long Sword',
            'Sheathe the sword to trade attack power for speed.',
            10, 0, 0, events, null, false, 150
        );
        this.attackAmpPenaltyRatio = 0.2;
        this.moveSpeedBonusRatio = 0.3;

        this.enableToggle(
            (hero) => {
                if (!hero) {
                    return;
                }
                hero.sheatheSwordActive = true;
            },
            (hero) => {
                if (!hero) {
                    return;
                }

                hero.sheatheSwordActive = true;
                hero.strength -= hero.baseStrength * this.attackAmpPenaltyRatio;
                hero.addStat('Speed', hero.getBaseStat('Speed') * this.moveSpeedBonusRatio);
            },
            (hero) => {
                if (!hero) {
                    return;
                }
                hero.sheatheSwordActive = false;
            }
        );
    }
}

export class ForeSight extends Skill {
    constructor(events) {
        super(
            'Fore Sight', 'Long Sword',
            'Blink away from a chosen point and counter with a brief aura around yourself if the original position is struck shortly after.',
            300, 40, 180, events, 'Point', false, 150
        );
        this.triggerWindow = 30;
        this.damage = 40;
        this.hitbox = 100;
        this.auraDuration = 12;
        this.auraEffectPeriod = 1;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Successful counter resets See Through cooldown and refunds its mana cost.';
    }

    casted(target, caster, source, tick) {
        super.casted();
        if (!target || !caster || !source) {
            return;
        }

        const start = {
            x: Number(source.x) || 0,
            y: Number(source.y) || 0,
        };
        const targetPoint = {
            x: Number(target.x) || 0,
            y: Number(target.y) || 0,
        };

        const dx = targetPoint.x - start.x;
        const dy = targetPoint.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 0) {
            return;
        }

        const step = Math.min(distance, this.range);
        const dirX = dx / distance;
        const dirY = dy / distance;
        caster.position.x = start.x + dirX * step;
        caster.position.y = start.y + dirY * step;
        caster.stop();

        const decoy = new SeeThroughDecoy(
            `${caster.name}_see_through_decoy_${tick}`,
            start,
            this.triggerWindow,
            () => {
                if (!caster.alive()) {
                    return;
                }

                const totalDamage = this.getAttackDamage(this.damage, caster);
                const hitTargetIds = new Set();
                const aura = new Aura(
                    `${caster.name}_fore_sight_aura_${tick}`,
                    caster,
                    this.hitbox,
                    0,
                    (enemy) => {
                        if (!enemy?.alive || !enemy.alive() || hitTargetIds.has(enemy.id)) {
                            return;
                        }

                        hitTargetIds.add(enemy.id);
                        enemy.takeDamage(totalDamage, caster);
                        emitWarriorAttackHit(this.events, caster, this, [enemy]);
                    },
                    this.auraDuration,
                    this.auraEffectPeriod
                );
                this.events.emit('skill_entity:created', { entity: aura });

                if (this.upgraded) {
                    this.currentCooldown = 0;
                    caster.restoreMP(this.manaCost);
                }
            }
        );

        this.events.emit('allied_decoy:created', { entity: decoy });
    }
}

export class HelmBreaker extends Skill {
    constructor(events) {
        super(
            'Helm Breaker', 'Long Sword',
            'Disappear, then crash down at a target point after a short delay.',
            2400, 120, 99999, events, 'Point', false, 250
        );
        this.delay = 60;
        this.hitbox = 100;
        this.damage = 50;
        this.armorReduction = 5;
        this.armorReductionDuration = 60;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Casting Helm Breaker also reduces all enemies\' armor by 5 for 60 ticks.';
    }

    casted(target, caster) {
        super.casted();
        if (!target || !caster) {
            return;
        }

        const destination = {
            x: Number(target.x) || 0,
            y: Number(target.y) || 0,
        };
        const enemies = this.events?.enemyRegistry instanceof Map ? this.events.enemyRegistry : new Map();

        if (this.upgraded) {
            const armorBreakBuff = new Buff(
                'Helm Breaker Armor Break',
                'Armor reduced by Helm Breaker.',
                'rgba(140, 110, 80, 1)',
                this.armorReductionDuration,
                (unit) => {
                    unit.addStat('Armor', -this.armorReduction);
                },
                false
            );

            for (const enemy of enemies.values()) {
                if (!enemy?.alive || !enemy.alive()) {
                    continue;
                }
                enemy.addBuff(armorBreakBuff);
            }
        }

        caster.addBuff(new Buff(
            'Helm Breaker',
            'Hidden above the battlefield.',
            'rgba(180, 180, 180, 0.2)',
            this.delay,
            (unit) => {
                unit.invulnerable = true;
                unit.skillCastingDisabled = true;
                unit.hitbox = 0;
            },
            true
        ));

        caster.position.x = -1000;
        caster.position.y = -1000;
        caster.stop();

        caster.startCast(this.delay, () => {
            if (!caster.alive()) {
                return;
            }

            caster.position.x = destination.x;
            caster.position.y = destination.y;
            caster.stop();

            const totalDamage = this.getAttackDamage(this.damage, caster);
            const hitTargets = [];
            for (const enemy of enemies.values()) {
                if (!enemy?.alive || !enemy.alive()) {
                    continue;
                }

                const dx = enemy.position.x - destination.x;
                const dy = enemy.position.y - destination.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > this.hitbox + enemy.hitbox) {
                    continue;
                }

                enemy.takeDamage(totalDamage, caster);
                hitTargets.push(enemy);
            }

            emitWarriorAttackHit(this.events, caster, this, hitTargets);
        });
    }
}

export class SpiritBlade extends Skill {
    constructor(events) {
        super(
            'Spirit Blade', 'Long Sword',
            'Gain attack amplification equal to half of current mana.',
            0, 0, 0, events, null, true, 70
        );
    }

    upgrade() {
        super.upgrade();
        this.description = 'Gain attack amplification equal to current mana.';
    }

    applyTo(hero) {
        if (!hero) {
            return;
        }

        hero.addBuff(new Buff(
            'Spirit Blade',
            'Attack amplification scales with current mana.',
            'rgba(180, 220, 255, 1)',
            Number.POSITIVE_INFINITY,
            (unit) => {
                const mana = Math.max(0, Number(unit.currentMP) || 0);
                unit.strength += this.upgraded ? mana : mana * 0.5;
            },
            true
        ));
    }
}
