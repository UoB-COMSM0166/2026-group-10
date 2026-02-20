export default class Movement {
    static calculateMovement(entity) {
        const pos = entity.getComponent('position');
        const vel = entity.getComponent('velocity');
        if (pos && vel) {
            pos.x += vel.vx;
            pos.y += vel.vy;
        }
    }

    static navigateToSpot(entity, targetSpot, speed) {
        const pos = entity.getComponent('position');
        const vel = entity.getComponent('velocity');
        if (!pos || !vel) return;

        const dx = targetSpot.x - pos.x;
        const dy = targetSpot.y - pos.y;
        const distSq = dx * dx + dy * dy;

        const dist = Math.sqrt(distSq);
        if (dist <= speed) {
            // Snap to target to avoid overshooting and velocity sign flipping.
            pos.x = targetSpot.x;
            pos.y = targetSpot.y;
            vel.vx = 0;
            vel.vy = 0;
            return;
        }

        const scale = speed / dist;
        vel.vx = dx * scale;
        vel.vy = dy * scale;
    }

    static moveAlongWaypoints(entity, speed) {
        const waypoints = entity.getComponent('waypoints');
        const vel = entity.getComponent('velocity');
        if (!Array.isArray(waypoints) || waypoints.length === 0) {
            if (vel) {
                vel.vx = 0;
                vel.vy = 0;
            }
            return;
        }

        const targetSpot = waypoints[0];
        this.navigateToSpot(entity, targetSpot, speed);

        const pos = entity.getComponent('position');
        if (pos && pos.x === targetSpot.x && pos.y === targetSpot.y) {
            waypoints.shift();
            entity.setComponent('waypoints', waypoints);
        }
    }

    static navigateToEntity(entity, targetEntity, speed) {
        const pos = entity.getComponent('position');
        const vel = entity.getComponent('velocity');
        const targetPos = targetEntity?.getComponent('position');

        if (!pos || !vel || !targetPos) return;

        const dx = targetPos.x - pos.x;
        const dy = targetPos.y - pos.y;
        const distSq = dx * dx + dy * dy;

        const dist = Math.sqrt(distSq);
        if (dist <= speed) {
            // Snap to target to avoid overshooting and velocity sign flipping.
            pos.x = targetPos.x;
            pos.y = targetPos.y;
            vel.vx = 0;
            vel.vy = 0;
            return;
        }

        const scale = speed / dist;
        vel.vx = dx * scale;
        vel.vy = dy * scale;
    }

    static stop(entity) {
        entity.setComponent('velocity', { vx: 0, vy: 0 });
    }
}
