export class Path {
  constructor(p, points) {
    this.p = p;
    this.points = points;
    this.strokeWeight = 40;
    this.strokeColor = 150;
  }

  show() {
    this.p.noFill();
    this.p.stroke(this.strokeColor);
    this.p.strokeWeight(this.strokeWeight);
    this.p.beginShape();
    for (let p of this.points) {
      this.p.vertex(p.x, p.y);
    }
    this.p.endShape();
  }

  getPoints() {
    return this.points;
  }
}
