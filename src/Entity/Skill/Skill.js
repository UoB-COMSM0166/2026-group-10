export default class Skill {
    constructor(json) {
        // 技能基本信息
        this.name = json.name;
        // "TargetUnit", "Area", "Passive", "SelfBuff", "Projectile"
        this.category = json.category;
        this.description = json.description;

        // 数值面板
        this.damage = json.damage || null;
        this.cooldown = json.cooldown || 0;
        this.currentCooldown = 0;
        this.manaCost = json.manaCost || 0;
        this.speed = json.speed || null;
        this.hitbox = json.hitbox || null;
        this.damagePeriod = Math.max(1, json.damagePeriod || 1);

        // 效果面板
        // "Slow", "Stun", "DamageOverTick", etc.
        this.effectStatus = json.effectStatus || null;
        this.effectType = json.effectType || null;
        this.effectValue = json.effectValue || null;
        this.duration = json.duration || null;
    }

    canCast() {
        return this.currentCooldown <= 0;
    }

    startCooldown() {
        this.currentCooldown = this.cooldown;
    }

    tickCooldown() {
        if (this.currentCooldown > 0) {
            this.currentCooldown -= 1;
        }
    }
}
