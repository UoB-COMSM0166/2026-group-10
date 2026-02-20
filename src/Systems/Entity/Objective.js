import Entity from './Entity.js';

export default class Objective {
    static createObjective(id, position, hp) {
        let objective = new Entity(id, 'objective', position);
        objective.setComponent('hp', hp);
        return objective;
    }
    
    static takeDamage(objective, damage) {
        let currentHp = objective.getComponent('hp');
        if (currentHp === null) return;

        let newHp = currentHp - damage;
        objective.setComponent('hp', newHp);

        if (newHp <= 0) {
            this.die(objective);
        }
    }
}