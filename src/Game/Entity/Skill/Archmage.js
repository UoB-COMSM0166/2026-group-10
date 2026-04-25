import Skill from './Skill.js';
import Buff from './Buff.js';
import { Missile, Area, Aura, Projectile, Guardian } from './SkillEntity.js'

export class IcePick extends Skill {
    constructor(events) {
        super(
            'Ice Pick', 'Ice',
            'Lyra\'Gotha generate a ice pick that moving towards a enemy and deals damage.',
            10, 0, 150, events, 'Unit', false
        );
    }

    upgrade() {
        super.upgrade();
        this.description = 'The Ice Pick deals damage and slows the target down.'
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
            `${caster.name}_ice_pick_${tick}`,
            source,
            6,
            4,
            target,
            this.getAttackDamage(this.upgraded ? 20 : 15, caster),
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
            'Storm Blast', 'Ice',
            'Lyra\'Gotha manipulates air currents in an area, summoning a storm that damages enemies in it.',
            450, 20, 200, events, 'Point', false
        );
        this.hitbox = 70;
    }

    upgrade() {
        super.upgrade();
        this.hitbox = 100;
        this.description = 'The storm area becomes larger, and slowing down and damages enemies in the area.';
    }

    casted(target, caster, _, tick) {
        super.casted();
        const totalDamage = this.getSpellDamage(5, caster);

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
            { x: target.x, y: target.y },
            (unit) => {
                unit.takeDamage(totalDamage);
                unit.addBuff(buff);
            },
            120,
            10,
            0
        );

        console.log(`AreaEffect Created. Located on ${target.x}, ${target.y}`);
        this.events.emit(`skill_entity:created`, { entity: area });
    }
}

export class FrostShield extends Skill {
    constructor(events) {
        super(
            'FrostShield', 'Ice',
            'Lyra\'Gotha’ summons the surrounding cold air, casting a frost shield around herself to reduce ' +
            'damage taken. While the shield is active, it casts frost magic every second on nearby enemy units, ' +
            'dealing minor damage and slowing them.',
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
            this.getSpellDamage(this.damage, caster),
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
            'Chakra', 'Ice', 'Lyra\'Gotha channels her inner energy, restoring a portion of her mana.',
            420, 0, 0, events, null, false
        )
    }

