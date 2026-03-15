import Sprite from './Sprite.js';

export default class Render {
    static renderingObjective(p5, objective) {
        const pos = objective.position;
        const hp = objective.currentHP;
        const hitbox = objective.hitbox;
        if (pos) {
            p5.stroke(0);
            p5.strokeWeight(2);
            p5.fill(0, 0, 255);
            p5.circle(pos.x, pos.y, hitbox);
            // p5.rect(pos.x - objective.hitbox.width / 2, pos.y - objective.hitbox.height / 2, objective.hitbox.width, objective.hitbox.height);
            p5.fill(255, 255, 255);
            p5.text(hp, pos.x - hitbox / 2, pos.y);
        }
    }

    static renderingEnemy(p5, enemies) {
        // console.log(enemies);
        // for (const [key, value] in enemies.entries()) {
        //     console.log(value.id);
        //     const pos = value.position;
        //     if (pos) {
        //         p5.stroke(0);
        //         p5.strokeWeight(2);
        //         p5.fill(255, 0, 0);
        //         p5.circle(pos.x, pos.y, 40);
        //     }
        // }
        for (const enemy of enemies.values()) {
            const pos = enemy.position;
            const hp = Math.round(enemy.currentHP);
            if (enemy) {
                p5.stroke(0);
                p5.strokeWeight(2);
                p5.fill(255, 0, 0);
                p5.circle(pos.x, pos.y, 20);
                p5.text(hp, pos.x - 10, pos.y - 15);
            }
        }
    }

    static renderingHero(p5, hero, assetLoader) {
        const pos = hero.position;
        
        // Only attempt to render if the hero has a valid position
        if (pos) { 
            
            if (!hero.sprites && assetLoader) {
                // Fetch sprite image and frame count
                const idleData = assetLoader.getAsset('heroIdle');
                const runData = assetLoader.getAsset('heroRun');
                const attackData = assetLoader.getAsset('heroAttack');
                
                // If all the required assets were successfully loaded
                if (idleData && runData && attackData) {
                    // Initialize the Sprite objects for each state.
                    // Parameters: (spriteData, drawWidth, drawHeight, animationSpeed)
                    hero.sprites = {
                        idle: new Sprite(idleData, 128, 128, 0.15),
                        run: new Sprite(runData, 128, 128, 0.20),     
                        attack: new Sprite(attackData, 128, 128, 0.25)
                    };
                }
            }
            
            // ANIMATION STATE CHECKS:
            // The hero is moving if its horizontal (vx) or vertical (vy) velocity is greater than 0.1
            const isMoving = hero.velocity && (Math.abs(hero.velocity.vx) > 0.1 || Math.abs(hero.velocity.vy) > 0.1);
            
            // Determine facing direction based on horizontal velocity
            if (hero.velocity && hero.velocity.vx < -0.1) {
                hero.isFacingLeft = true;  // Moving left, flip sprite
            } else if (hero.velocity && hero.velocity.vx > 0.1) {
                hero.isFacingLeft = false; // Moving right, default sprite orientation
            }

            // Future Task: 
            // Whenever hero casts a spell in Hero.js, temporarily set this.isAttacking = true,
            // use a timer or cooldown counter to reset it to false when the attack animation completes
            const isAttacking = hero.isAttacking || false; 

            // Resolve priority of animation states: Attacking overrides Moving, Moving overrides Idle.
            const state = isAttacking ? 'attack' : (isMoving ? 'run' : 'idle');

            // DRAWING:
            if (hero.sprites && hero.sprites[state] && !hero.isDead) {
                // Pass true so the active sprite sheet always animates its frames continuously
                hero.sprites[state].draw(p5, pos.x, pos.y, true, hero.isFacingLeft);
            } else {
                // If sprites fail to load or hero is dead, circle drawn instead.
                p5.stroke(0);
                p5.strokeWeight(2);
                if (!hero.isDead) {
                    p5.fill(0, 255, 0);
                } else {
                    p5.fill(200, 200, 200); 
                }
                p5.circle(pos.x, pos.y, 40);
            }
        }
    }

    static renderingProjectile(p5, entities, assetLoader) {
        for (const entity of Object.values(entities)) {
            const pos = entity.position;
            // console.log(`Rendering projectile with velocity (${entity.velocity.vx}, ${entity.velocity.vy}) and damage ${entity.damage}`);
            if (pos) {
                // Load a sprite based on the skill name
                if (!entity.sprite && assetLoader && entity.skillName) {
                    // format skill name into key, e.g., "Fireball" -> "fireballSprite"
                    const spriteKey = entity.skillName.toLowerCase().replace(/\s+/g, '') + 'Sprite';
                    const spriteData = assetLoader.getAsset(spriteKey);
                    
                    if (spriteData) {
                        // scale area effects to their hitbox, while projectiles use a fixed or proportional size
                        const drawSize = entity.category === 'Area' ? (entity.hitbox * 2) : 64;
                        entity.sprite = new Sprite(spriteData, drawSize, drawSize, 0.25);
                    }
                }

                if (entity.sprite) {
                    // Flip horizontally if moving left
                    const flipX = entity.velocity && entity.velocity.vx < -0.1;
                    entity.sprite.draw(p5, pos.x, pos.y, true, flipX);
                } else if (entity.category === 'Area') {
                    console.log(`Rendering AreaEffect with radius ${entity.hitbox || 0}`);
                    const radius = entity.hitbox || 0;
                    p5.stroke(80, 160, 255);
                    p5.strokeWeight(2);
                    p5.fill(80, 160, 255, 90);
                    p5.circle(pos.x, pos.y, radius * 2);
                } else {
                    p5.stroke(0);
                    p5.strokeWeight(2);
                    p5.fill(255, 255, 0);
                    p5.rect(pos.x - 5, pos.y - 5, 10, 10);
                }
            }
        }
    }

    static renderingPath(p5, map) {
        if (map.paths) {
            for (const [id, path] of map.paths.entries()) {
                p5.fill(255, 255, 0);
                // Mark the ID of the path at the first waypoint
                if (path.waypoint && path.waypoint.length > 0) {
                    const firstPoint = path.waypoint[0];
                    p5.stroke(0, 0, 0);
                    p5.strokeWeight(4);
                    p5.textSize(40);
                    p5.text(id, firstPoint.x + 5, firstPoint.y - 5);
                }

                p5.stroke(255, 255, 0);
                p5.strokeWeight(5);
                p5.noFill();
                // Draw the path
                for (let i=0; i<path.waypoint.length-1; i++) {
                    const point1 = path.waypoint[i];
                    const point2 = path.waypoint[i+1];
                    p5.line(point1.x, point1.y, point2.x, point2.y);
                }
            }
        }
    }
}