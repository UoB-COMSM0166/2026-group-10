export default class Skill {
    constructor(name, category, description, cooldown, manaCost, range, events, targetCategory, passive) {
        this.name = String(name);
        this.category = String(category);
        this.description = String(description);
        this.cooldown = Number(cooldown);
        this.currentCooldown = 0;
        this.manaCost = Number(manaCost);
        this.range = range;
        this.upgraded = false;
        this.events = events;
        this.targetCategory = targetCategory;
        this.passive = passive;
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

    coolingDown() {
        if (this.currentCooldown > 0) {
            this.currentCooldown--;
        }
    }
}
