import Entity from '../Entity.js';
import Unit from "../Unit/Unit.js";

export class Missile extends Entity {
    constructor(id, position, speed, hitbox, target, damage, effect, source = null) {
        super(id, position, speed, hitbox);
        this.setTarget(target);
        this.damage = Number(damage);
        this.effect = effect;
        this.source = source;
        this.finished = false;
        this.category = 'Missile';
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
            this.target.takeDamage(this.damage, this.source);
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
    constructor(id, position, speed, hitbox, destination, onHit, duration, effectPeriod = 10, maxDistance = 0, source = null) {
        super(id, position, speed, hitbox);
        this.onHit = onHit;
        this.source = source;
        this.finished = false;
        this.duration = Number(duration);
        this.effectPeriod = Number(effectPeriod);
        this.period = Number(effectPeriod);
        this.category = 'Area';
        this.origin = { x: position.x, y: position.y };
        this.destination = destination ? { x: destination.x, y: destination.y } : { x: position.x, y: position.y };
        this.maxDistance = Math.max(0, Number(maxDistance) || 0);
        this.distanceTravelled = 0;

        const dx = this.destination.x - this.origin.x;
        const dy = this.destination.y - this.origin.y;
        const directionDistance = Math.sqrt(dx * dx + dy * dy);

        if (directionDistance > 0 && this.speed > 0) {
            const scale = this.speed / directionDistance;
            this.velocity.vx = dx * scale;
            this.velocity.vy = dy * scale;
        }
    }

    available(size) {
        return (
            this.position.x > -this.hitbox && this.position.x < size.width + this.hitbox &&
            this.position.y > -this.hitbox && this.position.y < size.height + this.hitbox
        );
    }

    hit(unit) {
        if (this.onHit && typeof this.onHit === 'function') {
            this.onHit(unit);
        }
        // 判定击中后不会销毁
    }

    updateMovement() {
        if (this.finished || this.speed <= 0) {
            return;
        }

        if (this.maxDistance > 0 && this.distanceTravelled >= this.maxDistance) {
            this.velocity.vx = 0;
            this.velocity.vy = 0;
            return;
        }

        this.calculateMovement();
        this.distanceTravelled = this.getDistance(this.origin);

        if (this.maxDistance > 0 && this.distanceTravelled >= this.maxDistance) {
            this.velocity.vx = 0;
            this.velocity.vy = 0;
        }
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

        if (this.maxDistance > 0 && this.distanceTravelled >= this.maxDistance) {
            this.finished = true;
            return;
        }

        this.duration --;
    }
}

export class Aura extends Entity {
    constructor(id, source, hitbox, damage, effect, duration, effectPeriod = 10) {
        super(id, source?.position ?? { x: 0, y: 0 }, 0, hitbox);
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
            unit.takeDamage(this.damage, this.source);
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

export class Projectile extends Entity {
    constructor(id, position, speed, hitbox, destination, damage, effect, maxDistance, piercing = false, source = null) {
        super(id, position, speed, hitbox);
        this.damage = Number(damage);
        this.effect = effect;
        this.source = source;
        this.finished = false;
        this.category = 'Projectile';
        this.origin = { x: position.x, y: position.y };
        this.maxDistance = Number(maxDistance) || 0;
        this.distanceTravelled = 0;
        this.piercing = Boolean(piercing);
        this.hitUnits = new Set();

        const dx = destination.x - position.x;
        const dy = destination.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const projectileSpeed = Number(this.stats.get('Speed')) || 0;

        if (distance > 0 && projectileSpeed > 0) {
            const scale = projectileSpeed / distance;
            this.velocity.vx = dx * scale;
            this.velocity.vy = dy * scale;
        }
    }

    available(size) {
        return (
            this.position.x > 0 && this.position.x < size.width &&
            this.position.y > 0 && this.position.y < size.height
        );
    }

    updateMovement() {
        if (this.finished || this.stats.get('Speed') <= 0) {
            return;
        }

        this.calculateMovement();
        this.distanceTravelled = this.getDistance(this.origin);
    }

    checkHit(units) {
        const unitList = units instanceof Map ? units.values() : units;

        for (const unit of unitList) {
            if (!unit?.alive || !unit.alive()) {
                continue;
            }

            if (this.hitUnits.has(unit.id)) {
                continue;
            }

            if (this.getDistance(unit.position) <= this.hitbox + unit.hitbox) {
                return unit;
            }
        }

        return null;
    }

    hit(unit) {
        if (!unit?.alive || !unit.alive()) {
            this.finished = true;
            return;
        }

        if (this.damage) {
            unit.takeDamage(this.damage, this.source);
        }
        if (this.effect && typeof this.effect === 'function') {
            this.effect(unit);
        }
        this.hitUnits.add(unit.id);
        this.finished = !this.piercing;
    }

    update(size, units) {
        if (this.finished) {
            return;
        }

        if (!this.available(size)) {
            this.finished = true;
            return;
        }

        const hitUnit = this.checkHit(units);
        if (hitUnit) {
            this.hit(hitUnit);
            return;
        }

        if (this.maxDistance > 0 && this.distanceTravelled >= this.maxDistance) {
            this.finished = true;
        }
    }
}

export class Guardian extends Unit {
    constructor(
        id, position, hitbox, events,
        duration, attackRange, attackInterval, missileSpeed, missileHitbox, damage, onHitEffect = null
    ) {
        super(id, position, 0, hitbox, 1, 0);
        this.events = events;
        this.duration = Number(duration);
        this.attackRange = Number(attackRange);
        this.attackInterval = Number(attackInterval);
        this.attackCooldown = 0;
        this.missileSpeed = Number(missileSpeed);
        this.missileHitbox = Number(missileHitbox);
        this.damage = Number(damage);
        this.onHitEffect = onHitEffect;
        this.finished = false;
        this.category = 'Guardian';
    }

    alive() {
        return !this.finished && this.currentHP > 0;
    }

    attack(target) {
        if (!target?.alive || !target.alive()) {
            return;
        }

        const missile = new Missile(
            `${this.id}_missile_${this.duration}`,
            { x: this.position.x, y: this.position.y },
            this.missileSpeed,
            this.missileHitbox,
            target,
            this.damage,
            this.onHitEffect,
            this
        );

        this.events.emit('skill_entity:created', { entity: missile });
        this.attackCooldown = this.attackInterval;
    }

    update(_, enemies) {
        if (this.finished) {
            return;
        }

        if (this.duration <= 0) {
            this.finished = true;
            return;
        }

        const target = this.updateTarget(enemies, this.attackRange, this.attackRange);
        if (this.attackCooldown > 0) {
            this.attackCooldown -= 1;
        } else if (target) {
            this.attack(target);
        }

        this.duration -= 1;
    }
}

export class Tower extends Unit {
    constructor(
        id, position, hitbox, events,
        duration, attackRange, attackInterval, projectileSpeed, projectileHitbox, damage, source = null,
        projectileMaxDistance = attackRange, projectilePiercing = false, projectileName = 'arrow',
        projectileTracksTarget = false
    ) {
        super(id, position, 0, hitbox, 1, 0);
        this.events = events;
        this.duration = Number(duration);
        this.attackRange = Number(attackRange);
        this.attackInterval = Number(attackInterval);
        this.attackCooldown = 0;
        this.projectileSpeed = Number(projectileSpeed);
        this.projectileHitbox = Number(projectileHitbox);
        this.damage = Number(damage);
        this.source = source;
        this.projectileMaxDistance = Number(projectileMaxDistance);
        this.projectilePiercing = Boolean(projectilePiercing);
        this.projectileName = String(projectileName);
        this.projectileTracksTarget = Boolean(projectileTracksTarget);
        this.finished = false;
        this.category = 'Tower';
    }

    alive() {
        return !this.finished && this.currentHP > 0;
    }

    findTarget(enemies) {
        return this.findNearestEnemy(enemies, this.attackRange);
    }

    attack(target) {
        if (!target?.alive || !target.alive()) {
            return;
        }

        const projectile = this.projectileTracksTarget
            ? new Missile(
                `${this.id}_${this.projectileName}_${this.duration}`,
                { x: this.position.x, y: this.position.y },
                this.projectileSpeed,
                this.projectileHitbox,
                target,
                this.damage,
                null,
                this.source
            )
            : new Projectile(
                `${this.id}_${this.projectileName}_${this.duration}`,
                { x: this.position.x, y: this.position.y },
                this.projectileSpeed,
                this.projectileHitbox,
                { x: target.position.x, y: target.position.y },
                this.damage,
                null,
                this.projectileMaxDistance,
                this.projectilePiercing,
                this.source
            );

        this.events.emit('skill_entity:created', { entity: projectile });
        this.attackCooldown = this.attackInterval;
    }

    update(_, enemies) {
        if (this.finished) {
            return;
        }

        if (this.duration <= 0) {
            this.finished = true;
            return;
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown -= 1;
        } else {
            const target = this.findTarget(enemies);
            if (target) {
                this.attack(target);
            }
        }

        this.duration -= 1;
    }
}
