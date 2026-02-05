export class Unit {
    #health;
    #damage;
    #pos;
    #destination;
    #move_speed;
    #diameter;
    
    constructor(p, x, y, move_speed, health, damage) {
        this.p = p;
        this.#pos = this.p.createVector(x, y);
        this.#destination = null;
        this.#move_speed = move_speed;
        this.#health = health;
        this.#damage = damage;
        this.#diameter = 20; // default visual size for circle representation
    }

    get pos() {
        return this.#pos.copy();
    }

    get target() {
        return this.#destination ? this.#destination.copy() : null;
    }

    get health() {
        return this.#health;
    }

    get damage() {
        return this.#damage;
    }

    get diameter() {
        return this.#diameter;
    }

    isAlive() {
        return this.#health > 0;
    }

    #changeHealth(amount) {
        this.#health += amount;
        if (this.#health < 0) this.#health = 0;
    }

    attacked(damage) {
        this.#changeHealth(-damage);
    }

    healed(amount) {
        this.#changeHealth(amount);
    }

    dealDamage(targetUnit) {
        if (!(targetUnit instanceof Unit)) {
            throw new Error("targetUnit must be a Unit");
        }
        targetUnit.attacked(this.#damage);
    }

    setMovingTarget(x, y) {
        this.#destination = this.p.createVector(x, y);
    }

    stop() {
        this.#destination = null;
    }

    update() {
        if (!this.#destination) return;
        const PVector = this.p.constructor.Vector;
        let dir = PVector.sub(this.#destination, this.#pos);
        let dist = dir.mag();

        let step = this.#move_speed * this.p.deltaTime / 1000;

        if (dist <= step) {
            this.#pos = this.#destination.copy();
            this.#destination = null;
        } else {
            dir.setMag(step);
            this.#pos.add(dir);
        }
    }

    // Render this unit as a circle bound to its position
    draw() {
        // Default enemy-like appearance: red circle
        this.p.fill(0xff, 0x0, 0x0);
        const pos = this.pos; // use getter to avoid exposing internal vector
        this.p.circle(pos.x, pos.y, this.#diameter);
    }

    // Hit test: check if (x,y) is inside this unit's circle
    containsPoint(x, y) {
        const pos = this.pos;
        const dist = this.p.dist(x, y, pos.x, pos.y);
        return dist <= this.#diameter / 2;
    }
}