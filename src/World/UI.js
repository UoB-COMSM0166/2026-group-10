export default class UI {
	constructor(p5, gameManager) {
		this.p5 = p5;
		this.gameManager = gameManager;
		this.shouldDrawSkillCooldowns = false;
		this.heroStats = null;
		this.toasts = [];
		this.toastDurationFrames = 108; // ~1.8s at 60 FPS

		this.gameManager.events.on('hero:skill:casted', () => {
			this.shouldDrawSkillCooldowns = true;
		});
		this.gameManager.events.on('hero:stats:updated', ({ stats }) => {
			this.heroStats = stats;
		});
		this.gameManager.events.on('hero:levelup', ({ newLevel }) => {
			this.pushToast(`LEVEL UP! Lv.${newLevel}`);
		});
		this.gameManager.events.on('hero:skill:failed', ( message ) => {
			this.pushToast(message.reason, 60);
		});
		this.gameManager.events.on('wave.completed', () => {
			console.log("Wave Completed event received in UI");
			this.pushToast('You Win!', 60);
		})
		this.gameManager.events.on('game:over', ( wave ) => {
			console.log("Game Over event received in UI:", { wave });
			this.pushToast(`You Lose! ${wave.wave} left.`, 60);
		})
	}

	pushToast(message, durationFrames) {
		const frames = Number.isFinite(durationFrames) && durationFrames >= 0
			? Math.floor(durationFrames)
			: this.toastDurationFrames;
		this.toasts.push({
			message,
			expiresAtFrame: this.p5.frameCount + frames
		});
	}

	drawHeroWaypoints() {
		const p = this.p5;
		const hero = this.gameManager.hero;
		const waypoints = hero.waypoint;
		if (!Array.isArray(waypoints) || waypoints.length === 0) {
			// console.log(waypoints);
			return;
		}

		p.push();
		p.stroke(0, 200, 0);
		p.fill(0, 200, 0);
		p.textAlign(p.LEFT, p.TOP);

		for (let i = 0; i < waypoints.length; i++) {
			const point = waypoints[i];
			if (!point) {
				continue;
			}

			const isCurrentTarget = i === 0;

			if (isCurrentTarget) {
				const half = 9;
				p.strokeWeight(7);
				p.textSize(16);
				p.stroke(0, 220, 0);
				p.line(point.x - half, point.y - half, point.x + half, point.y + half);
				p.line(point.x + half, point.y - half, point.x - half, point.y + half);
				p.fill(0, 220, 0);
				p.strokeWeight(1);
				p.text(String(i + 1), point.x + 9, point.y + 9);
			} else {
				const half = 6;
				p.strokeWeight(5);
				p.textSize(14);
				p.stroke(0, 180, 0);
				p.line(point.x - half, point.y - half, point.x + half, point.y + half);
				p.line(point.x + half, point.y - half, point.x - half, point.y + half);
				p.fill(0, 180, 0);
				p.strokeWeight(1);
				p.text(String(i + 1), point.x + 9, point.y + 9);
			}
		}
		p.pop();
	}

	formatClock(seconds) {
		const safe = Math.max(0, seconds);
		const mins = Math.floor(safe / 100);
		const secs = Math.floor(safe % 100);
		return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}

	drawSkillCooldowns(p) {
		const entries = Object.entries(this.gameManager.hero?.skills || {});
		if (entries.length === 0) {
			return;
		}
		
		p.push();
		const iconSize = 56;
		const iconGap = 18;
		const rightPadding = 24;
		const iconY = p.height - iconSize - 24;

		const drawSkillIcon = (label, skill, x, y) => {
			const cooldown = Math.max(0, Math.ceil(skill?.currentCooldown || 0));

			p.noStroke();
			p.fill(0, 0, 0, 140);
			p.rect(x - 8, y - 8, iconSize + 16, iconSize + 28, 8);

			p.stroke(255);
			p.strokeWeight(2);
			p.fill(45, 45, 45);
			p.rect(x, y, iconSize, iconSize, 8);

			p.noStroke();
			p.fill(255);
			p.textAlign(p.CENTER, p.CENTER);
			p.textSize(22);
			p.text(label, x + iconSize / 2, y + iconSize / 2 - 6);

			p.textSize(12);
			if (cooldown > 0) {
				p.fill(255, 210, 70);
				p.text(`${cooldown}`, x + iconSize / 2, y + iconSize + 10);
			} else {
				p.fill(120, 255, 120);
				p.text('READY', x + iconSize / 2, y + iconSize + 10);
			}
		};

		entries.forEach(([key, skill], index) => {
			const x = p.width - rightPadding - iconSize - index * (iconSize + iconGap);
			drawSkillIcon(key, skill, x, iconY);
		});
		p.pop();
	}

	drawHeroBuffCircles(p) {
		const buffs = (this.gameManager.hero?.buffs || []).filter((buff) => !!buff);
		if (buffs.length === 0) {
			return;
		}

		const radius = 24;
		const gap = 14;
		const diameter = radius * 2;
		const totalWidth = buffs.length * diameter + (buffs.length - 1) * gap;
		const startX = (p.width - totalWidth) / 2 + radius;
		const centerY = p.height - 88;

		p.push();
		p.textAlign(p.CENTER, p.CENTER);

		buffs.forEach((buff, index) => {
			const x = startX + index * (diameter + gap);
			const remaining = buff.currentDuration === -1
				? '∞'
				: `${Math.max(0, Math.ceil(buff.currentDuration || 0))}`;

			p.stroke(255, 255, 255, 180);
			p.strokeWeight(2);
			p.fill(30, 30, 30, 170);
			p.circle(x, centerY, diameter);

			p.noStroke();
			p.fill(255);
			p.textSize(14);
			p.text(remaining, x, centerY + 1);
		});

		p.pop();
	}

	// TODO: Text to Graphics
	drawHeroStatsPanel(p) {
		if (!this.heroStats) {
			return;
		}

		const s = this.heroStats;
		p.push();
		p.noStroke();
		p.fill(0, 0, 0, 140);
		p.rect(20, p.height - 150, 280, 130, 8);

		p.fill(255);
		p.textAlign(p.LEFT, p.TOP);
		p.textSize(14);
		p.text(`${s.name}  Lv.${s.level}`, 30, p.height - 142);
		p.text(`HP ${s.hp}/${s.maxHP}`, 30, p.height - 120);
		p.text(`MP ${s.mp}/${s.maxMP}`, 30, p.height - 102);
		p.text(`SPD ${s.speed.toFixed(1)}  ARM ${s.armor.toFixed(1)}`, 30, p.height - 66);
		p.text(`STR ${s.strength}  AGI ${s.agility}  INT ${s.intelligence}`, 30, p.height - 84);
		p.text(`SpellAmp ${s.spellAmp}`, 30, p.height - 48);
		p.pop();
	}

	drawToasts(p) {
		const nowFrame = p.frameCount;
		this.toasts = this.toasts.filter((toast) => toast.expiresAtFrame > nowFrame);
		if (this.toasts.length === 0) {
			return;
		}

		const toast = this.toasts[0];
		const remainingFrames = toast.expiresAtFrame - nowFrame;
		const fadeOutFrames = Math.max(1, Math.floor(this.toastDurationFrames * 0.2));
		const alpha = remainingFrames < fadeOutFrames
			? Math.max(0, Math.floor((remainingFrames / fadeOutFrames) * 255))
			: 255;

		p.push();
		p.textAlign(p.CENTER, p.CENTER);
		p.textSize(24);
		p.noStroke();
		p.fill(0, 0, 0, Math.min(180, alpha));
		p.rect(p.width / 2 - 170, 24, 340, 56, 10);
		p.fill(255, 230, 80, alpha);
		p.text(toast.message, p.width / 2, 52);
		p.pop();
	}


	draw() {
		const p = this.p5;
		this.drawHeroWaypoints();

		const gameplayTime = this.gameManager.getDisplaySeconds('gameplay');
		const timeText = this.formatClock(gameplayTime);
        const tick = this.gameManager.now();
		const stats = this.gameManager.getDebugStats();
		const fpsText = `FPS ${stats.fps.toFixed(1)} / ${stats.targetFps}`;
		const tpsText = `TPS ${stats.tps.toFixed(1)} / ${stats.targetTps}`;

		p.push();
		p.noStroke();
		p.fill(0, 0, 0, 140);
		p.rect(20, 20, 230, 100, 8);

		p.fill(255);
		p.textAlign(p.LEFT, p.TOP);
		p.textSize(20);
		p.text(`Time ${timeText}`, 32, 28);
		p.textSize(14);
        p.text(`Tick ${tick}`, 32, 58);
		p.text(fpsText, 32, 78);
		p.text(tpsText, 32, 98);
		p.pop();

		if (this.shouldDrawSkillCooldowns) {
			this.drawSkillCooldowns(p);
		}
		this.drawHeroBuffCircles(p);
		this.drawHeroStatsPanel(p);
		this.drawToasts(p);
	}
}
