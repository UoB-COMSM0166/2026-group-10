import Hero from './Hero.js';
import {
    IcePick, StormBlast, FrostShield, Chakra, Blizzard, ManaDrain,
    FireBall, FlameWave, Burning, ViperGuardian, Meteorite, FierySoul,
    Lightning, ThunderCloud, ChainLightning, BallLightning, StaticExplosion, ElectromagneticField
} from "../../Skill/Archmage.js";

export default class Archmage extends Hero {
    constructor(position, events, element, ui, clock) {
        super(
            'Archmage', 'Lyra\'Gotha', position, 1, 15, 180, 220,
            'Manipulate magical elements to deal massive damage from a distance.',
            2, 3, 0.1, events, ui, clock, ['Ice', 'Fire', 'Thunder']
        );

        this.baseHpRegen = 1;
        this.baseMpRegen = 1.5;
        this.hpRegen = this.baseHpRegen;
        this.mpRegen = this.baseMpRegen;

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
        this.interruptCast();
        this.position = { x: this.spawnPosition.x, y: this.spawnPosition.y };
        this.currentHP = this.maxHP;
        this.currentMP = this.maxMP;
        this.remainingRespawnCD = 0;
        this.stop();
        this.clearWaypoints();
        this.events.emit('hero:respawn', { hero: this });
        this.ui.emit('hero:respawn', { hero: this });
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

    changeSkill(slot, skill) {
        if (!skill) {
            return null;
        }

        this.skill.set(slot, skill);
        if (slot === 'P') {
            this.applyPassiveSkills();
        }

        return skill;
    }
}
