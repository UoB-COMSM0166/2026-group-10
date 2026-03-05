import Entity from '../Entity.js';

export default class Unit extends Entity {
    constructor(id, position, speed, hitbox, hp, mp) {
        super(id, position, speed, hitbox);

        this.baseMaxHP = hp;
        this.baseMaxMP = mp;

        this.maxHP = hp;
        this.maxMP = mp;
        this.currentHP = hp;
        this.currentMP = mp;
        this.buffs = [];
        this.statsDirty = false;
        this._buffBaseStats = {};
        this._trackedBuffKeys = new Set();
    }

    takeDamage(amount) {
        this.currentHP = Math.max(0, this.currentHP - amount);
    }

    heal(amount) {
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    }

    die() {
        // Handle unit death (e.g., remove from game, play animation, etc.)
    }

    addBuff(buff) {
        if (!buff) {
            return null;
        }

        const existing = this.buffs.find((it) => it && buff && it.name === buff.name);
        if (existing) {
            existing.description = buff.description;
            existing.status = buff.status;
            existing.duration = buff.duration;
            existing.currentDuration = buff.duration === -1 ? -1 : buff.duration;
            this.statsDirty = true;
            this.emitUnitEvent('unit:buff:applied', { unit: this, buff: existing, refreshed: true });
            this.recalculateStatsFromBuffs('buff_applied');
            return existing;
        }

        this.buffs.push(buff);
        this.statsDirty = true;
        this.emitUnitEvent('unit:buff:applied', { unit: this, buff, refreshed: false });
        this.recalculateStatsFromBuffs('buff_applied');
        return buff;
    }

    emitUnitEvent(eventName, payload) {
        if (this.events && typeof this.events.emit === 'function') {
            this.events.emit(eventName, payload);
        }
    }

    applyBuffEffects() {
        const effectKeys = new Set();

        for (const buff of this.buffs) {
            if (!buff || !buff.status) {
                continue;
            }
            for (const [key, value] of Object.entries(buff.status)) {
                if (typeof value !== 'number') {
                    continue;
                }
                effectKeys.add(key);
                if (!this._trackedBuffKeys.has(key)) {
                    this._trackedBuffKeys.add(key);
                    this._buffBaseStats[key] = typeof this[key] === 'number' ? this[key] : 0;
                }
            }
        }

        for (const key of [...this._trackedBuffKeys]) {
            if (effectKeys.has(key)) {
                continue;
            }
            if (typeof this._buffBaseStats[key] === 'number') {
                this[key] = this._buffBaseStats[key];
            }
            this._trackedBuffKeys.delete(key);
            delete this._buffBaseStats[key];
        }

        for (const key of effectKeys) {
            const base = typeof this._buffBaseStats[key] === 'number' ? this._buffBaseStats[key] : 0;
            let delta = 0;
            for (const buff of this.buffs) {
                if (!buff || !buff.status) {
                    continue;
                }
                const value = buff.status[key];
                if (typeof value === 'number') {
                    delta += value;
                }
            }
            this[key] = base + delta;
        }
    }

    recalculateStatsFromBuffs(source = 'buff_changed') {
        if (!this.statsDirty) {
            return;
        }

        if (typeof this.updateFinalStat === 'function') {
            this.updateFinalStat();
        } else {
            this.applyBuffEffects();
        }

        if (typeof this.emitStatsUpdated === 'function') {
            this.emitStatsUpdated(source);
        }
        this.statsDirty = false;
    }

    tickBuffs(dt) {
        const expiredBuffs = [];

        this.buffs = this.buffs.filter((buff) => {
            if (!buff || buff.currentDuration === undefined || buff.currentDuration === -1) {
                return true;
            }

            buff.currentDuration -= dt;
            if (buff.currentDuration <= 0) {
                expiredBuffs.push(buff);
                return false;
            }
            return true;
        });

        if (expiredBuffs.length > 0) {
            this.statsDirty = true;
            for (const buff of expiredBuffs) {
                this.emitUnitEvent('unit:buff:expired', { unit: this, buff });
            }
        }

        this.recalculateStatsFromBuffs('buff_tick');
    }
}
