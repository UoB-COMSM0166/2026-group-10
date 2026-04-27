import Input from './Input.js';
import { getSoundResource } from './Asset/AssetSheet.js';
import UI from './Output/UI.js';
import Render from './Output/Render.js';
import { BackgroundMusic, SoundEffect } from './Output/Sound.js';

const p5Ctor = window.p5;
if (!p5Ctor) {
    throw new Error('p5.js is required before loading FrontEnd/Main.js');
}

const GAME_WIDTH = 1600;
const GAME_HEIGHT = 900;
// TODO: Connect this to the Menu.
const DEFAULT_GAME_CONFIG = {
    hero: 'Architect',
    category: 'Penis',
    world: 'Forest',
};

const worker = new Worker(new URL('../Game/Worker.js', import.meta.url), { type: 'module' });
const soundResource = getSoundResource();
const MUSIC_TRACKS = [
    { id: 'normal', label: 'Normal', url: soundResource.normal, loop: true },
    { id: 'death', label: 'Death', url: soundResource.death, loop: false },
    { id: 'dead', label: 'Dead', url: soundResource.dead, loop: true },
    { id: 'boss', label: 'Boss', url: soundResource.boss, loop: true },
    { id: 'win', label: 'Win', url: soundResource.win, loop: false },
    { id: 'lose', label: 'Lose', url: soundResource.lose, loop: false },
];
window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

let latestState = null;
let latestEvents = [];
let latestResult = null;
let uiMessageQueue = [];
let bookPausedGame = false;
const music = new BackgroundMusic(MUSIC_TRACKS);
const soundEffect = new SoundEffect({
    eventMap: {
        'hero:attack:hit': 'heroAttack',
        'skill_entity:created': 'heroSkill',
        'enemy_skill_entity:created': 'enemySkill',
        'allied_decoy:created': 'heroSkill',
        'enemy:killed': 'enemyKilled',
        'enemy:reached_objective': 'objectiveHit',
        'hero:death': 'heroDeath',
        'hero:respawn': 'heroRespawn',
        'wave:start': 'waveStart',
        'game:win': 'victory',
        'objective:destroyed': 'defeat',
    },
    eventCooldowns: {
        'hero:attack:hit': 80,
        'skill_entity:created': 120,
        'enemy_skill_entity:created': 180,
        'allied_decoy:created': 250,
        'enemy:killed': 60,
        'enemy:reached_objective': 220,
        'hero:death': 1000,
        'hero:respawn': 800,
        'wave:start': 1200,
        'game:win': 1500,
        'objective:destroyed': 1500,
    },
});
const musicState = {
    desiredTrackId: null,
    currentTrackId: null,
    heroAlive: true,
    bossAlive: false,
    gameWon: false,
    gameLost: false,
    previousStarted: false,
    previousHeroAlive: null,
    previousBossId: null,
    previousGameWon: false,
    requestId: 0,
};

function getTrackIndexById(id) {
    return MUSIC_TRACKS.findIndex((track) => track.id === id);
}

async function playMusicTrack(id, options = {}) {
    if (!id) {
        return;
    }

    const index = getTrackIndexById(id);
    if (index < 0) {
        console.warn(`Unknown music track: ${id}`);
        return;
    }

    const shouldRestart = options.restart === true;
    if (!shouldRestart && musicState.currentTrackId === id && music.isPlaying) {
        musicState.desiredTrackId = id;
        return;
    }

    musicState.desiredTrackId = id;
    const requestId = musicState.requestId + 1;
    musicState.requestId = requestId;

    if (!shouldRestart && music.currentTrack?.id === id && music.isReady) {
        await music.play();
        if (requestId === musicState.requestId) {
            musicState.currentTrackId = id;
        }
        return;
    }

    const changed = await music.switchTrack(index);
    if (changed && requestId === musicState.requestId) {
        musicState.currentTrackId = id;
    }
}

async function syncMusicToDesiredTrack() {
    if (!musicState.desiredTrackId) {
        return;
    }

    if (musicState.currentTrackId === musicState.desiredTrackId && music.isPlaying) {
        return;
    }

    await playMusicTrack(musicState.desiredTrackId, {
        restart: musicState.currentTrackId !== musicState.desiredTrackId,
    });
}

function handleMusicState(state) {
    if (!state) {
        return;
    }

    const started = Boolean(state.flags?.started);
    const gameWon = Boolean(state.flags?.gameWon);
    const heroAlive = state.hero?.alive !== false;
    const bossId = state.boss?.id ?? null;
    const bossAlive = Boolean(bossId && state.boss?.alive !== false && !state.boss?.finished);

    musicState.heroAlive = heroAlive;
    musicState.bossAlive = bossAlive;
    musicState.gameWon = gameWon;

    if (musicState.gameLost) {
        musicState.previousStarted = started;
        musicState.previousHeroAlive = heroAlive;
        musicState.previousBossId = bossId;
        musicState.previousGameWon = gameWon;
        return;
    }

    if (!musicState.previousGameWon && gameWon) {
        void playMusicTrack('win', { restart: true });
        musicState.previousStarted = started;
        musicState.previousHeroAlive = heroAlive;
        musicState.previousBossId = bossId;
        musicState.previousGameWon = gameWon;
        return;
    }

    if (gameWon) {
        musicState.previousStarted = started;
        musicState.previousHeroAlive = heroAlive;
        musicState.previousBossId = bossId;
        musicState.previousGameWon = gameWon;
        return;
    }

    if (!musicState.previousStarted && started && heroAlive) {
        void playMusicTrack('normal');
    }

    if (musicState.previousHeroAlive === true && !heroAlive) {
        void playMusicTrack('death', { restart: true });
    } else if (musicState.previousHeroAlive === false && heroAlive) {
        void playMusicTrack(bossAlive ? 'boss' : 'normal', { restart: true });
    } else if (!musicState.previousBossId && bossId && heroAlive) {
        void playMusicTrack('boss', { restart: true });
    } else if (musicState.previousBossId && !bossId && heroAlive && musicState.currentTrackId === 'boss') {
        void playMusicTrack('normal', { restart: true });
    }

    musicState.previousStarted = started;
    musicState.previousHeroAlive = heroAlive;
    musicState.previousBossId = bossId;
    musicState.previousGameWon = gameWon;
}

