export default class Entity {
    constructor(id, position, speed, hitbox) {
        this.id = id;
        this.position = position || { x: 0, y: 0 };
        this.velocity = { vx: 0, vy: 0 };
        this.speed = speed || 0;

        this.hitbox = hitbox || 0;  // Default Circle with radius 0
        this.target = null;  // The movement target
        this.waypoint = [];
    }

    calculateVelocity(target) {
        const dx = target.x - this.position.x;
        const dy = target.y - this.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const scale = this.speed / dist;
        this.velocity = { vx: dx * scale, vy: dy * scale };
    }

    navigate(targetSpot) {
        const dx = targetSpot.x - this.position.x;
        const dy = targetSpot.y - this.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= this.speed) {
            // Snap to target to avoid overshooting and velocity sign flipping.
            this.position.x = targetSpot.x;
            this.position.y = targetSpot.y;
            this.velocity.vx = 0;
            this.velocity.vy = 0;
            return;
        }

        const scale = this.speed / dist;
        this.velocity.vx = dx * scale;
        this.velocity.vy = dy * scale;
    }

    follow() {
        if (this.target) this.navigate(this.target.position);
    }

    setTarget(target) {
        this.target = target;
    }

    appendWaypoint(point) {
        this.waypoint.push(point);
    }

    clearWaypoints() {
        this.waypoint = [];
    }

    moveAlongWaypoint() {
        if (!Array.isArray(this.waypoint) || this.waypoint.length === 0) {
            if (this.velocity) {
                this.velocity.vx = 0;
                this.velocity.vy = 0;
            }
            return;
        }
        const targetSpot = this.waypoint[0];
        this.navigate(targetSpot);

        const pos = this.position;
        if (pos && pos.x === targetSpot.x && pos.y === targetSpot.y) {
            this.waypoint.shift();
        }

        this.calculateMovement();
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
}