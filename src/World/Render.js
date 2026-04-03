export default class Render {
    static Y_SCALE = 1;

    static projectPosition(position) {
        return {
            x: position.x,
            y: position.y * Render.Y_SCALE,
        };
    }

    static projectHeight(value) {
        return value * Render.Y_SCALE;
    }

    static projectDiameter(radius) {
        return radius * 2;
    }

    static renderHero(p5, hero) {
        const pos = hero.position ? Render.projectPosition(hero.position) : null;
        if (pos) {
            p5.stroke(0);
            p5.strokeWeight(2);
            if (hero.alive()) {
                p5.fill(hero.sprite);
            } else {
                p5.fill('rgba(200, 200, 200, 1)');
            }
            p5.ellipse(
                pos.x,
                pos.y,
                Render.projectDiameter(hero.hitbox),
                Render.projectHeight(Render.projectDiameter(hero.hitbox))
            );
            p5.noFill();
            if (hero.renderRange) {
                p5.stroke('rgba(0, 255, 0, 0.8)');
                p5.ellipse(
                    pos.x,
                    pos.y,
                    Render.projectDiameter(hero.renderRange),
                    Render.projectHeight(Render.projectDiameter(hero.renderRange))
                );
            }
        }

        for (const point of hero.waypoint) {
            const projectedPoint = Render.projectPosition(point);
            p5.stroke(0, 255, 0);
            p5.strokeWeight(2);
            p5.noFill();
            p5.ellipse(projectedPoint.x, projectedPoint.y, 10, Render.projectHeight(10));
        }
    }

    static renderObjective(p5, objective) {
        const pos = objective.position ? Render.projectPosition(objective.position) : null;
        const hp = objective.currentHP;
        const hitbox = objective.hitbox;
        if (pos) {
            p5.stroke(0);
            p5.strokeWeight(2);
            p5.fill(objective.sprite);
            p5.ellipse(
                pos.x,
                pos.y,
                Render.projectDiameter(hitbox),
                Render.projectHeight(Render.projectDiameter(hitbox))
            );
            p5.fill(100, 100, 100);
            p5.textSize(20);
            p5.text(hp, pos.x + hitbox/2, pos.y + hitbox/2);
        }
    }

    static renderEnemies(p5, enemies) {
        for (const enemy of enemies.values()) {
            const pos = enemy.position ? Render.projectPosition(enemy.position) : null;
            const hp = Math.round(enemy.currentHP);
            const hitbox = enemy.hitbox;
            if (enemy && pos) {
                p5.stroke(0);
                p5.strokeWeight(2);
                p5.fill(enemy.sprite);
                p5.ellipse(
                    pos.x,
                    pos.y,
                    Render.projectDiameter(hitbox),
                    Render.projectHeight(Render.projectDiameter(hitbox))
                );
                p5.textSize(15);
                p5.text(hp, pos.x + hitbox/2, pos.y + hitbox/2);
            }
        }
    }

    static renderEntities(p5, entities) {
        const items = entities instanceof Map ? entities.values() : Object.values(entities);
        for (const entity of items) {
            const pos = entity.position ? Render.projectPosition(entity.position) : null;
            if (pos) {
                if (entity.category === 'Area' || entity.category === 'Aura') {
                    console.log(`Rendering AreaEffect with radius ${entity.hitbox || 0}`);
                    const radius = entity.hitbox || 0;
                    p5.stroke(entity.sprite);
                    p5.strokeWeight(2);
                    p5.fill(entity.sprite, 90);
                    p5.ellipse(
                        pos.x,
                        pos.y,
                        Render.projectDiameter(radius),
                        Render.projectHeight(Render.projectDiameter(radius))
                    );
                } else {
                    p5.stroke(0);
                    p5.strokeWeight(2);
                    p5.fill(entity.sprite);
                    p5.ellipse(
                        pos.x,
                        pos.y,
                        Render.projectDiameter(entity.hitbox),
                        Render.projectHeight(Render.projectDiameter(entity.hitbox))
                    )
                }
            }
        }
    }

    static renderWaveLane(p5, wave) {
        // Draw lane paths and IDs
        for (let lane of wave.lanes) {
            p5.fill(255, 255, 0);
            if (lane.waypoint && lane.waypoint.length > 0) {
                const firstPoint = Render.projectPosition(lane.waypoint[0]);
                p5.stroke(0, 0, 0);
                p5.strokeWeight(4);
                p5.textSize(40);
                p5.text(lane.id, firstPoint.x + 5, firstPoint.y - 5);
            }

            p5.stroke(255, 255, 0);
            p5.strokeWeight(5);
            p5.noFill();
            // Draw the path
            for (let i=0; i<lane.waypoint.length-1; i++) {
                const point1 = Render.projectPosition(lane.waypoint[i]);
                const point2 = Render.projectPosition(lane.waypoint[i+1]);
                p5.line(point1.x, point1.y, point2.x, point2.y);
            }
        }
    }

    static renderMapBounds(p5, size) {
        const width = size.width;
        const height = Render.projectHeight(size.height);

        p5.noFill();
        p5.stroke(0, 120, 255);
        p5.strokeWeight(3);
        p5.rect(0, 0, width, height);
    }

    static renderVirtualEntityRange(p5, pointerPosition, hitbox) {
        p5.noStroke();
        p5.fill('rgba(0, 255, 0, 0.3)');
        p5.ellipse(
            pointerPosition.x,
            pointerPosition.y,
            hitbox * 2,
            hitbox * 2 * Render.Y_SCALE
        );
    }
}
