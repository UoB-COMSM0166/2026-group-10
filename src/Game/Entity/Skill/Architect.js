import Skill from './Skill.js';
import Buff from './Buff.js';
import { Tower } from './SkillEntity.js';

const MAX_ACTIVE_TOWERS = 9;

function getActiveTowerCount(events) {
    const registry = events?.skillEntityRegistry;
    if (!(registry instanceof Map)) {
        return 0;
    }

    let count = 0;
    for (const entity of registry.values()) {
        if (entity?.category === 'Tower' && !entity.finished) {
            count += 1;
        }
    }

    return count;
}

function failTowerPlacement() {
    return {
        ok: false,
        code: 409,
        message: `Tower limit reached. Maximum ${MAX_ACTIVE_TOWERS} towers can exist at the same time.`,
    };
}

class FlameTowerEntity extends Tower {
    constructor(id, position, hitbox, events, duration, attackRange, damage, armorReduction, source = null) {
        super(id, position, hitbox, events, duration, attackRange, 1, 0, 0, damage, source);
        this.armorReduction = Number(armorReduction);
        this.projectileName = 'flame';
    }

    attack(target) {
        if (!target?.alive || !target.alive()) {
            return;
        }

        target.takeDamage(this.damage, this.source);
        const nextBaseArmor = target.getBaseStat('Armor') - this.armorReduction;
        target.baseStats.set('Armor', nextBaseArmor);
        target.setStat('Armor', target.getStat('Armor') - this.armorReduction);
    }

    update(_, enemies) {
        if (this.finished) {
            return;
        }

        if (this.duration <= 0) {
            this.finished = true;
            return;
        }

        const target = this.updateTarget(enemies, this.attackRange, this.attackRange);
        if (target) {
            this.attack(target);
        }

        this.duration -= 1;
    }
}

class FrostTowerEntity extends Tower {
    constructor(id, position, hitbox, events, duration, auraRadius, attackInterval, damage, slowRatio, slowDuration, source = null) {
        super(id, position, hitbox, events, duration, auraRadius, attackInterval, 0, 0, damage, source);
        this.auraRadius = Number(auraRadius);
        this.slowRatio = Number(slowRatio);
        this.slowDuration = Number(slowDuration);
        this.projectileName = 'frost';
    }

    createSlowBuff() {
        return new Buff(
            'FrostTower Slow',
            'Slowed by FrostTower aura.',
            'rgba(0, 153, 255, 1)',
            this.slowDuration,
            (unit) => {
                unit.setStat('Speed', Math.max(0, unit.getBaseStat('Speed') * (1 - this.slowRatio)));
            },
            false
        );
    }

    pulse(enemies) {
        if (!(enemies instanceof Map)) {
            return;
        }

        const slowBuff = this.createSlowBuff();
        for (const enemy of enemies.values()) {
            if (!enemy?.alive || !enemy.alive()) {
                continue;
            }

            if (this.getDistance(enemy.position) > this.auraRadius) {
                continue;
            }

            enemy.takeDamage(this.damage, this.source);
            if (enemy?.alive && enemy.alive()) {
                enemy.addBuff(slowBuff);
            }
        }
    }

    update(_, enemies) {
        if (this.finished) {
            return;
        }

        if (this.duration <= 0) {
            this.finished = true;
            return;
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown -= 1;
        } else {
            this.pulse(enemies);
            this.attackCooldown = this.attackInterval;
        }

        this.duration -= 1;
    }
}

export class ArrowTower extends Skill {
    constructor(events) {
        super(
            'ArrowTower', 'Physics',
            'Build an arrow tower at the target point.',
            0, 40, 600, events, 'Point', false
        );
        this.duration = Number.MAX_SAFE_INTEGER;
        this.attackRange = 150;
        this.attackInterval = 40;
        this.damage = 15;
        this.towerHitbox = 12;
        this.arrowSpeed = 8;
        this.arrowHitbox = 4;
    }

    casted(target, caster, _, tick) {
        if (!target || !caster) {
            return { ok: false, code: 400, message: 'Tower target point is required.' };
        }

        if (getActiveTowerCount(this.events) >= MAX_ACTIVE_TOWERS) {
            return failTowerPlacement();
        }

        super.casted();
        const casterId = caster?.name ?? caster;
        const tower = new Tower(
            `${casterId}_arrow_tower_${tick}`,
            { x: Number(target.x) || 0, y: Number(target.y) || 0 },
            this.towerHitbox,
            this.events,
            this.duration,
            this.attackRange,
            this.attackInterval,
            this.arrowSpeed,
            this.arrowHitbox,
            this.damage,
            caster,
            this.attackRange,
            false,
            'arrow',
            true
        );

        this.events.emit('skill_entity:created', { entity: tower });
        return { ok: true };
    }
}

