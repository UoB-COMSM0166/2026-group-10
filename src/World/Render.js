export default class Render {
    static renderingObjective(p5, objective) {
        const pos = objective.position;
        const hp = objective.currentHP;
        const hitbox = objective.hitbox;
        if (pos) {
            p5.stroke(0);
            p5.strokeWeight(2);
            p5.fill(0, 0, 255);
            p5.circle(pos.x, pos.y, hitbox);
            // p5.rect(pos.x - objective.hitbox.width / 2, pos.y - objective.hitbox.height / 2, objective.hitbox.width, objective.hitbox.height);
            p5.fill(100, 100, 100);
            p5.textSize(20);
            p5.text(hp, pos.x + hitbox/2, pos.y + hitbox/2);
        }
    }

    static renderingEnemy(p5, enemies) {
        for (const enemy of enemies.values()) {
            const pos = enemy.position;
            const hp = Math.round(enemy.currentHP);
            const hitbox = enemy.hitbox;
            if (enemy) {
                p5.stroke(0);
                p5.strokeWeight(2);
                p5.fill(255, 0, 0);
                p5.circle(pos.x, pos.y, hitbox);
                p5.textSize(20);
                p5.text(hp, pos.x + hitbox/2, pos.y + hitbox/2);
            }
        }
    }

    static renderingHero(p5, hero) {
        const pos = hero.position;
        if (pos) {
            p5.stroke(0);
            p5.strokeWeight(2);
            if (hero.isAlive()) {
                p5.fill(0, 255, 0);
            } else {
                p5.fill(200, 200, 200);
            }
            p5.circle(pos.x, pos.y, 40);
        }
    }

    static renderingProjectile(p5, entities) {
        for (const entity of Object.values(entities)) {
            const pos = entity.position;
            // console.log(`Rendering projectile with velocity (${entity.velocity.vx}, ${entity.velocity.vy}) and damage ${entity.damage}`);
            if (pos) {
                if (entity.category === 'Area') {
                    console.log(`Rendering AreaEffect with radius ${entity.hitbox || 0}`);
                    const radius = entity.hitbox || 0;
                    p5.stroke(80, 160, 255);
                    p5.strokeWeight(2);
                    p5.fill(80, 160, 255, 90);
                    p5.circle(pos.x, pos.y, radius * 2);
                } else {
                    p5.stroke(0);
                    p5.strokeWeight(2);
                    p5.fill(255, 255, 0);
                    p5.rect(pos.x - 5, pos.y - 5, 10, 10);
                }
            }
        }
    }

    static renderingPath(p5, map) {
        if (map.paths) {
            for (const [id, path] of map.paths.entries()) {
                p5.fill(255, 255, 0);
                // Mark the ID of the path at the first waypoint
                if (path.waypoint && path.waypoint.length > 0) {
                    const firstPoint = path.waypoint[0];
                    p5.stroke(0, 0, 0);
                    p5.strokeWeight(4);
                    p5.textSize(40);
                    p5.text(id, firstPoint.x + 5, firstPoint.y - 5);
                }

                p5.stroke(255, 255, 0);
                p5.strokeWeight(5);
                p5.noFill();
                // Draw the path
                for (let i=0; i<path.waypoint.length-1; i++) {
                    const point1 = path.waypoint[i];
                    const point2 = path.waypoint[i+1];
                    p5.line(point1.x, point1.y, point2.x, point2.y);
                }
            }
        }
    }
}