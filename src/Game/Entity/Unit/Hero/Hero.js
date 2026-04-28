import Unit from '../Unit.js';

const BASE_RESPAWN_CD = 600;  // Ticks
const SKILL_SLOT_UNLOCK_ORDER = ['W', 'E', 'R'];
const HP_PER_STRENGTH = 20;
const HP_REGEN_PER_STRENGTH = 0.01;

export default class Hero extends Unit {
    constructor(
        id, name, position, speed, hitbox, hp, mp,
        description, armor, strength, intelligence,
        events, clock, category
    ) {
        super(id, position, speed, hitbox, hp, mp);
        this.name = String(name);
        this.events = events;
        // this.ui = ui;
        this.clock = clock;
        this.description = String(description);
        this.baseMaxHP = this.maxHP;

        this.baseStats.set('Armor', Number(armor));
        this.baseStats.set('Strength', Number(strength));
        this.baseStats.set('Intelligence', Number(intelligence));
        this.stats.set('Armor', Number(armor));
        this.stats.set('Strength', Number(strength));
        this.stats.set('Intelligence', Number(intelligence));
        this.syncStatAliases();

        this.respawnCD = BASE_RESPAWN_CD;
        this.active = false;
        this.remainingRespawnCD = 0;
        this.spawnPosition = position;

        this.gold = 1000;
        this.castState = null;

        this.upgradeCost = new Map();
        this.upgradeCost.set('Speed', 100);
        this.upgradeCost.set('Armor', 100);
        this.upgradeCost.set('Strength', 100);
        this.upgradeCost.set('Intelligence', 100);
        this.upgradeCost.set('SpellSlot', 80);

        this.statsGrowth = new Map();
        this.statsGrowth.set('Speed', 0);
        this.statsGrowth.set('Armor', 0);
        this.statsGrowth.set('Strength', 0);
        this.statsGrowth.set('Intelligence', 0);

        this.spellSlotLevel = 0;
        this.spellSlotUpgradeCost = 80;
        this.skillSlotUnlocked = new Map([
            ['A', true],
            ['Q', true],
            ['W', false],
            ['E', false],
            ['R', false],
            ['P', true],
        ]);
        this.nextSkillSlotToUnlock = this.findNextLockedSkillSlot();

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

    collectCoin(amount) {
        this.gold += Number(amount);
        console.log(`${this.name} collected ${amount} gold. Total gold: ${this.gold}`);
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
        // this.ui.emit('hero:death', { hero: this, respawnTick: this.remainingRespawnCD });
    }

    respawn() {
        this.interruptCast();
        this.position = { x: this.spawnPosition.x, y: this.spawnPosition.y };
        this.currentHP = this.maxHP;
        this.remainingRespawnCD = 0;
        this.stop();
        this.clearWaypoints();
        this.events.emit('hero:respawn', { hero: this });
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
        this.stats.set('Strength', this.baseStats.get('Strength'));
        this.stats.set('Intelligence', this.baseStats.get('Intelligence'));
        super.updateBuffs();
        this.syncStatAliases();
        this.applyStrengthStats();
    }

    updateSkill() {
        for (const [slot, skill] of this.skill.entries()) {
            if (skill && this.isSkillSlotUnlocked(slot)) {
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
        const upgradeCategory = String(category ?? '').trim();
        if (upgradeCategory === 'SpellSlot') {
            const slot = this.nextSkillSlotToUnlock;
            if (!slot) {
                return { success: false, message: 'Spell Slot Level Maxed Out.' };
            }

            const goldRequired = this.spellSlotUpgradeCost;
            if (goldRequired > this.gold) {
                return { success: false, message: 'Insufficient Gold.' };
            }

            this.gold -= goldRequired;
            this.skillSlotUnlocked.set(slot, true);
            this.spellSlotLevel += 1;
            this.equipDefaultSkillForSlot(slot);
            this.nextSkillSlotToUnlock = this.findNextLockedSkillSlot();
            this.spellSlotUpgradeCost += 50;
            this.upgradeCost.set('SpellSlot', this.spellSlotUpgradeCost);

            return { success: true, message: `Skill slot ${slot} unlocked.` };
        }

        if (!this.upgradeCost.has(upgradeCategory)) {
            return { success: false, message: 'Unknown Category. This should not happen.' };
        }

        const goldRequired = this.upgradeCost.get(upgradeCategory);
        if (goldRequired > this.gold) {
            return { success: false, message: 'Insufficient Gold.' };
        }

        const statGrowth = Number(this.statsGrowth.get(upgradeCategory)) || 0;
        this.gold -= goldRequired;
        this.baseStats.set(upgradeCategory, (Number(this.baseStats.get(upgradeCategory)) || 0) + statGrowth);
        this.stats.set(upgradeCategory, (Number(this.stats.get(upgradeCategory)) || 0) + statGrowth);
        this.upgradeCost.set(upgradeCategory, goldRequired + 50);
        this.syncStatAliases();

        return { success: true, message: `${upgradeCategory} Upgraded.` };
    }

    upgradeSkill(slot, name) {
        if (!this.isSkillSlotUnlocked(slot)) {
            return null;
        }

        const findSkill = this.skillTree.get(slot)?.find(s => s.name === name);
        if (findSkill) {
            if (findSkill.upgraded) {
                return findSkill;
            }

            const goldRequired = Number(findSkill.upgradeCost) || 0;
            if (goldRequired > this.gold) {
                return null;
            }

            this.gold -= goldRequired;
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

    applyPassiveSkills() {
        for (const [slot, skill] of this.skill.entries()) {
            if (!this.isSkillSlotUnlocked(slot)) {
                continue;
            }

            if (skill?.passive && typeof skill.applyTo === 'function') {
                skill.applyTo(this);
            }
        }
    }

    updatePassiveSkills() {
        for (const [slot, skill] of this.skill.entries()) {
            if (!this.isSkillSlotUnlocked(slot)) {
                continue;
            }

            if (skill?.passive && typeof skill.updatePassive === 'function') {
                skill.updatePassive(this);
            }
        }
    }

    initializeSkillSlots() {
        if (!(this.skillTree instanceof Map)) {
            return;
        }

        for (const [slot, skills] of this.skillTree.entries()) {
            if (!Array.isArray(skills)) {
                continue;
            }

            for (const skill of skills) {
                if (skill) {
                    skill.slot = slot;
                }
            }
        }
    }

    syncStatAliases() {
        this.baseStrength = Number(this.baseStats.get('Strength')) || 0;
        this.strength = Number(this.stats.get('Strength')) || 0;
        this.baseIntelligence = Number(this.baseStats.get('Intelligence')) || 0;
        this.intelligence = Number(this.stats.get('Intelligence')) || 0;
    }

    applyStrengthStats() {
        const previousMaxHP = this.maxHP;
        this.maxHP = this.baseMaxHP + this.strength * HP_PER_STRENGTH;
        this.hpRegen += this.strength * HP_REGEN_PER_STRENGTH;

        if (this.maxHP > previousMaxHP) {
            this.currentHP += this.maxHP - previousMaxHP;
        }

        this.currentHP = Math.min(this.currentHP, this.maxHP);
    }

    normalizeSkillSlot(slot) {
        const normalizedSlot = String(slot ?? '').trim().toUpperCase();
        return this.skillSlotUnlocked.has(normalizedSlot) ? normalizedSlot : '';
    }

    isSkillSlotUnlocked(slot) {
        const normalizedSlot = this.normalizeSkillSlot(slot);
        return normalizedSlot ? Boolean(this.skillSlotUnlocked.get(normalizedSlot)) : false;
    }

    findNextLockedSkillSlot() {
        return SKILL_SLOT_UNLOCK_ORDER.find((slot) => !this.isSkillSlotUnlocked(slot)) ?? null;
    }

    equipDefaultSkillForSlot(slot) {
        const normalizedSlot = this.normalizeSkillSlot(slot);
        if (!normalizedSlot || this.skill.get(normalizedSlot)) {
            return this.skill.get(normalizedSlot) ?? null;
        }

        const availableSkills = this.skillTree?.get(normalizedSlot) ?? [];
        const currentCategory = this.skill.get('A')?.category ?? null;
        const defaultSkill = availableSkills.find((skill) => skill?.category === currentCategory)
            ?? availableSkills.find(Boolean)
            ?? null;
        if (!defaultSkill) {
            return null;
        }

        this.skill.set(normalizedSlot, defaultSkill);
        defaultSkill.slot = normalizedSlot;
        if (normalizedSlot === 'P') {
            this.applyPassiveSkills();
        }

        return defaultSkill;
    }

    changeSkill(slot, skill) {
        const normalizedSlot = this.normalizeSkillSlot(slot);
        if (!skill || !this.isSkillSlotUnlocked(normalizedSlot)) {
            return null;
        }

        this.skill.set(normalizedSlot, skill);
        skill.slot = normalizedSlot;
        if (normalizedSlot === 'P') {
            this.applyPassiveSkills();
        }

        return skill;
    }

    inFountain(objectivePosition) {
        return this.getDistance(objectivePosition) <= 100;
    }
}
