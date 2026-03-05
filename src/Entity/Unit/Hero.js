import Unit from './Unit.js';
import Skill from '../Skill/Skill.js';
import Projectile from '../Skill/Projectile.js';
import AreaEffect from '../Skill/AreaEffect.js';
import Buff from '../Skill/Buff.js';
const EXPERIENCE_TABLE = [
    100,  // Level 2
    300,  // Level 3
    600,  // Level 4
    1000, // Level 5
    1500, // Level 6
    2100, // Level 7
    2800, // Level 8
    3600, // Level 9
    4500, // Level 10
];

export default class Hero extends Unit {
    constructor(json, skillData, position, mapWidth, mapHeight, events = null) {
        super("hero", position, 0, {width: 0, height: 0});
        this.events = events;
        this.gameManager = null;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        this.level = 1;
        this.experience = 0;
        this.name = json.name;
        this.description = json.description;
        this.hitbox = json.hitbox;

        this.mainAttribute = json.mainAttribute;
        this.baseAttribute = json.baseAttribute;
        this.attributeGrowth = json.attributeGrowth;
        this.baseStat = json.baseStat;

        this.baseComputedAttribute = {
            strength: 0,
            agility: 0,
            intelligence: 0,
        };
        this.attribute = {
            strength: 0,
            agility: 0,
            intelligence: 0,
        };

        // Current stats (with Buff/Debuff)
        this.maxHP = 0;
        this.hpRegen = 0;
        this.maxMP = 0;
        this.mpRegen = 0;
        this.speed = 0;
        this.armor = 0;
        this.spellAmp = 0;

        this.skills = this.buildSkills(skillData, json);
        this.passiveSkillSlots = ['D', 'F'];
        this.passiveBuffTag = 'passive_skill';
        this.registerEventHandlers();

        this.updateAttribute();
        this.updateStat();
        this.currentHP = this.maxHP;
        this.currentMP = this.maxMP;
        this.emitStatsUpdated('init');
    }

    registerEventHandlers() {
        if (!this.events) {
            return;
        }

        this.events.on('hero:skill:cast', ({ key, x, y }) => {
            this.castSkill(key, x, y);
        });
    }

    bindGameManager(gameManager) {
        this.gameManager = gameManager;
    }

    getAmplifiedSelfBuffStatus(baseStatus = {}) {
        const ampFactor = 1 + Math.max(0, this.spellAmp || 0) / 100;
        const scaledStatus = {};

        for (const [stat, value] of Object.entries(baseStatus)) {
            if (typeof value === 'number') {
                scaledStatus[stat] = Number((value * ampFactor).toFixed(3));
            }
        }

        return scaledStatus;
    }

    castSkill(key, x, y) {
        if (!this.gameManager) {
            return;
        }

        const skill = this.skills[key];
        if (!skill) {
            this.events?.emit('hero:skill:failed', { key, reason: 'skill_not_found', x, y });
            return;
        }

        if (!skill.canCast()) {
            this.events?.emit('hero:skill:failed', { key, reason: 'on_cooldown', skill, x, y });
            return;
        }

        if (this.currentMP < skill.manaCost) {
            this.events?.emit('hero:skill:failed', { key, reason: 'not_enough_mana', skill, x, y });
            return;
        }

        if (skill.category === "Projectile" || skill.category === "TargetUnit") {
            const projectile = new Projectile(
                `projectile_${this.gameManager.now()}`,
                { x: this.position.x, y: this.position.y },
                skill.speed,
                skill.hitbox,
                { x, y },
                skill.damage
            );
            projectile.calculateVelocity({ x, y });
            this.gameManager.addEntity(projectile);
            this.currentMP -= skill.manaCost;
            skill.startCooldown();
            this.events?.emit('hero:skill:casted', { key, skill, x, y, entity: projectile });
            return;
        }

        if (skill.category === "Area") {
            const areaEffect = new AreaEffect(
                `area_${this.gameManager.now()}`,
                { x, y },
                skill.hitbox,
                skill.duration,
                skill.damage + this.spellAmp * 0.7,
                skill.damagePeriod,
                this.gameManager
            );
            this.gameManager.addEntity(areaEffect);
            this.currentMP -= skill.manaCost;
            skill.startCooldown();
            this.events?.emit('hero:skill:casted', { key, skill, x, y, entity: areaEffect });
            return;
        }

        if (skill.category === "SelfBuff") {
            const amplifiedStatus = this.getAmplifiedSelfBuffStatus(skill.effectStatus || {});
            const buff = new Buff(skill.name, skill.description, skill.duration, amplifiedStatus);
            this.applyBuff(buff);
            this.currentMP -= skill.manaCost;
            skill.startCooldown();
            this.events?.emit('hero:skill:casted', { key, skill, x: this.position.x, y: this.position.y });
            return;
        }

        this.events?.emit('hero:skill:failed', { key, reason: 'unsupported_category', skill, x, y });
    }

