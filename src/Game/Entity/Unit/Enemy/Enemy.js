import Unit from "../Unit.js";

export default class Enemy extends Unit {
    constructor(id, name, position, speed, hitbox, hp, mp, events, waypoint, damage, gold) {
        super(id, position, speed, hitbox, hp, mp);
        this.name = String(name);
        this.finished = false;
        this.events = events;
        this.waypoint = [];
        for (let point of waypoint) {
            this.appendWaypoint(point);
        }
        this.damage = Number(damage);
        this.gold = Number(gold);
        this.diecry = null;
        this.onReachedObjective = null;
    }

    checkReachedObjective() {
        if (!this.finished && this.waypoint.length === 0) {
            if (typeof this.onReachedObjective === 'function') {
                this.onReachedObjective();
            }
            this.finished = true;
            // this.clearEventHandlers();
            this.events.emit('enemy:reached_objective', { enemy: this });
            console.log(`Enemy ${this.id} reached objective.`);
        }
    }

    takeDamage(amount) {
        // console.log(`Enemy ${this.id} takes ${amount} damage.`);
        super.takeDamage(amount);
        if (!this.alive()) {
            this.die();
        }
    }

    die() {
        if (this.finished) {
            return;
        }
        if (this.diecry) this.diecry();

        this.finished = true;
        this.events.emit('enemy:killed', { id: this.id, gold: this.gold, enemy: this });
    }

    updateMovement() {
        if (this.getStat('Speed') <= 0) { return; }
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
