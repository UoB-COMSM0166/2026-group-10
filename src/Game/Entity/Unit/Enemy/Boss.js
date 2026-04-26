import Unit from "../Unit.js";

export default class Boss extends Unit {
    constructor(id, name, position, speed, hitbox, hp, mp, events, target) {
        super(id, position, speed, hitbox, hp, mp);
        this.name = name;
        this.events = events;
        this.target = target;
        this.gold = 0;
        this.finished = false;

        this.skills = new Map();
        this.skills.set('Q', null);
        this.skills.set('W', null);
        this.skills.set('E', null);
        this.skills.set('R', null);
        this.cooldown = 180;
        this.currentCooldown = this.cooldown;
        this.castState = null;
    }

    takeDamage(amount, source = null, options = {}) {
        super.takeDamage(amount, source, options);
        if (!this.alive()) {
            this.die();
        }
    }

    die() {
        if (this.finished) {
            return;
        }

        this.finished = true;
        this.events.emit('enemy:killed', { id: this.id, gold: this.gold, enemy: this });
    }

    isBackswing() {
        return this.castState?.phase === 'backswing';
    }

    isSkillBusy() {
        return this.castState !== null;
    }

    castSkill(slot, target = null, tick = 0) {
        if (this.isSkillBusy()) {
            return false;
        }

        const skill = slot && typeof slot === 'object'
            ? slot
            : this.skills.get(slot);
        if (!skill || !skill.cooledDown()) {
            return false;
        }

        this.stop();
        const castTarget = target ?? this.target ?? null;
        const source = { x: this.position.x, y: this.position.y };
        const context = {
            caster: this,
            target: castTarget,
            source,
            tick,
        };

        if (typeof skill.startCast === 'function') {
            if (!skill.startCast(context)) {
                return false;
            }

            this.castState = {
                phase: 'casting',
                remaining: skill.castRemaining,
                skill,
                target: castTarget,
                source,
                tick,
            };
            return true;
        }

        this.castState = {
            phase: 'casting',
            remaining: 120,
            skill,
            target: castTarget,
            source,
            tick,
        };
        return true;
    }

    finishCast() {
        if (!this.castState) {
            return;
        }

        const { skill, target, source, tick } = this.castState;
        const context = typeof skill.completeCast === 'function'
            ? skill.completeCast()
            : null;
        const castTarget = context?.target ?? target;
        const castSource = context?.source ?? source;
        const castTick = context?.tick ?? tick;

        if (skill.targetCategory === null) {
            skill.casted(this, castTick);
        } else {
            skill.casted(castTarget, this, castSource, castTick);
        }

        this.currentCooldown = this.cooldown;

        if (typeof skill.isBackswing === 'function' && skill.isBackswing()) {
            this.castState = {
                phase: 'backswing',
                remaining: skill.backswingRemaining,
                skill,
                target: castTarget,
                source: castSource,
                tick: castTick,
            };
            return;
        }

        this.castState = null;
    }

    updateCasting() {
        if (!this.castState) {
            return;
        }

        const { skill } = this.castState;

        if (this.castState.phase === 'backswing') {
            if (typeof skill.updateBackswing === 'function') {
                skill.updateBackswing();
                this.castState.remaining = skill.backswingRemaining;
                if (!skill.isBackswing()) {
                    this.castState = null;
                }
                return;
            }

            this.castState.remaining -= 1;
            if (this.castState.remaining <= 0) {
                this.castState = null;
            }
            return;
        }

        if (typeof skill.updateCasting === 'function') {
            const completed = skill.updateCasting();
            this.castState.remaining = skill.castRemaining;
            if (completed) {
                this.finishCast();
            }
            return;
        }

        this.castState.remaining -= 1;
        if (this.castState.remaining <= 0) {
            this.finishCast();
        }
    }

    updateSkillCooldowns() {
        if (this.currentCooldown > 0) {
            this.currentCooldown -= 1;
        }

        for (const skill of this.skills.values()) {
            if (skill) {
                skill.coolingDown();
            }
        }
    }

    update() {
        if (this.finished || !this.alive()) {
            return;
        }

        this.updateBuffs();
        this.updateSkillCooldowns();
        this.updateCasting();

        if (!this.isSkillBusy()) {
            this.updateMovement();
        }
    }
}
