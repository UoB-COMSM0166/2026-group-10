import Projectile from '../Entity/Skill/Projectile.js';
import AreaEffect from '../Entity/Skill/AreaEffect.js';

export default class Controller {
    constructor(gameManager, hero) {
        this.gameManager = gameManager;
        this.hero = hero;
    }

    castSpell(key, x, y) {
        const skill = this.hero.skills[key];
        if (skill) {
            if (!skill.canCast()) {
                console.log(`Skill ${skill.name} is on cooldown for ${skill.currentCooldown} more ticks.`);
                return;
            }
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
                    console.log(`Casting skill ${skill.name} towards (${x}, ${y}) with cd ${skill.cooldown}, damage ${skill.damage} and mana cost ${skill.manaCost}`);
                    this.gameManager.addEntity(projectile);
                    this.hero.currentMP -= skill.manaCost;
                    skill.startCooldown();
                } else if (skill.category === "Area") {
                    const areaEffect = new AreaEffect(
                        `area_${this.gameManager.now()}`,
                        { x, y },
                        skill.hitbox,
                        skill.duration,
                        skill.damage,
                        skill.damagePeriod,
                        this.gameManager
                    );
                    console.log(`Casting skill ${skill.name} at (${x}, ${y}) with cd ${skill.cooldown}, damage ${skill.damage} per tick, duration ${skill.duration} ticks and mana cost ${skill.manaCost}`);
                    this.gameManager.addEntity(areaEffect);
                    this.hero.currentMP -= skill.manaCost;
                    skill.startCooldown();
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
        } else if (key === 'q' || key === 'Q') {
            const skill = this.gameManager.hero.skills['Q'];
            if (skill) {
                this.castSpell('Q', x, y);
            }
        } else if (key === 'u' || key === 'U') {
            this.hero.levelUp();
        }
    }
}