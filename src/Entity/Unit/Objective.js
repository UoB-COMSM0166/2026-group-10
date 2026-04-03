import Unit from './Unit.js';

export default class Objective extends Unit {
    constructor(objective, events) {
        super("objective", objective.position, 0, objective.hitbox, objective.hp, 0, objective.sprite);
        this.events = events;
        this.registerEventHandlers();
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
