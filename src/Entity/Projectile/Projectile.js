import Entity from '../Entity.js';

// Projectile class represents a moving projectile without target unit.
export default class Projectile extends Entity {
    constructor(id, position, speed, hitbox, targetSpot, damage, gameManager = null) {
        super(id, position, speed, hitbox);
        this.navigate(targetSpot);
        this.category = 'Projectile';
        this.damage = damage;
        this.gameManager = gameManager;
        this.destroyed = false;
    }

    isOutOfBounds(mapWidth, mapHeight) {
        return (
            this.position.x < 0 ||
            this.position.x > mapWidth ||
            this.position.y < 0 ||
            this.position.y > mapHeight
        );
    }

    destroy() {
        this.destroyed = true;
    }

    isEnemyAlive(enemy) {
        if (!enemy || !enemy.position) {
            return false;
        }
        if (typeof enemy.isAlive === 'function') {
            return enemy.isAlive();
        }
        if (typeof enemy.currentHP === 'number') {
            return enemy.currentHP > 0;
        }
        return true;
    }

    checkEnemyCollisionAndDamage() {
        const collection = this.gameManager?.enemies;
        const enemies = collection instanceof Map ? collection.values() : Object.values(collection || {});

        for (const enemy of enemies) {
            if (!this.isEnemyAlive(enemy)) {
                continue;
            }

            if (this.collidesWith(enemy, 5, 20)) {
                this.emitCollisionWith(enemy, { collisionType: 'projectile_hit' });
                this.destroy();
                return;
            }
        }
    }

    update(mapWidth, mapHeight) {
        if (this.destroyed) {
            return;
        }

        this.calculateMovement();
        this.checkEnemyCollisionAndDamage();

        if (this.destroyed) {
            return;
        }

        if (this.isOutOfBounds(mapWidth, mapHeight)) {
            this.destroy();
        }
    }
}
