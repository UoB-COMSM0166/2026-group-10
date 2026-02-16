export class Entity {
    // Every thing is an entity, Hero, Enemy, Projectile(Bullet, Fireball), status effect, etc.)

    constructor(id) {
        this.id = id;
        this.components = {
            // position: Map of entity ID to { x, y }
            position: null,
            // velocity: Map of entity ID to { vx, vy }
            velocity: null,
            // target: a pointer to the target entity
            target: null
        };
    }

    addComponent(type, data) {
        if (!this.components[type]) {
            this.components[type] = new Map();
            this.components[type].set(this.id, data);
        }
    }

    removeComponent(type) {
        delete this.components[type];
    }

    setComponent(type, data) {
        if (this.components[type]) {
            this.components[type].set(this.id, data);
        }
    }

    getComponent(type) {
        if (this.components[type]) {
            return this.components[type].get(this.id);
        }
        return null;
    }
}