async function unlockAudioAndSync() {
    await soundEffect.unlock();
    await syncMusicToDesiredTrack();
}

music.onTrackEnded = (track) => {
    if (track?.id === 'death' && !musicState.heroAlive) {
        void playMusicTrack('dead', { restart: true });
    }
};

window.addEventListener('pointerdown', () => {
    void unlockAudioAndSync();
}, { passive: true });
window.addEventListener('keydown', () => {
    void unlockAudioAndSync();
});

function postCommand(command, payload = null) {
    const requestId = `${command}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    worker.postMessage({ command, payload, requestId });
    return requestId;
}

function getDistance(from, to) {
    if (!from || !to) {
        return Number.POSITIVE_INFINITY;
    }

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function getMouseWorldPosition(sketch) {
    return {
        x: sketch.mouseX,
        y: sketch.mouseY / Render.WORLD_Y_SCALE,
    };
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

    worldRender.layer = sketch;
    worldRender.renderScene(state);
    drawTargetingOverlay(sketch, state, vectorTargetStart);
    drawStatusText(sketch, state);
}

function drawTargetingOverlay(sketch, state, vectorTargetStart = null) {
    const targeting = state?.hero?.targeting;
    if (targeting?.status !== 'targeting') {
        return;
    }

    const hero = state.hero;
    const mouse = getMouseWorldPosition(sketch);
    const range = Number(targeting.range) || 0;

    worldRender.withWorldTransform(() => {
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
        } else if (targeting.targetCategory === 'Unit' || targeting.targetCategory === 'Tower') {
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
    });
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

worker.onmessage = (event) => {
    const { type, payload, name, command } = event.data ?? {};

    if (type === 'state') {
        latestState = payload;
        handleMusicState(payload);
    } else if (type === 'event') {
        latestEvents.push({
            label: `${name}${payload?.wave ? ` ${payload.wave}` : ''}`,
            at: Date.now(),
        });
        latestEvents = latestEvents.slice(-12);
        soundEffect.handleEvent(name, payload);
        if (name === 'game:start') {
            musicState.gameLost = false;
            musicState.gameWon = false;
            musicState.previousStarted = false;
            musicState.previousHeroAlive = null;
            musicState.previousBossId = null;
            musicState.previousGameWon = false;
            void playMusicTrack('normal', { restart: true });
        }
        if (name === 'objective:destroyed') {
            musicState.gameLost = true;
            void playMusicTrack('lose', { restart: true });
        }
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

const worldRender = new Render(null);
const input = new Input({
    getState: () => latestState,
    getVectorTargetStart: () => input.vectorTargetStart,
    setVectorTargetStart: (value) => {
        input.vectorTargetStart = value;
    },
    postCommand,
    toggleBook: () => {
        if (sketchUi) {
            const nextShowBook = !sketchUi.showBook;
            sketchUi.showBook = nextShowBook;

            if (nextShowBook) {
                if (!latestState?.flags?.paused) {
                    postCommand('game:pause');
                    bookPausedGame = true;
                }
                return;
            }

            if (bookPausedGame) {
                postCommand('game:resume');
                bookPausedGame = false;
            }
        }
    },
    isBookOpen: () => Boolean(sketchUi?.showBook),
    handleSkillClick: ({ state, mouse }) => {
        if (!sketchUi || !state?.hero) {
            return;
        }

        sketchUi.handleSkillClick(state.hero, mouse, postCommand);
    },
    setCheatInputState: (value) => {
        if (sketchUi && typeof sketchUi.setCheatInputState === 'function') {
            sketchUi.setCheatInputState(value);
        }
    },
});
input.vectorTargetStart = null;
let sketchUi = null;

const sketch = (p) => {
    let uiLayer = null;
    let ui = null;

    p.setup = () => {
        p.createCanvas(GAME_WIDTH, GAME_HEIGHT);
        uiLayer = p.createGraphics(p.width, p.height);
        ui = new UI(uiLayer);
        sketchUi = ui;

        p.textFont('sans-serif');
        uiLayer.textFont('sans-serif');

        postCommand('create:game', DEFAULT_GAME_CONFIG);
        postCommand('game:start');
        postCommand('snapshot');
        void unlockAudioAndSync();
    };

    p.draw = () => {
        drawWorld(p, latestState, input.vectorTargetStart);

        if (ui && latestState) {
            while (uiMessageQueue.length > 0) {
                ui.handleWorkerMessage(uiMessageQueue.shift());
            }
            ui.draw(latestState, { x: p.mouseX, y: p.mouseY });
            p.image(uiLayer, 0, 0);
        }
    };
    input.bind(p);
};

new p5Ctor(sketch, document.getElementById('app'));
