export default class Movement {
    static calculateMovement(entity) {
        const pos = entity.getComponent('position');
        const vel = entity.getComponent('velocity');
        if (pos && vel) {
            pos.x += vel.vx;
            pos.y += vel.vy;
        }
    }

    // TODO: Update the entity's velocity to move towards the target spot, with a given speed
    static navigateToSpot(entity, targetSpot, speed) {
        const pos = entity.getComponent('position');
        const vel = entity.getComponent('velocity');
        if (!pos || !vel) return;

        const dx = targetSpot.x - pos.x;
        const dy = targetSpot.y - pos.y;
        const distSq = dx * dx + dy * dy;

        if (distSq === 0) {
            vel.vx = 0;
            vel.vy = 0;
            return;
        }

        const scale = speed / Math.sqrt(distSq);
        vel.vx = dx * scale;
        vel.vy = dy * scale;
    }

    static navigateToEntity(entity, targetEntity, speed) {
        const pos = entity.getComponent('position');
        const vel = entity.getComponent('velocity');
        const targetPos = targetEntity?.getComponent('position');

        if (!pos || !vel || !targetPos) return;

        const dx = targetPos.x - pos.x;
        const dy = targetPos.y - pos.y;
        const distSq = dx * dx + dy * dy;

        if (distSq === 0) {
            vel.vx = 0;
            vel.vy = 0;
            return;
        }

        const scale = speed / Math.sqrt(distSq);
        vel.vx = dx * scale;
        vel.vy = dy * scale;
    }
}
