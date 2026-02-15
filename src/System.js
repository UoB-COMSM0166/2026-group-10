export class System {
    static playerControlSystem(p, manager) {
        for (let id of manager.entities) {
            if (manager.getComponent(id, 'input')) {
                if (p.mouseIsPressed) {
                    console.log(`Mouse ${p.mouseButton} Pressed.`);
                    manager.addComponent(id, 'target', { x: p.mouseX, y: p.mouseY });
                }
                if (p.keyIsPressed && (p.key === 's' || p.key === 'S')) {
                    manager.components.target.delete(id);
                    let vel = manager.getComponent(id, 'velocity');
                    vel.vx = 0; vel.vy = 0;
                }
            }
        }
    }

    static navigationSystem(manager) {
        for (let id of manager.entities) {
            const pos = manager.getComponent(id, 'position');
            const target = manager.getComponent(id, 'target');
            const vel = manager.getComponent(id, 'velocity');

            if (pos && target && vel) {
                let dx = target.x - pos.x;
                let dy = target.y - pos.y;
                let dist = Math.sqrt(dx*dx + dy*dy);

                if (dist > 3) {
                    vel.vx = (dx/dist) * 5;
                    vel.vy = (dy/dist) * 5;
                } else {
                    vel.vx = 0; vel.vy = 0;
                    manager.components.target.delete(id);
                }
            }
        }
    }

    static movementSystem(manager) {
        for (let id of manager.entities) {
            const pos = manager.getComponent(id, 'position');
            const vel = manager.getComponent(id, 'velocity');
            if (pos && vel) {
                pos.x += vel.vx;
                pos.y += vel.vy;
            }
        }
    }

    static renderSystem(p, manager) {
        for (let id of manager.entities) {
            const pos = manager.getComponent(id, 'position');
            const app = manager.getComponent(id, 'appearance');
            if (pos && app) {
                p.fill(app.color);
                p.rectMode(p.CENTER);
                if (app.type === 'rect') p.rect(pos.x, pos.y, app.size, app.size);
            }
        }
    }

    static drawUI(p, manager) {
        for (let id of manager.entities) {
            const target = manager.getComponent(id, 'target');
            if (target) {
                p.stroke(0, 255, 0);
                p.line(target.x-5, target.y-5, target.x+5, target.y+5);
                p.line(target.x+5, target.y-5, target.x-5, target.y+5);
            }
        }
        p.fill(255);
        p.noStroke();
        p.text("Left Click: Move | S: Stop", 20, 30);
    }
}