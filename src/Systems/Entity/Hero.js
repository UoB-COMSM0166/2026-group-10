import { Entity } from './Entity.js';

export default class Hero {
    static createHero(id, position) {
        const hero = new Entity(id);
        hero.setComponent('position', position);
        hero.setComponent('velocity', { vx: 0, vy: 0 });

        return hero;
    }

    static initHeroData(json, hero) {
        // Based on the JSON data, initialize the hero's components
        hero.addComponent('name', json.name);
        hero.addComponent('mainAttribute', json.mainAttribute);
        hero.addComponent('description', json.description);
        hero.addComponent('baseAttribute', json.baseAttribute);
        hero.addComponent('attributeGrowth', json.attributeGrowth);
        hero.addComponent('baseStat', json.baseStat);
        hero.addComponent('alive', true);
        hero.addComponent('level', 1);
        hero.addComponent('experience', 0);
        hero.addComponent('effects', []); // List of active effects on the hero

        // Calculate derived stats. Dirty flag indicates whether the stat needs to be recalculated (e.g., casted by a buff, equipping items, etc.)
        const stats = Hero.calculateStats(json);
        hero.addComponent('stats', stats);
        hero.addComponent('dirty', {
            maxHP: false,
            hpRegen: false,
            maxMP: false,
            mpRegen: false,
            attackDamage: false,
            speed: false,
            attackCD: false,
            armor: false,
            spellAmp: false
        });
    }

    static levelUp(json, hero) {
        let level = hero.getComponent('level');
        hero.setComponent('level', level + 1);

        // Recalculate stats based on new level
        const stats = Hero.calculateStats(json);
        hero.setComponent('stats', stats);

        // Restore HP and MP in ratio to the new max
        let currentHP = hero.getComponent('currentHP');
        let maxHP = hero.getComponent('stats').maxHP;
        hero.setComponent('currentHP', Math.min(currentHP + 0.2 * maxHP, maxHP));

        let currentMP = hero.getComponent('currentMP');
        let maxMP = hero.getComponent('stats').maxMP;
        hero.setComponent('currentMP', Math.min(currentMP + 0.2 * maxMP, maxMP));
    }

    static die(hero) {
        hero.setComponent('alive', false);
    }
    
    static respawn(hero, position) {
        hero.setComponent('alive', true);
        hero.setComponent('position', position);
        hero.setComponent('velocity', { vx: 0, vy: 0 });
        hero.setComponent('currentHP', hero.getComponent('stats').maxHP);
        hero.setComponent('currentMP', hero.getComponent('stats').maxMP);
    }

    // Calculate the status screens (HP, MP, etc.) based on the base stats and attributes.
    static calculateStats(json) {        
        // 计算状态屏幕（HP、MP等）基于基础属性和属性成长（不包括buff，装备加成）
        // TODO: Calculate the status screens (HP, MP, etc.) based on the base stats and attribute growth (not including buffs, equipment bonuses, etc.)

        return {
            maxHP: maxHP,
            hpRegen: hpRegen,
            maxMP: maxMP,
            mpRegen: mpRegen,
            attackDamage: attackDamage,
            speed: speed,
            attackCD: attackCD,
            armor: armor,
            spellAmp: spellAmp
        }
    }
}

