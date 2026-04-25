import Input from './Input.js';
import UI from './Output/UI.js';
import Render from './Output/Render.js';

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
let bookPausedGame = false;
const objectiveSprite = {
    image: null,
    loaded: false,
    failed: false,
    promise: null,
};

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

    if (!state) {
        return;
    }

    worldRender.layer = sketch;
    drawObjective(sketch, state.objective);
    worldRender.renderUnitsAndProjectiles(state);
    drawTargetingOverlay(sketch, state, vectorTargetStart);
    drawStatusText(sketch, state);
}

function drawObjective(sketch, objective) {
    if (!objective?.position) {
        return;
    }

    worldRender.withWorldTransform(() => {
        worldRender.renderBaseRing(objective);

        if (objectiveSprite.loaded && objectiveSprite.image) {
            worldRender.renderBillboardImage(
                objectiveSprite.image,
                objective,
                4 / Render.ENTITY_SPRITE_BASE_SIZE
            );
            return;
        }

        sketch.noStroke();
        sketch.fill('#f5f1df');
        sketch.circle(objective.position.x, objective.position.y, objective.hitbox * 2.6);
    });
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
        let heroClass = 'Archmage';
        if (window.gameState.selectedCharacter === 'Elf Ranger') heroClass = 'Ranger';
        else if (window.gameState.selectedCharacter === 'Human Warrior') heroClass = 'Warrior';
        else if (window.gameState.selectedCharacter === 'Dracthyr Mage') heroClass = 'Archmage';

        console.log(`Starting game with ${heroClass} character and ${window.gameState.selectedDifficulty} difficulty`);
        postCommand('game:start', {
            heroClass: heroClass,
            difficulty: window.gameState.selectedDifficulty
        });
        postCommand('game:resume');
        postCommand('snapshot');
    }
};

window.playClickNoise = function() {
    if (window.gameState.settings.isSound === true && window.clickNoise) {
       window.clickNoise.amp(0.29);
       window.clickNoise.play();
    }
};

const sketch = (p) => {
    let loadingComplete = false;
    let uiLayer = null;
    let ui = null;

    p.setup = () => {
        p.createCanvas(GAME_WIDTH, GAME_HEIGHT);
        uiLayer = p.createGraphics(p.width, p.height);
        ui = new UI(uiLayer);
        sketchUi = ui;

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

        window.menuBackground = loadImg("FrontEnd/Assert/Image/menu_background.png");
        window.generalBackground = loadImg("FrontEnd/Assert/Image/general-background.png");
        window.selectDifficultyBg = loadImg("FrontEnd/Assert/Image/select_difficulty_bg.png");
        window.cursorImage = loadImg("FrontEnd/Assert/Image/cursor.png");
        
        window.introImages[0] = loadImg("FrontEnd/Assert/Image/intro1.png");
        window.introImages[1] = loadImg("FrontEnd/Assert/Image/intro2.jpg");
        window.introImages[2] = loadImg("FrontEnd/Assert/Image/intro3.png");
        window.introImages[3] = loadImg("FrontEnd/Assert/Image/intro4.jpg");
        
        window.characterImages[0] = loadImg("FrontEnd/Assert/Image/elf_img_no_bg.png");
        window.characterImages[1] = loadImg("FrontEnd/Assert/Image/warrior_img.jpg");
        window.characterImages[2] = loadImg("FrontEnd/Assert/Image/mage_img.jpg");

        window.introVoices[0] = loadSnd("FrontEnd/Assert/Sound/introVoiceOne.mp3");
        window.introVoices[1] = loadSnd("FrontEnd/Assert/Sound/introVoiceTwo.mp3");
        window.introVoices[2] = loadSnd("FrontEnd/Assert/Sound/introVoiceThree.mp3");
        window.introVoices[3] = loadSnd("FrontEnd/Assert/Sound/introVoiceFour.mp3");
        
        window.characterVoices[0] = loadSnd("FrontEnd/Assert/Sound/elf_narration.mp3");
        window.characterVoices[1] = loadSnd("FrontEnd/Assert/Sound/warrior_narration.mp3");
        window.characterVoices[2] = loadSnd("FrontEnd/Assert/Sound/mage_narration.mp3");

        window.menuMusic = loadSnd("FrontEnd/Assert/Sound/menu_music.mp3", () => {
            if (window.musicStarted && window.gameState.settings.isMusic && !window.menuMusic.isPlaying()) {
                window.menuMusic.amp(0.15);
                window.menuMusic.loop();
                window.menuMusic.play();
            }
        });
        window.introMusic = loadSnd("FrontEnd/Assert/Sound/intro-music.mp3");
        window.clickNoise = loadSnd("FrontEnd/Assert/Sound/general_click_noise.mp3");

        p.loadFont(
            "FrontEnd/Assert/Image/message_font.ttf", 
            (f) => { window.font = f; },
            (err) => {
                console.warn("Could not load font, using default.");
                window.font = 'sans-serif';
            }
        );

        objectiveSprite.promise = new Promise((resolve, reject) => {
            p.loadImage('FrontEnd/Assert/Image/Sprite_Tree.png', 
                (img) => {
                    objectiveSprite.image = img;
                    objectiveSprite.loaded = true;
                    resolve(img);
                },
                (err) => {
                    objectiveSprite.failed = true;
                    reject(err);
                }
            );
        });

        loadingComplete = true;

        if (typeof MenuScene !== 'undefined') {
            window.activeScene = new MenuScene(p, window.menuBackground);
        }
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
};

new p5Ctor(sketch, document.getElementById('app'));
