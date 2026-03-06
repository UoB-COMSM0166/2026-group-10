export class Enemy {
  constructor(p, path) {
    this.p = p;
    this.path = path; // Path points array
    this.pos = this.p.createVector(path[0].x, path[0].y);
    this.speed = 2;
    this.pathIndex = 0;
    this.hp = 10;
    this.finished = false;
    this.diameter = 20;
  }

  update() {
    if (this.pathIndex >= this.path.length - 1) {
      this.finished = true;
      return;
    }

    let target = this.path[this.pathIndex + 1];
    let targetVec = this.p.createVector(target.x, target.y);
    let dir = p5.Vector.sub(targetVec, this.pos);

    if (dir.mag() < this.speed) {
      this.pathIndex++;
    } else {
      dir.setMag(this.speed);
      this.pos.add(dir);
    }
  }

  show() {
    this.p.fill(255, 0, 0);
    this.p.noStroke();
    this.p.ellipse(this.pos.x, this.pos.y, this.diameter);
  }

  takeDamage(damage) {
    this.hp -= damage;
  }

  isAlive() {
    return this.hp > 0 && !this.finished;
  }
}
