import UI from './Output/UI.js';

const p5Ctor = window.p5;
if (!p5Ctor) {
    throw new Error('p5.js is required before loading FrontEnd/Main.js');
}

const GAME_WIDTH = 1600;
const GAME_HEIGHT = 900;
const worker = new Worker(new URL('../Game/Worker.js', import.meta.url), { type: 'module' });
window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

let latestState = null;
let latestEvents = [];
let latestResult = null;
let uiMessageQueue = [];

function postCommand(command, payload = null) {
    const requestId = `${command}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    worker.postMessage({ command, payload, requestId });
    return requestId;
}

function getMouseWorldPosition(sketch) {
    return {
        x: sketch.mouseX,
        y: sketch.mouseY,
    };
}

function getDistance(from, to) {
    if (!from || !to) {
        return Number.POSITIVE_INFINITY;
    }

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function drawWorld(sketch, state, vectorTargetStart = null) {
    sketch.background('#0d1320');

    sketch.push();
    sketch.noStroke();
    sketch.fill('#151e31');
    sketch.rect(0, 0, sketch.width, sketch.height);

    // sketch.fill('#19243a');
    // sketch.circle(320, 540, 120);
    // sketch.fill('#243550');
    // sketch.circle(800, 90, 100);
    // sketch.circle(1120, 450, 100);
    sketch.pop();

    if (!state) {
        return;
    }

    drawObjective(sketch, state.objective);
    drawHero(sketch, state.hero);
    drawEnemies(sketch, state.enemies);
    drawSkillEntities(sketch, state.skillEntities, '#9fd0ff');
    drawSkillEntities(sketch, state.enemySkillEntities, '#ffb199');
    drawTargetingOverlay(sketch, state, vectorTargetStart);
    drawStatusText(sketch, state);
}

function drawObjective(sketch, objective) {
    if (!objective?.position) {
        return;
    }

    sketch.push();
    sketch.noStroke();
    sketch.fill('#f5f1df');
    sketch.circle(objective.position.x, objective.position.y, objective.hitbox * 2.6);
    sketch.pop();
}

function drawHero(sketch, hero) {
    if (!hero?.position) {
        return;
    }

    sketch.push();
    sketch.noStroke();
    sketch.fill(hero.alive ? '#8cd3ff' : '#5f6f82');
    sketch.circle(hero.position.x, hero.position.y, hero.hitbox * 2.2);
    sketch.pop();
}

function drawEnemies(sketch, enemies = []) {
    sketch.push();
    sketch.noStroke();

    for (const enemy of enemies) {
        if (!enemy?.position) {
            continue;
        }

        sketch.fill(getEnemyColor(enemy.name));
        sketch.circle(enemy.position.x, enemy.position.y, enemy.hitbox * 2.1);
    }

    sketch.pop();
}

function drawSkillEntities(sketch, entities = [], color) {
    sketch.push();
    sketch.noFill();
    sketch.stroke(color);
    sketch.strokeWeight(2);

    for (const entity of entities) {
        if (!entity?.position) {
            continue;
        }

        sketch.circle(entity.position.x, entity.position.y, entity.hitbox * 2);
    }

    sketch.pop();
}

function drawTargetingOverlay(sketch, state, vectorTargetStart = null) {
    const targeting = state?.hero?.targeting;
    if (targeting?.status !== 'targeting') {
        return;
    }

    const hero = state.hero;
    const mouse = getMouseWorldPosition(sketch);
    const range = Number(targeting.range) || 0;

    sketch.push();
    sketch.noFill();
    sketch.stroke('#f5c750');
    sketch.strokeWeight(2);

    if (range > 0 && hero?.position) {
        sketch.circle(hero.position.x, hero.position.y, range * 2);
    }

    if (targeting.targetCategory === 'Point') {
        sketch.circle(mouse.x, mouse.y, 28);
        if (hero?.position) {
            sketch.line(hero.position.x, hero.position.y, mouse.x, mouse.y);
        }
    } else if (targeting.targetCategory === 'Unit') {
        sketch.circle(mouse.x, mouse.y, 34);
    } else if (targeting.targetCategory === 'Vector') {
        const start = vectorTargetStart ?? hero?.position ?? mouse;
        if (start) {
            const startInRange = !hero?.position || range <= 0 || getDistance(hero.position, start) <= range;
            const accent = startInRange ? '#f5c750' : '#d14b57';

            sketch.stroke(accent);
            sketch.fill(sketch.color(accent));
            sketch.circle(start.x, start.y, 16);
            sketch.noFill();
            sketch.strokeWeight(3);
            sketch.line(start.x, start.y, mouse.x, mouse.y);
            drawVectorArrow(sketch, start, mouse, accent);
            sketch.circle(mouse.x, mouse.y, 24);
        }
    }

    sketch.pop();
}

function drawVectorArrow(sketch, start, end, color) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= 0) {
        return;
    }

    const ux = dx / distance;
    const uy = dy / distance;
    const headLength = 18;
    const wingLength = 10;
    const baseX = end.x - ux * headLength;
    const baseY = end.y - uy * headLength;
    const perpX = -uy;
    const perpY = ux;

    sketch.push();
    sketch.stroke(color);
    sketch.strokeWeight(3);
    sketch.line(end.x, end.y, baseX + perpX * wingLength, baseY + perpY * wingLength);
    sketch.line(end.x, end.y, baseX - perpX * wingLength, baseY - perpY * wingLength);
    sketch.pop();
}

function drawStatusText(sketch, state) {
    sketch.push();
    sketch.fill('#dbe7f5');
    sketch.textAlign(sketch.RIGHT, sketch.TOP);
    sketch.textSize(14);

    const lines = [
        `Wave ${state.wave?.index + 1 ?? 1}`,
        `Tick ${state.tick ?? 0}`,
        state.flags?.paused ? 'Paused' : 'Running',
    ];

    if (latestResult?.payload?.message) {
        lines.push(latestResult.payload.message);
    }

    if (latestEvents.length > 0) {
        lines.push(...latestEvents.slice(-3).map((item) => item.label));
    }

    sketch.text(lines.join('\n'), sketch.width - 24, 24);
    sketch.pop();
}

function getEnemyColor(name) {
    if (name === 'Zombie') return '#89a96b';
    if (name === 'Ghoul') return '#d57d4a';
    if (name === 'Necromancer') return '#9b6ad6';
    return '#d87b7b';
}

function getSkillKeyFromKeyboard(key) {
    const normalized = String(key ?? '').toUpperCase();
    const allowed = new Set(['A', 'Q', 'W', 'E', 'R']);
    return allowed.has(normalized) ? normalized : null;
}

worker.onmessage = (event) => {
    const { type, payload, name, command } = event.data ?? {};

    if (type === 'state') {
        latestState = payload;
    } else if (type === 'event') {
        latestEvents.push({
            label: `${name}${payload?.wave ? ` ${payload.wave}` : ''}`,
            at: Date.now(),
        });
        latestEvents = latestEvents.slice(-12);
    } else if (type === 'result') {
        latestResult = event.data;
    } else if (type === 'error') {
        latestResult = {
            command,
            payload: {
                code: 500,
                message: payload?.message ?? 'Worker error',
            },
        };
    }

    uiMessageQueue.push(event.data);
};

const sketch = (p) => {
    let uiLayer = null;
    let ui = null;
    let vectorTargetStart = null;

    p.setup = () => {
        p.createCanvas(GAME_WIDTH, GAME_HEIGHT);
        uiLayer = p.createGraphics(p.width, p.height);
        ui = new UI(uiLayer);

        p.textFont('sans-serif');
        uiLayer.textFont('sans-serif');

        postCommand('game:start');
        postCommand('snapshot');
    };

    p.draw = () => {
        drawWorld(p, latestState, vectorTargetStart);

        if (ui && latestState) {
            while (uiMessageQueue.length > 0) {
                ui.handleWorkerMessage(uiMessageQueue.shift());
            }
            ui.render(latestState);
            p.image(uiLayer, 0, 0);
        }
    };

    p.mousePressed = () => {
        if (p.mouseButton.right && !p.mouseButton.left) {
            console.log('Right click - move command');
            vectorTargetStart = null;
            postCommand('hero:move', {
                position: getMouseWorldPosition(p),
            });
            return;
        }

        if (!latestState?.hero?.targeting || latestState.hero.targeting.status !== 'targeting') {
            return;
        }

        const targeting = latestState.hero.targeting;
        const command = `hero:cast:${targeting.skillKey}`;

        if (targeting.targetCategory === 'Vector') {
            vectorTargetStart = getMouseWorldPosition(p);
            return;
        }

        if (targeting.targetCategory === 'Point') {
            postCommand(command, {
                position: getMouseWorldPosition(p),
            });
            return;
        }

        if (targeting.targetCategory === 'Unit') {
            const nearestEnemy = findNearestEnemy(latestState.enemies, getMouseWorldPosition(p));
            postCommand(command, {
                targetId: nearestEnemy?.id ?? null,
            });
            return;
        }
    };

    p.mouseReleased = () => {
        if (p.mouseButton !== p.LEFT) {
            return;
        }

        if (!vectorTargetStart) {
            return;
        }

        const targeting = latestState?.hero?.targeting;
        if (!targeting || targeting.status !== 'targeting' || targeting.targetCategory !== 'Vector') {
            vectorTargetStart = null;
            return;
        }

        postCommand(`hero:cast:${targeting.skillKey}`, {
            start: { ...vectorTargetStart },
            end: getMouseWorldPosition(p),
        });
        vectorTargetStart = null;
    };

    p.keyPressed = () => {
        const skillKey = getSkillKeyFromKeyboard(p.key);
        if (skillKey) {
            postCommand(`hero:press:${skillKey}`);
            return;
        }

        if (String(p.key ?? '').toUpperCase() === 'S') {
            vectorTargetStart = null;
            postCommand('hero:stop');
            return;
        }

        if (p.key === ' ') {
            if (latestState?.flags?.paused) {
                postCommand('game:resume');
            } else {
                postCommand('game:pause');
            }
        }
    };
};

function findNearestEnemy(enemies = [], position) {
    if (!position) {
        return null;
    }

    let nearestEnemy = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const enemy of enemies) {
        if (!enemy?.position) {
            continue;
        }

        const dx = enemy.position.x - position.x;
        const dy = enemy.position.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= nearestDistance) {
            continue;
        }

        nearestEnemy = enemy;
        nearestDistance = distance;
    }

    return nearestEnemy;
}

new p5Ctor(sketch, document.getElementById('app'));
