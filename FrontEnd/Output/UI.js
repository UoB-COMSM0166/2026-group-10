import View from './View.js';

export default class UI {
    constructor(layer) {
        this.layer = layer;
        this.layout = {
            panelX: 24,
            panelY: 24,
            panelWidth: 420,
            panelHeight: 190,
            skillBarHeight: 96,
            buffSize: 40,
            skillSize: 52,
            gap: 12,
        };
        this.skillOrder = ['A', 'Q', 'W', 'E', 'R', 'Passive'];
        this.skillPalette = {
            Ice: '#4da3ff',
            Fire: '#ff7a1a',
            Lightning: '#f4d03f',
            default: '#6c7a89',
        };
        this.buffFallbackColor = '#b8c4d6';
        this.toast = null;
        this.toastDuration = 60;
    }

    render(state) {
        const layer = this.layer;
        if (!layer || !state?.hero) {
            return;
        }

        layer.clear();
        this.updateToasts();
        this.drawObjectivePanel(state.objective);
        this.drawHeroProfilePanel(state.hero);
        this.drawHeroSkillsPanel(state.hero);
        this.drawWaveStatsPanel(state.wave);
        // this.drawBuffBar(state.hero);
        this.drawToasts();
    }

    handleWorkerMessage(message) {
        const type = message?.type;
        if (type === 'result') {
            this.handleWorkerResult(message);
            return;
        }

        if (type === 'event') {
            this.handleWorkerEvent(message);
        }
    }

    handleWorkerResult(message) {
        const command = String(message?.command ?? '');
        const payload = message?.payload ?? {};
        const code = Number(payload.code) || 0;
        const data = payload.data ?? {};

        if (command.startsWith('hero:press:') && data.phase === 'targeting') {
            this.pushToast(payload.message, 'info');
            return;
        }

        if (command === 'game:pause' || command === 'game:resume') {
            this.pushToast(payload.message, 'system');
            return;
        }

        if (code >= 400) {
            this.pushToast(payload.message, 'error');
            return;
        }
    }

    handleWorkerEvent(message) {
        return message;
    }

