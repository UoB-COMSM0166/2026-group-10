export default class Render {
    static renderingObjective(p5, objective) {
        const pos = objective.position;
        if (pos) {
            p5.stroke(0);
            p5.strokeWeight(2);
            p5.fill(0, 0, 255);
            p5.rect(pos.x - 20, pos.y - 20, 40, 40);
        }
    }

    static renderingEnemy(p5, enemies) {
        for (const entity of Object.values(enemies)) {
            const pos = entity.position;
            if (pos) {
                p5.stroke(0);
                p5.strokeWeight(2);
                p5.fill(255, 0, 0);
                p5.circle(pos.x, pos.y, 40);
            }
        }
    }

    static renderingHero(p5, hero) {
        const pos = hero.position;
        if (pos) {
            p5.stroke(0);
            p5.strokeWeight(2);
            p5.fill(0, 255, 0);
            p5.circle(pos.x, pos.y, 40);
        }
    }

    static renderingProjectile(p5, entities) {
        for (const entity of Object.values(entities)) {
            const pos = entity.position;
            // console.log(`Rendering projectile with velocity (${entity.velocity.vx}, ${entity.velocity.vy}) and damage ${entity.damage}`);
            if (pos) {
                p5.stroke(0);
                p5.strokeWeight(2);
                p5.fill(255, 255, 0);
                p5.rect(pos.x - 5, pos.y - 5, 10, 10);
            }
        }
    }

    static renderingPath(p5, map) {
        if (map.paths) {
            for (const [id, path] of Object.entries(map.paths)) {
                p5.fill(255, 255, 0);
                // Mark the ID of the path at the first waypoint
                if (path.waypoints && path.waypoints.length > 0) {
                    const firstPoint = path.waypoints[0];
                    p5.stroke(0, 0, 0);
                    p5.strokeWeight(4);
                    p5.textSize(40);
                    p5.text(id, firstPoint.x + 5, firstPoint.y - 5);
                }

                p5.stroke(255, 255, 0);
                p5.strokeWeight(5);
                p5.noFill();
                // Draw the path
                for (var i=0; i<path.waypoints.length-1; i++) {
                    const point1 = path.waypoints[i];
                    const point2 = path.waypoints[i+1];
                    p5.line(point1.x, point1.y, point2.x, point2.y);
                }
            }
        }
    }
}