export class RockTower extends Skill {
    constructor(events) {
        super(
            'RockTower', 'Physics',
            'Build a rock tower at the target point.',
            0, 60, 600, events, 'Point', false
        );
        this.duration = Number.MAX_SAFE_INTEGER;
        this.attackRange = 130;
        this.attackInterval = 90;
        this.damage = 60;
        this.towerHitbox = 12;
        this.rockSpeed = 2;
        this.rockHitbox = 30;
        this.rockMaxDistance = 130;
    }

    casted(target, caster, _, tick) {
        if (!target || !caster) {
            return { ok: false, code: 400, message: 'Tower target point is required.' };
        }

        if (getActiveTowerCount(this.events) >= MAX_ACTIVE_TOWERS) {
            return failTowerPlacement();
        }

        super.casted();
        const casterId = caster?.name ?? caster;
        const tower = new Tower(
            `${casterId}_rock_tower_${tick}`,
            { x: Number(target.x) || 0, y: Number(target.y) || 0 },
            this.towerHitbox,
            this.events,
            this.duration,
            this.attackRange,
            this.attackInterval,
            this.rockSpeed,
            this.rockHitbox,
            this.damage,
            caster,
            this.rockMaxDistance,
            true,
            'rock',
            false
        );

        this.events.emit('skill_entity:created', { entity: tower });
        return { ok: true };
    }
}

export class FlameTower extends Skill {
    constructor(events) {
        super(
            'FlameTower', 'Physics',
            'Build a flame tower at the target point.',
            0, 100, 600, events, 'Point', false
        );
        this.duration = Number.MAX_SAFE_INTEGER;
        this.attackRange = 160;
        this.damage = 0.3;
        this.armorReduction = 0.1;
        this.towerHitbox = 12;
    }

    casted(target, caster, _, tick) {
        if (!target || !caster) {
            return { ok: false, code: 400, message: 'Tower target point is required.' };
        }

        if (getActiveTowerCount(this.events) >= MAX_ACTIVE_TOWERS) {
            return failTowerPlacement();
        }

        super.casted();
        const casterId = caster?.name ?? caster;
        const tower = new FlameTowerEntity(
            `${casterId}_flame_tower_${tick}`,
            { x: Number(target.x) || 0, y: Number(target.y) || 0 },
            this.towerHitbox,
            this.events,
            this.duration,
            this.attackRange,
            this.damage,
            this.armorReduction,
            caster
        );

        this.events.emit('skill_entity:created', { entity: tower });
        return { ok: true };
    }
}

export class FrostTower extends Skill {
    constructor(events) {
        super(
            'FrostTower', 'Physics',
            'Build a frost tower at the target point.',
            0, 80, 600, events, 'Point', false
        );
        this.duration = Number.MAX_SAFE_INTEGER;
        this.auraRadius = 150;
        this.attackInterval = 60;
        this.damage = 5;
        this.slowRatio = 0.3;
        this.slowDuration = 90;
        this.towerHitbox = 12;
    }

    casted(target, caster, _, tick) {
        if (!target || !caster) {
            return { ok: false, code: 400, message: 'Tower target point is required.' };
        }

        if (getActiveTowerCount(this.events) >= MAX_ACTIVE_TOWERS) {
            return failTowerPlacement();
        }

        super.casted();
        const casterId = caster?.name ?? caster;
        const tower = new FrostTowerEntity(
            `${casterId}_frost_tower_${tick}`,
            { x: Number(target.x) || 0, y: Number(target.y) || 0 },
            this.towerHitbox,
            this.events,
            this.duration,
            this.auraRadius,
            this.attackInterval,
            this.damage,
            this.slowRatio,
            this.slowDuration,
            caster
        );

        this.events.emit('skill_entity:created', { entity: tower });
        return { ok: true };
    }
}

export class Demolish extends Skill {
    constructor(events) {
        super(
            'Demolish', 'Physics',
            'Destroy a target tower and restore mana.',
            0, 0, 600, events, 'Tower', false
        );
        this.manaRefund = 20;
    }

    casted(target, caster) {
        super.casted();
        if (!target || target.category !== 'Tower' || target.finished) {
            return;
        }

        target.finished = true;
        if (caster?.restoreMP) {
            caster.restoreMP(this.manaRefund);
        }
    }
}

export class Poverty extends Skill {
    constructor(events) {
        super(
            'Poverty', 'Physics',
            'Objective gains 0.1 HP regeneration per frame. When there are no defensive towers on the field and current MP is below 40, Architect commits suicide.',
            0, 0, 0, events, null, true
        );
    }
}
