export default class Render {

    static renderingObjective(p5, objective) {
        const pos = objective.getComponent('position');
        if (pos) {
            p5.stroke(0);
            p5.strokeWeight(2);
            p5.fill(0, 0, 255);
            p5.rect(pos.x - 20, pos.y - 20, 40, 40);
        }
    }

    static renderingEnemy(p5, entities) {
        for (const entity of entities) {
            // console.log('Rendering entity:', entity.getComponent('name'));
            const pos = entity.getComponent('position');
            if (pos) {
                p5.stroke(0);
                p5.strokeWeight(2);
                p5.fill(255, 0, 0);
                p5.circle(pos.x, pos.y, 40);
            }
        }
    }

    static renderingHero(p5, hero) {
        const pos = hero.getComponent('position');
        if (pos) {
            p5.stroke(0);
            p5.strokeWeight(2);
            p5.fill(0, 255, 0);
            p5.circle(pos.x, pos.y, 40);
        }
    }

    static renderingPath(p5, map) {
        if (map.paths) {
            for (const [id, path] of Object.entries(map.paths)) {
                p5.stroke(255, 255, 0);
                p5.strokeWeight(5);
                p5.noFill();
                for (var i=0; i<path.way_points.length-1; i++) {
                    const point1 = path.way_points[i];
                    const point2 = path.way_points[i+1];
                    p5.line(point1.x, point1.y, point2.x, point2.y);
                }
            }
        }
    }
}