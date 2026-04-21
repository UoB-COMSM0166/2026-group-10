import Enemy from './Enemy.js'
import Boss from './Boss.js'
import { Area, Aura } from "../../Skill/SkillEntity.js";
import Buff from "../../Skill/Buff.js";
import BossSkill from "../../Skill/BossSkill.js";

export class Zombie extends Enemy {
    constructor(id, position, events, waypoint, tick) {
        super(
            id, 'Zombie', position, 0.8, 10, 50, 0,
            events, waypoint, 15, 10
        )

        const buff = new Buff(
            'Poison Poll',
            'Slowed down.',
            'rgba(0, 100, 0, 0.5)',
            30,
            (unit) => {
                unit.setStat('Speed', Math.max(0, unit.getBaseStat('Speed') - unit.getBaseStat('Speed') * 0.1));
            },
            false
        )

        this.diecry = () => {
            console.log(`${this.id} dies with a groan.`);
            const poison = new Area (
                `${this.id}_diecry_poison_${tick}`,
                this.position, 0, 20,
                this.position,
                (unit) => {
                    unit.takeDamage(2, this);
                    unit.addBuff(buff);
                },
                60,
                10,
                0,
                this
            )

            this.events.emit('enemy_skill_entity:created', { entity: poison });
        };
    }
}

export class Boomer extends Enemy {
    constructor(id, position, events, waypoint, tick) {
        super(
            id, 'Boomer', position, 1, 9, 40, 0,
            events, waypoint, 15, 10
        )

        this.diecry = () => {
            console.log(`${this.id} dies with a groan.`);
            const explosion = new Area(
                `${this.id}_diecry_explosion_${tick}`,
                { x: this.position.x, y: this.position.y },
                0,
                40,
                { x: this.position.x, y: this.position.y },
                (unit) => {
                    unit.takeDamage(20, this);
                },
                40,
                40,
                0,
                this
            );
            explosion.period = 39;

            this.events.emit('enemy_skill_entity:created', { entity: explosion });
        };
    }
}

export class Necromancer extends Enemy {
    constructor(id, position, events, waypoint, tick) {
        super(
            id, 'Necromancer', position, 0.7, 10, 55, 0,
            events, waypoint, 15, 15
        );

        this.aura = new Aura(
            `${this.id}_death_aura_${tick}`,
            this,
            40,
            1,
            null,
            Number.POSITIVE_INFINITY,
            1
        );

        this.onReachedObjective = () => {
            if (this.aura) {
                this.aura.finished = true;
            }
        };

        this.events.emit('enemy_skill_entity:created', { entity: this.aura });
    }

    die() {
        if (this.aura) {
            this.aura.finished = true;
        }

        super.die();
    }
}

class IceBolt extends BossSkill {
    constructor(events) {
        super(
            'Ice Bolt', 'Ice',
            'After chanting, fire an ice spike at the target location.',
            600, 0, 99999, events, null, 90, 0
        );
        this.flightDuration = 60;
        this.hitbox = 60;
        this.damage = 90;
        this.slowDuration = 60;
        this.slowRatio = 0.5;
    }

    casted(caster, tick) {
        super.casted();
        if (!caster?.target?.position) {
            return;
        }

        const destination = {
            x: Number(caster.target.position.x) || 0,
            y: Number(caster.target.position.y) || 0,
        };
        const origin = {
            x: Number(caster.position?.x) || 0,
            y: Number(caster.position?.y) || 0,
        };
        const dx = destination.x - origin.x;
        const dy = destination.y - origin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = distance / this.flightDuration;
        const slowBuff = new Buff(
            'Ice Bolt Slow',
            'Slowed by Ice Bolt.',
            'rgba(0, 153, 255, 1)',
            this.slowDuration,
            (unit) => {
                unit.setStat('Speed', Math.max(0, unit.getBaseStat('Speed') * (1 - this.slowRatio)));
            },
            false
        );

        const iceBolt = new Area(
            `${caster.id ?? caster.name}_ice_bolt_${tick}`,
            origin,
            speed,
            this.hitbox,
            destination,
            () => {},
            this.flightDuration + 1,
            this.flightDuration + 1,
            distance,
            caster
        );

        iceBolt.category = 'IceBolt';
        iceBolt.flightRemaining = this.flightDuration;
        iceBolt.impact = (units) => {
            for (const unit of units.values()) {
                if (!unit?.alive || !unit.alive()) {
                    continue;
                }

                if (iceBolt.getDistance(unit.position) <= iceBolt.hitbox + unit.hitbox) {
                    unit.takeDamage(this.damage, caster);
                    unit.addBuff(slowBuff);
                }
            }
        };
        iceBolt.update = (size, units) => {
            if (iceBolt.finished) {
                return;
            }

            if (!iceBolt.available(size)) {
                iceBolt.finished = true;
                return;
            }

            iceBolt.flightRemaining -= 1;
            if (iceBolt.flightRemaining > 0) {
                return;
            }

            iceBolt.position = { x: destination.x, y: destination.y };
            iceBolt.velocity.vx = 0;
            iceBolt.velocity.vy = 0;
            iceBolt.impact(units);
            iceBolt.finished = true;
        };

        this.events.emit('enemy_skill_entity:created', { entity: iceBolt });
    }
}

