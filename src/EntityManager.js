export class EntityManager {
    constructor() {
        this.nextId = 0;
        this.entities = new Set();
        this.components = {
            position: new Map(),
            velocity: new Map(),
            target: new Map(),
            appearance: new Map(),
            input: new Map()
        };
    }

    createEntity() {
        const id = this.nextId++;
        this.entities.add(id);
        return id;
    }

    addComponent(id, type, data) {
        this.components[type].set(id, data);
    }

    getComponent(id, type) {
        return this.components[type].get(id);
    }
}