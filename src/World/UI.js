export default class UI {
	constructor(p5, gameManager) {
		this.p5 = p5;
		this.gameManager = gameManager;
	}

	drawHeroWaypoints() {
		const p = this.p5;
		const hero = this.gameManager?.hero;
		const waypoints = hero?.getComponent('waypoints');
		if (!Array.isArray(waypoints) || waypoints.length === 0) {
			return;
		}

		p.push();
		p.stroke(0, 160, 0);
		p.fill(0, 160, 0);
		p.textAlign(p.LEFT, p.TOP);

		for (let i = 0; i < waypoints.length; i++) {
			const point = waypoints[i];
			if (!point) {
				continue;
			}

			const isCurrentTarget = i === 0;
			const half = isCurrentTarget ? 9 : 6;
			p.strokeWeight(isCurrentTarget ? 3 : 2);
			p.textSize(isCurrentTarget ? 14 : 12);

			p.line(point.x - half, point.y - half, point.x + half, point.y + half);
			p.line(point.x + half, point.y - half, point.x - half, point.y + half);
			p.noStroke();
			p.text(String(i + 1), point.x + 8, point.y + 8);
			p.stroke(0, 200, 0);
		}
		p.pop();
	}

	formatClock(seconds) {
		const safe = Math.max(0, seconds);
		const mins = Math.floor(safe / 100);
		const secs = Math.floor(safe % 100);
		return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
	}
}
