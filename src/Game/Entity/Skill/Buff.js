export default class Buff {
    constructor(name, description, icon, duration, effect, positive = true, effectPeriod = 1, tags = [], level = 1) {
        this.name = String(name);
        this.description = String(description);
        // TODO: 暂时设定icon为颜色
        this.icon = String(icon);
        this.duration = Number(duration);
        this.remaining = Number(duration);
        this.effect = effect;
        this.positive = Boolean(positive);
        this.effectPeriod = Math.max(1, Number(effectPeriod) || 1);
        this.elapsed = 0;
        this.tags = Array.isArray(tags) ? [...tags] : [];
        this.level = Number(level) || 1;
    }

    onEffect(unit) {
        this.elapsed += 1;

        if (this.elapsed % this.effectPeriod === 0 && typeof this.effect === 'function') {
            this.effect(unit);
        }
    }

    // increaseLevel(amount) {
    //     this.level += Number(amount) || 0;
    // }
    //
    // decreaseLevel(amount) {
    //     this.level = Math.max(1, this.level - (Number(amount) || 0));
    // }

    clone() {
        return new Buff(
            this.name,
            this.description,
            this.icon,
            this.duration,
            this.effect,
            this.positive,
            this.effectPeriod,
            this.tags,
            this.level
        );
    }
}
