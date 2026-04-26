import Unit from './Unit.js';

export default class Objective extends Unit {
    constructor(position, hitbox, hp, events) {
        super("Corona Terrae", position, 0, hitbox, hp, 0);
        this.events = events;
        this.registerEventHandlers();
        this.hpRegen = 0;
    }

    registerEventHandlers() {
        this.events.on('enemy:reached_objective', ({ enemy }) => {
            this.takeDamage(enemy.damage);
            if (!this.alive()) {
                this.events.emit('objective:destroyed');
            }
        });

        this.events.on('objective:repaired', ({ amount }) => {
            this.heal(amount);
        });
    }
}
