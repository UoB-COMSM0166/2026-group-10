import Entity from '../Entity.js';

export default class Unit extends Entity {
    constructor(id, position, speed, hitbox, hp, mp) {
        super(id, position, speed, hitbox);

        this.maxHP = hp;
        this.maxMP = mp;
        this.currentHP = hp;
        this.currentMP = mp;
    }

    takeDamage(amount) {
        this.currentHP = Math.max(0, this.currentHP - amount);
    }

    heal(amount) {
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    }

    die() {
        // Handle unit death (e.g., remove from game, play animation, etc.)
    }
}