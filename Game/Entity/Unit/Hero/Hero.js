import Unit from '../Unit.js';

const BASE_RESPAWN_CD = 600;  // Ticks

export default class Hero extends Unit {
    constructor(
        id, name, position, speed, hitbox, hp, mp,
        description, armor, attackAmp, spellAmp,
        events, ui, clock, category
    ) {
        super(id, position, speed, hitbox, hp, mp);
        this.name = String(name);
        this.events = events;
        this.ui = ui;
        this.clock = clock;
        this.description = String(description);

        this.baseArmor = Number(armor);
        this.armor = this.baseArmor;
        this.baseAttackAmp = Number(attackAmp);
        this.attackAmp = this.baseAttackAmp
        this.baseSpellAmp = Number(spellAmp);
        this.spellAmp = this.baseSpellAmp;

        this.respawnCD = BASE_RESPAWN_CD;
        this.active = false;
        this.remainingRespawnCD = 0;
        this.spawnPosition = position;

        this.gold = 310;
        this.castState = null;

        this.speedLevel = 0;
        this.armorLevel = 0;
        this.attackAmpLevel = 0;
        this.spellAmpLevel = 0;
        this.spellSlotLevel = 0;

        this.category = category;
        this.skill = new Map();
        this.skill.set('A', null);
        this.skill.set('Q', null);
        this.skill.set('W', null);
        this.skill.set('E', null);
        this.skill.set('R', null);
        this.skill.set('P', null);
        this.applyPassiveSkills();
    }

    takeDamage(amount, source = null, options = {}) {
        super.takeDamage(amount);
        if (!this.alive()) {
            this.die();
        }
    }

    die() {
        if (this.remainingRespawnCD > 0) return;
        this.interruptCast();
        this.stop();
        this.clearWaypoints();
        this.currentHP = 0;
        this.remainingRespawnCD = this.respawnCD;
        this.events.emit('hero:death', { hero: this, respawnTick: this.remainingRespawnCD });
        this.ui.emit('hero:death', { hero: this, respawnTick: this.remainingRespawnCD });
    }

    updateMovement() {
        if (!this.alive() || this.isCasting()) { return; }
        super.updateMovement();
    }

    updateCasting() {
        if (!this.castState) {
            return;
        }

        if (!this.alive()) {
            this.interruptCast();
            return;
        }

        if (typeof this.castState.onTick === 'function') {
            this.castState.onTick();
        }

        this.castState.remaining -= 1;
        if (this.castState.remaining > 0) {
            return;
        }

        const onComplete = this.castState.onComplete;
        this.castState = null;
        if (typeof onComplete === 'function') {
            onComplete();
        }
    }

    updateBuffs() {
        this.speed = this.baseSpeed;
        this.hitbox = this.baseHitbox;
        this.armor = this.baseArmor;
        this.hpRegen = this.baseHpRegen;
        this.mpRegen = this.baseMpRegen;
        this.attackAmp = this.baseAttackAmp + this.attackAmpLevel;
        this.spellAmp = this.baseSpellAmp + this.spellAmpLevel;
        this.invulnerable = false;
        this.skillCastingDisabled = false;
        this.onIncomingDamage = null;
        this.applyBuffEffect();
        this.buffs = this.buffs.filter((buff) => {
            buff.remaining -= 1;
            return buff.remaining > 0;
        });
    }

    updateSkill() {
        for (const [slot, skill] of this.skill.entries()) {
            if (skill) {
                skill.coolingDown();
                skill.updateToggle(this, this.clock.now());
                if (slot === 'A' && skill.currentCooldown > 0 && skill.cooldownAcceleration > 0) {
                    skill.cooldownAccelerationCarry += skill.cooldownAcceleration;
                    const extraCooldownTicks = Math.floor(skill.cooldownAccelerationCarry);
                    if (extraCooldownTicks > 0) {
                        skill.currentCooldown = Math.max(0, skill.currentCooldown - extraCooldownTicks);
                        skill.cooldownAccelerationCarry -= extraCooldownTicks;
                    }
                }
                skill.cooldownAcceleration = 0;
                skill.bonusDamage = 0;
                skill.lifestealRatio = 0;
            }
        }
    }

    upgrade(category) {
        let goldRequired = 0;
        switch (category) {
            case 'SpellSlot':
                if (this.spellSlotLevel >= 3) return { success: false, message: 'Spell Slot Level Maxed Out.' };
                goldRequired = this.spellSlotLevel * 40 + 20;
                if (goldRequired > this.gold) return { success: false, message: 'Insufficient Gold.' };
                this.gold -= goldRequired;
                this.spellSlotLevel += 1;
                return { success: true, message: 'New Spell Slot Unlocked.' };
            case 'Speed':
                goldRequired = this.speedLevel * 40 + 20;
                if (goldRequired > this.gold) return { success: false, message: 'Insufficient Gold.' };
                this.gold -= goldRequired;
                this.speedLevel += 1;
                return { success: true, message: `Speed Upgraded to Lv. ${this.speedLevel}` };
            case 'Armor':
                goldRequired = this.armorLevel * 40 + 20;
                if (goldRequired > this.gold) return { success: false, message: 'Insufficient Gold.' };
                this.gold -= goldRequired;
                this.armorLevel += 1;
                return { success: true, message: `Armor Upgraded to Lv. ${this.armorLevel}` };
            case 'AttackAmp':
                goldRequired = this.attackAmpLevel * 40 + 20;
                if (goldRequired > this.gold) return { success: false, message: 'Insufficient Gold.' };
                this.gold -= goldRequired;
                this.attackAmpLevel += 1;
                this.attackAmp = this.baseAttackAmp + this.attackAmpLevel;
                return { success: true, message: `Attack Amplification Upgraded to Lv. ${this.attackAmpLevel}` };
            case 'SpellAmp':
                goldRequired = this.spellAmpLevel * 40 + 20;
                if (goldRequired > this.gold) return { success: false, message: 'Insufficient Gold.' };
                this.gold -= goldRequired;
                this.spellAmpLevel += 1;
                return { success: true, message: `Spell Amplification Upgraded to Lv. ${this.spellAmpLevel}` };
            default:
                return { success: false, message: 'Unknown Category. This should not happen.' };
        }
    }

    upgradeSkill(slot, name) {
        const findSkill = this.skillTree.get(slot)?.find(s => s.name === name);
        if (findSkill) {
            findSkill.upgrade();
            return findSkill;
        }

        return null;
    }

    stop() {
        super.stop();
        this.clearWaypoints();
        this.removeTarget();
    }

    startCast(duration, onComplete, onTick = null) {
        const castDuration = Math.max(0, Number(duration) || 0);

        this.stop();
        if (castDuration === 0) {
            if (typeof onComplete === 'function') {
                onComplete();
            }
            return;
        }

        this.castState = {
            remaining: castDuration,
            onComplete,
            onTick: typeof onTick === 'function' ? onTick : null,
        };
    }

    interruptCast() {
        this.castState = null;
    }

    isCasting() {
        return this.castState !== null;
    }

    setRenderRange(skill) {
        this.renderRange = Number(skill.range);
    }

    clearRenderRange() {
        this.renderRange = null;
    }

    applyPassiveSkills() {
        for (const skill of this.skill.values()) {
            if (skill?.passive && typeof skill.applyTo === 'function') {
                skill.applyTo(this);
            }
        }
    }

    inFountain(objectivePosition) {
        return this.getDistance(objectivePosition) <= 100;
    }
}
