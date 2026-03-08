export default class Buff {
    constructor(name, description, duration, status) {
        this.name = name;
        this.description = description;
        this.duration = duration;  // Duration in ticks, -1 for infinite
        this.currentDuration = duration;
        this.status = status;  // {speed: 10, armor: -5, ...}
    }
}