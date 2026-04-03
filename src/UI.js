export default class UI {
    constructor(layer, game, ui) {
        this.layer = layer;
        this.game = game;
        this.ui = ui;
    }

    draw() {
        const hero = this.game?.hero;
        if (!hero) {
            return;
        }

        this.drawHeroStatus(hero);
    }

    drawHeroStatus(hero) {
        const panelWidth = 320;
        const panelHeight = 84;
        const padding = 16;
        const barHeight = 18;
        const barWidth = panelWidth - padding * 2;
        const left = 20;
        const top = this.layer.height - panelHeight - 20;

        const hpRatio = hero.maxHP > 0 ? hero.currentHP / hero.maxHP : 0;
        const mpRatio = hero.maxMP > 0 ? hero.currentMP / hero.maxMP : 0;

        this.layer.push();
        this.layer.noStroke();
        this.layer.fill('rgba(18, 22, 30, 0.82)');
        this.layer.rect(left, top, panelWidth, panelHeight, 10);

        this.layer.fill(255);
        this.layer.textSize(14);
        this.layer.textAlign(this.layer.LEFT, this.layer.TOP);
        this.layer.text(hero.name, left + padding, top + 10);

        this.drawBar(
            left + padding,
            top + 32,
            barWidth,
            barHeight,
            hpRatio,
            'rgba(170, 40, 50, 1)',
            `HP ${Math.round(hero.currentHP)} / ${hero.maxHP}`
        );

        this.drawBar(
            left + padding,
            top + 56,
            barWidth,
            barHeight,
            mpRatio,
            'rgba(50, 110, 220, 1)',
            `MP ${Math.round(hero.currentMP)} / ${hero.maxMP}`
        );
        this.layer.pop();
    }

    drawBar(x, y, width, height, ratio, fillColor, label) {
        const clampedRatio = Math.max(0, Math.min(1, ratio));

        this.layer.fill('rgba(255, 255, 255, 0.12)');
        this.layer.rect(x, y, width, height, 6);
        this.layer.fill(fillColor);
        this.layer.rect(x, y, width * clampedRatio, height, 6);

        this.layer.fill(255);
        this.layer.textSize(12);
        this.layer.textAlign(this.layer.CENTER, this.layer.CENTER);
        this.layer.text(label, x + width / 2, y + height / 2);
    }
}
