import { Bullet } from "./Bullet.js";

export class Tower {
  constructor(p, x, y, bulletsArray) {
    this.p = p;
    this.pos = this.p.createVector(x, y);
    this.bulletsArray = bulletsArray; 

    // Core attributes
    this.range = 150;
    this.reload = 0;
    this.size = 30;
    this.damage = 5;
    this.level = 1;
    
    // Interaction attributes
    this.isSelected = false; // Record whether it is selected
  }

  // Check whether the mouse clicked on this tower
  containsPoint(mx, my) {
    let d = this.p.dist(mx, my, this.pos.x, this.pos.y);
    return d < this.size / 2;
  }

  upgrade() {
    this.level++;
    this.damage += 3;       // Increase damage
    this.range += 20;       // Increase range
    this.reloadTime = Math.max(10, 30 - this.level * 2); // Slightly increase fire rate
    
    console.log(`🔧 Tower upgraded! Level: ${this.level}, Damage: ${this.damage}, Range: ${this.range}`);
  }

  getUpgradeCost() {
    // Base cost 200, increase 100 per level
    return this.level * 100 + 100;
  }

  show() {
    this.p.push(); // Use push/pop to protect graphics style
    
    // 1. If selected, draw range circle and highlight border
    if (this.isSelected) {
      // Draw translucent attack range
      this.p.fill(0, 255, 0, 30);
      this.p.stroke(0, 255, 0, 150);
      this.p.strokeWeight(2);
      this.p.ellipse(this.pos.x, this.pos.y, this.range * 2);
      
      // Draw selection halo
      this.p.noFill();
      this.p.stroke(255, 255, 0); // Yellow highlight
      this.p.rect(this.pos.x, this.pos.y, this.size + 8, this.size + 8);
    }

    // 2. Draw tower body
    this.p.rectMode(this.p.CENTER);
    this.p.noStroke();
    // Color darkens with level
    let blueValue = this.p.constrain(100 + this.level * 30, 0, 255);
    this.p.fill(50, 50, blueValue);
    this.p.rect(this.pos.x, this.pos.y, this.size, this.size);

    // 3. Draw level text
    this.p.fill(255);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(12);
    this.p.text("Lv." + this.level, this.pos.x, this.pos.y);
    
    this.p.pop();
  }

  scan(enemies) {
    if (this.reload > 0) this.reload--;
    
    for (let e of enemies) {
      let d = this.p.dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
      if (d < this.range && this.reload <= 0) {
        // Pass current damage to bullet
        this.bulletsArray.push(new Bullet(this.p, this.pos.x, this.pos.y, e, this.damage));
        this.reload = 30; // Can be changed to this.reloadTime to support fire rate upgrade
        break;
      }
    }
  }
}