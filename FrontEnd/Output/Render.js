import { loadSpriteImage } from "../Assert/AssetSheet.js";

// TODO: Connect to Menu
const HERO = 'Warrior';
const ENEMIES = ['Zombie', 'Boomer', 'Necromancer', 'Lich'];
const WORLD = 'Forest';

export default class Render {
    static WORLD_Y_SCALE = 0.7;
    static ENEMY_FRAME_COUNT = 8;
    static ENEMY_DIRECTION_COUNT = 8;
    static ENEMY_BOSS_FRAME_COUNT = 10;
    static HERO_FRAME_COUNT = 8;
    static HERO_DIRECTION_COUNT = 8;
    static HERO_FRAME_SIZE = 96;
    static GAME_TICK_RATE = 60;
    static ENTITY_SPRITE_BASE_SIZE = 10;
    static HERO_SPRITE_SCALE = 0.3;
    static ENTITY_SPRITE_FOOT_OFFSET = 0.35;

    constructor(layer, hero = HERO, map = WORLD, enemies = ENEMIES) {
        this.layer = layer;
        this.sprites = loadSpriteImage(hero, enemies, map);
    }

    renderHero(hero, tick = 0) {
        const sketch = this.layer;
        if (!hero?.position) {
            return;
        }

        this.withWorldTransform(() => {
            this.renderBaseRing(hero);

            if (this.renderHeroSprite(hero, tick)) {
                return;
            }

            sketch.noStroke();
            sketch.fill(hero.alive ? '#8cd3ff' : '#5f6f82');
            sketch.circle(hero.position.x, hero.position.y, hero.hitbox);
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
        this.renderScene(state);
    }

    renderScene(state) {
        if (!state) {
            return;
        }

        const drawQueue = this.buildDrawQueue(state);

        this.withWorldTransform(() => {
            for (const item of drawQueue) {
                this.renderQueueItem(item, state.tick);
            }

            for (const enemy of state.enemies ?? []) {
                this.renderEnemyHealthBar(enemy);
            }
        });
    }

    renderEntity(entity, tick = 0, n = 0) {
        const sprite = this.getSprite(entity);
        if (!sprite?.image || !sprite.frameWidth || !sprite.frameHeight) {
            return false;
        }

        this.renderSprite(sprite, entity, tick, n);
        return true;
    }

    renderHeroSprite(hero, tick = 0) {
        const sprite = this.getHeroSprite(hero);
        if (!sprite?.image) {
            return false;
        }
        return this.renderDirectionalSprite(
            sprite,
            hero,
            tick,
            Render.HERO_SPRITE_SCALE,
            2
        );
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
        this.drawImage(
            sketch,
            image,
            -drawWidth / 2,
            -drawHeight + feetY,
            drawWidth,
            drawHeight
        );
        sketch.pop();
        return true;
    }

    renderObjective(objective) {
        const sketch = this.layer;
        if (!objective?.position) {
            return;
        }

        this.renderBaseRing(objective);

        if (this.sprites?.objective?.complete) {
            this.renderBillboardImage(
                this.sprites.objective,
                objective,
                4 / Render.ENTITY_SPRITE_BASE_SIZE
            );
            return;
        }

        sketch.noStroke();
        sketch.fill('#f5f1df');
        sketch.circle(objective.position.x, objective.position.y, objective.hitbox * 2.6);
    }

    renderSprite(sprite, entity, tick = 0, n = 0) {
        const scaleExponent = Number.isFinite(Number(n)) ? Number(n) : 0;
        const baseScaleMultiplier = entity?.isBoss
            ? Render.HERO_SPRITE_SCALE
            : 1;
        const scaleMultiplier = 2 ** scaleExponent * baseScaleMultiplier;
        this.renderDirectionalSprite(sprite, entity, tick, scaleMultiplier);
    }

    renderBaseRing(entity, color = '#ff0000') {
        const sketch = this.layer;
        const hitbox = Number(entity?.hitbox) || 0;
        if (!entity?.position || hitbox <= 0) {
            return;
        }

        if (entity.id === HERO || entity.id === 'Corona Terrae') {
            color = '#00ff00';
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

    buildDrawQueue(state) {
        const queue = [];

        if (state?.objective?.position) {
            queue.push({
                kind: 'objective',
                entity: state.objective,
            });
        }

        if (state?.hero?.position) {
            queue.push({
                kind: 'hero',
                entity: state.hero,
            });
        }

        for (const enemy of state?.enemies ?? []) {
            if (!enemy?.position) {
                continue;
            }

            queue.push({
                kind: 'enemy',
                entity: enemy,
            });
        }

        for (const entity of state?.skillEntities ?? []) {
            if (!entity?.position) {
                continue;
            }

            queue.push({
                kind: 'skillEntity',
                entity,
                color: '#9fd0ff',
            });
        }

        for (const entity of state?.enemySkillEntities ?? []) {
            if (!entity?.position) {
                continue;
            }

            queue.push({
                kind: 'skillEntity',
                entity,
                color: '#ffb199',
            });
        }

        queue.sort((left, right) => {
            const leftY = Number(left?.entity?.position?.y) || 0;
            const rightY = Number(right?.entity?.position?.y) || 0;
            return leftY - rightY;
        });

        return queue;
    }

    renderQueueItem(item, tick = 0) {
        const sketch = this.layer;
        const entity = item?.entity;
        if (!entity?.position) {
            return;
        }

        if (item.kind === 'objective') {
            this.renderObjective(entity);
            return;
        }

        if (item.kind === 'hero') {
            this.renderBaseRing(entity);

            if (!this.renderHeroSprite(entity, tick)) {
                sketch.noStroke();
                sketch.fill(entity.alive ? '#8cd3ff' : '#5f6f82');
                sketch.circle(entity.position.x, entity.position.y, entity.hitbox);
            }
            return;
        }

        if (item.kind === 'enemy') {
            this.renderBaseRing(entity);

            if (!this.renderEntity(entity, tick, 0)) {
                sketch.noStroke();
                sketch.fill(this.getEnemyColor(entity.name));
                sketch.circle(entity.position.x, entity.position.y, entity.hitbox * 2.1);
            }
            return;
        }

        if (item.kind === 'skillEntity') {
            sketch.noFill();
            sketch.stroke(item.color);
            sketch.strokeWeight(2);

            if (!this.renderEntity(entity, tick)) {
                sketch.circle(entity.position.x, entity.position.y, entity.hitbox * 2);
            }
        }
    }

    getSprite(entity) {
        const key = this.getSpriteKey(entity);
        if (!key) {
            return null;
        }

        const image = this.sprites?.enemies?.[key] ?? null;
        return this.buildEnemySprite(image);
    }

    getHeroSprite(hero) {
        return this.buildHeroSprite(this.sprites?.hero ?? null);
    }

    getSpriteKey(entity) {
        const key = entity?.name ?? entity?.category ?? '';
        return String(key).trim();
    }

    buildEnemySprite(image) {
        if (!image?.complete) {
            return null;
        }

        const frameCount = this.getEnemyFrameCount(image);

        return {
            image,
            frameCount,
            directionCount: Render.ENEMY_DIRECTION_COUNT,
            frameWidth: Math.floor((Number(image.width) || 0) / frameCount),
            frameHeight: Math.floor((Number(image.height) || 0) / Render.ENEMY_DIRECTION_COUNT),
        };
    }

    buildHeroSprite(image) {
        if (!image?.complete) {
            return null;
        }

        return {
            image,
            frameCount: Render.HERO_FRAME_COUNT,
            directionCount: Render.HERO_DIRECTION_COUNT,
            frameWidth: Render.HERO_FRAME_SIZE,
            frameHeight: Render.HERO_FRAME_SIZE,
        };
    }

    getEnemyFrameCount(image) {
        const width = Number(image?.width) || 0;
        const height = Number(image?.height) || 0;

        if (width === 960 && height === 1280) {
            return Render.ENEMY_BOSS_FRAME_COUNT;
        }

        return Render.ENEMY_FRAME_COUNT;
    }

    renderDirectionalSprite(sprite, entity, tick = 0, scaleMultiplier = 1, hitboxMultiplier = 1) {
        const sketch = this.layer;
        const hitbox = (Number(entity?.hitbox) || 0) * hitboxMultiplier;
        if (!sprite?.image || !entity?.position || hitbox <= 0) {
            return false;
        }

        const vx = Number(entity?.velocity?.vx) || 0;
        const vy = Number(entity?.velocity?.vy) || 0;
        const isMoving = vx !== 0 || vy !== 0;
        const moveSpeed = Math.sqrt(vx * vx + vy * vy);
        const animationFps = moveSpeed * 6 + 24;
        const frameCount = Math.max(1, Number(sprite.frameCount) || 1);
        const directionCount = Math.max(1, Number(sprite.directionCount) || 1);
        const frameIndex = isMoving
            ? Math.floor(((Number(tick) || 0) * animationFps) / Render.GAME_TICK_RATE) % frameCount
            : 0;
        const angle = Number.isFinite(Number(entity?.angle)) ? Number(entity.angle) : 0;
        const directionRow = directionCount > 1
            ? Math.max(0, Math.min(directionCount - 1, Math.floor(angle)))
            : 0;
        const sourceX = frameIndex * sprite.frameWidth;
        const sourceY = directionRow * sprite.frameHeight;
        const drawWidth = Math.max(1, hitbox * Render.ENTITY_SPRITE_BASE_SIZE * scaleMultiplier);
        const aspectRatio = sprite.frameWidth > 0 ? sprite.frameHeight / sprite.frameWidth : 1;
        const drawHeight = drawWidth * aspectRatio;
        const feetY = hitbox * Render.ENTITY_SPRITE_FOOT_OFFSET;

        sketch.push();
        sketch.translate(entity.position.x, entity.position.y);
        sketch.scale(1, 1 / Render.WORLD_Y_SCALE);
        this.drawImage(
            sketch,
            sprite.image,
            -drawWidth / 2,
            -drawHeight + feetY,
            drawWidth,
            drawHeight,
            sourceX,
            sourceY,
            sprite.frameWidth,
            sprite.frameHeight
        );
        sketch.pop();
        return true;
    }

    getDrawableSource(image) {
        if (!image) {
            return null;
        }

        if (image.canvas) {
            return image.canvas;
        }

        if (image.elt) {
            return image.elt;
        }

        return image;
    }

    drawImage(sketch, image, dx, dy, dWidth, dHeight, sx = null, sy = null, sWidth = null, sHeight = null) {
        const source = this.getDrawableSource(image);
        if (!source) {
            return false;
        }

        if (
            sx === null || sy === null
            || sWidth === null || sHeight === null
        ) {
            sketch.drawingContext.drawImage(source, dx, dy, dWidth, dHeight);
            return true;
        }

        sketch.drawingContext.drawImage(
            source,
            sx,
            sy,
            sWidth,
            sHeight,
            dx,
            dy,
            dWidth,
            dHeight
        );
        return true;
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
