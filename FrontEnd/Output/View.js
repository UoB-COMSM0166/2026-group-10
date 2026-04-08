export default class View {
    static buttonRegistry = new Map();

    LEFT = 0;
    CENTER = 1;
    RIGHT = 2;
    TOP = 0;
    BOTTOM = 2;

    static text(layer, x, y, text, size, color, bold = false, paddingX = 0, paddingY = 0, font = "Arial", stroke = 0) {
        if (bold) {
            layer.textFont(font + ' bold');
        } else {
            layer.textFont(font);
        }
        layer.stroke(0);
        layer.strokeWeight(stroke);
        layer.textSize(size);
        layer.fill(color);
        const width = layer.textWidth(text) + paddingX * 2;
        const height = layer.textAscent() + paddingY * 2;
        let realX = 0;
        let realY = 0;
        // if (alignX === View.CENTER) {
            realX = x - width / 2;
        // } else if (alignX === View.RIGHT) {
        //     realX = x - width;
        // }

        // if (alignY === View.CENTER) {
            realY = y + height / 2;
        // } else if (alignY === View.BOTTOM) {
        //     realY = y + height;
        // }

        layer.text(text, realX, realY);
    }

    static meter(layer, x, y, width, height, current, max, regen, color, subColor, textSize) {
        const clampedRatio = Math.max(0, Math.min(1, current / max));

        layer.push();
        layer.noStroke();
        layer.fill(subColor);
        layer.rect(x, y, width, height);

        layer.fill(color);
        layer.rect(x, y, width * clampedRatio, height);

        View.text(layer, x + width / 2, y + height / 2, `${Math.round(current)} / ${Math.round(max)}`, textSize, 255, true, 0, 0, "Arial", 3);
        View.text(layer, x + width, y + height / 2, `+${regen.toFixed(1)}`, textSize - 8, 200, true, 30, 0, "Arial", 2);
        layer.pop();
    }

    static skillIcon(layer, x, y, width, height, key, skill, cd, maxCd) {
        const currentCooldown = Number(cd ?? skill?.currentCooldown) || 0;
        const totalCooldown = Number(maxCd ?? skill?.cooldown) || 0;
        const cooldownRatio = totalCooldown > 0
            ? Math.max(0, Math.min(1, currentCooldown / totalCooldown))
            : 0;
        const label = skill?.name ? String(skill.name).slice(0, 10) : '';

        layer.push();
        layer.stroke('rgba(255,255,255,0.08)');
        layer.strokeWeight(1);
        layer.fill(skill ? '#4a5568' : '#2f3640');
        layer.rect(x, y, width, height);

        if (skill && currentCooldown > 0 && totalCooldown > 0) {
            const overlayHeight = height * cooldownRatio;
            layer.noStroke();
            layer.fill(6, 10, 18, 190);
            layer.rect(x, y, width, overlayHeight);
        }

        // layer.text(String(key ?? ''), x + 6, y + 4);
        View.text(layer, x + 10, y + 10, String(key ?? ''), 25, skill ? 255 : 180, true, 0, 0, "Arial", 3);

        if (!skill) {
            layer.pop();
            return;
        }

        // layer.text(label, x + width / 2, y + height / 2 + height * 0.14);
        View.text(layer, x + width / 2, y + height - 20, label, Math.max(10, Math.round(Math.min(width, height) * 0.14)), 255, true, 0, 0, "Arial", 2);

        if (currentCooldown > 0) {
            layer.fill(255);
            layer.textSize(Math.max(16, Math.round(Math.min(width, height) * 0.3)));
            layer.text(Math.ceil(currentCooldown), x + width / 2, y + height / 2 - height * 0.1);
        }

        layer.pop();
    }

    static buffIcon(layer, x, y, size, buff, positive, timeLeft, maxTime) {
        const ratio = maxTime > 0 ? Math.max(0, Math.min(1, timeLeft / maxTime)) : 0;
        const ringColor = positive ? '#44c06b' : '#d14b57';
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const iconDiameter = size - 8;
        const ringDiameter = size + 6;
        const iconColor = typeof buff?.icon === 'string' && buff.icon.length > 0
            ? layer.color(buff.icon)
            : layer.color('#b8c4d6');
        const initials = View.getBuffInitials(buff?.name);

        layer.push();
        layer.noFill();
        layer.stroke(255, 28);
        layer.strokeWeight(5);
        layer.circle(centerX, centerY, ringDiameter);

        layer.stroke(ringColor);
        layer.strokeCap(layer.ROUND);
        layer.arc(
            centerX,
            centerY,
            ringDiameter,
            ringDiameter,
            -layer.HALF_PI,
            -layer.HALF_PI + layer.TWO_PI * ratio
        );

        layer.noStroke();
        layer.fill(8, 12, 18, 220);
        layer.circle(centerX, centerY, iconDiameter + 4);

        layer.fill(iconColor);
        layer.circle(centerX, centerY, iconDiameter);

        layer.fill(255);
        layer.textAlign(layer.CENTER, layer.CENTER);
        layer.textSize(Math.max(9, Math.round(size * 0.22)));
        layer.text(initials, centerX, centerY + 0.5);
        layer.pop();
    }

    static getBuffInitials(name) {
        if (!name) {
            return '';
        }

        const words = String(name).split(/\s+/).filter(Boolean);
        if (words.length === 1) {
            return words[0].slice(0, 2).toUpperCase();
        }

        return words.map((word) => word[0]).join('').slice(0, 2).toUpperCase();
    }
}
