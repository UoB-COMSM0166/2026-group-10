import Entity from '../Entity.js';
import Unit from "../Unit/Unit.js";

export class Missile extends Entity {
    constructor(id, position, speed, hitbox, sprite, target, damage, effect) {
        super(id, position, speed, hitbox, sprite);
        this.setTarget(target);
        this.damage = Number(damage);
        this.effect = effect;
        this.finished = false;
    }

    available(size) {
        return (
            this.position.x > 0 && this.position.x < size.width &&
            this.position.y > 0 && this.position.y < size.height
        );
    }

    checkHit() {
        return this.getDistance(this.target.position) <= this.hitbox + this.target.hitbox;
    }

    hit() {
        if (this.damage) {
            this.target.takeDamage(this.damage);
        }
        if (this.effect && typeof this.effect === 'function') {
            this.effect(this.target);
        }
        this.finished = true;
    }

    setTarget(target) {
        if (!target instanceof Unit) return;
        this.target = target;
    }

    update(size, _) {
        if (this.finished) return;

        if (!this.available(size)) {
            this.finished = true;
            return;
        }

        if (this.checkHit()) {
            this.hit();
        }
    }
}

export class Area extends Entity {
    constructor(id, position, speed, hitbox, sprite, destination, damage, effect, duration, effectPeriod = 10) {
        super(id, position, speed, hitbox, sprite);
        this.navigateToPoint(destination);
        this.damage = Number(damage);
        this.effect = effect;
        this.finished = false;
        this.duration = Number(duration);
        this.effectPeriod = Number(effectPeriod);
        this.period = Number(effectPeriod);
    }

    available(size) {
        return (
            this.position.x > -this.hitbox && this.position.x < size.width + this.hitbox &&
            this.position.y > -this.hitbox && this.position.y < size.height + this.hitbox
        );
    }

    hit(unit) {
        if (this.damage) {
            unit.takeDamage(this.damage);
        }
        if (this.effect && typeof this.effect === 'function') {
            this.effect(unit);
        }
        // 判定击中后不会销毁
    }

    update(size, units) {
        if (this.duration <= 0) {
            this.finished = true;
            return;
        }

        if (this.finished) return;

        if (!this.available(size)) {
            this.finished = true;
            return;
        }

        this.updateMovement();
        if (this.period === 0) {
            for (let unit of units.values()) {
                if (this.getDistance(unit.position) <= this.hitbox + unit.hitbox) {
                    this.hit(unit);
                }
            }
            this.period = this.effectPeriod;
        } else {
            this.period --;
        }
        this.duration --;
    }
}

export class Aura extends Entity {
    constructor(id, source, hitbox, sprite, damage, effect, duration, effectPeriod = 10) {
        super(id, source?.position ?? { x: 0, y: 0 }, 0, hitbox, sprite);
        this.source = source;
        this.damage = Number(damage);
        this.effect = effect;
        this.finished = false;
        this.duration = Number(duration);
        this.effectPeriod = Number(effectPeriod);
        this.period = Number(effectPeriod);
        this.category = 'Aura';
    }

    updateMovement() {
        if (!this.source?.alive || !this.source.alive()) {
            this.finished = true;
            return;
        }

        this.position = { x: this.source.position.x, y: this.source.position.y };
        this.velocity.vx = 0;
        this.velocity.vy = 0;
    }

    hit(unit) {
        if (!unit?.alive || !unit.alive()) {
            return;
        }

        if (this.damage) {
            unit.takeDamage(this.damage);
        }

        if (this.effect && typeof this.effect === 'function') {
            this.effect(unit);
        }
    }

    update(_, units) {
        if (this.finished) {
            return;
        }

        if (!this.source?.alive || !this.source.alive()) {
            this.finished = true;
            return;
        }

        if (this.duration <= 0) {
            this.finished = true;
            return;
        }

        this.updateMovement();
        if (this.period > 0) {
            this.period -= 1;
        } else {
            for (const unit of units.values()) {
                if (this.getDistance(unit.position) <= this.hitbox + unit.hitbox) {
                    this.hit(unit);
                }
            }
            this.period = this.effectPeriod;
        }

        this.duration -= 1;
    }
}
