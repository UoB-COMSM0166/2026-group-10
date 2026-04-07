import { Bullet } from "./Bullet.js";

export class Tower {
  constructor(p, x, y, bulletsArray, towerImage) {
    this.p = p;
    this.pos = this.p.createVector(x, y);
    this.bulletsArray = bulletsArray;
    this.towerImage = towerImage;

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
    this.p.push(); 
    
    // draw range and selection highlight first so they appear below the tower image
    if (this.isSelected) {
      //draw range circle
      this.p.fill(0, 255, 0, 30);
      this.p.stroke(0, 255, 0, 150);
      this.p.strokeWeight(2);
      this.p.ellipse(this.pos.x, this.pos.y, this.range * 2);
      
      // draw selection highlight
      this.p.noFill();
      this.p.stroke(255, 255, 0); 
      this.p.rectMode(this.p.CENTER);
      this.p.rect(this.pos.x, this.pos.y, this.size + 8, this.size + 8);
    }

    // draw the tower (image or fallback)
    if (this.towerImage) {
      this.p.imageMode(this.p.CENTER);
      this.p.image(this.towerImage, this.pos.x, this.pos.y, this.size, this.size);
    } else {
      this.p.rectMode(this.p.CENTER);
      this.p.noStroke();
      let blueValue = this.p.constrain(100 + this.level * 30, 0, 255);
      this.p.fill(50, 50, blueValue);
      this.p.rect(this.pos.x, this.pos.y, this.size, this.size);
    }

    // draw level text
    this.p.fill(255);
    this.p.stroke(0); // Add a black stroke for better visibility
    this.p.strokeWeight(2);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(12);
    this.p.text("Lv." + this.level, this.pos.x, this.pos.y + this.size / 2 + 10);
    
    this.p.pop();
  }

  scan(enemies) {
    if (this.reload > 0) this.reload--;
    
    for (let e of enemies) {
      let d = this.p.dist(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
      if (d < this.range && this.reload <= 0) {
        this.bulletsArray.push(new Bullet(this.p, this.pos.x, this.pos.y, e, this.damage));
        this.reload = this.reloadTime || 30; // Default reload time if not set
        break;
      }
    }
  }
}