import Entity from '../Entity.js';

export default class AreaEffect extends Entity {
    constructor(id, position, hitbox, duration, damagePerTrigger, damagePeriod, gameManager) {
        super(id, { x: position.x, y: position.y }, 0, hitbox);
        this.category = 'Area';
        this.duration = duration || 0;
        this.damage = damagePerTrigger || 0;
        this.damagePeriod = Math.max(1, damagePeriod || 1);
        this.damageCountdown = this.damagePeriod;
        this.gameManager = gameManager;
        this.destroyed = false;
    }

    destroy() {
        this.destroyed = true;
    }

    containsPoint(x, y) {
        const halfW = (this.hitbox?.width || 0) / 2;
        const halfH = (this.hitbox?.height || 0) / 2;

        return (
            x >= this.position.x - halfW &&
            x <= this.position.x + halfW &&
            y >= this.position.y - halfH &&
            y <= this.position.y + halfH
        );
    }

    applyDamageToEnemies() {
        const enemies = this.gameManager?.enemies || {};

        for (const enemy of Object.values(enemies)) {
            if (!enemy || !enemy.position) {
                continue;
            }

            if (this.containsPoint(enemy.position.x, enemy.position.y)) {
                if (typeof enemy.takeDamage === 'function') {
                    enemy.takeDamage(this.damage);
                } else if (typeof enemy.currentHP === 'number') {
                    enemy.currentHP = Math.max(0, enemy.currentHP - this.damage);
                }
            }
        }
    }

    update() {
        if (this.destroyed) {
            return;
        }

        this.damageCountdown -= 1;
        if (this.damageCountdown <= 0) {
            this.applyDamageToEnemies();
            this.damageCountdown = this.damagePeriod;
        }

        this.duration -= 1;

        if (this.duration <= 0) {
            this.destroy();
        }
    }
}
