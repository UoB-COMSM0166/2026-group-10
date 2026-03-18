import Unit from './Unit.js';
import { IcePick, StormBlast, FrostShield, Blizzard, ArcaneIntelligence, ManaDrain, Chakra } from "../Skill/Archmage.js";

const EXPERIENCE_TABLE = [
    100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500,
];
const BASE_RESPAWN_CD = 120;  // Ticks

export default class Hero extends Unit {
    constructor(hero, position, events, ui, clock) {
        super(hero.name, position, hero.speed, hero.hitbox, hero.hp, hero.mp, hero.sprite);
        this.events = events;
        this.ui = ui;
        this.clock = clock;
        this.name = String(hero.name);
        this.description = String(hero.description);
        this.mainAttribute = String(hero.mainAttribute);
        this.baseAttribute = hero.baseAttribute;
        this.attributeGrowth = hero.attributeGrowth;

        this.respawnCD = BASE_RESPAWN_CD;
        this.active = false;
        this.remainingRespawnCD = 0;

        this.level = 1;
        this.experience = 0;

        // 技能和装备系统
        this.skill = new Map();
        const icePick = new IcePick(this.events);
        // icePick.upgrade();
        const stormBlast = new StormBlast(this.events);
        const chakra = new Chakra(this.events);
        const blizzard = new Blizzard(this.events, { width: 1280, height: 720 });
        const arcaneIntelligence = new ArcaneIntelligence(this.events);
        const manaDrain = new ManaDrain(this.events);
        const frostShield = new FrostShield(this.events);
        this.skill.set('A', icePick);
        this.skill.set('Q', stormBlast);
        this.skill.set('W', frostShield);
        this.skill.set('E', chakra);
        this.skill.set('R', blizzard);
        this.skill.set('D', arcaneIntelligence);
        this.skill.set('F', manaDrain);
        this.renderRange = null;
        this.applyPassiveSkills();

        this.inventory = new Map();
        this.inventory.set('weapon', null);
        this.inventory.set('armor', null);
        this.inventory.set('shoes', null);
    }

    gainExperience(amount) {
        console.log(`${this.name} gainExperience: ${amount}`);
        this.experience += amount;
        if (this.experience >= EXPERIENCE_TABLE[this.level - 2]) {
            this.levelUp();
            this.experience = this.experience - EXPERIENCE_TABLE[this.level - 2];
        }
    }

    levelUp() {
        this.level++;
    }

    die() {
        if (!this.alive()) return;
        this.stop();
        this.clearWaypoints();
        this.remainingRespawnCD = this.respawnCD;
        this.events.emit('hero:death');
    }

    respawn(position) {
        this.position = { x: position.x, y: position.y };
        this.stop();
        this.clearWaypoints();
        this.events.emit('hero:respawn');
    }

    updateMovement() {
        if (!this.alive()) { return; }
        super.updateMovement();
    }

    updateSkill() {
        for (let skill of this.skill.values()) {
            if (skill) {
                skill.coolingDown();
            }
        }
    }

    stop() {
        super.stop();
        this.clearWaypoints();
        this.removeTarget();
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
