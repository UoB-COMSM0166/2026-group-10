export default class Render {
    static WORLD_Y_SCALE = 0.7;
    static ENEMY_FRAME_COUNT = 4;
    static ENEMY_FRAME_TICKS = 10;
    static ENTITY_SPRITE_BASE_SIZE = 3;
    static ENTITY_SPRITE_FOOT_OFFSET = 0.35;

    constructor(layer) {
        this.layer = layer;
        this.sprites = new Map();
    }

    renderHero(hero) {
        const sketch = this.layer;
        if (!hero?.position) {
            return;
        }

        this.withWorldTransform(() => {
            this.renderBaseRing(hero);
            sketch.noStroke();
            sketch.fill(hero.alive ? '#8cd3ff' : '#5f6f82');
            sketch.circle(hero.position.x, hero.position.y, hero.hitbox * 2.2);
        });
    }

    renderEnemies(enemies = [], tick = 0) {
        const sketch = this.layer;
        this.withWorldTransform(() => {
            sketch.noStroke();

            for (const enemy of enemies) {
                if (!enemy?.position) {
                    continue;
                }

                this.renderBaseRing(enemy);

                if (!this.renderEntity(enemy, tick, 0)) {
                    sketch.fill(this.getEnemyColor(enemy.name));
                    sketch.circle(enemy.position.x, enemy.position.y, enemy.hitbox * 2.1);
                }

                this.renderEnemyHealthBar(enemy);
            }
        });
    }

    renderSkillEntities(entities = [], color, tick = 0) {
        const sketch = this.layer;
        this.withWorldTransform(() => {
            sketch.noFill();
            sketch.stroke(color);
            sketch.strokeWeight(2);

            for (const entity of entities) {
                if (!entity?.position) {
                    continue;
                }

                if (!this.renderEntity(entity, tick)) {
                    sketch.circle(entity.position.x, entity.position.y, entity.hitbox * 2);
                }
            }
        });
    }

    renderUnitsAndProjectiles(state) {
        if (!state) {
            return;
        }

        this.renderHero(state.hero);
        this.renderEnemies(state.enemies, state.tick);
        this.renderSkillEntities(state.skillEntities, '#9fd0ff', state.tick);
        this.renderSkillEntities(state.enemySkillEntities, '#ffb199', state.tick);
    }

    renderEntity(entity, tick = 0, n = 0) {
        const sprite = this.getSprite(entity);
        if (!sprite || sprite.failed || !sprite.loaded || !sprite.image || !sprite.frameWidth || !sprite.frameHeight) {
            return false;
        }

        this.renderSprite(sprite, entity, tick, n);
        return true;
    }

    renderBillboardImage(image, entity, scaleMultiplier = 1, footOffset = Render.ENTITY_SPRITE_FOOT_OFFSET, facingRight = true) {
        const sketch = this.layer;
        const hitbox = Number(entity?.hitbox) || 0;
        if (!image || !entity?.position || hitbox <= 0) {
            return false;
        }

        const drawWidth = Math.max(1, hitbox * Render.ENTITY_SPRITE_BASE_SIZE * scaleMultiplier);
        const drawHeight = drawWidth;
        const feetY = hitbox * footOffset;

        sketch.push();
        sketch.translate(entity.position.x, entity.position.y);
        sketch.scale(1, 1 / Render.WORLD_Y_SCALE);
        if (!facingRight) {
            sketch.scale(-1, 1);
        }
        sketch.image(
            image,
            -drawWidth / 2,
            -drawHeight + feetY,
            drawWidth,
            drawHeight
        );
        sketch.pop();
        return true;
    }

    renderSprite(sprite, entity, tick = 0, n = 0) {
        const sketch = this.layer;
        const frameIndex = Math.floor((Number(tick) || 0) / Render.ENEMY_FRAME_TICKS) % Render.ENEMY_FRAME_COUNT;
        const sourceX = frameIndex * sprite.frameWidth;
        const scaleExponent = Number.isFinite(Number(n)) ? Number(n) : 0;
        const scaleMultiplier = 2 ** scaleExponent;
        const hitbox = Number(entity.hitbox) || 0;
        const drawWidth = Math.max(1, hitbox * Render.ENTITY_SPRITE_BASE_SIZE * scaleMultiplier);
        const drawHeight = drawWidth;
        const centerX = entity.position.x;
        const centerY = entity.position.y;
        const facingRight = Number(entity?.velocity?.vx) > 0;
        const feetY = hitbox * Render.ENTITY_SPRITE_FOOT_OFFSET;

        sketch.push();
        sketch.translate(centerX, centerY);
        // Cancel world-space Y compression for billboard sprites.
        sketch.scale(1, 1 / Render.WORLD_Y_SCALE);
        if (!facingRight) {
            sketch.scale(-1, 1);
        }
        sketch.image(
            sprite.image,
            -drawWidth / 2,
            -drawHeight + feetY,
            drawWidth,
            drawHeight,
            sourceX,
            0,
            sprite.frameWidth,
            sprite.frameHeight
        );
        sketch.pop();
    }

    renderBaseRing(entity, color = '#d14b57') {
        const sketch = this.layer;
        const hitbox = Number(entity?.hitbox) || 0;
        if (!entity?.position || hitbox <= 0) {
            return;
        }

        sketch.push();
        sketch.noFill();
        sketch.stroke(color);
        sketch.strokeWeight(2);
        sketch.circle(entity.position.x, entity.position.y, hitbox * 2);
        sketch.pop();
    }

    renderEnemyHealthBar(enemy) {
        const sketch = this.layer;
        const hp = Number(enemy?.hp);
        const maxHP = Number(enemy?.maxHP);
        const hitbox = Number(enemy?.hitbox) || 0;
        if (!enemy?.position || maxHP <= 0 || hp < 0) {
            return;
        }

        const ratio = Math.max(0, Math.min(1, hp / maxHP));
        const width = Math.max(20, hitbox * 2.4);
        const height = 5;
        const x = enemy.position.x - width / 2;
        const y = enemy.position.y - hitbox - 20;

        sketch.push();
        sketch.noStroke();
        sketch.fill(40, 12, 16, 220);
        sketch.rect(x, y, width, height, 4);
        sketch.fill('#d14b57');
        sketch.rect(x, y, width * ratio, height, 4);
        sketch.pop();
    }

    getSprite(entity) {
        const key = this.getSpriteKey(entity);
        if (!key) {
            return null;
        }

        if (!this.sprites.has(key)) {
            this.sprites.set(key, this.loadSprite(key));
        }

        return this.sprites.get(key);
    }

    getSpriteKey(entity) {
        const key = entity?.name ?? entity?.category ?? '';
        return String(key).trim();
    }

    loadSprite(name) {
        const sketch = this.layer;
        if (!sketch || typeof sketch.loadImage !== 'function') {
            return null;
        }

        const sprite = {
            image: null,
            frameWidth: 0,
            frameHeight: 0,
            loaded: false,
            failed: false,
            loading: true,
            promise: null,
        };

        sprite.promise = sketch.loadImage(`FrontEnd/Assert/Image/${name}_Layout.png`)
            .then((image) => {
                sprite.image = image;
                sprite.loaded = true;
                sprite.loading = false;
                sprite.frameWidth = Math.floor((Number(image.width) || 0) / Render.ENEMY_FRAME_COUNT);
                sprite.frameHeight = Number(image.height) || 0;
                return image;
            })
            .catch(() => {
                sprite.failed = true;
                sprite.loading = false;
                return null;
            });

        return sprite;
    }

    getEnemyColor(name) {
        if (name === 'Zombie') return '#89a96b';
        if (name === 'Ghoul') return '#d57d4a';
        if (name === 'Necromancer') return '#9b6ad6';
        return '#d87b7b';
    }

    withWorldTransform(draw) {
        const sketch = this.layer;
        sketch.push();
        sketch.scale(1, Render.WORLD_Y_SCALE);
        sketch.imageMode(sketch.CORNER);
        sketch.drawingContext.imageSmoothingEnabled = false;
        draw();
        sketch.pop();
    }
}