    calculateMovement() {
            const pos = this.position;
            const vel = this.velocity;
            if (pos && vel) {
                pos.x += vel.vx;
                pos.y += vel.vy;
            }

        // Reset Location if out of bounds
        if (pos.x < 0 || pos.x > this.mapWidth || pos.y < 0 || pos.y > this.mapHeight) {
            pos.x = Math.max(0, Math.min(pos.x, this.mapWidth));
            pos.y = Math.max(0, Math.min(pos.y, this.mapHeight));
            vel.vx = 0;
            vel.vy = 0;
        }
    }

    gainExperience(amount) {
        this.experience += amount;
        this.checkLevelUp();
    }

    checkLevelUp() {
        if (this.experience >= EXPERIENCE_TABLE[this.level - 2]) {
            this.levelUp();
            this.experience = 0; // Reset experience after leveling up
        }
    }

    levelUp() {
        const previousLevel = this.level;
        console.log(`Hero leveled up to level ${this.level + 1}`);
        this.level += 1;
        this.updateAttribute();
        this.updateStat();
        this.emitStatsUpdated('level_up');
        if (this.events) {
            this.events.emit('hero:levelup', {
                hero: this,
                previousLevel,
                newLevel: this.level
            });
        }
    }

    // Level Update Attribute
    updateAttribute() {
        this.baseComputedAttribute.strength = this.baseAttribute.strength + (this.level - 1) * this.attributeGrowth.strength;
        this.baseComputedAttribute.agility = this.baseAttribute.agility + (this.level - 1) * this.attributeGrowth.agility;
        this.baseComputedAttribute.intelligence = this.baseAttribute.intelligence + (this.level - 1) * this.attributeGrowth.intelligence;
    }

    // Level Update Stat
    updateStat() {
        this.maxHP = this.baseStat.hp + this.baseComputedAttribute.strength * 20;
        this.hpRegen = this.baseComputedAttribute.strength * 0.001;
        this.maxMP = this.baseStat.mp + this.baseComputedAttribute.intelligence * 12;
        this.mpRegen = this.baseComputedAttribute.intelligence * 0.001;
        this.speed = this.baseStat.speed + this.baseComputedAttribute.agility * 0.1;
        this.armor = this.baseComputedAttribute.agility * 0.3;
        this.spellAmp = this.baseComputedAttribute.intelligence * 0.5;
        this.updateFinalStat();
    }

    updateFinalStat() {
        this.syncPassiveSkillBuffs();
        const finalStats = this.calculateBuffedStats();

        this.attribute.strength = finalStats.strength;
        this.attribute.agility = finalStats.agility;
        this.attribute.intelligence = finalStats.intelligence;

        const hpRatio = this.currentHP / this.maxHP;
        const mpRatio = this.currentMP / this.maxMP;

        this.maxHP = finalStats.maxHP;
        this.hpRegen = finalStats.hpRegen;
        this.maxMP = finalStats.maxMP;
        this.mpRegen = finalStats.mpRegen;
        this.speed = finalStats.speed;
        this.armor = finalStats.armor;
        this.spellAmp = finalStats.spellAmp;

        if (this.skills.A) {
            this.skills.A.cooldown = Math.max(6, this.baseStat.attackCD - this.attribute.agility);
            this.skills.A.damage = this.attribute[this.mainAttribute] * 1.5;
        }

        this.currentHP = this.maxHP * hpRatio;
        this.currentMP = this.maxMP * mpRatio;
    }

    getPassiveSkillBuff(slot) {
        if (!slot) {
            return null;
        }
        return (this.buffs || []).find((buff) => buff?.source === this.passiveBuffTag && buff?.passiveSlot === slot) || null;
    }

    createPassiveBuff(slot, skill) {
        const status = (skill && typeof skill.effectStatus === 'object' && skill.effectStatus) ? skill.effectStatus : {};
        const buff = new Buff(skill.name, skill.description, -1, { ...status });
        buff.source = this.passiveBuffTag;
        buff.passiveSlot = slot;
        buff.passiveSkillName = skill.name;
        return buff;
    }

    syncPassiveSkillBuffs() {
        if (!Array.isArray(this.buffs)) {
            this.buffs = [];
        }

        for (const slot of this.passiveSkillSlots) {
            const skill = this.skills?.[slot] || null;
            const existingBuff = this.getPassiveSkillBuff(slot);
            const isPassiveSkill = !!(skill && skill.category === 'Passive');

            if (!isPassiveSkill) {
                if (existingBuff) {
                    this.buffs = this.buffs.filter((buff) => buff !== existingBuff);
                }
                continue;
            }

            if (!existingBuff) {
                this.buffs.push(this.createPassiveBuff(slot, skill));
                continue;
            }

            existingBuff.name = skill.name;
            existingBuff.description = skill.description;
            existingBuff.duration = -1;
            existingBuff.currentDuration = -1;
            existingBuff.status = { ...(skill.effectStatus || {}) };
            existingBuff.passiveSkillName = skill.name;
        }
    }

