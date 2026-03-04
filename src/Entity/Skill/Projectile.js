import Entity from '../Entity.js';

export default class Projectile extends Entity {
    constructor(id, position, speed, hitbox, targetSpot, damage) {
        super(id, position, speed, hitbox);
        this.navigate(targetSpot);
        this.damage = damage;
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

    update(mapWidth, mapHeight) {
        this.calculateMovement();
        if (this.isOutOfBounds(mapWidth, mapHeight)) {
            this.destroy();
        }
    }
}