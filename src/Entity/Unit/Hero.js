import Unit from './Unit.js';
import Skill from '../Skill/Skill.js';

export default class Hero extends Unit {
    constructor(json, position, mapWidth, mapHeight) {
        super("hero", position, 0, {width: 0, height: 0});
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        this.level = 1;
        this.name = json.name;
        this.description = json.description;
        this.hitbox = json.hitbox;

        this.mainAttribute = json.mainAttribute;
        this.baseAttribute = json.baseAttribute;
        this.attributeGrowth = json.attributeGrowth;
        this.baseStat = json.baseStat;

        this.state = {
            strength: 0,
            agility: 0,
            intelligence: 0,
        }

        // Stats Definition
        this.maxHP;
        this.hpRegen;
        this.maxMP;
        this.mpRegen;
        this.attackDamage;
        this.speed;
        this.attackCD;
        this.armor;
        this.spellAmp;

        this.updateAttribute();
        this.updateStat();
        this.currentHP = this.maxHP;
        this.currentMP = this.maxMP;

        // MARK: Example skill, which should be stored in Hero JSON file
        const skill = {
            name: "Ice Pick",
            category: "Projectile",
            description: "Generate a ice pick that moving towards a enemy.",
            damage: 20,
            speed: 20,
            hitbox: {width: 10, height: 10},
            cooldown: 120,
            manaCost: 0
        }

        // Skill system
        this.skills = {
            A: new Skill(skill),
        };
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

    // Level Update Attribute
    updateAttribute() {
        this.state.strength = this.baseAttribute.strength + (this.level - 1) * this.attributeGrowth.strength;
        this.state.agility = this.baseAttribute.agility + (this.level - 1) * this.attributeGrowth.agility;
        this.state.intelligence = this.baseAttribute.intelligence + (this.level - 1) * this.attributeGrowth.intelligence;
    }

    // Level Update Stat
    updateStat() {
        this.maxHP = this.baseStat.hp + this.state.strength * 20;
        this.hpRegen = this.state.strength * 0.1;
        this.maxMP = this.baseStat.mp + this.state.intelligence * 12;
        this.mpRegen = this.state.intelligence * 0.05;
        this.attackDamage = this.state.strength * 2 + this.state.agility * 1.5;
        this.speed = this.state.agility * 1.5;
        this.attackCD = Math.max(0.1, this.baseStat.attackCD - this.state.agility * 0.01);
        this.armor = this.state.agility * 0.3;
        this.spellAmp = this.state.intelligence * 0.5;
    }
}