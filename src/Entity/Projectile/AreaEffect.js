import Entity from '../Entity.js';

export default class AreaEffect extends Entity {
    constructor(id, position, hitbox, duration, damagePerTrigger, damagePeriod, gameManager, effectStatus = null, effectDuration = 0) {
        const normalizedRadius = AreaEffect.normalizeRadius(hitbox);
        super(id, { x: position.x, y: position.y }, 0, normalizedRadius);
        this.category = 'Area';
        this.duration = duration || 0;
        this.damage = damagePerTrigger || 0;
        this.effectStatus = (effectStatus && typeof effectStatus === 'object') ? { ...effectStatus } : null;
        this.effectDuration = Math.max(0, Number(effectDuration || 0));
        this.damagePeriod = Math.max(1, damagePeriod || 1);
        this.damageCountdown = this.damagePeriod;
        this.gameManager = gameManager;
        this.destroyed = false;
    }

    static normalizeRadius(hitbox) {
        if (typeof hitbox === 'number') {
            return Math.max(0, hitbox);
        }

        if (hitbox && typeof hitbox === 'object') {
            const width = Number(hitbox.width || 0);
            const height = Number(hitbox.height || 0);
            return Math.max(0, Math.max(width, height) / 2);
        }

        return 0;
    }

    destroy() {
        this.destroyed = true;
    }

    containsPoint(x, y) {
        const radius = Math.max(0, Number(this.hitbox || 0));
        const dx = x - this.position.x;
        const dy = y - this.position.y;
        return dx * dx + dy * dy <= radius * radius;
    }

    applyDamageToEnemies() {
        const collection = this.gameManager?.enemies;
        const enemies = collection instanceof Map ? collection.values() : Object.values(collection || {});

        for (const enemy of enemies) {
            if (!enemy || !enemy.position) {
                continue;
            }

            if (this.containsPoint(enemy.position.x, enemy.position.y)) {
                this.emitCollisionWith(enemy, { collisionType: 'area_tick' });
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
