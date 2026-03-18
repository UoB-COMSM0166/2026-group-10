export default class Entity {
    constructor(id, position, speed, hitbox, sprite) {
        this.id = String(id);
        this.position = { x: position.x, y: position.y } || { x: 0, y: 0 };
        this.velocity = { vx: 0, vy: 0 };
        this.baseSpeed = Number(speed) || 0;
        this.speed = this.baseSpeed;
        this.hitbox = Number(hitbox) || 0;  // Circle with default radius 0
        this.target = null;  // The movement target
        this.waypoint = [];
        this.sprite = sprite;
    }

    getDistance(position) {
        const dx = position.x - this.position.x;
        const dy = position.y - this.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    checkInside(position) {
        return this.getDistance(position) <= this.hitbox;
    }

    navigateToUnit(targetUnit) {
        this.navigateToPoint(targetUnit.position);
    }

    navigateToPoint(targetSpot) {

        const dist = this.getDistance(targetSpot);

        if (dist <= this.speed) {
            // Snap to target to avoid overshooting and velocity sign flipping.
            this.position.x = targetSpot.x;
            this.position.y = targetSpot.y;
            this.velocity.vx = 0;
            this.velocity.vy = 0;
            return;
        }

        const dx = targetSpot.x - this.position.x;
        const dy = targetSpot.y - this.position.y;
        const scale = this.speed / dist;
        this.velocity.vx = dx * scale;
        this.velocity.vy = dy * scale;
    }

    setTarget(target) {
        if (!target instanceof Entity) return;
        this.target = target;
    }

    removeTarget() {
        this.target = null;
    }

    appendWaypoint(point) {
        this.waypoint.push(point);
    }

    clearWaypoints() {
        this.waypoint = [];
    }

    // 可调用
    moveAlongWaypoint() {
        if (!Array.isArray(this.waypoint) || this.waypoint.length === 0) {
            if (this.velocity) {
                this.velocity.vx = 0;
                this.velocity.vy = 0;
            }
            return;
        }
        const targetSpot = this.waypoint[0];
        this.navigateToPoint(targetSpot);

        const pos = this.position;
        if (pos && pos.x === targetSpot.x && pos.y === targetSpot.y) {
            this.waypoint.shift();
        }
    }

    stop() {
        this.velocity.vx = 0;
        this.velocity.vy = 0;
    }

    calculateMovement() {
        const pos = this.position;
        const vel = this.velocity;
        if (pos && vel) {
            pos.x += vel.vx;
            pos.y += vel.vy;
        }
    }

    updateMovement() {
        if (this.speed <= 0) { return; }
        if (this.target) {
            this.navigateToUnit(this.target);
            this.calculateMovement();
        } else {
            this.moveAlongWaypoint();
            this.calculateMovement();
        }
    }
}