    calculateBuffedStats() {
        const buffDelta = {
            strength: 0,
            agility: 0,
            intelligence: 0,
            maxHP: 0,
            hpRegen: 0,
            maxMP: 0,
            mpRegen: 0,
            speed: 0,
            armor: 0,
            spellAmp: 0
        };

        for (const buff of this.buffs || []) {
            if (!buff || !buff.status) {
                continue;
            }
            for (const [key, value] of Object.entries(buff.status)) {
                if (typeof value === 'number' && Object.prototype.hasOwnProperty.call(buffDelta, key)) {
                    buffDelta[key] += value;
                }
            }
        }

        const strength = Math.max(0, this.baseComputedAttribute.strength + buffDelta.strength);
        const agility = Math.max(0, this.baseComputedAttribute.agility + buffDelta.agility);
        const intelligence = Math.max(0, this.baseComputedAttribute.intelligence + buffDelta.intelligence);

        const maxHP = Math.max(1, this.baseStat.hp + strength * 20 + buffDelta.maxHP);
        const hpRegen = Math.max(0, strength * 0.001 + buffDelta.hpRegen);
        const maxMP = Math.max(0, this.baseStat.mp + intelligence * 12 + buffDelta.maxMP);
        const mpRegen = Math.max(0, intelligence * 0.001 + buffDelta.mpRegen);
        const speed = Math.max(0, this.baseStat.speed + agility * 0.1 + buffDelta.speed);
        const armor = agility * 0.3 + buffDelta.armor;
        const spellAmp = Math.max(0, intelligence * 0.5 + buffDelta.spellAmp);

        return {
            strength,
            agility,
            intelligence,
            maxHP,
            hpRegen,
            maxMP,
            mpRegen,
            speed,
            armor,
            spellAmp
        };
    }

    applyRegenTick() {
        let changed = false;

        if (typeof this.currentHP === 'number' && this.hpRegen > 0 && this.currentHP < this.maxHP) {
            this.currentHP = Math.min(this.maxHP, this.currentHP + this.hpRegen);
            changed = true;
        }

        if (typeof this.currentMP === 'number' && this.mpRegen > 0 && this.currentMP < this.maxMP) {
            this.currentMP = Math.min(this.maxMP, this.currentMP + this.mpRegen);
            changed = true;
        }

        if (changed) {
            this.emitStatsUpdated('regen_tick');
        }
    }

    getStatsSnapshot() {
        return {
            name: this.name,
            level: this.level,
            hp: Math.round(this.currentHP),
            maxHP: Math.round(this.maxHP),
            mp: Math.round(this.currentMP),
            maxMP: Math.round(this.maxMP),
            strength: Math.round(this.attribute.strength),
            agility: Math.round(this.attribute.agility),
            intelligence: Math.round(this.attribute.intelligence),
            speed: Number(this.speed.toFixed(1)),
            armor: Number(this.armor.toFixed(1)),
            spellAmp: Number(this.spellAmp.toFixed(1))
        };
    }

    emitStatsUpdated(source = 'update') {
        if (!this.events) {
            return;
        }
        this.events.emit('hero:stats:updated', {
            source,
            hero: this,
            stats: this.getStatsSnapshot()
        });
    }

    applyBuff(buff) {
        return super.addBuff(buff);
    }

    getSkillSetName(skillData, heroJson) {
        if (!skillData || typeof skillData !== 'object') {
            return null;
        }

        const configuredSet = heroJson?.skillSet || heroJson?.skillTree || heroJson?.skillPreset;
        if (configuredSet && skillData[configuredSet]) {
            return configuredSet;
        }

        const [firstSet] = Object.keys(skillData);
        return firstSet || null;
    }

    getSkillDefinition(skillEntries) {
        if (Array.isArray(skillEntries)) {
            return skillEntries.find((entry) => entry && entry.name && entry.category) || null;
        }
        if (skillEntries && skillEntries.name && skillEntries.category) {
            return skillEntries;
        }
        return null;
    }

    buildSkills(skillData, heroJson) {
        const skillSetName = this.getSkillSetName(skillData, heroJson);
        const skillSet = skillSetName ? skillData[skillSetName] : {};
        const slotKeys = ['A', 'Q', 'W', 'E', 'R', 'D', 'F'];
        const builtSkills = {};

        for (const slot of slotKeys) {
            const definition = this.getSkillDefinition(skillSet?.[slot]);
            if (!definition) {
                continue;
            }
            builtSkills[slot] = new Skill(definition);
        }

        return builtSkills;
    }

    changeSkill(key, skill) {
        if (!key) {
            return;
        }

        if (skill === null) {
            this.skills[key] = null;
        } else if (skill) {
            this.skills[key] = skill instanceof Skill ? skill : new Skill(skill);
        } else {
            return;
        }

        this.statsDirty = true;
        this.recalculateStatsFromBuffs('skill_changed');
    }
}
