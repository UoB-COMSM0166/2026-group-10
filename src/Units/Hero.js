import { Unit } from "./Unit.js";

export class Hero extends Unit {
    constructor(p, x, y, move_speed, health = 100, damage = 10) {
        super(p, x, y, move_speed, health, damage);
    }
}