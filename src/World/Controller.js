import Projectile from '../Entity/Skill/Projectile.js';

export default class Controller {
    constructor(gameManager, hero) {
        this.gameManager = gameManager;
        this.hero = hero;
    }

    castSpell(key, x, y) {
        const skill = this.hero.skills[key];
        if (skill) {
            if (this.hero.currentMP >= skill.manaCost) {
                if (skill.category === "Projectile") {
                    const projectile = new Projectile(
                        `projectile_${this.gameManager.now()}`,
                        { x: this.hero.position.x, y: this.hero.position.y },
                        skill.speed,
                        skill.hitbox,
                        { x, y },
                        skill.damage
                    );
                    projectile.calculateVelocity({ x, y });
                    console.log(`Casting skill ${skill.name} towards (${x}, ${y}) with damage ${skill.damage}`);
                    this.gameManager.addEntity(projectile);
                    this.hero.currentMP -= skill.manaCost;
                }
            }
        }
    }

    handleRightClick(x, y, append = false) {
        // Check if click is within canvas bounds
        if (x < 0 || x > this.gameManager.map.width || y < 0 || y > this.gameManager.map.height) {
            // Click is outside the canvas, ignore it
            return false;
        }
        
        const targetSpot = { x, y };
        if (!append) {
            this.hero.clearWaypoints();
        }

        // console.log(`Hero moving to: ${x}, ${y}, append=${append}`);
        this.hero.appendWaypoint(targetSpot);
        return true;
    }

    handleButton(key, x, y) {
        if (key === 's' || key === 'S') {
            console.log('Hero stopped');
            this.hero.clearWaypoints();
            this.hero.stop();
        } else if (key === 'a' || key === 'A') {
            const skill = this.gameManager.hero.skills['A'];
            if (skill) {
                // console.log('Hero uses skill A');
                this.castSpell('A', x, y);
            }
        }
    }
}