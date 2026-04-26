import Hero from './Hero.js';
import {
    IcePick, StormBlast, FrostShield, Chakra, Blizzard, ManaDrain,
    FireBall, FlameWave, Burning, ViperGuardian, Meteorite, FierySoul,
    Lightning, ThunderCloud, ChainLightning, BallLightning, StaticExplosion, ElectromagneticField
} from "../../Skill/Archmage.js";

const MP_PER_INTELLIGENCE = 30;
const MP_REGEN_PER_INTELLIGENCE = 0.05;

export default class Archmage extends Hero {
    constructor(position, events, element, clock) {
        super(
            'Archmage', 'Lyra\'Gotha', position, 1, 15, 180, 220,
            'Manipulate magical elements to deal massive damage from a distance.',
            2, 3, 4, events, clock, ['Ice', 'Fire', 'Lightning']
        );
        this.baseMaxMP = this.maxMP;

        this.baseHpRegen = 1;
        this.baseMpRegen = 1.5;
        this.hpRegen = this.baseHpRegen;
        this.mpRegen = this.baseMpRegen;

        this.statsGrowth.set('Speed', 0.15);
        this.statsGrowth.set('Armor', 0.1);
        this.statsGrowth.set('Strength', 1);
        this.statsGrowth.set('Intelligence', 1.2);

        const icePick = new IcePick(this.events);
        const stormBlast = new StormBlast(this.events);
        const frostShield = new FrostShield(this.events);
        const chakra = new Chakra(this.events);
        const blizzard = new Blizzard(this.events);
        const manaDrain = new ManaDrain(this.events);

        const fireBall = new FireBall(this.events);
        const flameWave = new FlameWave(this.events);
        const burning = new Burning(this.events);
        const viperGuardian = new ViperGuardian(this.events);
        const meteorite = new Meteorite(this.events);
        const fierySoul = new FierySoul(this.events);

        const lightning = new Lightning(this.events);
        const thunderCloud = new ThunderCloud(this.events);
        const chainLightning = new ChainLightning(this.events);
        const ballLightning = new BallLightning(this.events);
        const staticExplosion = new StaticExplosion(this.events);
        const electromagneticField = new ElectromagneticField(this.events);

        this.skillTree = new Map();
        this.skillTree.set('A', [icePick, fireBall, lightning]);
        this.skillTree.set('Q', [stormBlast, flameWave, thunderCloud]);
        this.skillTree.set('W', [frostShield, burning, chainLightning]);
        this.skillTree.set('E', [chakra, viperGuardian, ballLightning]);
        this.skillTree.set('R', [blizzard, meteorite, staticExplosion]);
        this.skillTree.set('P', [manaDrain, fierySoul, electromagneticField]);
        this.initializeSkillSlots();

        if (element === 'Ice') {
            this.skill.set('A', icePick);
            this.skill.set('Q', stormBlast);
            // this.skill.set('W', frostShield);
            // this.skill.set('E', chakra);
            // this.skill.set('R', blizzard);
            this.skill.set('P', manaDrain);
        } 
        else if (element === 'Fire') {
            this.skill.set('A', fireBall);
            this.skill.set('Q', flameWave);
            // this.skill.set('W', burning);
            // this.skill.set('E', viperGuardian);
            // this.skill.set('R', meteorite);
            this.skill.set('P', fierySoul);
        } 
        else if (element === 'Thunder') {
            this.skill.set('A', lightning);
            this.skill.set('Q', thunderCloud);
            // this.skill.set('W', chainLightning);
            // this.skill.set('E', ballLightning);
            // this.skill.set('R', staticExplosion);
            this.skill.set('P', electromagneticField);
        } 

        this.applyPassiveSkills();

        this.skill.set('W', null);
        this.skill.set('E', null);
        this.skill.set('R', null);
    }

    respawn() {
        super.respawn();
        this.currentMP = this.maxMP;
    }

    updateRespawn() {
        if (this.alive() || this.remainingRespawnCD <= 0) {
            return;
        }

        this.remainingRespawnCD -= 1;
        if (this.remainingRespawnCD <= 0) {
            this.respawn();
        }
    }

    updateBuffs() {
        super.updateBuffs();
        this.applyIntelligenceStats();
    }

    applyIntelligenceStats() {
        const previousMaxMP = this.maxMP;
        this.maxMP = this.baseMaxMP + this.intelligence * MP_PER_INTELLIGENCE;
        this.mpRegen += this.intelligence * MP_REGEN_PER_INTELLIGENCE;

        if (this.maxMP > previousMaxMP) {
            this.currentMP += this.maxMP - previousMaxMP;
        }

        this.currentMP = Math.min(this.currentMP, this.maxMP);
    }

    changeSkill(slot, skill) {
        return super.changeSkill(slot, skill);
    }
}
