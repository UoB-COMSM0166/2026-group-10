import Projectile from './Projectile.js';

// Missile class represents a homing projectile.
export default class Missile extends Projectile {
    constructor(id, position, speed, hitbox, targetUnit, damage, gameManager = null) {
        super(
            id,
            { x: position.x, y: position.y },
            speed,
            hitbox,
            targetUnit?.position || position,
            damage,
            gameManager
        );
        this.category = 'Missile';
        this.target = targetUnit || null;
    }

    hasValidTarget() {
        if (!this.target || !this.target.position) {
            return false;
        }
        if (typeof this.target.currentHP === 'number') {
            return this.target.currentHP > 0;
        }
        return true;
    }

    update(mapWidth, mapHeight) {
        if (this.destroyed) {
            return;
        }

        if (!this.hasValidTarget()) {
            this.destroy();
            return;
        }

        // Recalculate every tick to keep tracking current target position.
        this.navigate(this.target.position);
        this.calculateMovement();

        if (this.hasValidTarget()) {
            if (this.collidesWith(this.target, 5, 20)) {
                this.emitCollisionWith(this.target, { collisionType: 'missile_hit' });
                this.destroy();
                return;
            }
        }

        if (this.isOutOfBounds(mapWidth, mapHeight)) {
            this.destroy();
        }
    }
}
