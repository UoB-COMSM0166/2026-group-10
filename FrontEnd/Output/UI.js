import View from './View.js';

export default class UI {
    constructor(layer) {
        this.layer = layer;
        this.art = this.loadImageAssets({
            objectiveProfile: 'FrontEnd/Assert/Image/Profile_Tree.png',
            heroProfile: 'FrontEnd/Assert/Image/Profile_Archmage.png',
            heroProfileDead: 'FrontEnd/Assert/Image/Profile_Archmage_Dead.png',
            heroSpellBookBackground: 'FrontEnd/Assert/Image/Book_Background_Archmage.png',
            statSpeed: 'FrontEnd/Assert/Image/Stats_Speed.png',
            statArmor: 'FrontEnd/Assert/Image/Stats_Armor.png',
            statAttack: 'FrontEnd/Assert/Image/Stats_Attack.png',
            statSpell: 'FrontEnd/Assert/Image/Stats_Spell.png',
            skillBallLightning: 'FrontEnd/Assert/Image/Icon/Skill_BallLightning.png',
            skillBlizzard: 'FrontEnd/Assert/Image/Icon/Skill_Blizzard.png',
            skillBurning: 'FrontEnd/Assert/Image/Icon/Skill_Burning.png',
            skillChainLightning: 'FrontEnd/Assert/Image/Icon/Skill_ChainLightning.png',
            skillChakra: 'FrontEnd/Assert/Image/Icon/Skill_Chakra.png',
            skillElectromagneticField: 'FrontEnd/Assert/Image/Icon/Skill_ElectromagneticField.png',
            skillFierySoul: 'FrontEnd/Assert/Image/Icon/Skill_FierySoul.png',
            skillFireBall: 'FrontEnd/Assert/Image/Icon/Skill_FireBall.png',
            skillFlameWave: 'FrontEnd/Assert/Image/Icon/Skill_FlameWave.png',
            skillFrostShield: 'FrontEnd/Assert/Image/Icon/Skill_FrostShield.png',
            skillIcePick: 'FrontEnd/Assert/Image/Icon/Skill_IcePick.png',
            skillLightning: 'FrontEnd/Assert/Image/Icon/Skill_Lightning.png',
            skillManaDrain: 'FrontEnd/Assert/Image/Icon/Skill_ManaDrain.png',
            skillMeteorite: 'FrontEnd/Assert/Image/Icon/Skill_Meteorite.png',
            skillStaticExplosion: 'FrontEnd/Assert/Image/Icon/Skill_StaticExplosion.png',
            skillStormBlast: 'FrontEnd/Assert/Image/Icon/Skill_StormBlast.png',
            skillThunderCloud: 'FrontEnd/Assert/Image/Icon/Skill_ThunderCloud.png',
            skillViperGuardian: 'FrontEnd/Assert/Image/Icon/Skill_ViperGuardian.png',
        });
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
        this.showBook = false;
        this.skillOrder = ['A', 'Q', 'W', 'E', 'R', 'P'];
        this.skillPalette = {
            Ice: '#4da3ff',
            Fire: '#ff7a1a',
            Lightning: '#9a25fb',
            default: '#6c7a89',
        };
        this.buffFallbackColor = '#b8c4d6';
        this.toast = null;
        this.toastDuration = 60;
    }

