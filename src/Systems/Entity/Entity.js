export default class Entity {
    // Every thing is an entity, Hero, Enemy, Projectile(Bullet, Fireball), status effect, etc.)

    constructor(id, name, position) {
        this.id = id;
        this.components = {
            // catagory of the entity
            name: new Map([[this.id, name]]),
            // position: Map of entity ID to { x, y }
            position: new Map([[this.id, position]]),
            // velocity: Map of entity ID to { vx, vy }
            velocity: new Map([[this.id, { vx: 0, vy: 0 }]]),
            waypoints: new Map([[this.id, []]]),
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