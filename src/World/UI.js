export default class UI {
	constructor(p5, gameManager) {
		this.p5 = p5;
		this.gameManager = gameManager;
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
