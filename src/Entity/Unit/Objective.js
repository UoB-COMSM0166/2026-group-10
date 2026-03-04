import Unit from './Unit.js';

export default class Objective extends Unit {
    constructor(position, HP) {
        super("objective", position, 0, { width: 50, height: 50 }, HP, 0);
    }
}