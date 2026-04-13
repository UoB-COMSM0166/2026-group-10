import Unit from '../Unit.js';

const EXPERIENCE_TABLE = [
    100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500,
];
const BASE_RESPAWN_CD = 600;  // Ticks

export default class Hero extends Unit {
    constructor(
        id, name, position, speed, hitbox, hp, mp,
        description, armor, attackAmp, spellAmp,
        events, ui, clock
    ) {
        super(id, position, speed, hitbox, hp, mp);
        this.name = String(name);
        this.events = events;
        this.ui = ui;
        this.clock = clock;
        this.description = String(description);

        this.baseArmor = Number(armor);
        this.armor = this.baseArmor;
        this.attackAmp = Number(attackAmp);
        this.spellAmp = Number(spellAmp);

        this.respawnCD = BASE_RESPAWN_CD;
        this.active = false;
        this.remainingRespawnCD = 0;
        this.spawnPosition = { x: position.x, y: position.y };
        this.inFountain = false;

        this.gold = 0;
        this.castState = null;

        // 技能和装备系统
        this.skill = new Map();
        this.skill.set('A', null);
        this.skill.set('Q', null);
        this.skill.set('W', null);
        this.skill.set('E', null);
        this.skill.set('R', null);
        this.skill.set('Passive', null);
        this.renderRange = null;
        this.applyPassiveSkills();

        this.inventory = new Map();
        this.inventory.set('weapon', null);
        this.inventory.set('armor', null);
        this.inventory.set('shoes', null);
    }

    takeDamage(amount) {
        super.takeDamage(amount);
        if (!this.alive()) {
            this.die();
        }
    }

    die() {
        if (this.remainingRespawnCD > 0) return;
        this.interruptCast();
        this.stop();
        this.clearWaypoints();
        this.currentHP = 0;
        this.remainingRespawnCD = this.respawnCD;
        this.events.emit('hero:death', { hero: this, respawnTick: this.remainingRespawnCD });
        this.ui.emit('hero:death', { hero: this, respawnTick: this.remainingRespawnCD });
    }

    updateMovement() {
        if (!this.alive() || this.isCasting()) { return; }
        super.updateMovement();
    }

    updateCasting() {
        if (!this.castState) {
            return;
        }

        if (!this.alive()) {
            this.interruptCast();
            return;
        }

        this.castState.remaining -= 1;
        if (this.castState.remaining > 0) {
            return;
        }

        const onComplete = this.castState.onComplete;
        this.castState = null;
        if (typeof onComplete === 'function') {
            onComplete();
        }
    }

    updateSkill() {
        for (const [slot, skill] of this.skill.entries()) {
            if (skill) {
                skill.coolingDown();
                skill.updateToggle(this, this.clock.now());
                if (slot === 'A' && skill.currentCooldown > 0 && skill.cooldownAcceleration > 0) {
                    skill.cooldownAccelerationCarry += skill.cooldownAcceleration;
                    const extraCooldownTicks = Math.floor(skill.cooldownAccelerationCarry);
                    if (extraCooldownTicks > 0) {
                        skill.currentCooldown = Math.max(0, skill.currentCooldown - extraCooldownTicks);
                        skill.cooldownAccelerationCarry -= extraCooldownTicks;
                    }
                }
                skill.cooldownAcceleration = 0;
                skill.bonusDamage = 0;
                skill.lifestealRatio = 0;
            }
        }
    }

    stop() {
        super.stop();
        this.clearWaypoints();
        this.removeTarget();
    }

    startCast(duration, onComplete) {
        const castDuration = Math.max(0, Number(duration) || 0);

        this.stop();
        if (castDuration === 0) {
            if (typeof onComplete === 'function') {
                onComplete();
            }
            return;
        }

        this.castState = {
            remaining: castDuration,
            onComplete,
        };
    }

    interruptCast() {
        this.castState = null;
    }

    isCasting() {
        return this.castState !== null;
    }

    setRenderRange(skill) {
        this.renderRange = Number(skill.range);
    }

    clearRenderRange() {
        this.renderRange = null;
    }

    applyPassiveSkills() {
        for (const skill of this.skill.values()) {
            if (skill?.passive && typeof skill.applyTo === 'function') {
                skill.applyTo(this);
            }
        }
    }
}