    pushToast(message, tone = 'info') {
        if (!message) {
            return;
        }

        this.toast = {
            id: `${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
            message: String(message),
            tone,
            remaining: this.toastDuration,
        };
    }

    updateToasts() {
        if (!this.toast) {
            return;
        }

        this.toast.remaining -= 1;
        if (this.toast.remaining <= 0) {
            this.toast = null;
        }
    }

    drawToasts() {
        if (!this.toast) {
            return;
        }

        const layer = this.layer;
        const width = 360;
        const height = 54;
        const startX = layer.width - width - 24;
        const startY = layer.height - 24 - height;

        this.drawToast(startX, startY, width, height, this.toast);
    }

    drawToast(x, y, width, height, toast) {
        const layer = this.layer;
        const palette = this.getToastPalette(toast.tone);
        const alpha = Math.min(1, toast.remaining / 30);

        layer.push();
        layer.noStroke();
        layer.fill(layer.red(palette.bg), layer.green(palette.bg), layer.blue(palette.bg), 228 * alpha);
        layer.rect(x, y, width, height, 14);

        layer.fill(palette.accent);
        layer.rect(x, y, 6, height, 14, 0, 0, 14);

        layer.fill(255, 245 * alpha);
        layer.textAlign(layer.LEFT, layer.CENTER);
        layer.textSize(14);
        layer.text(toast.message, x + 18, y + height / 2, width - 28, height - 16);
        layer.pop();
    }

    getToastPalette(tone) {
        const layer = this.layer;
        if (tone === 'error') {
            return { bg: layer.color('#35151b'), accent: layer.color('#d14b57') };
        }

        if (tone === 'success') {
            return { bg: layer.color('#163320'), accent: layer.color('#44c06b') };
        }

        if (tone === 'system') {
            return { bg: layer.color('#1b2436'), accent: layer.color('#8caeff') };
        }

        return { bg: layer.color('#2a2112'), accent: layer.color('#f5c750') };
    }

    drawObjectivePanel(objective) {
        const layer = this.layer;
        const width = 315;
        const height = 270;
        const x = 0;
        const y = 630;

        layer.push();
        layer.noStroke();
        layer.fill(12, 18, 28, 210);
        layer.rect(x, y, width, height, 18);
        View.text(layer, x + width / 2, y + 10, objective.name, 20, 255, false);
        View.meter(
            layer, x + 18, y + height - 40, width - 36, 25,
            objective.hp, objective.maxHP, objective.hpRegen ?? 0,
            layer.color(0, 0, 255), layer.color(0, 0, 100), 20
        )

        layer.rect(x, y+height, 10, 10);
        layer.pop();
    }

    drawHeroProfilePanel(hero) {
        const layer = this.layer;
        const width = 200;
        const height = 270;
        const x = 316;
        const y = 630;

        layer.push();
        layer.noStroke();
        layer.fill(12, 18, 28, 210);
        layer.rect(x, y, width, height, 18);
        View.text(layer, x + width / 2, y + 10, hero.name, 20, 255, true);
        layer.pop();
    }

    drawHeroSkillsPanel(hero) {
        const layer = this.layer;
        const skills = hero.skills ?? {};
        const width = 770;
        const height = 220;
        const x = 516;
        const y = 680;

        layer.push();
        layer.noStroke();
        layer.fill(12, 18, 28, 210);
        layer.rect(x, y, width, height, 18);
        layer.pop();

        View.meter(
            layer, x + 20, y + height - 100, width - 40, 35,
            hero.hp, hero.maxHP, hero.hpRegen ?? 0,
            layer.color(0, 200, 0), layer.color(0, 100, 0), 25
        )

        View.meter(
            layer, x + 20, y + height - 50, width - 40, 35,
            hero.mp, hero.maxMP, hero.mpRegen ?? 0,
            layer.color(50, 50, 255), layer.color(0, 0, 100), 25
        )

        View.skillIcon(layer, x + 20, y + 20, 80, 80, 'A', skills.A);
        View.skillIcon(layer, x + 20 + 100, y + 20, 80, 80, 'Q', skills.Q);
        View.skillIcon(layer, x + 20 + 200, y + 20, 80, 80, 'W', skills.W);
        View.skillIcon(layer, x + 20 + 300, y + 20, 80, 80, 'E', skills.E);
        View.skillIcon(layer, x + 20 + 400, y + 20, 80, 80, 'R', skills.R);
        View.skillIcon(layer, x + 20 + 500, y + 20 + 5, 70, 70, '', skills.Passive);
        View.skillIcon(layer, x + 20 + 590, y + 20, 140, 80, 'B', null);
    }

    drawWaveStatsPanel(wave) {
        const layer = this.layer; 
        const width = 200;
        const height = 270;
        const x = 1286;
        const y = 630;

        layer.push();
        layer.noStroke();
        layer.fill(12, 18, 28, 210);
        layer.rect(x, y, width, height, 18);
        layer.pop();

        let statusText = 'Upcoming';

        if (wave.beforeCountdown <= 0) {
            statusText = 'Pending';
        } else {
            const seconds = Math.ceil(wave.beforeCountdown / 60);
            statusText = String(seconds).padStart(2, '0');
        }

        View.text(layer, x + width / 2, y + 40, 'Wave', 30, 255, true);
        View.text(layer, x + width / 2, y + 80, String(wave.index + 1) + ' : ' + String(wave.total), 40, 255, true);

        View.text(layer, x + width / 2, y + 150, statusText, 40, 255, false);

        View.text(layer, x + 40, y + 215, `${wave.remainingEnemies}`, 45, 255, true, 0, 0, "Arial", 3);
        View.text(layer, x + 130, y + 205, 'Enemies', 20, 255, false, 0, 0, "Arial", 3);
        View.text(layer, x + 130, y + 230, 'Remaining', 20, 255, false, 0, 0, "Arial", 3);
    }

    drawBuffBar(hero) {
        const layer = this.layer;
        const buffs = Array.isArray(hero.buffs) ? hero.buffs : [];
        const { panelX, panelY, panelHeight, skillBarHeight, buffSize, gap } = this.layout;
        const startX = panelX;
        const startY = panelY + panelHeight + skillBarHeight + 34;
        const perRow = 8;
        const rows = Math.max(1, Math.ceil(Math.max(1, buffs.length) / perRow));
        const panelHeightPx = rows * (buffSize + gap) + 30;

        layer.push();
        layer.noStroke();
        layer.fill(12, 18, 28, 210);
        layer.rect(startX, startY, 420, panelHeightPx, 18);

        layer.fill(255);
        layer.textAlign(layer.LEFT, layer.TOP);
        layer.textSize(14);
        layer.text('Buffs', startX + 16, startY + 12);

        buffs.forEach((buff, index) => {
            const col = index % perRow;
            const row = Math.floor(index / perRow);
            const x = startX + 16 + col * (buffSize + gap);
            const y = startY + 34 + row * (buffSize + gap);
            this.drawBuffIcon(x, y, buffSize, buff);
        });

        layer.pop();
    }

    drawBuffIcon(x, y, size, buff) {
        View.buffIcon(
            this.layer,
            x,
            y,
            size,
            buff,
            Boolean(buff?.positive),
            Number(buff?.remaining) || 0,
            Number(buff?.duration) || 0
        );
    }

    getRatio(value, maxValue) {
        if (!maxValue || maxValue <= 0) {
            return 0;
        }

        return value / maxValue;
    }

    getSkillColor(category) {
        return this.skillPalette[category] ?? this.skillPalette.default;
    }

    parseColor(value, fallback) {
        const layer = this.layer;
        if (typeof value === 'string' && value.length > 0) {
            return layer.color(value);
        }

        return layer.color(fallback);
    }

    compactName(name) {
        if (!name) {
            return '';
        }

        const words = String(name).split(/\s+/).filter(Boolean);
        if (words.length === 1) {
            return words[0].slice(0, 8);
        }

        return words.map((word) => word[0]).join('').slice(0, 4);
    }

    getBuffInitials(name) {
        if (!name) {
            return '';
        }

        const words = String(name).split(/\s+/).filter(Boolean);
        if (words.length === 1) {
            return words[0].slice(0, 2).toUpperCase();
        }

        return words.map((word) => word[0]).join('').slice(0, 2).toUpperCase();
    }

    formatNumber(value) {
        return (Number(value) || 0).toFixed(1);
    }
}