    upgrade() {
        super.upgrade();
        this.description = 'Now Lyra\'Gotha restore a certain percentage of the maximum MP.';
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
    constructor(events) {
        super(
            'Blizzard', 'Ice',
            'Lyra\'Gotha controls all ice elements across the entire map, summoning a Blizzard that Freezes ' +
            'all enemies. During the chanting, the hero cannot be affected by negative effects or perform other actions.',
            30, 80, 0, events, null, false
        );
        this.castDuration = 60;
        this.size = { width: 1280, height: 720 };
    }

    upgrade() {
        super.upgrade();
        this.castDuration = 30;
        this.description = 'Summon a Blizzard that Freezes all enemies and deals damage equal to half of their maximum health.';
    }

    casted(caster, tick) {
        super.casted();
        if (!caster) {
            return;
        }

        const buffEffect = (unit) => {
            unit.speed = 0;
        }

        caster.startCast(this.castDuration, () => {
            if (!caster.alive()) {
                return;
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
                `${caster.name}_blizzard_${tick}`,
                { x: x, y: y },
                0,
                Math.sqrt(x * x + y * y),
                { x: x, y: y },
                (unit) => {
                    if (this.upgraded) {
                        unit.takeDamage(this.getSpellDamage(unit.maxHP / 2, caster));
                    }
                    unit.addBuff(buff);
                },
                2,
                1,
                0
            );

            console.log(`AreaEffect Created. Located on ${x}, ${y}`);
            this.events.emit(`skill_entity:created`, { entity: area });
        });
    }
}

export class ManaDrain extends Skill {
    constructor(events) {
        super(
            'Mana Drain', 'Ice',
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

export class FireBall extends Skill {
    constructor(events) {
        super(
            'Fire Ball', 'Fire',
            'Lyra\'Gotha generate a fire ball that moving in straight.',
            10, 0, 200, events, 'Point', false
        );
        this.baseDamage = 15;
        this.upgradedDamage = 20;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Now fire ball that hits enemy will ignite it. Ignition deals continuous damage.'
    }

    casted(target, caster, source, tick) {
        super.casted();
        const casterId = caster?.name ?? caster;
        const totalDamage = this.getAttackDamage(
            this.upgraded ? this.upgradedDamage : this.baseDamage,
            caster,
            { includeBonusDamage: true }
        );

        const buffEffect = (unit) => {
            unit.takeDamage(2);
        }

        const buff = new Buff(
            'Fire Ball Ignition',
            'Suffer continuous damage.',
            'rgba(225, 50, 0, 1)',
            30,
            buffEffect,
            false,
            10,
            ['ignition']
        )

        const projectile = new Projectile(
            `${casterId}_fire_ball_${tick}`,
            source,
            6,
            4,
            target,
            totalDamage,
            (target) => {
                if (!this.upgraded) return;
                target.addBuff(buff);
            },
            this.range
        );

        console.log(`Projectile Created. Head to ${target.x}, ${target.y}`);
        this.events.emit(`skill_entity:created`, { entity: projectile });
    }
}

export class FlameWave extends Skill {
    constructor(events) {
        super(
            'Flame Wave', 'Fire',
            'Lyra\'Gotha Channeled the dragon\'s breath, unleashing a wave of flames that damage and ignite ' +
            'all the enemies caught in its path.',
            18, 20, 260, events, 'Point', false
        );
        this.speed = 8;
        this.hitbox = 35;
        this.damage = 30;
        this.igniteDuration = 50;
        this.igniteDamage = 5;
        this.ignitePeriod = 10;
        this.slowAmount = 0.2;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Ignition now also slows the target.';
        this.damage = 40;
    }

    casted(target, caster, source, tick) {
        super.casted();
        const casterId = caster?.name ?? caster;
        const totalDamage = this.getSpellDamage(this.damage, caster);

        const igniteBuff = new Buff(
            'Flame Wave Ignition',
            'Burning from Flame Wave.',
            'rgba(255, 100, 0, 1)',
            this.igniteDuration,
            (unit) => {
                unit.takeDamage(this.igniteDamage);
                if (this.upgraded) {
                    unit.speed = Math.max(0, unit.speed - unit.baseSpeed * this.slowAmount);
                }
            },
            false,
            this.ignitePeriod,
            ['ignition']
        );

        const area = new Area(
            `${casterId}_flame_wave_${tick}`,
            source,
            this.speed,
            this.hitbox,
            target,
            (unit) => {
                if (area.hitUnits.has(unit.id) || !unit.alive()) {
                    return;
                }

                area.hitUnits.add(unit.id);
                unit.takeDamage(totalDamage);
                unit.addBuff(igniteBuff);
            },
            Math.ceil(this.range / this.speed),
            1,
            this.range
        );

        area.hitUnits = new Set();
        area.category = 'Area';

        console.log(`Flame Wave Created. Head to ${target.x}, ${target.y}`);
        this.events.emit('skill_entity:created', { entity: area });
    }
}

export class Burning extends Skill {
    constructor(events) {
        super(
            'Burning', 'Fire',
            'Ignite the air around Lyra\'Gotha, burning nearby enemies while increasing her movement speed.',
            60, 20, 0, events, null, false
        );
        this.duration = 120;
        this.hitbox = 100;
        this.damage = 1;
        this.effectPeriod = 5;
        this.moveSpeedBonus = 2;
    }

    upgrade() {
        super.upgrade();
        this.hitbox = 150;
        this.moveSpeedBonus = 2;
        this.description = 'Burning affects a wider area and grants more bonus movement speed.';
    }

    casted(caster, tick) {
        super.casted();
        if (!caster) {
            return;
        }

        const selfBuff = new Buff(
            'Burning',
            'Movement speed increased by burning flames.',
            'rgba(255, 120, 0, 1)',
            this.duration,
            (unit) => {
                unit.speed += this.moveSpeedBonus;
            },
            true
        );

        caster.addBuff(selfBuff);

        const aura = new Aura(
            `${caster.name}_burning_${tick}`,
            caster,
            this.hitbox,
            this.getSpellDamage(this.damage, caster),
            null,
            this.duration,
            this.effectPeriod
        );

        this.events.emit('skill_entity:created', { entity: aura });
    }
}

export class ViperGuardian extends Skill {
    constructor(events) {
        super(
            'Viper Guardian', 'Fire',
            'Summon a guardian that automatically attacks the nearest enemy in range.',
            30, 35, 250, events, 'Point', false
        );
        this.duration = 600;
        this.attackRange = 100;
        this.attackInterval = 45;
        this.damage = 10;
        this.guardianHitbox = 12;
        this.missileSpeed = 6;
        this.missileHitbox = 4;
    }

    upgrade() {
        super.upgrade();
        this.description = 'Guardian attacks now ignite enemies.';
    }

    casted(target, caster, _, tick) {
        super.casted();
        const casterId = caster?.name ?? caster;
        if (!target) {
            return;
        }

        const igniteBuff = new Buff(
            'Viper Guardian Ignition',
            'Burning from Viper Guardian.',
            'rgba(255, 110, 0, 1)',
            45,
            (unit) => {
                unit.takeDamage(3);
            },
            false,
            10,
            ['ignition']
        );

        const guardian = new Guardian(
            `${casterId}_viper_guardian_${tick}`,
            { x: target.x, y: target.y },
            this.guardianHitbox,
            this.events,
            this.duration,
            this.attackRange,
            this.attackInterval,
            this.missileSpeed,
            this.missileHitbox,
            this.getSpellDamage(this.damage, caster),
            this.upgraded ? (unit) => unit.addBuff(igniteBuff) : null
        );

        this.events.emit('skill_entity:created', { entity: guardian });
    }
}

export class Meteorite extends Skill {
    constructor(events) {
        super(
            'Meteorite', 'Fire',
            'Summon a meteorite at the target point after a short delay, damaging and stunning enemies on impact.',
            24, 40, 250, events, 'Point', false
        );
        this.delay = 30;
        this.hitbox = 35;
        this.damage = 10;
        this.stunDuration = 30;
        this.rollSpeed = 1;
        this.rollEffectPeriod = 5;
    }

    upgrade() {
        super.upgrade();
        this.targetCategory = 'Vector';
        this.description = 'Choose a vector. After impact, the meteorite rolls in that direction and keeps damaging enemies every 5 ticks.';
    }

    casted(target, caster, _, tick) {
        super.casted();
        const casterId = caster?.name ?? caster;
        const totalDamage = this.getSpellDamage(this.damage, caster);

        const landingPoint = this.upgraded ? target?.start : target;
        const rollDirection = this.upgraded ? target?.end : null;
        if (!landingPoint) {
            return;
        }

        const stunBuff = new Buff(
            'Meteorite Stun',
            'Stunned by meteorite impact.',
            'rgba(255, 170, 80, 1)',
            this.stunDuration,
            (unit) => {
                unit.speed = 0;
            },
            false
        );

        const meteorite = new Area(
            `${casterId}_meteorite_${tick}`,
            { x: landingPoint.x, y: landingPoint.y },
            0,
            this.hitbox,
            { x: landingPoint.x, y: landingPoint.y },
            () => {},
            this.delay + Math.ceil(this.range / this.rollSpeed) + 2,
            this.rollEffectPeriod,
            this.upgraded ? this.range : 0
        );

        meteorite.delayRemaining = this.delay;
        meteorite.landed = false;
        meteorite.rolling = Boolean(this.upgraded && rollDirection);
        meteorite.period = this.rollEffectPeriod;
        meteorite.rollDirection = rollDirection ? { x: rollDirection.x, y: rollDirection.y } : null;

        meteorite.impact = (units) => {
            for (const unit of units.values()) {
                if (!unit?.alive || !unit.alive()) {
                    continue;
                }

                if (meteorite.getDistance(unit.position) <= meteorite.hitbox + unit.hitbox) {
                    unit.takeDamage(totalDamage);
                    unit.addBuff(stunBuff);
                }
            }
        };

        meteorite.rollHit = (units) => {
            for (const unit of units.values()) {
                if (!unit?.alive || !unit.alive()) {
                    continue;
                }

                if (meteorite.getDistance(unit.position) <= meteorite.hitbox + unit.hitbox) {
                    unit.takeDamage(totalDamage);
                }
            }
        };

        meteorite.updateMovement = () => {
            if (meteorite.finished || !meteorite.landed || !meteorite.rolling || meteorite.speed <= 0) {
                return;
            }

            meteorite.calculateMovement();
            meteorite.distanceTravelled = meteorite.getDistance(meteorite.origin);

            if (meteorite.maxDistance > 0 && meteorite.distanceTravelled >= meteorite.maxDistance) {
                meteorite.finished = true;
            }
        };

        meteorite.update = (size, units) => {
            if (meteorite.finished) {
                return;
            }

            if (!meteorite.landed) {
                meteorite.delayRemaining -= 1;
                if (meteorite.delayRemaining > 0) {
                    meteorite.duration -= 1;
                    return;
                }

                meteorite.landed = true;
                meteorite.impact(units);

                if (!meteorite.rolling) {
                    meteorite.finished = true;
                    return;
                }

                const dx = meteorite.rollDirection.x - landingPoint.x;
                const dy = meteorite.rollDirection.y - landingPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= 0) {
                    meteorite.finished = true;
                    return;
                }

                meteorite.speed = this.rollSpeed;
                meteorite.origin = { x: meteorite.position.x, y: meteorite.position.y };
                meteorite.distanceTravelled = 0;
                meteorite.velocity.vx = dx / distance * meteorite.speed;
                meteorite.velocity.vy = dy / distance * meteorite.speed;
                meteorite.period = this.rollEffectPeriod;
                meteorite.duration -= 1;
                return;
            }

            if (!meteorite.available(size)) {
                meteorite.finished = true;
                return;
            }

            if (meteorite.period > 0) {
                meteorite.period -= 1;
            } else {
                meteorite.rollHit(units);
                meteorite.period = this.rollEffectPeriod;
            }

            if (meteorite.maxDistance > 0 && meteorite.distanceTravelled >= meteorite.maxDistance) {
                meteorite.finished = true;
                return;
            }

            meteorite.duration -= 1;
            if (meteorite.duration <= 0) {
                meteorite.finished = true;
            }
        };

        this.events.emit('skill_entity:created', { entity: meteorite });
    }
}

export class FierySoul extends Skill {
    constructor(events) {
        super(
            'Fiery Soul', 'Fire',
            'Each ignited enemy increases the attack speed of the current A skill.',
            0, 0, 0, events, null, true
        );
        this.attackSpeedPerIgnited = 0.25;
        this.moveSpeedPerIgnited = 1;
    }

    upgrade() {
        super.upgrade();
        this.description = 'FierySoul will also give Lyra\'Gotha extra movement speed.';
    }

    applyTo(hero) {
        if (!hero) {
            return;
        }

        if (!hero._fierySoulTrackedEnemies) {
            hero._fierySoulTrackedEnemies = new Map();
        }

        if (!hero._fierySoulListenerAttached) {
            hero._fierySoulListenerAttached = true;

            this.events.on('enemy:spawned', ({ newEnemy }) => {
                if (newEnemy) {
                    hero._fierySoulTrackedEnemies.set(newEnemy.id, newEnemy);
                }
            });

            this.events.on('enemy:killed', ({ id }) => {
                hero._fierySoulTrackedEnemies.delete(id);
            });

            this.events.on('enemy:reached_objective', ({ enemy }) => {
                if (enemy?.id) {
                    hero._fierySoulTrackedEnemies.delete(enemy.id);
                }
            });
        }

        const countIgnitedEnemies = () => {
            let count = 0;
            for (const enemy of hero._fierySoulTrackedEnemies.values()) {
                if (!enemy?.alive || !enemy.alive()) {
                    continue;
                }

                const ignited = enemy.buffs?.some((buff) => Array.isArray(buff.tags) && buff.tags.includes('ignition'));
                if (ignited) {
                    count += 1;
                }
            }
            return count;
        };

        const buff = new Buff(
            'Fiery Soul',
            'Gain bonuses from ignited enemies.',
            'rgba(255, 140, 0, 1)',
            Number.POSITIVE_INFINITY,
            (unit) => {
                const ignitedCount = countIgnitedEnemies();
                const attackSkill = unit.skill.get('A');
                if (attackSkill) {
                    attackSkill.cooldownAcceleration = ignitedCount * this.attackSpeedPerIgnited;
                }

                if (this.upgraded && ignitedCount > 0) {
                    unit.speed += ignitedCount * this.moveSpeedPerIgnited;
                }
            },
            true
        );

        hero.addBuff(buff);
    }
}

export class Lightning extends Skill {
    constructor(events) {
        super(
            'Lightning', 'Lightning',
            'Lyra\'Gotha summons a lightning strike that hits a area, dealing magic damage and apply a static field buff to enemies hit.',
            10, 0, 200, events, 'Point', false
        );
        this.hitbox = 70;
        this.damage = 15;
        this.staticFieldDuration = 120;
    }

    upgrade() {
        super.upgrade();
        this.hitbox = 100;
        this.damage = 20;
        this.description = 'Lightning strikes a larger area for more damage and applies Static Field to enemies hit.';
    }

    casted(target, caster, _, tick) {
        super.casted();
        const casterId = caster?.name ?? caster;
        const totalDamage = this.getAttackDamage(this.damage, caster);

        if (!target) {
            return;
        }

        const staticFieldBuff = new Buff(
            'Static Field',
            'Affected by a charged static field.',
            'rgba(255, 255, 120, 1)',
            this.staticFieldDuration,
            () => {},
            false
        );

        const area = new Area(
            `${casterId}_lightning_${tick}`,
            { x: target.x, y: target.y },
            0,
            this.hitbox,
            { x: target.x, y: target.y },
            (unit) => {
                if (!unit?.alive || !unit.alive()) {
                    return;
                }

                unit.takeDamage(totalDamage);
                unit.addBuff(staticFieldBuff);
            },
            2,
            1,
            0
        );

        console.log(`AreaEffect Created. Located on ${target.x}, ${target.y}`);
        this.events.emit('skill_entity:created', { entity: area });
    }
}

export class ThunderCloud extends Skill {
    constructor(events) {
        super(
            'Thunder Cloud', 'Lightning',
            'Summon a thunder cloud that slowly drifts forward, periodically damaging enemies and applying Static Field.',
            20, 30, 240, events, 'Point', false
        );
        this.speed = 1.5;
        this.hitbox = 80;
        this.damage = 12;
        this.duration = 180;
        this.effectPeriod = 30;
        this.staticFieldDuration = 120;
    }

    upgrade() {
        super.upgrade();
        this.hitbox = 100;
        this.damage = 16;
        this.duration = 240;
        this.description = 'Thunder Cloud lasts longer, covers a wider area, and deals more damage each pulse.';
    }

    casted(target, caster, source, tick) {
        super.casted();
        const casterId = caster?.name ?? caster;
        const totalDamage = this.getSpellDamage(this.damage, caster);
        if (!target || !source) {
            return;
        }

        const staticFieldBuff = new Buff(
            'Static Field',
            'Affected by a charged static field.',
            'rgba(255, 255, 120, 1)',
            this.staticFieldDuration,
            () => {},
            false
        );

        const cloud = new Area(
            `${casterId}_thunder_cloud_${tick}`,
            { x: source.x, y: source.y },
            this.speed,
            this.hitbox,
            { x: target.x, y: target.y },
            (unit) => {
                if (!unit?.alive || !unit.alive()) {
                    return;
                }

                unit.takeDamage(totalDamage);
                unit.addBuff(staticFieldBuff);
            },
            this.duration,
            this.effectPeriod,
            this.range
        );

        this.events.emit('skill_entity:created', { entity: cloud });
    }
}

export class ChainLightning extends Skill {
    constructor(events) {
        super(
            'Chain Lightning', 'Lightning',
            'Strike a target with lightning, then chain to nearby enemies, damaging and applying Static Field to each one hit.',
            16, 25, 220, events, 'Unit', false
        );
        this.damage = 14;
        this.maxTargets = 4;
        this.chainRange = 140;
        this.staticFieldDuration = 120;
    }

    upgrade() {
        super.upgrade();
        this.damage = 18;
        this.chainRange = 170;
        this.description = 'Chain Lightning deals more damage and can jump farther between enemies.';
    }

    casted(target, caster) {
        super.casted();
        if (!target?.alive || !target.alive()) {
            return;
        }
        const totalDamage = this.getSpellDamage(this.damage, caster);

        const enemies = this.events?.enemyRegistry instanceof Map ? this.events.enemyRegistry : new Map();
        const hitUnits = new Set();
        const staticFieldBuff = new Buff(
            'Static Field',
            'Affected by a charged static field.',
            'rgba(255, 255, 120, 1)',
            this.staticFieldDuration,
            () => {},
            false
        );

        let currentTarget = target;
        let remainingChains = this.maxTargets;

        while (currentTarget && remainingChains > 0) {
            currentTarget.takeDamage(totalDamage);
            currentTarget.addBuff(staticFieldBuff);
            hitUnits.add(currentTarget.id);
            remainingChains -= 1;

            if (remainingChains <= 0) {
                break;
            }

            let nextTarget = null;
            let nearestDistance = Number.POSITIVE_INFINITY;

            for (const enemy of enemies.values()) {
                if (!enemy?.alive || !enemy.alive() || hitUnits.has(enemy.id)) {
                    continue;
                }

                const distance = currentTarget.getDistance(enemy.position);
                if (distance > this.chainRange || distance >= nearestDistance) {
                    continue;
                }

                nextTarget = enemy;
                nearestDistance = distance;
            }

            currentTarget = nextTarget;
        }
    }
}

export class BallLightning extends Skill {
    constructor(events) {
        super(
            'Ball Lightning', 'Lightning',
            'Transform into a ball of lightning, gaining speed, becoming immune to damage, and shocking enemies you pass through.',
            24, 35, 0, events, null, false
        );
        this.duration = 120;
        this.damage = 18;
        this.hitbox = 30;
        this.effectPeriod = 1;
        this.moveSpeedBonus = 3;
        this.staticFieldDuration = 120;
    }

    upgrade() {
        super.upgrade();
        this.duration = 150;
        this.damage = 24;
        this.moveSpeedBonus = 4;
        this.description = 'Ball Lightning lasts longer, moves faster, and deals more damage on contact.';
    }

    casted(caster, tick) {
        super.casted();
        if (!caster) {
            return;
        }
        const totalDamage = this.getSpellDamage(this.damage, caster);

        const staticFieldBuff = new Buff(
            'Static Field',
            'Affected by a charged static field.',
            'rgba(255, 255, 120, 1)',
            this.staticFieldDuration,
            () => {},
            false
        );

        const ballLightningBuff = new Buff(
            'Ball Lightning',
            'Transformed into ball lightning: faster, invulnerable, and unable to cast other skills.',
            'rgba(180, 220, 255, 1)',
            this.duration,
            (unit) => {
                unit.speed += this.moveSpeedBonus;
                unit.hitbox = this.hitbox;
                unit.invulnerable = true;
                unit.skillCastingDisabled = true;
            },
            true
        );

        caster.speed += this.moveSpeedBonus;
        caster.hitbox = this.hitbox;
        caster.invulnerable = true;
        caster.skillCastingDisabled = true;
        caster.addBuff(ballLightningBuff);

        const aura = new Aura(
            `${caster.name}_ball_lightning_${tick}`,
            caster,
            this.hitbox,
            0,
            null,
            this.duration,
            this.effectPeriod
        );

        aura.hitUnits = new Set();
        aura.hit = (unit) => {
            if (!unit?.alive || !unit.alive() || aura.hitUnits.has(unit.id)) {
                return;
            }

            aura.hitUnits.add(unit.id);
            unit.takeDamage(totalDamage);
            unit.addBuff(staticFieldBuff);
        };

        aura.updateMovement = () => {
            if (!aura.source?.alive || !aura.source.alive()) {
                aura.finished = true;
                return;
            }

            aura.position = { x: aura.source.position.x, y: aura.source.position.y };
            aura.hitbox = aura.source.hitbox;
            aura.velocity.vx = 0;
            aura.velocity.vy = 0;
        };

        this.events.emit('skill_entity:created', { entity: aura });
    }
}

export class StaticExplosion extends Skill {
    constructor(events) {
        super(
            'Static Explosion', 'Lightning',
            'Detonate Static Field on all affected enemies, dealing damage and stunning them.',
            30, 40, 0, events, null, false
        );
        this.damage = 20;
        this.stunDuration = 45;
    }

    upgrade() {
        super.upgrade();
        this.damage = 28;
        this.stunDuration = 60;
        this.description = 'Static Explosion deals more damage and stuns enemies for longer.';
    }

    casted(caster) {
        super.casted();
        if (!caster) {
            return;
        }
        const totalDamage = this.getSpellDamage(this.damage, caster);

        const enemies = this.events?.enemyRegistry instanceof Map ? this.events.enemyRegistry : new Map();
        const stunBuff = new Buff(
            'Static Explosion Stun',
            'Stunned by Static Explosion.',
            'rgba(255, 255, 180, 1)',
            this.stunDuration,
            (unit) => {
                unit.speed = 0;
            },
            false
        );

        for (const enemy of enemies.values()) {
            if (!enemy?.alive || !enemy.alive()) {
                continue;
            }

            const hasStaticField = enemy.buffs?.some((buff) => buff.name === 'Static Field');
            if (!hasStaticField) {
                continue;
            }

            enemy.removeBuff('Static Field');
            enemy.takeDamage(totalDamage);
            if (enemy.alive()) {
                enemy.addBuff(stunBuff);
            }
        }
    }
}

export class ElectromagneticField extends Skill {
    constructor(events) {
        super(
            'Electromagnetic Field', 'Lightning',
            'Generate an electromagnetic aura that slows nearby enemies.',
            0, 0, 0, events, null, true
        );
        this.hitbox = 120;
        this.slowRatio = 0.1;
        this.slowDuration = 2;
        this.effectPeriod = 1;
    }

    upgrade() {
        super.upgrade();
        this.hitbox = 150;
        this.slowRatio = 0.2;
        this.description = 'Electromagnetic Field has a wider aura and slows nearby enemies more strongly.';
    }

    applyTo(hero) {
        if (!hero) {
            return;
        }

        const slowBuff = new Buff(
            'Electromagnetic Field Slow',
            'Slowed by Electromagnetic Field.',
            'rgba(180, 220, 255, 1)',
            this.slowDuration,
            (unit) => {
                unit.speed = Math.max(0, unit.baseSpeed - unit.baseSpeed * this.slowRatio);
            },
            false
        );

        const ensureAura = () => {
            if (!hero.alive() || (hero._electromagneticFieldAura && !hero._electromagneticFieldAura.finished)) {
                return;
            }

            const aura = new Aura(
                `${hero.name}_electromagnetic_field`,
                hero,
                this.hitbox,
                0,
                (unit) => {
                    unit.addBuff(slowBuff);
                },
                Number.POSITIVE_INFINITY,
                this.effectPeriod
            );

            hero._electromagneticFieldAura = aura;
            this.events.emit('skill_entity:created', { entity: aura });
        };

        const buff = new Buff(
            'Electromagnetic Field',
            'Continuously emits an aura that slows nearby enemies.',
            'rgba(180, 220, 255, 1)',
            Number.POSITIVE_INFINITY,
            () => {
                ensureAura();
                if (hero._electromagneticFieldAura && !hero._electromagneticFieldAura.finished) {
                    hero._electromagneticFieldAura.hitbox = this.hitbox;
                }
            },
            true
        );

        hero.addBuff(buff);
        ensureAura();
    }
}