class FrostBlast extends BossSkill {
    constructor(events) {
        super(
            'Frost Blast', 'Ice',
            'After chanting, freeze and weaken nearby target.',
            600, 0, 100, events, null, 200, 120
        );
        this.range = 20;
        this.damage = 40;
        this.freezeDuration = 200;
        this.armorReduction = 5;
        this.armorReductionDuration = 120;
    }

    casted(caster, tick) {
        super.casted();
        const target = caster?.target;
        if (!caster?.position || !target?.position || !target?.alive || !target.alive()) {
            return;
        }

        if (caster.getDistance(target.position) >= this.range) {
            return;
        }

        const freezeBuff = new Buff(
            'Frost Blast Freeze',
            'Frozen by Frost Blast.',
            'rgba(0, 153, 255, 1)',
            this.freezeDuration,
            (unit) => {
                unit.setStat('Speed', 0);
            },
            false
        );
        const armorBreakBuff = new Buff(
            'Frost Blast Armor Break',
            'Armor reduced by Frost Blast.',
            'rgba(120, 220, 255, 1)',
            this.armorReductionDuration,
            (unit) => {
                unit.addStat('Armor', -this.armorReduction);
            },
            false
        );

        target.takeDamage(this.damage, caster);
        target.addBuff(freezeBuff);
        target.addBuff(armorBreakBuff);
    }
}

class Blink extends BossSkill {
    constructor(events) {
        super(
            'Blink', 'Ice',
            'Blink to a point near the target after chanting.',
            600, 0, 99999, events, null, 60, 60
        );
        this.targetDistance = 50;
    }

    casted(caster, tick) {
        super.casted();
        const target = caster?.target;
        if (!caster?.position || !target?.position) {
            return;
        }

        const heroPosition = {
            x: Number(target.position.x) || 0,
            y: Number(target.position.y) || 0,
        };
        const casterPosition = {
            x: Number(caster.position.x) || 0,
            y: Number(caster.position.y) || 0,
        };
        const targetDistance = Number(caster.nextBlinkDistance) || this.targetDistance;
        const randomDirection = Boolean(caster.nextBlinkRandomDirection);
        let dirX = 1;
        let dirY = 0;

        if (randomDirection) {
            const direction = caster.getRandomDirection();
            dirX = direction.x;
            dirY = direction.y;
        } else {
            const dx = casterPosition.x - heroPosition.x;
            const dy = casterPosition.y - heroPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            dirX = distance > 0 ? dx / distance : 1;
            dirY = distance > 0 ? dy / distance : 0;
        }

        const destination = caster.clampToWorld({
            x: heroPosition.x + dirX * targetDistance,
            y: heroPosition.y + dirY * targetDistance,
        });

        caster.position.x = destination.x;
        caster.position.y = destination.y;
        caster.velocity.vx = 0;
        caster.velocity.vy = 0;
        caster.nextBlinkDistance = null;
        caster.nextBlinkRandomDirection = false;
    }
}

