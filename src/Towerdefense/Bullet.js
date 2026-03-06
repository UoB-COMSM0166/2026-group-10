export class Bullet {
  constructor(p, x, y, target, damage = 5) {
    this.p = p;
    this.pos = this.p.createVector(x, y);
    this.target = target;
    this.speed = 5;
    this.damage = damage;
    this.hit = false;
  }

  update() {
    if (!this.target.isAlive()) {
      this.hit = true;
      return;
    }

    let dir = p5.Vector.sub(this.target.pos, this.pos);
    if (dir.mag() < this.speed) {
      this.target.takeDamage(this.damage);
      console.log(`💥 Bullet hit enemy! Damage: ${this.damage}, Enemy HP: ${this.target.hp}`);
      this.hit = true;
    } else {
      dir.setMag(this.speed);
      this.pos.add(dir);
    }
  }

  show() {
    this.p.fill(0);
    this.p.noStroke();
    this.p.ellipse(this.pos.x, this.pos.y, 8);
  }
}
