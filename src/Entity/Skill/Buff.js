export default class Buff {
    constructor(name, description, icon, duration, effect, positive = true) {
        this.name = String(name);
        this.description = String(description);
        // TODO: 暂时设定icon为颜色
        this.icon = String(icon);
        this.duration = Number(duration);
        this.remaining = Number(duration);
        this.effect = effect;
        this.positive = Boolean(positive);
    }

    onEffect(unit) {
        if (typeof this.effect === 'function') {
            this.effect(unit);
        }
    }

    clone() {
        return new Buff(
            this.name,
            this.description,
            this.icon,
            this.duration,
            this.effect,
            this.positive
        );
    }
}