export class Lich extends Boss {
    constructor(id, position, events, target) {
        super(id, 'Lich', position, 0.7, 35, 1000, 0, events, target);
        this.target = target;
        this.skills.set('Q', new IceBolt(events));
        this.skills.set('W', new FrostBlast(events));
        this.skills.set('E', new Blink(events));
        this.combatPhase = 1;
        this.aiTick = 0;
        this.qDelay = 0;
        this.qDelayActive = false;
        this.queuedSkill = null;
        this.nextBlinkDistance = null;
        this.nextBlinkRandomDirection = false;
        this.worldBounds = { width: 1600, height: 900 };
    }

    getTargetDistance() {
        if (!this.target?.position) {
            return Number.POSITIVE_INFINITY;
        }

        return this.getDistance(this.target.position);
    }

    clampToWorld(position) {
        return {
            x: Math.max(0, Math.min(this.worldBounds.width, Number(position?.x) || 0)),
            y: Math.max(0, Math.min(this.worldBounds.height, Number(position?.y) || 0)),
        };
    }

    getRandomDirection() {
        const angle = Math.random() * Math.PI * 2;
        return {
            x: Math.cos(angle),
            y: Math.sin(angle),
        };
    }

    getRandomPointAtDistance(origin, distance) {
        const start = {
            x: Number(origin?.x) || 0,
            y: Number(origin?.y) || 0,
        };

        for (let i = 0; i < 16; i += 1) {
            const direction = this.getRandomDirection();
            const point = {
                x: start.x + direction.x * distance,
                y: start.y + direction.y * distance,
            };

            if (
                point.x >= 0 && point.x <= this.worldBounds.width &&
                point.y >= 0 && point.y <= this.worldBounds.height
            ) {
                return point;
            }
        }

        const direction = this.getRandomDirection();
        return this.clampToWorld({
            x: start.x + direction.x * distance,
            y: start.y + direction.y * distance,
        });
    }

    resetQDelay() {
        this.qDelay = 0;
        this.qDelayActive = false;
    }

    startQDelayMovement() {
        if (this.qDelayActive) {
            return;
        }

        this.qDelayActive = true;
        this.qDelay = 0;
        this.clearWaypoints();
        this.appendWaypoint(this.getRandomPointAtDistance(this.position, 84));
    }

    delayThenCastQ() {
        this.startQDelayMovement();
        this.qDelay += 1;

        if (this.qDelay < 120) {
            return false;
        }

        this.resetQDelay();
        this.clearWaypoints();
        return this.castSkill('Q', null, this.aiTick);
    }

    castBlink(distance, randomDirection = false) {
        this.nextBlinkDistance = distance;
        this.nextBlinkRandomDirection = randomDirection;

        if (this.castSkill('E', null, this.aiTick)) {
            return true;
        }

        this.nextBlinkDistance = null;
        this.nextBlinkRandomDirection = false;
        return false;
    }

    updatePhase() {
        if (this.combatPhase === 1 && this.currentHP < this.maxHP * 0.5) {
            this.combatPhase = 2;
            this.resetQDelay();
            this.clearWaypoints();
        }
    }

    updateBehavior() {
        if (!this.target?.position || this.isSkillBusy()) {
            return;
        }

        if (this.queuedSkill) {
            const queuedSkill = this.queuedSkill;
            if (this.castSkill(queuedSkill, null, this.aiTick)) {
                this.queuedSkill = null;
            }
            return;
        }

        const distance = this.getTargetDistance();

        if (this.combatPhase === 1) {
            if (distance > 500) {
                this.resetQDelay();
                this.clearWaypoints();
                if (this.castBlink(50, false)) {
                    this.queuedSkill = 'W';
                }
                return;
            }

            this.delayThenCastQ();
            return;
        }

        if (distance > 500) {
            this.delayThenCastQ();
            return;
        }

        this.resetQDelay();
        this.clearWaypoints();

        if (distance < 200) {
            this.castSkill('W', null, this.aiTick);
            return;
        }

        this.castBlink(500, true);
    }

    update() {
        if (!this.alive()) {
            return;
        }

        this.aiTick += 1;
        this.updateBuffs();
        this.updateSkillCooldowns();
        this.updateCasting();
        this.updatePhase();

        if (!this.isSkillBusy()) {
            this.updateBehavior();
        }

        if (!this.isSkillBusy()) {
            this.updateMovement();
        }
    }
}
