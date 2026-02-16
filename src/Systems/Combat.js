export class Combat {
    // damage = attack damage * (100 / (100 + armor))
    static damage(source, target, damage) {

    }

    static applyEffect(entity, effect) {
        entity.getComponent('effects').push(effect);
    }
}