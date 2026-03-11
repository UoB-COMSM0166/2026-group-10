export default class UI {
	constructor(p5, gameManager, assetLoader) {
		this.p5 = p5;
		this.gameManager = gameManager;
		this.assetLoader = assetLoader;
		this.shouldDrawSkillCooldowns = false;
		this.heroStats = null;
		this.toasts = [];
		this.imageToasts = [];
 		this.toastDurationFrames = 108; // ~1.8s at 60 FPS
		this.winNotificationEndFrame = null; // Timer for win notification
		this.p5.noCursor();
		this.isSettingsMenuOpen = false;

		// We will store the button boundaries here to detect clicks
        this.hitboxes = {
            icon: { x: 0, y: 0, w: 0, h: 0 },
            pause: { x: 0, y: 0, w: 0, h: 0 },
            resume: { x: 0, y: 0, w: 0, h: 0 },
            menu: { x: 0, y: 0, w: 0, h: 0 }
        };

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
			this.winNotificationEndFrame = this.p5.frameCount + this.toastDurationFrames;
		});
		this.gameManager.events.on('game:over', ( wave ) => {
			console.log("Game Over event received in UI:", { wave });
			this.pushToast(`You Lose! ${wave.wave} left.`, 60);
		});
	}

	drawSettings() {
        const p = this.p5;
        
        // 1. Draw the Settings Button Box (Top Right Corner)
        const boxSize = 50;
        const padding = 20;
        const boxX = p.width - boxSize - padding;
        const boxY = padding;
        
        // Update the hitbox to be the entire box, not just the image
        this.hitboxes.icon = { x: boxX, y: boxY, w: boxSize, h: boxSize };
        
        p.push();
        
        // Check if mouse is hovering over the settings box
        const isHoverBox = p.mouseX > boxX && p.mouseX < boxX + boxSize && p.mouseY > boxY && p.mouseY < boxY + boxSize;
        
        // Draw the background box
        p.fill(isHoverBox ? 80 : 40, 40, 45, 220); // Dark gray, lighter on hover
        p.stroke(180, 140, 50); // Gold border to match your menu theme
        p.strokeWeight(2);
        p.rect(boxX, boxY, boxSize, boxSize, 8); // 8 is for rounded corners
        
        // Draw the icon centered inside the box
        const icon = this.assetLoader.getAsset('settingIcon');
        if (icon) {
            const iconSize = 30; // Slightly smaller than the box to give it padding
            const iconX = boxX + (boxSize - iconSize) / 2;
            const iconY = boxY + (boxSize - iconSize) / 2;
            p.image(icon, iconX, iconY, iconSize, iconSize);
        }
        
        p.pop();

        // 2. Draw the Menu Overlay if it is open
        if (this.isSettingsMenuOpen) {
            p.push();
            
            // Darken the background
            p.fill(0, 0, 0, 180);
            p.rect(0, 0, p.width, p.height);

            // Draw Menu Window
            const menuW = 250;
            const menuH = 300;
            const menuX = (p.width - menuW) / 2;
            const menuY = (p.height - menuH) / 2;
            
            p.fill(40, 40, 45);
            p.stroke(180, 140, 50); // Gold border
            p.strokeWeight(3);
            p.rect(menuX, menuY, menuW, menuH, 12);
            
            // Draw Buttons
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(20);
            
            const btnW = 160;
            const btnH = 45;
            const btnX = p.width / 2; // Center horizontally
            
            // --- Helper function to draw a button ---
            const drawBtn = (label, yPos, hitboxKey) => {
                const bx = btnX - btnW / 2;
                const by = yPos - btnH / 2;
                
                // Update hitbox
                this.hitboxes[hitboxKey] = { x: bx, y: by, w: btnW, h: btnH };
                
                // Button hover effect
                const isHover = p.mouseX > bx && p.mouseX < bx + btnW && p.mouseY > by && p.mouseY < by + btnH;
                p.fill(isHover ? 100 : 70); // Lighter if hovered
                
                p.rect(bx, by, btnW, btnH, 8);
                p.fill(255);
                p.text(label, btnX, yPos);
            };

            // Draw the three buttons
            drawBtn("Pause", menuY + 80, 'pause');
            drawBtn("Resume", menuY + 150, 'resume');
            drawBtn("Menu", menuY + 220, 'menu');
            
            p.pop();
        }
    }

    handleMouseClick(mx, my) {
        // Helper to check if a point is inside a box
        const isInside = (box) => mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h;

        // 1. If the menu is CLOSED, only check the new settings box
        if (!this.isSettingsMenuOpen) {
            if (isInside(this.hitboxes.icon)) {
                this.isSettingsMenuOpen = true; // Open the menu
                return true; // Tell main.js the UI handled this click
            }
        } 
        // 2. If the menu is OPEN, check the buttons inside it
        else {
            if (isInside(this.hitboxes.resume)) {
                console.log("Resume button clicked (Placeholder)");
                this.isSettingsMenuOpen = false; // Just close the visual menu
                return true;
            }
            if (isInside(this.hitboxes.pause)) {
                console.log("Pause button clicked (Placeholder)");
                return true;
            }
            if (isInside(this.hitboxes.menu)) {
                console.log("Main Menu button clicked (Placeholder)");
                return true;
            }
            
            // If the menu is open, block all underlying game clicks
            return true; 
        }
        
        return false; 
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

	pushImageToast(assetKey, durationFrames) {
		const frames = Number.isFinite(durationFrames) && durationFrames >= 0
			? Math.floor(durationFrames)
			: this.toastDurationFrames;
			
		this.imageToasts.push({
			assetKey,
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

	drawHUDBar(p) {
        if (!this.heroStats) return;
    
        const hud = this.assetLoader.getAsset('actionFrame');
        if (!hud) return;
    
        const s = this.heroStats;
        
        const hpPercent = s.hp / s.maxHP;
        const mpPercent = s.mp / s.maxMP;
        
        // --- FLASHING PULSE MATH ---
        const pulseAlpha = 150 + p.sin(p.frameCount * 0.15) * 105;
        const isHpLow = hpPercent < 0.25;
        const isMpLow = mpPercent < 0.25;
    
        const hudWidth = 781;
        const hudHeight = 127;
        const barWidth = 321;
        const barHeight = 31;
    
        const x = (p.width - hudWidth) / 2;
        const y = p.height - hudHeight - 10;
        const barY = y + 25;
    
        p.push();
    
        // Draw HUD frame (uncomment when you have your empty frame ready)
        // p.image(hud, x, y, hudWidth, hudHeight);
    
        // =========================
        // HEALTH BAR
        // =========================
        const hpX = x + 30; 
    
        // 1. Background (Dark Gray)
        p.noStroke();
        p.fill(60);
        p.rect(hpX, barY, barWidth, barHeight, 6);
    
        // 2. Actual Health (Red)
        p.fill(220, 60, 60);
        p.rect(hpX, barY, barWidth * hpPercent, barHeight, 6);

        // 3. Low Health Flashing Border
        if (isHpLow) {
            p.stroke(255, 0, 0, pulseAlpha); 
            p.strokeWeight(3);
            p.noFill();
            p.rect(hpX, barY, barWidth, barHeight, 6);
        }
    
        // =========================
        // MANA BAR
        // =========================
        const mpX = x + hudWidth - barWidth - 30;
    
        // 1. Background
        p.noStroke();
        p.fill(60);
        p.rect(mpX, barY, barWidth, barHeight, 6);
    
        // 2. Actual Mana (Blue)
        p.fill(70, 140, 255);
        p.rect(mpX, barY, barWidth * mpPercent, barHeight, 6);

        // 3. Low Mana Flashing Border
        if (isMpLow) {
            p.stroke(255, 0, 0, pulseAlpha); 
            p.strokeWeight(3);
            p.noFill();
            p.rect(mpX, barY, barWidth, barHeight, 6);
        }
    
        // =========================
        // TEXT
        // =========================
        p.noStroke(); 
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
    
        p.text(
            `Health  ${Math.floor(s.hp)} / ${s.maxHP}`,
            hpX + barWidth / 2,
            barY + barHeight / 2
        );
    
        p.text(
            `Mana  ${Math.floor(s.mp)} / ${s.maxMP}`,
            mpX + barWidth / 2,
            barY + barHeight / 2
        );
    
        p.pop();
    }

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
		this.drawHUDBar(p);
		this.drawSettings();

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

		const nowFrame = p.frameCount;
		const activeToasts = this.toasts.filter((toast) => toast.expiresAtFrame > nowFrame);
		if (activeToasts.length > 0) {
			const toast = activeToasts[0];
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

		this.imageToasts = this.imageToasts.filter((toast) => toast.expiresAtFrame > nowFrame);

		if (this.imageToasts.length > 0) {
			const toast = this.imageToasts[0]; // Display the top toast
			const img = this.assetLoader.getAsset(toast.assetKey);

			if (img) {
				const remainingFrames = toast.expiresAtFrame - nowFrame;
				const fadeOutFrames = Math.max(1, Math.floor(this.toastDurationFrames * 0.2));
				
				// Calculate alpha for fade out
				const alpha = remainingFrames < fadeOutFrames
					? Math.max(0, Math.floor((remainingFrames / fadeOutFrames) * 255))
					: 255;

				p.push();
				//p.tint(255, alpha); // Apply the alpha transparency to the image
				
				// 1. Scale the image
                const scaleFactor = 0.8; 
                const drawWidth = img.width * scaleFactor;
                const drawHeight = img.height * scaleFactor;

            
                const x = (p.width - drawWidth) / 2;
                
                const y = 40; 
                
                p.image(img, x, y, drawWidth, drawHeight);
                p.pop();
			}
		}

		if (this.shouldDrawSkillCooldowns) {
			this.drawSkillCooldowns(p);
		}
		this.drawHeroBuffCircles(p);
		this.drawHeroStatsPanel(p);
		this.drawToasts(p);

		const cursorImg = this.assetLoader.getAsset('customCursor');
        if (cursorImg) {
            p.push();
            const cursorWidth = 24; 
            const cursorHeight = 24;
            
            // Draw the image exactly at the current mouse coordinates
            p.image(cursorImg, p.mouseX, p.mouseY, cursorWidth, cursorHeight);
            p.pop();
        }
	}
}
