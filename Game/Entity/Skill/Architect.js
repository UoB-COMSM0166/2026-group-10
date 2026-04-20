import Skill from './Skill.js';
import { Tower } from './SkillEntity.js';

export class ArrowTower extends Skill {
    constructor(events) {
        super(
            'ArrowTower', 'Physics',
            'Place an arrow tower that automatically fires at nearby enemies.',
            40, 20, 99999, events, 'Point', false
        );
        this.duration = 720;
        this.upgradedDuration = 1200;
        this.attackRange = 100;
        this.attackInterval = 40;
        this.baseDamage = 20;
        this.upgradedDamage = 40;
        this.towerHitbox = 12;
        this.arrowSpeed = 8;
        this.arrowHitbox = 4;
    }

    upgrade() {
        super.upgrade();
        this.description = 'ArrowTower lasts longer and fires stronger arrows.';
    }

    casted(target, caster, source, tick) {
        super.casted();
        if (!target || !caster) {
            return;
        }

        const casterId = caster?.name ?? caster;
        const damage = this.getAttackDamage(
            this.upgraded ? this.upgradedDamage : this.baseDamage,
            caster
        );
        const tower = new Tower(
            `${casterId}_arrow_tower_${tick}`,
            { x: Number(target.x) || 0, y: Number(target.y) || 0 },
            this.towerHitbox,
            this.events,
            this.upgraded ? this.upgradedDuration : this.duration,
            this.attackRange,
            this.attackInterval,
            this.arrowSpeed,
            this.arrowHitbox,
            damage,
            caster
        );

        this.events.emit('skill_entity:created', { entity: tower });
    }
}

export class RockTower extends Skill {
    constructor(events) {
        super(
            'RockTower', 'Physics',
            'Place a rock tower that rolls boulders through nearby enemies.',
            40, 20, 99999, events, 'Point', false
        );
        this.duration = 720;
        this.attackRange = 100;
        this.attackInterval = 120;
        this.damage = 30;
        this.towerHitbox = 12;
        this.rockSpeed = 2;
        this.rockHitbox = 30;
        this.rockMaxDistance = 100;
    }

    upgrade() {
        super.upgrade();
        this.description = 'RockTower rolls heavy boulders that can hit each enemy once.';
    }

    casted(target, caster, source, tick) {
        super.casted();
        if (!target || !caster) {
            return;
        }

        const casterId = caster?.name ?? caster;
        const damage = this.getAttackDamage(this.damage, caster);
        const tower = new Tower(
            `${casterId}_rock_tower_${tick}`,
            { x: Number(target.x) || 0, y: Number(target.y) || 0 },
            this.towerHitbox,
            this.events,
            this.duration,
            this.attackRange,
            this.attackInterval,
            this.rockSpeed,
            this.rockHitbox,
            damage,
            caster,
            this.rockMaxDistance,
            true,
            'rock'
        );

        this.events.emit('skill_entity:created', { entity: tower });
    }
}
