import Unit from "../Unit.js";

export default class Enemy extends Unit {
    constructor(id, name, position, speed, hitbox, hp, mp, sprite, events, waypoint, damage, exp) {
        super(id, position, speed, hitbox, hp, mp, sprite);
        this.name = String(name);
        this.finished = false;
        this.events = events;
        this.waypoint = [];
        for (let point of waypoint) {
            this.appendWaypoint(point);
        }
        this.damage = Number(damage);
        this.experience = Number(exp);
        this.diecry = null;
    }

    checkReachedObjective() {
        if (!this.finished && this.waypoint.length === 0) {
            this.finished = true;
            // this.clearEventHandlers();
            this.events.emit('enemy:reached_objective', { enemy: this });
            console.log(`Enemy ${this.id} reached objective.`);
        }
    }

    takeDamage(amount) {
        // console.log(`Enemy ${this.id} takes ${amount} damage.`);
        super.takeDamage(amount);
        if (this.currentHP <= 0) {
            this.die();
        }
    }

    die() {
        if (this.finished) {
            return;
        }
        if (this.diecry) this.diecry();

        this.finished = true;
        this.events.emit('enemy:killed', { id: this.id, experience: this.experience });
    }

    updateMovement() {
        if (this.speed <= 0) { return; }
        this.moveAlongWaypoint();
        this.calculateMovement();
        this.checkReachedObjective();
    }

    update() {
        if (this.finished) return;
        this.updateBuffs();
        this.updateMovement();
    }
}