import Entity from '../Entity.js';

export default class Unit extends Entity {
    constructor(id, position, speed, hitbox, hp, mp) {
        super(id, position, speed, hitbox);
        this.maxHP = Number(hp);
        this.maxMP = Number(mp);
        this.currentHP = Number(hp);
        this.currentMP = Number(mp);

        this.baseStats.set('Armor', 0);
        this.stats.set('Armor', 0);
        this.baseHpRegen = 0;
        this.baseMpRegen = 0;
        this.hpRegen = 0;
        this.mpRegen = 0;
        this.invulnerable = false;
        this.skillCastingDisabled = false;
        this.onIncomingDamage = null;

        this.buffs = [];
    }
    
    // HP & MP受到影响
    takeDamage(amount, source = null, options = {}) {
        if (typeof this.onIncomingDamage === 'function' && !options?.ignoreReactive) {
            this.onIncomingDamage(amount, source, options);
        }

        if (this.invulnerable) {
            return 0;
        }

        const effectiveDamage = Math.max(0.01, amount - this.stats.get('Armor'));
        this.currentHP = Math.max(0, this.currentHP - effectiveDamage);
        return effectiveDamage;
    }

    heal(amount) {
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    }

    consumeMP(amount) {
        this.currentMP = Math.max(0, this.currentMP - amount);
    }
    
    restoreMP(amount) {
        this.currentMP = Math.min(this.maxMP, this.currentMP + amount);
    }

    alive() {
        return this.currentHP > 0;
    }

    getStat(name) {
        return Number(this.stats.get(name)) || 0;
    }

    setStat(name, value) {
        this.stats.set(name, Number(value) || 0);
    }

    addStat(name, value) {
        this.setStat(name, this.getStat(name) + (Number(value) || 0));
    }

    getBaseStat(name) {
        return Number(this.baseStats.get(name)) || 0;
    }

    findNearestEnemy(enemies, range) {
        const searchRange = Number(range);
        if (!(enemies instanceof Map) || searchRange < 0) {
            return null;
        }

        let nearestEnemy = null;
        let nearestDistance = Number.POSITIVE_INFINITY;

        for (const enemy of enemies.values()) {
            if (!enemy?.alive || !enemy.alive()) {
                continue;
            }

            const distance = this.getDistance(enemy.position);
            if (distance > searchRange || distance >= nearestDistance) {
                continue;
            }

            nearestEnemy = enemy;
            nearestDistance = distance;
        }

        return nearestEnemy;
    }

    updateTarget(enemies, attackRange, retainRange = attackRange) {
        const searchRange = Number(attackRange);
        const lockRange = Number(retainRange);
        const currentTarget = this.target;

        if (
            currentTarget?.alive &&
            currentTarget.alive() &&
            this.getDistance(currentTarget.position) <= lockRange
        ) {
            return currentTarget;
        }

        const nextTarget = this.findNearestEnemy(enemies, searchRange);
        if (nextTarget) {
            this.setTarget(nextTarget);
            return nextTarget;
        }

        this.removeTarget();
        return null;
    }

    addBuff(newBuff) {
        const buffToApply = typeof newBuff?.clone === 'function' ? newBuff.clone() : newBuff;
        if (!buffToApply) {
            return;
        }

        for (const buff of this.buffs) {
            if (buff.name === buffToApply.name) {
                buff.description = buffToApply.description;
                buff.icon = buffToApply.icon;
                buff.duration = buffToApply.duration;
                buff.remaining = buffToApply.duration;
                buff.effect = buffToApply.effect;
                buff.positive = buffToApply.positive;
                buff.effectPeriod = buffToApply.effectPeriod;
                buff.elapsed = 0;
                return;
            }
        }

        this.buffs.push(buffToApply);
    }

    removeBuff(buffName) {
        this.buffs = this.buffs.filter((buff) => buff.name !== buffName);
    }

    applyBuffEffect() {
        for (const buff of this.buffs) {
            buff.onEffect(this);
        }
    }

    updateRegeneration() {
        if (this.hpRegen > 0) {
            this.heal(this.hpRegen / 60);
        }
        if (this.mpRegen > 0) {
            this.restoreMP(this.mpRegen / 60);
        }
    }

    updateBuffs() {
        this.stats.set('Speed', this.baseStats.get('Speed'));
        this.stats.set('Armor', this.baseStats.get('Armor'));
        this.hitbox = this.baseHitbox;
        this.hpRegen = this.baseHpRegen;
        this.mpRegen = this.baseMpRegen;
        this.invulnerable = false;
        this.skillCastingDisabled = false;
        this.onIncomingDamage = null;
        this.applyBuffEffect();
        this.buffs = this.buffs.filter((buff) => {
            buff.remaining -= 1;
            return buff.remaining > 0;
        });
    }
}
