export class Movement {
    static calculateMovement(entity) {
        const pos = entity.getComponent('position');
        const vel = entity.getComponent('velocity');
        if (pos && vel) {
            pos.x += vel.vx;
            pos.y += vel.vy;
        }
    }

    // Update the entity's velocity to move towards the target spot, with a given speed
    static navigateToSpot(entity, targetSpot, speed) {

    }

    // Update the entity's velocity to move towards the target entity, with a given speed
    static navigateToEntity(entity, targetEntity, speed) {
        
    }
}