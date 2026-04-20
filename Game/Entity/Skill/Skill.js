export default class Skill {
    constructor(
        name, category, description, cooldown, manaCost, range,
        events, targetCategory, passive, upgradeCost = 0
    ) {
        this.name = String(name);
        this.category = String(category);
        this.description = String(description);
        this.cooldown = Number(cooldown);
        this.currentCooldown = 0;
        this.manaCost = Number(manaCost);
        this.range = range;
        this.upgraded = false;
        this.upgradeCost = upgradeCost || 0;
        this.events = events;
        this.targetCategory = targetCategory;
        this.passive = passive;
        this.bonusDamage = 0;
        this.toggleable = false;
        this.active = false;
        this.onToggleOn = null;
        this.onToggleActive = null;
        this.onToggleOff = null;
    }

    upgrade() {
        this.upgraded = true;
    }

    inRange(distance) {
        return distance <= this.range;
    }

    cooledDown() {
        return this.currentCooldown === 0;
    }

    sufficientMP(MP) {
        return MP >= this.manaCost;
    }

    casted() {
        this.currentCooldown = this.cooldown;
    }

    getAttackDamage(baseDamage, caster, { includeBonusDamage = false } = {}) {
        const damage = Number(baseDamage) || 0;
        const attackAmp = Number(caster?.attackAmp) || 0;
        const bonusDamage = includeBonusDamage ? (Number(this.bonusDamage) || 0) : 0;
        return damage + attackAmp + bonusDamage;
    }

    getSpellDamage(baseDamage, caster) {
        const damage = Number(baseDamage) || 0;
        const spellAmp = Number(caster?.spellAmp) || 0;
        return damage * (1 + spellAmp);
    }

    enableToggle(onToggleOn, onToggleActive, onToggleOff) {
        this.toggleable = true;
        this.onToggleOn = typeof onToggleOn === 'function' ? onToggleOn : null;
        this.onToggleActive = typeof onToggleActive === 'function' ? onToggleActive : null;
        this.onToggleOff = typeof onToggleOff === 'function' ? onToggleOff : null;
    }

    toggle(...args) {
        if (!this.toggleable) {
            return false;
        }

        if (this.active) {
            this.active = false;
            if (typeof this.onToggleOff === 'function') {
                this.onToggleOff(...args);
            }
            return false;
        }

        this.active = true;
        if (typeof this.onToggleOn === 'function') {
            this.onToggleOn(...args);
        }
        return true;
    }

    updateToggle(...args) {
        if (!this.toggleable || !this.active) {
            return;
        }

        if (typeof this.onToggleActive === 'function') {
            this.onToggleActive(...args);
        }
    }

    coolingDown() {
        if (this.currentCooldown > 0) {
            this.currentCooldown--;
        }
    }
}
