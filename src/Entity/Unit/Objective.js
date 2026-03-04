import Unit from './Unit.js';

export default class Objective extends Unit {
    constructor(json) {
        super("objective", json.position, 0, json.hitbox, json.hp, 0);
    }
}