    draw(state, mouse = null) {
        const layer = this.layer;
        if (!layer || !state?.hero) {
            return;
        }

        layer.clear();
        this.updateToasts();
        this.drawObjectivePanel(state.objective);
        this.drawHeroProfilePanel(state.hero);
        this.drawHeroSkillsPanel(state.hero);

        this.drawBuffIconPanel(state.hero);
        this.drawWaveStatsPanel(state.wave, state.flags);
        this.drawHeroStatsPanel(state.hero);

        if (this.showBook) {
            this.drawSkillBookWindow(state.hero);
        }
        this.drawSkillDetail(state.hero, mouse);
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

        if ((command === 'hero:upgrade' || command === 'hero:upgrade:skill') && code < 400) {
            this.pushToast(payload.message, 'success');
            return;
        }

        if (command === 'hero:skill:change' && code < 400) {
            this.pushToast(payload.message, 'success');
            return;
        }

        if (code >= 400) {
            this.pushToast(payload.message, 'error');
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
        const width = 600;
        const height = 54;
        const startX = (layer.width - width) / 2;
        const startY = layer.height - 340;

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

        layer.fill(255, 245 * alpha);
        layer.textAlign(layer.LEFT, layer.CENTER);
        layer.textSize(14);
        // layer.text(toast.message, x + 18, y + height / 2, width - 28, height - 16);
        View.text(layer, x + width / 2, y + height / 2, toast.message, 30, 255 * alpha, false, 0, 0, "Arial", 2);
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
        this.drawPanelArtwork(this.art.objectiveProfile, x, y, width, height, 18);

        View.text(layer, x + width / 2, y + 20, objective.name, 20, 255, false);
        View.meter(
            layer, x + 18, y + height - 40, width - 36, 25,
            objective.hp, objective.maxHP, objective.hpRegen,
            layer.color(255, 200, 0), layer.color(100, 100, 0), 20
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
        const alive = hero?.alive !== false;
        const portrait = alive ? this.art.heroProfile : this.art.heroProfileDead;

        layer.push();
        layer.noStroke();
        this.drawPanelArtwork(portrait, x, y, width, height, 18);
        if (!alive) {
            layer.fill(8, 12, 18, 120);
            layer.rect(x, y, width, height, 18);
        }
        View.text(layer, x + width / 2, y + 20, hero.name, 20, 255, true, 0, 0, "Arial", 3);

        if (!alive) {
            const respawnText = `${this.getRespawnSeconds(hero)}`;
            View.text(layer, x + width / 2, y + height / 2, respawnText, 50, 255, true, 0, 0, "Arial", 4);
        }

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
            layer, x + 20, y + height - 55, width - 40, 35,
            hero.mp, hero.maxMP, hero.mpRegen ?? 0,
            layer.color(50, 50, 255), layer.color(0, 0, 100), 25
        )

        View.liveSkillIcon(layer, x + 20, y + 20, 80, 80, 'A', skills.A, this.getSkillIcon(skills.A));
        View.liveSkillIcon(layer, x + 20 + 100, y + 20, 80, 80, 'Q', skills.Q, this.getSkillIcon(skills.Q));
        View.liveSkillIcon(layer, x + 20 + 200, y + 20, 80, 80, 'W', skills.W, this.getSkillIcon(skills.W));
        View.liveSkillIcon(layer, x + 20 + 300, y + 20, 80, 80, 'E', skills.E, this.getSkillIcon(skills.E));
        View.liveSkillIcon(layer, x + 20 + 400, y + 20, 80, 80, 'R', skills.R, this.getSkillIcon(skills.R));
        const passiveSkill = this.getHeroSkillBySlot(skills, 'P');
        View.liveSkillIcon(layer, x + 20 + 500, y + 20 + 5, 70, 70, '', passiveSkill, this.getSkillIcon(passiveSkill));
        View.liveSkillIcon(layer, x + 20 + 590, y + 20, 140, 80, 'B', null, null);
    }

    drawSkillDetail(hero, mouse = null) {
        const skill = this.checkMouseAboveSkill(hero, mouse);
        if (!skill) {
            return;
        }

        const layer = this.layer;
        const width = 290;
        const height = 250;
        const x = layer.width - width - 24;
        const y = 24;
        const bodyX = x + 18;
        let cursorY = y + 60;

        layer.push();
        layer.noStroke();
        layer.fill(12, 18, 28, 222);
        layer.rect(x, y, width, height, 18);

        layer.fill(this.getSkillColor(skill.category));
        layer.rect(x, y, width, 8, 18, 18, 0, 0);

        View.text(layer, x + width / 2, y + 18, skill.name ?? 'Skill', 22, 255, true, 0, 0, "Arial", 3);
        View.text(layer, x + width / 2, y + 40, `${skill.slot ?? ''} ${skill.category ?? ''}`.trim(), 13, 210, false, 0, 0, "Arial", 2);

        cursorY = this.drawSkillDetailRow(bodyX, cursorY, 'Cooldown', this.formatSeconds(skill.currentCooldown, skill.cooldown));
        cursorY = this.drawSkillDetailRow(bodyX, cursorY, 'Target', this.formatTargetCategory(skill.targetCategory, skill.passive));
        cursorY = this.drawSkillDetailRow(bodyX, cursorY, 'Mana', this.formatResource(skill.manaCost));
        cursorY = this.drawSkillDetailRow(bodyX, cursorY, 'Range', this.formatRange(skill.range, skill.targetCategory));

        if (skill.upgraded) {
            cursorY = this.drawSkillDetailRow(bodyX, cursorY, 'State', 'Upgraded');
        } else if (skill.active) {
            cursorY = this.drawSkillDetailRow(bodyX, cursorY, 'State', 'Active');
        }

        layer.fill(255, 36);
        layer.rect(bodyX, cursorY + 6, width - 36, 1);

        layer.noStroke();
        layer.fill(225);
        layer.textAlign(layer.LEFT, layer.TOP);
        layer.textSize(14);
        layer.text(
            skill.description || 'No description available.',
            bodyX,
            cursorY + 18,
            width - 36,
            height - (cursorY - y) - 30
        );
        layer.pop();
    }

    drawBuffIconPanel(hero) {
        const layer = this.layer;
        const buffs = Array.isArray(hero.buffs) ? hero.buffs : [];
        const width = 770;
        const height = 50;
        const x = 516;
        const y = 630;

        layer.push();
        layer.noStroke();
        layer.fill(12, 18, 28, 210);
        layer.rect(x, y, width, height, 18);
        layer.pop();
    }

    drawWaveStatsPanel(wave, flags = {}) {
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

        if (flags?.paused) {
            statusText = 'Pause';
        } else if (wave.beforeCountdown <= 0) {
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

    drawHeroStatsPanel(hero) {
        const layer = this.layer;
        const width = 115;
        const height = 270;
        const x = 1486;
        const y = 630;
        const rows = [
            { icon: this.art.statSpeed, value: this.formatStatValue(hero?.speed) },
            { icon: this.art.statArmor, value: this.formatStatValue(hero?.armor) },
            { icon: this.art.statAttack, value: this.formatStatValue(hero?.attackAmp) },
            { icon: this.art.statSpell, value: this.formatStatValue(hero?.spellAmp) },
        ];

        layer.push();
        layer.noStroke();
        layer.fill(12, 18, 28, 210);
        layer.rect(x, y, width, height, 18);

        rows.forEach((row, index) => {
            this.drawHeroStatRow(x + 12, y + 18 + index * 62, width - 24, 48, row.icon, row.value);
        });

        layer.pop();
    }

    drawSkillBookWindow(hero) {
        const layer = this.layer;
        const width = 1280;
        const height = 720;
        const x = 160;
        const y = 90;

        layer.push();
        const portrait = this.art.heroSpellBookBackground;
        this.drawPanelArtwork(portrait, x, y, width, height, 0);
        layer.fill(12, 18, 28, 220);
        layer.rect(x, y, width, height, 0);
        View.text(layer, x + 240, y + 40, 'ICE', 40, 255, true, 0, 0, "Arial", 4);
        View.text(layer, x + 560, y + 40, 'FIRE', 40, 255, true, 0, 0, "Arial", 4);
        View.text(layer, x + 880, y + 40, 'LIGHTNING', 40, 255, true, 0, 0, "Arial", 4);
        View.text(layer, x + 1160, y + 40, 'HERO', 40, 255, true, 0, 0, "Arial", 4);

        let deltaY = 120;
        for (const slot of this.skillOrder) {
            View.text(layer, x + 40, y + 40 + deltaY, slot, 40, 255, true, 0, 0, "Arial", 4);
            let deltaX = 120;
            const skills = this.getSkillTreeSlot(hero, slot);

            for (const skill of skills) {
                if (!skill) {
                    continue;
                }
                const equippedSkill = this.getHeroSkillBySlot(hero.skills, slot);
                const highLight = skill.name === equippedSkill?.name;
                View.skillIcon(layer, x + deltaX, y + deltaY, 80, 80, skill, highLight, this.getSkillIcon(skill));
                deltaX += 320;
            }
            deltaY += 96;
        }

        layer.pop();
    }

    handleSkillClick(hero, mouse, postCommand) {
        if (!this.showBook || !hero || !mouse || typeof postCommand !== 'function') {
            return false;
        }

        const hoveredSkill = this.checkMouseAboveSkill(hero, mouse);
        if (!hoveredSkill?.name || !hoveredSkill?.slot) {
            return false;
        }

        if (!hero.inFountain) {
            this.pushToast('Too Far from Objective.', 'error');
            return true;
        }

        const equippedSkill = this.getHeroSkillBySlot(hero.skills, hoveredSkill.slot);
        if (equippedSkill?.name === hoveredSkill.name) {
            return true;
        }

        postCommand('hero:skill:change', {
            slot: hoveredSkill.slot,
            name: hoveredSkill.name,
        });
        return true;
    }

    // drawBuffBar(hero) {
    //     const layer = this.layer;
    //     const buffs = Array.isArray(hero.buffs) ? hero.buffs : [];
    //     const { panelX, panelY, panelHeight, skillBarHeight, buffSize, gap } = this.layout;
    //     const startX = panelX;
    //     const startY = panelY + panelHeight + skillBarHeight + 34;
    //     const perRow = 8;
    //     const rows = Math.max(1, Math.ceil(Math.max(1, buffs.length) / perRow));
    //     const panelHeightPx = rows * (buffSize + gap) + 30;

    //     layer.push();
    //     layer.noStroke();
    //     layer.fill(12, 18, 28, 210);
    //     layer.rect(startX, startY, 420, panelHeightPx, 18);

    //     layer.fill(255);
    //     layer.textAlign(layer.LEFT, layer.TOP);
    //     layer.textSize(14);
    //     layer.text('Buffs', startX + 16, startY + 12);

    //     buffs.forEach((buff, index) => {
    //         const col = index % perRow;
    //         const row = Math.floor(index / perRow);
    //         const x = startX + 16 + col * (buffSize + gap);
    //         const y = startY + 34 + row * (buffSize + gap);
    //         this.drawBuffIcon(x, y, buffSize, buff);
    //     });

    //     layer.pop();
    // }

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

    formatStatValue(value) {
        return this.formatNumber(value);
    }

    formatSeconds(currentCooldown, cooldown) {
        const current = (Number(currentCooldown) || 0) / 60;
        const total = (Number(cooldown) || 0) / 60;
        return `${current.toFixed(1)}s / ${total.toFixed(1)}s`;
    }

    formatTargetCategory(targetCategory, passive = false) {
        if (passive) {
            return 'Passive';
        }

        if (targetCategory === null) {
            return 'Self';
        }

        return String(targetCategory);
    }

    formatResource(value) {
        const amount = Number(value) || 0;
        return amount > 0 ? `${amount}` : 'None';
    }

    formatRange(value, targetCategory) {
        const range = Number(value) || 0;
        if (targetCategory === null || range <= 0) {
            return 'N/A';
        }

        return `${range}`;
    }

    drawSkillDetailRow(x, y, label, value) {
        const layer = this.layer;
        layer.fill(170, 182, 198);
        layer.textAlign(layer.LEFT, layer.TOP);
        layer.textSize(12);
        layer.text(`${label}`, x, y);

        layer.fill(255);
        layer.textSize(14);
        layer.text(String(value ?? ''), x + 92, y - 1);
        return y + 24;
    }

    checkMouseAboveSkill(hero, mouse = null) {
        if (!mouse) {
            return null;
        }

        if (this.showBook) {
            return this.getHoveredBookSkill(hero, mouse);
        }

        const skills = hero?.skills ?? {};
        const hoveredSlot = this.getHoveredSkillSlot(mouse);
        if (!hoveredSlot) {
            return null;
        }

        return skills[hoveredSlot] ?? null;
    }

    getHoveredSkillSlot(mouse) {
        const hitboxes = [
            { slot: 'A', x: 536, y: 700, width: 80, height: 80 },
            { slot: 'Q', x: 636, y: 700, width: 80, height: 80 },
            { slot: 'W', x: 736, y: 700, width: 80, height: 80 },
            { slot: 'E', x: 836, y: 700, width: 80, height: 80 },
            { slot: 'R', x: 936, y: 700, width: 80, height: 80 },
            { slot: 'P', x: 1036, y: 705, width: 70, height: 70 },
        ];

        for (const hitbox of hitboxes) {
            if (this.isPointInRect(mouse, hitbox)) {
                return hitbox.slot;
            }
        }

        return null;
    }

    getHoveredBookSkill(hero, mouse = null) {
        return this.getHoveredBookSkillWithSlot(hero, mouse)?.skill ?? null;
    }

    getHoveredBookSkillWithSlot(hero, mouse = null) {
        if (!mouse) {
            return null;
        }

        const bookX = 160;
        const bookY = 90;
        const slotOrder = this.skillOrder;
        let deltaY = 120;

        for (const slot of slotOrder) {
            let deltaX = 120;
            const skills = this.getSkillTreeSlot(hero, slot);

            for (const skill of skills) {
                if (!skill) {
                    deltaX += 320;
                    continue;
                }

                const hitbox = {
                    x: bookX + deltaX,
                    y: bookY + deltaY,
                    width: 80,
                    height: 80,
                };

                if (this.isPointInRect(mouse, hitbox)) {
                    return { slot, skill };
                }

                deltaX += 320;
            }

            deltaY += 96;
        }

        return null;
    }

    isPointInRect(point, rect) {
        return point.x >= rect.x
            && point.x <= rect.x + rect.width
            && point.y >= rect.y
            && point.y <= rect.y + rect.height;
    }

    getDetailedSkill(hero) {
        const skills = hero?.skills ?? {};
        const preferredSlots = [
            hero?.selectedSkill,
            hero?.targeting?.skillKey,
            'A',
            'Q',
            'W',
            'E',
            'R',
            'P',
        ].filter(Boolean);

        for (const slot of preferredSlots) {
            if (skills[slot]) {
                return skills[slot];
            }
        }

        return Object.values(skills).find(Boolean) ?? null;
    }

    getSkillTreeSlot(hero, slot) {
        const skillTree = hero?.skillTree;
        if (!skillTree) {
            return [];
        }

        const normalizedSlot = this.normalizeSkillSlot(slot);
        if (skillTree instanceof Map) {
            return skillTree.get(normalizedSlot) ?? skillTree.get(slot) ?? [];
        }

        return Array.isArray(skillTree[normalizedSlot])
            ? skillTree[normalizedSlot]
            : (Array.isArray(skillTree[slot]) ? skillTree[slot] : []);
    }

    getHeroSkillBySlot(skills, slot) {
        if (!skills) {
            return null;
        }

        const normalizedSlot = this.normalizeSkillSlot(slot);
        return skills[normalizedSlot] ?? skills[slot] ?? null;
    }

    normalizeSkillSlot(slot) {
        return slot === 'Passive' ? 'P' : slot;
    }

    getSkillIcon(skill) {
        const key = this.getSkillIconKey(skill?.name);
        return key ? (this.art[key] ?? null) : null;
    }

    getSkillIconKey(skillName) {
        const normalized = String(skillName ?? '').replace(/\s+/g, '');
        const iconMap = {
            BallLightning: 'skillBallLightning',
            Blizzard: 'skillBlizzard',
            Burning: 'skillBurning',
            ChainLightning: 'skillChainLightning',
            Chakra: 'skillChakra',
            ElectromagneticField: 'skillElectromagneticField',
            FierySoul: 'skillFierySoul',
            FireBall: 'skillFireBall',
            FlameWave: 'skillFlameWave',
            FrostShield: 'skillFrostShield',
            IcePick: 'skillIcePick',
            Lightning: 'skillLightning',
            ManaDrain: 'skillManaDrain',
            Meteorite: 'skillMeteorite',
            StaticExplosion: 'skillStaticExplosion',
            StormBlast: 'skillStormBlast',
            ThunderCloud: 'skillThunderCloud',
            ViperGuardian: 'skillViperGuardian',
        };

        return iconMap[normalized] ?? null;
    }

    getRespawnSeconds(hero) {
        return Math.max(0, Math.ceil((Number(hero?.remainingRespawnCD) || 0) / 60));
    }

    loadImageAssets(assetMap) {
        const assets = {};

        for (const [key, path] of Object.entries(assetMap ?? {})) {
            assets[key] = this.loadImageAsset(path);
        }

        return assets;
    }

    loadImageAsset(path) {
        if (typeof window === 'undefined' || typeof window.Image !== 'function') {
            return null;
        }

        const image = new window.Image();
        image.src = path;
        return image;
    }

    drawPanelArtwork(image, x, y, width, height, radius = 0) {
        const layer = this.layer;
        if (!image?.complete) {
            return;
        }

        layer.drawingContext.save();
        layer.drawingContext.beginPath();
        layer.drawingContext.roundRect(x, y, width, height, radius);
        layer.drawingContext.clip();
        layer.drawingContext.drawImage(image, x, y, width, height);
        layer.drawingContext.restore();
    }

    drawHeroStatRow(x, y, width, height, icon, value) {
        const layer = this.layer;
        const iconSize = 32;
        const iconX = x;
        const iconY = y + (height - iconSize) / 2;
        const valueX = x + iconSize + 12;

        // layer.fill(255, 18);
        // layer.rect(x, y, width, height, 12);
        this.drawPanelArtwork(icon, iconX, iconY, iconSize, iconSize, 0);
        View.text(layer, valueX + (width - iconSize - 12) / 2, y + height / 2, value, 18, 255, true, 0, 0, "Arial", 3);
    }
}
