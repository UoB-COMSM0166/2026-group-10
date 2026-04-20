import Skill from './Skill.js';

export default class BossSkill extends Skill {
    constructor(
        name, category, description, cooldown, manaCost, range, events, targetCategory,
        castDuration = 120, backswingDuration = 0
    ) {
        super(name, category, description, cooldown, manaCost, range, events, targetCategory, false, 0);
        this.castDuration = Math.max(0, Number(castDuration) || 0);
        this.backswingDuration = Math.max(0, Number(backswingDuration) || 0);
        this.castRemaining = 0;
        this.backswingRemaining = 0;
        this.castContext = null;
        this.phase = 'idle';
    }

    startCast(context = {}) {
        if (this.isBusy() || !this.cooledDown()) {
            return false;
        }

        this.phase = 'casting';
        this.castRemaining = this.castDuration;
        this.backswingRemaining = 0;
        this.castContext = context;
        return true;
    }

    updateCasting() {
        if (!this.isCasting()) {
            return false;
        }

        this.castRemaining -= 1;
        return this.castRemaining <= 0;
    }

    completeCast() {
        if (!this.isCasting()) {
            return null;
        }

        const context = this.castContext;
        this.castContext = null;
        this.castRemaining = 0;

        if (this.backswingDuration > 0) {
            this.phase = 'backswing';
            this.backswingRemaining = this.backswingDuration;
        } else {
            this.phase = 'idle';
            this.backswingRemaining = 0;
        }

        return context;
    }

    updateBackswing() {
        if (!this.isBackswing()) {
            return false;
        }

        this.backswingRemaining -= 1;
        if (this.backswingRemaining <= 0) {
            this.phase = 'idle';
            this.backswingRemaining = 0;
            return true;
        }

        return false;
    }

    cancelCast() {
        this.phase = 'idle';
        this.castRemaining = 0;
        this.backswingRemaining = 0;
        this.castContext = null;
    }

    isCasting() {
        return this.phase === 'casting';
    }

    isBackswing() {
        return this.phase === 'backswing';
    }

    isBusy() {
        return this.isCasting() || this.isBackswing();
    }

    getTimingState() {
        return {
            phase: this.phase,
            casting: this.isCasting(),
            backswing: this.isBackswing(),
            remaining: this.isCasting() ? this.castRemaining : this.backswingRemaining,
            castRemaining: this.castRemaining,
            backswingRemaining: this.backswingRemaining,
            castDuration: this.castDuration,
            backswingDuration: this.backswingDuration,
        };
    }
}
