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
const DEFAULT_GAME_SETTINGS = {
    world: 'Forest',
};
const HERO_ALIASES = {
    architect: 'Architect',
    engineer: 'Architect',
    ranger: 'Architect',
    warrior: 'Warrior',
    archmage: 'Archmage',
    mage: 'Archmage',
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
let worldRender = null;
let initializeGamePresentation = null;
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

    if (!window.gameState?.settings?.isMusic) {
        musicState.desiredTrackId = id;
        await music.stop();
        musicState.currentTrackId = null;
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
    const gameWon = Boolean(musicState.gameWon);
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

function stopMenuMusic() {
    if (!window.menuMusic) {
        return;
    }

    if (typeof window.menuMusic.stop === 'function') {
        window.menuMusic.stop();
        return;
    }

    if (typeof window.menuMusic.pause === 'function') {
        window.menuMusic.pause();
    }
}

async function applyAudioSettings() {
    if (!window.gameState?.settings?.isMusic) {
        stopMenuMusic();
        await music.stop();
        musicState.currentTrackId = null;
        return;
    }

    if (window.activeScene?.constructor?.name === 'MenuScene') {
        if (window.menuMusic && window.musicStarted) {
            window.menuMusic.amp?.(0.15);
            window.menuMusic.loop?.();
            window.menuMusic.play?.();
        }
        return;
    }

    await syncMusicToDesiredTrack();
}

function returnToMenuScene(sketch) {
    postCommand('game:pause');
    postCommand('destroy:game');
    latestState = null;
    latestEvents = [];
    latestResult = null;
    uiMessageQueue = [];
    bookPausedGame = false;
    musicState.gameLost = false;
    musicState.gameWon = false;
    musicState.previousStarted = false;
    musicState.previousHeroAlive = null;
    musicState.previousBossId = null;
    musicState.previousGameWon = false;
    musicState.desiredTrackId = null;
    musicState.currentTrackId = null;
    if (sketchUi) {
        sketchUi.over = false;
        sketchUi.win = null;
        sketchUi.showBook = false;
        sketchUi.resultWindowMenuButtonBounds = null;
    }
    void music.stop();
    if (typeof MenuScene !== 'undefined') {
        window.activeScene = new MenuScene(sketch, window.menuBackground);
    }
}

window.addEventListener('pointerdown', () => {
    void unlockAudioAndSync();
}, { passive: true });
window.addEventListener('keydown', () => {
    void unlockAudioAndSync();
});

function normalizeHeroName(hero) {
    const normalized = String(hero ?? '').trim().toLowerCase();
    return HERO_ALIASES[normalized] ?? '';
}

function parseCheatChangeHero(command) {
    const match = String(command ?? '').match(/^cheat:change\(([^)]+)\)$/i);
    if (!match) {
        return '';
    }

    return normalizeHeroName(match[1]);
}

function postCommand(command, payload = null) {
    const cheatChangeHero = parseCheatChangeHero(command);
    if (cheatChangeHero) {
        if (typeof initializeGamePresentation === 'function') {
            initializeGamePresentation(cheatChangeHero);
        }
        window.gameState.selectedCharacter = cheatChangeHero;
    }

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

    if (!worldRender) {
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
        if (window.gameState?.settings?.isSound) {
            soundEffect.handleEvent(name, payload);
        }
        if (name === 'game:start') {
            musicState.gameLost = false;
            musicState.gameWon = false;
            musicState.previousStarted = false;
            musicState.previousHeroAlive = null;
            musicState.previousBossId = null;
            musicState.previousGameWon = false;
            if (sketchUi?.getResult) {
                sketchUi.over = false;
                sketchUi.win = null;
            }
            stopMenuMusic();
            void playMusicTrack('normal', { restart: true });
        }
        if (name === 'game:win') {
            musicState.gameWon = true;
            if (sketchUi?.getResult) {
                sketchUi.getResult(true);
            }
        }
        if (name === 'objective:destroyed') {
            musicState.gameLost = true;
            if (sketchUi?.getResult) {
                sketchUi.getResult(false);
            }
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

window.activeScene = null;
window.menuBackground = null;
window.mapOneBackground = null;
window.selectDifficultyBg = null;
window.generalBackground = null;
window.msgTimer = 0;
window.audioMessage = "";
window.MESSAGE_DURATION = 80;
window.menuMusic = null;
window.musicStarted = false;
window.clickNoise = null;
window.cursorImage = null;
window.font = null;
window.introMusic = null;
window.introImages = [];
window.instructionImages = [];
window.introVoices = [];
window.characterImages = [];
window.characterVoices = [];

window.gameState = {
    selectedCharacter: null,
    selectedDifficulty: null,
    settings: {
        isSound: true,
        isMusic: true
    }
};

window.GameController = {
    startGame() {
        const heroClass = normalizeHeroName(window.gameState.selectedCharacter);
        if (!heroClass) {
            console.warn('Cannot start game without a selected hero.');
            return;
        }

        if (typeof initializeGamePresentation === 'function') {
            initializeGamePresentation(heroClass);
        }

        stopMenuMusic();

        console.log(`Starting game with ${heroClass} character and ${window.gameState.selectedDifficulty} difficulty`);
        postCommand('game:start', {
            hero: heroClass,
            world: DEFAULT_GAME_SETTINGS.world,
            difficulty: window.gameState.selectedDifficulty ?? 'easy',
        });
        postCommand('snapshot');
    }
};

window.playClickNoise = function() {
    if (window.gameState.settings.isSound === true && window.clickNoise) {
        window.clickNoise.amp(0.29);
        window.clickNoise.play();
    }
};
window.applyAudioSettings = () => {
    void applyAudioSettings();
};

const sketch = (p) => {
    let loadingComplete = false;
    let uiLayer = null;
    let ui = null;
    let activePresentationHero = null;

    const ensureGamePresentation = (hero) => {
        const normalizedHero = String(hero ?? '').trim();
        if (!normalizedHero || !uiLayer) {
            return;
        }

        if (normalizedHero === activePresentationHero && ui && worldRender) {
            return;
        }

        ui = new UI(uiLayer, normalizedHero);
        sketchUi = ui;
        worldRender = new Render(null, normalizedHero, DEFAULT_GAME_SETTINGS.world);
        activePresentationHero = normalizedHero;
        bookPausedGame = false;
    };

    p.setup = () => {
        p.createCanvas(GAME_WIDTH, GAME_HEIGHT);
        uiLayer = p.createGraphics(p.width, p.height);
        initializeGamePresentation = ensureGamePresentation;

        p.textFont('sans-serif');
        uiLayer.textFont('sans-serif');

        p.noCursor();

        const loadImg = (path) => {
            const img = new window.Image();
            img.src = path;
            return img;
        };

        const loadSnd = (path, cb) => {
            if (window.p5 && window.p5.SoundFile) {
                return new window.p5.SoundFile(path, cb);
            }
            return p.loadSound(path, cb); // Fallback
        };

        window.menuBackground = loadImg("src/FrontEnd/Asset/Image/newMenuBG.png");
        window.generalBackground = loadImg("src/FrontEnd/Asset/Image/generalBGZelda.png");
        window.selectDifficultyBg = loadImg("src/FrontEnd/Asset/Image/newSelectDifficultyBG.jpg");
        window.cursorImage = loadImg("src/FrontEnd/Asset/Image/cursor.png");

        window.introImages[0] = loadImg("src/FrontEnd/Asset/Image/intro1.png");
        window.introImages[1] = loadImg("src/FrontEnd/Asset/Image/intro2.png");
        window.introImages[2] = loadImg("src/FrontEnd/Asset/Image/intro3.png");
        window.introImages[3] = loadImg("src/FrontEnd/Asset/Image/intro4.png");

        window.instructionImages[0] = loadImg("src/FrontEnd/Asset/Image/how_to_play1.png");
        window.instructionImages[1] = loadImg("src/FrontEnd/Asset/Image/how_to_play2.png");
        window.instructionImages[2] = loadImg("src/FrontEnd/Asset/Image/how_to_play3.png");
        window.instructionImages[3] = loadImg("src/FrontEnd/Asset/Image/how_to_play4.png");

        window.characterImages[0] = loadImg("src/FrontEnd/Asset/Image/Architect/Profile.png");
        window.characterImages[1] = loadImg("src/FrontEnd/Asset/Image/Warrior/Profile.png");
        window.characterImages[2] = loadImg("src/FrontEnd/Asset/Image/Archmage/Profile.png");

        window.introVoices[0] = loadSnd("src/FrontEnd/Asset/Sound/intro_narration_1.mp3");
        window.introVoices[1] = loadSnd("src/FrontEnd/Asset/Sound/intro_narration_2.mp3");
        window.introVoices[2] = loadSnd("src/FrontEnd/Asset/Sound/intro_narration_3.mp3");
        window.introVoices[3] = loadSnd("src/FrontEnd/Asset/Sound/intro_narration_4.mp3");

        window.characterVoices[0] = loadSnd("src/FrontEnd/Asset/Sound/elf_narration.mp3");
        window.characterVoices[1] = loadSnd("src/FrontEnd/Asset/Sound/warrior_narration.mp3");
        window.characterVoices[2] = loadSnd("src/FrontEnd/Asset/Sound/mage_narration.mp3");

        window.menuMusic = loadSnd("src/FrontEnd/Asset/Sound/menu_music.mp3", () => {
            if (window.musicStarted && window.gameState.settings.isMusic && !window.menuMusic.isPlaying()) {
                window.menuMusic.amp(0.15);
                window.menuMusic.loop();
                window.menuMusic.play();
            }
        });
        window.introMusic = loadSnd("src/FrontEnd/Asset/Sound/intro-music.mp3");
        window.clickNoise = loadSnd("src/FrontEnd/Asset/Sound/general_click_noise.mp3");

        p.loadFont(
            "src/FrontEnd/Asset/Image/message_font.ttf",
            (f) => { window.font = f; },
            (_) => {
                console.warn("Could not load font, using default.");
                window.font = 'sans-serif';
            }
        );

        loadingComplete = true;

        if (typeof LoadingScene !== 'undefined') {
            window.activeScene = new LoadingScene(p);
        } else if (typeof MenuScene !== 'undefined') {
            window.activeScene = new MenuScene(p, window.menuBackground);
        }

        void unlockAudioAndSync();
    };

    p.draw = () => {
        if (!loadingComplete) {
            p.background('#08101b');
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(32);
            p.text("Loading Game...", p.width / 2, p.height / 2);
            return;
        }

        p.background('#08101b');

        if (window.activeScene) {
            window.activeScene.display();
        }

        if (window.activeScene && window.activeScene.constructor.name === 'MapOneScene') {
            drawWorld(p, latestState, input.vectorTargetStart);

            if (ui && latestState) {
                while (uiMessageQueue.length > 0) {
                    ui.handleWorkerMessage(uiMessageQueue.shift());
                }
                ui.draw(latestState, { x: p.mouseX, y: p.mouseY });
                p.image(uiLayer, 0, 0);
            }
        }

        if (window.cursorImage && window.cursorImage.complete && window.cursorImage.naturalWidth > 0) {
            p.drawingContext.drawImage(window.cursorImage, p.mouseX, p.mouseY, 32, 32);
        }
    };
    p.mousePressed = async () => {
        if (!loadingComplete) return;

        // Satisfy browser's autoplay policy by initializing the AudioContext on user interaction
        if (p.getAudioContext().state !== 'running') {
            await p.userStartAudio();
        }

        if (window.activeScene && typeof window.activeScene.mousePressed === 'function') {
            window.activeScene.mousePressed();
        }

        if (window.musicStarted === false && window.menuMusic) {
            window.musicStarted = true;

            let isReady = false;
            if (typeof window.menuMusic.isLoaded === 'function') {
                isReady = window.menuMusic.isLoaded();
            } else if (typeof window.menuMusic.duration === 'function') {
                isReady = window.menuMusic.duration() > 0;
            }

            if (window.gameState.settings.isMusic && isReady) {
                window.menuMusic.amp(0.15);
                window.menuMusic.loop();
                window.menuMusic.play();
            }
        }

        if (window.activeScene && window.activeScene.constructor.name === 'MapOneScene') {
            if (sketchUi?.handleResultWindowClick?.({ x: p.mouseX, y: p.mouseY })) {
                returnToMenuScene(p);
                return;
            }
            const pauseAction = sketchUi?.handlePauseWindowClick?.({ x: p.mouseX, y: p.mouseY }) ?? null;
            if (pauseAction) {
                if (pauseAction === 'main_menu') {
                    returnToMenuScene(p);
                    return;
                }

                if (pauseAction === 'toggle_sound') {
                    window.gameState.settings.isSound = !window.gameState.settings.isSound;
                    window.applyAudioSettings?.();
                    window.audioMessage = window.gameState.settings.isSound
                        ? 'Sound is switched on!'
                        : 'Sound is switched off!';
                    window.msgTimer = window.MESSAGE_DURATION;
                    return;
                }

                if (pauseAction === 'toggle_music') {
                    window.gameState.settings.isMusic = !window.gameState.settings.isMusic;
                    window.applyAudioSettings?.();
                    window.audioMessage = window.gameState.settings.isMusic
                        ? 'Music is switched on!'
                        : 'Music is switched off!';
                    window.msgTimer = window.MESSAGE_DURATION;
                    return;
                }
            }
            input.handleMousePressed(p);
        }
    };

    p.mouseReleased = () => {
        if (!loadingComplete) return;
        if (window.activeScene && window.activeScene.constructor.name === 'MapOneScene') {
            input.handleMouseReleased(p);
        }
    };

    p.keyPressed = () => {
        if (!loadingComplete) return;
        if (window.activeScene && window.activeScene.constructor.name === 'MapOneScene') {
            input.handleKeyPressed(p);
        }
    };

    input.bind(p);
};

new p5Ctor(sketch, document.getElementById('app'));
