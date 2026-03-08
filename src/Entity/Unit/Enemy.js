import Unit from "./Unit.js";
import Buff from "../Projectile/Buff.js";

export default class Enemy extends Unit {
    constructor(id, position, speed, hitbox, hp, mp, events, waypoint, damage, heroDamage) {
        super(id, position, speed, hitbox, hp, mp);
        // console.log(this.currentHP);
        this.finished = false;
        this.events = events;
        this.waypoint = [];
        for (let point of waypoint) {
            this.appendWaypoint(point);
        }
        this.damage = damage || 0;
        this.heroDamage = heroDamage || 0;
        this.unsubscribeCollision = null;
        this.registerEventHandlers();
    }

    registerEventHandlers() {
        if (!this.events || typeof this.events.on !== 'function') {
            return;
        }

        this.unsubscribeCollision = this.events.on('entity:collision:self', ({ entity, other }) => {
            if (entity !== this) {
                return;
            }
            this.applyDamageFromCollision(other);
        });
    }

    clearEventHandlers() {
        if (typeof this.unsubscribeCollision === 'function') {
            this.unsubscribeCollision();
            this.unsubscribeCollision = null;
        }
    }

    applyDamageFromCollision(sourceEntity) {
        if (!sourceEntity || this.finished || this.currentHP <= 0) {
            return;
        }

        const sourceCategory = sourceEntity.category;
        const canDamage = sourceCategory === 'Area' || sourceCategory === 'Projectile' || sourceCategory === 'Missile';
        if (!canDamage) {
            return;
        }

        const damage = Number(sourceEntity.damage || 0);
        if (damage <= 0) {
            return;
        }

        this.takeDamage(damage);

        if (sourceCategory === 'Area' && sourceEntity.effectStatus && sourceEntity.effectDuration > 0) {
            const debuff = new Buff(
                `area_debuff_${sourceEntity.id}`,
                `${sourceEntity.id} debuff`,
                sourceEntity.effectDuration,
                { ...sourceEntity.effectStatus }
            );
            this.addBuff(debuff);
        }
    }

    moveAlongWaypoint() {
        super.moveAlongWaypoint();
        this.reachedObjective();
    }

    reachedObjective() {
        if (!this.finished && this.waypoint.length === 0) {
            this.finished = true;
            this.clearEventHandlers();
            this.events?.emit('enemy:reached_objective', { enemy: this });
        }
    }

    takeDamage(amount) {
        console.log(`Enemy ${this.id} takes ${amount} damage.`);
        super.takeDamage(amount);
        if (this.currentHP <= 0) {
            this.die();
        }
    }

    die() {
        if (this.finished) {
            return;
        }
        this.finished = true;
        this.destroyed = true;
        this.clearEventHandlers();
        this.events?.emit('enemy:died', { enemy: this });
    }

    isAlive() {
        return this.currentHP > 0 && !this.finished;
    }
}
