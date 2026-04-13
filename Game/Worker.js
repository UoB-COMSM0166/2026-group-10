import GameManager from './GameManager.js';

const game = new GameManager();
const TICK_RATE = 60;
const TICK_MS = 1000 / TICK_RATE;

let loopHandle = null;
let heroTargetingState = createHeroTargetingState();

function createHeroTargetingState() {
    return {
        status: 'idle',
        skillKey: null,
        targetCategory: null,
        range: 0,
        sequence: 0,
    };
}

function clonePosition(position) {
    if (!position) {
        return null;
    }

    return {
        x: Number(position.x) || 0,
        y: Number(position.y) || 0,
    };
}

function buildUnitState(unit) {
    if (!unit) {
        return null;
    }

    return {
        id: unit.id,
        name: unit.name ?? unit.id,
        position: clonePosition(unit.position),
        velocity: unit.velocity ? {
            vx: Number(unit.velocity.vx) || 0,
            vy: Number(unit.velocity.vy) || 0,
        } : null,
        hp: Number(unit.currentHP) || 0,
        maxHP: Number(unit.maxHP) || 0,
        mp: Number(unit.currentMP) || 0,
        maxMP: Number(unit.maxMP) || 0,
        hpRegen: Number(unit.hpRegen) || 0,
        mpRegen: Number(unit.mpRegen) || 0,
        speed: Number(unit.speed) || 0,
        baseSpeed: Number(unit.baseSpeed) || 0,
        armor: Number(unit.armor) || 0,
        attackAmp: Number(unit.attackAmp) || 0,
        spellAmp: Number(unit.spellAmp) || 0,
        hitbox: Number(unit.hitbox) || 0,
        inFountain: Boolean(unit.inFountain),
        alive: typeof unit.alive === 'function' ? unit.alive() : true,
        finished: Boolean(unit.finished),
        buffs: Array.isArray(unit.buffs) ? unit.buffs.map((buff) => ({
            name: buff.name,
            description: buff.description,
            icon: buff.icon,
            positive: Boolean(buff.positive),
            duration: Number(buff.duration) || 0,
            remaining: Number(buff.remaining) || 0,
            level: Number(buff.level) || 1,
            tags: Array.isArray(buff.tags) ? [...buff.tags] : [],
        })) : [],
    };
}

function buildHeroSkillState(hero) {
    const skills = {};

    for (const [slot, skill] of hero.skill.entries()) {
        skills[slot] = skill ? {
            slot,
            name: skill.name,
            category: skill.category,
            description: skill.description ?? '',
            cooldown: Number(skill.cooldown) || 0,
            currentCooldown: Number(skill.currentCooldown) || 0,
            manaCost: Number(skill.manaCost) || 0,
            range: Number(skill.range) || 0,
            targetCategory: skill.targetCategory ?? null,
            passive: Boolean(skill.passive),
            active: Boolean(skill.active),
            upgraded: Boolean(skill.upgraded),
        } : null;
    }

    return skills;
}

function buildEntityState(entity) {
    if (!entity) {
        return null;
    }

    return {
        id: entity.id,
        category: entity.category ?? 'Entity',
        position: clonePosition(entity.position),
        velocity: entity.velocity ? {
            vx: Number(entity.velocity.vx) || 0,
            vy: Number(entity.velocity.vy) || 0,
        } : null,
        hitbox: Number(entity.hitbox) || 0,
        finished: Boolean(entity.finished),
        duration: Number(entity.duration) || 0,
    };
}

function buildStateSnapshot() {
    return {
        tick: game.clock.now(),
        world: {
            name: game.world.name,
            mode: game.world.mode,
            size: { ...game.world.size },
        },
        wave: {
            index: game.currentWaveIndex,
            total: Array.isArray(game.world?.waves) ? game.world.waves.length : 0,
            remainingEnemies: (
                (game.currentWave?.lanes ?? []).reduce((sum, lane) => sum + (Number(lane.counter) || 0), 0)
                + game.enemies.size
            ),
            beforeCountdown: game.beforeWave,
            before: game.beforeWave,
            active: game.currentWave ? {
                before: game.currentWave.before,
                lanes: game.currentWave.lanes.map((lane) => ({
                    id: lane.id,
                    name: lane.name,
                    cd: lane.cd,
                    timer: lane.timer,
                    counter: lane.counter,
                    waypoint: lane.waypoint.map((point) => clonePosition(point)),
                })),
            } : null,
        },
        hero: {
            ...buildUnitState(game.hero),
            remainingRespawnCD: Number(game.hero.remainingRespawnCD) || 0,
            respawnCD: Number(game.hero.respawnCD) || 0,
            selectedSkill: heroTargetingState.skillKey,
            targeting: { ...heroTargetingState },
            casting: game.hero.isCasting(),
            skills: buildHeroSkillState(game.hero),
        },
        objective: buildUnitState(game.objective),
        enemies: [...game.enemies.values()].map((enemy) => buildUnitState(enemy)),
        skillEntities: [...game.skillEntities.values()].map((entity) => buildEntityState(entity)),
        enemySkillEntities: [...game.enemySkillEntities.values()].map((entity) => buildEntityState(entity)),
        flags: {
            started: game.started,
            gameOver: game.gameOver,
            gameWon: game.gameWon,
            paused: loopHandle === null,
        },
    };
}

function emitState() {
    self.postMessage({
        type: 'state',
        payload: buildStateSnapshot(),
    });
}

function sanitizeEventPayload(name, payload = {}) {
    switch (name) {
        case 'wave:start':
        case 'wave:end':
            return { wave: payload.wave };
        case 'game:win':
        case 'objective:destroyed':
            return {};
        case 'hero:death':
            return {
                heroId: payload.hero?.id ?? null,
                respawnTick: payload.respawnTick ?? 0,
            };
        case 'hero:respawn':
            return {
                heroId: payload.hero?.id ?? null,
            };
        case 'enemy:spawned':
            return {
                enemy: buildUnitState(payload.newEnemy),
            };
        case 'enemy:killed':
            return {
                id: payload.id ?? null,
                gold: payload.gold ?? 0,
            };
        case 'enemy:reached_objective':
            return {
                enemyId: payload.enemy?.id ?? null,
            };
        default:
            return payload;
    }
}

function emitEvent(name, payload) {
    self.postMessage({
        type: 'event',
        name,
        payload: sanitizeEventPayload(name, payload),
    });
}

function emitResult(command, requestId, code, message, data = null) {
    self.postMessage({
        type: 'result',
        command,
        requestId: requestId ?? null,
        payload: {
            code,
            message,
            data,
        },
    });
}

function setHeroTargetingState(nextState = {}) {
    heroTargetingState = {
        ...createHeroTargetingState(),
        ...nextState,
    };
}

function clearHeroTargetingState() {
    setHeroTargetingState();
}

function registerEventBridge() {
    const forwardedEvents = [
        'wave:start',
        'wave:end',
        'game:win',
        'objective:destroyed',
        'hero:death',
        'hero:respawn',
        'enemy:spawned',
        'enemy:killed',
        'enemy:reached_objective',
    ];

    for (const eventName of forwardedEvents) {
        game.events.on(eventName, (payload) => {
            if (eventName === 'hero:death' || eventName === 'game:win' || eventName === 'objective:destroyed') {
                clearHeroTargetingState();
            }
            emitEvent(eventName, payload);
        });
    }
}

function tick() {
    game.clock.tickCount += 1;
    game.update();
    emitState();
}

function startLoop() {
    if (loopHandle !== null) {
        return false;
    }

    if (!game.started) {
        game.started = true;
        game.startWave();
    }

    loopHandle = setInterval(tick, TICK_MS);
    return true;
}

function stopLoop() {
    if (loopHandle === null) {
        return false;
    }

    clearInterval(loopHandle);
    loopHandle = null;
    return true;
}

function normalizeKey(key) {
    return String(key ?? '').trim().toUpperCase();
}

function isHeroControllable() {
    if (!game.started) {
        return { ok: false, code: 400, message: 'Game has not started.' };
    }

    if (game.gameOver) {
        return { ok: false, code: 409, message: 'Game is over.' };
    }

    if (!game.hero.alive()) {
        return { ok: false, code: 409, message: 'Hero is dead.' };
    }

    return { ok: true };
}

function getHeroSkill(key) {
    const normalizedKey = normalizeKey(key);
    if (!normalizedKey) {
        return { key: normalizedKey, skill: null };
    }

    return {
        key: normalizedKey,
        skill: game.hero.skill.get(normalizedKey) ?? null,
    };
}

function canUseSkill(key, skill) {
    if (!skill) {
        return { ok: false, code: 404, message: `Skill slot ${key} not found.` };
    }

    if (skill.passive) {
        return { ok: false, code: 400, message: `Skill slot ${key} is passive and cannot be used.` };
    }

    if (game.hero.skillCastingDisabled) {
        return { ok: false, code: 409, message: 'Hero cannot cast skills right now.' };
    }

    if (!skill.cooledDown()) {
        return { ok: false, code: 409, message: `Skill slot ${key} is cooling down.` };
    }

    if (!skill.sufficientMP(game.hero.currentMP)) {
        return { ok: false, code: 409, message: `Not enough MP for skill slot ${key}.` };
    }

    return { ok: true };
}

function resolveUnitTarget(payload = {}, skill) {
    const targetId = payload.targetId ?? payload.target?.id ?? null;
    if (targetId) {
        const explicitTarget = game.enemies.get(targetId) ?? null;
        if (explicitTarget?.alive && explicitTarget.alive()) {
            return explicitTarget;
        }
    }

    return game.hero.findNearestEnemy(game.enemies, skill.range);
}

function isTargetInRange(targetPosition, skill) {
    if (!targetPosition || !skill) {
        return false;
    }

    return skill.inRange(game.hero.getDistance(targetPosition));
}

function castHeroSkill(skill, payload = {}) {
    const tickNow = game.clock.now();
    const source = clonePosition(game.hero.position);
    const category = skill.targetCategory;

    if (category === null) {
        skill.casted(game.hero, tickNow);
        return { ok: true };
    }

    if (category === 'Point') {
        const target = clonePosition(payload.position ?? payload.target);
        if (!target) {
            return { ok: false, code: 400, message: 'Point target is required.' };
        }

        if (!isTargetInRange(target, skill)) {
            return { ok: false, code: 409, message: 'Point target is out of range.' };
        }

        skill.casted(target, game.hero, source, tickNow);
        return { ok: true };
    }

    if (category === 'Vector') {
        const start = clonePosition(payload.start ?? payload.target?.start);
        const end = clonePosition(payload.end ?? payload.target?.end);
        if (!start || !end) {
            return { ok: false, code: 400, message: 'Vector target requires start and end.' };
        }

        if (!isTargetInRange(start, skill)) {
            return { ok: false, code: 409, message: 'Vector start target is out of range.' };
        }

        skill.casted({ start, end }, game.hero, source, tickNow);
        return { ok: true };
    }

    if (category === 'Unit') {
        const target = resolveUnitTarget(payload, skill);
        if (!target) {
            return { ok: false, code: 404, message: 'No valid enemy target found.' };
        }

        if (!isTargetInRange(target.position, skill)) {
            return { ok: false, code: 409, message: 'Unit target is out of range.' };
        }

        skill.casted(target, game.hero, source, tickNow);
        return { ok: true };
    }

    return { ok: false, code: 400, message: `Unsupported target category: ${category}` };
}

function armHeroSkill(key, skill) {
    setHeroTargetingState({
        status: 'targeting',
        skillKey: key,
        targetCategory: skill.targetCategory,
        range: Number(skill.range) || 0,
        sequence: heroTargetingState.sequence + 1,
    });
}

function handleGameCommand(command, requestId) {
    if (command === 'game:start') {
        if (loopHandle !== null) {
            emitResult(command, requestId, 200, 'Game is already running.');
            return;
        }

        startLoop();
        emitState();
        emitResult(command, requestId, 200, 'Game started.');
        return;
    }

    if (command === 'game:pause') {
        if (!stopLoop()) {
            emitResult(command, requestId, 200, 'Game is already paused.');
            return;
        }

        emitState();
        emitResult(command, requestId, 200, 'Game paused.');
        return;
    }

    if (command === 'game:resume') {
        if (loopHandle !== null) {
            emitResult(command, requestId, 200, 'Game is already running.');
            return;
        }

        startLoop();
        emitState();
        emitResult(command, requestId, 200, 'Game resumed.');
        return;
    }
}

function handleHeroMove(command, requestId, payload = {}) {
    const heroState = isHeroControllable();
    if (!heroState.ok) {
        emitResult(command, requestId, heroState.code, heroState.message);
        return;
    }

    const position = clonePosition(payload.position);
    if (!position) {
        emitResult(command, requestId, 400, 'Position is required.');
        return;
    }

    game.hero.interruptCast();
    game.hero.stop();
    clearHeroTargetingState();
    game.hero.clearWaypoints();
    game.hero.appendWaypoint(position);
    emitState();
    emitResult(command, requestId, 200, 'Hero move command accepted.');
}

function handleHeroStop(command, requestId) {
    if (!game.started) {
        emitResult(command, requestId, 400, 'Game has not started.');
        return;
    }

    game.hero.interruptCast();
    game.hero.stop();
    clearHeroTargetingState();
    emitState();
    emitResult(command, requestId, 200, 'Hero stopped.');
}

function handleHeroPress(command, requestId) {
    const heroState = isHeroControllable();
    if (!heroState.ok) {
        emitResult(command, requestId, heroState.code, heroState.message);
        return;
    }

    const key = normalizeKey(command.slice('hero:press:'.length));
    const { skill } = getHeroSkill(key);
    const skillState = canUseSkill(key, skill);
    if (!skillState.ok) {
        emitResult(command, requestId, skillState.code, skillState.message);
        return;
    }

    if (heroTargetingState.status === 'targeting' && heroTargetingState.skillKey === key) {
        clearHeroTargetingState();
        emitState();
        emitResult(command, requestId, 200, `Skill slot ${key} targeting cancelled.`);
        return;
    }

    if (skill.targetCategory === null) {
        const castResult = castHeroSkill(skill);
        if (!castResult.ok) {
            emitResult(command, requestId, castResult.code, castResult.message);
            return;
        }

        game.hero.consumeMP(skill.manaCost);
        clearHeroTargetingState();
        emitState();
        emitResult(command, requestId, 200, `Skill slot ${key} cast immediately.`, {
            phase: 'cast',
            skillKey: key,
            targetCategory: null,
        });
        return;
    }

    armHeroSkill(key, skill);
    emitState();
    emitResult(command, requestId, 200, `Skill slot ${key} targeting started.`, {
        phase: 'targeting',
        skillKey: key,
        targetCategory: skill.targetCategory,
        range: Number(skill.range) || 0,
    });
}

function handleHeroCast(command, requestId, payload = {}) {
    const heroState = isHeroControllable();
    if (!heroState.ok) {
        emitResult(command, requestId, heroState.code, heroState.message);
        return;
    }

    const key = normalizeKey(command.slice(command.toLowerCase().startsWith('hero:cast:') ? 'hero:cast:'.length : 'Hero:cast:'.length));
    const { skill } = getHeroSkill(key);
    const skillState = canUseSkill(key, skill);
    if (!skillState.ok) {
        emitResult(command, requestId, skillState.code, skillState.message);
        return;
    }

    if (skill.targetCategory !== null) {
        if (heroTargetingState.status !== 'targeting' || heroTargetingState.skillKey !== key) {
            armHeroSkill(key, skill);
            emitState();
            emitResult(command, requestId, 409, `Skill slot ${key} is not armed. Press it first to enter targeting mode.`, {
                phase: 'targeting',
                skillKey: key,
                targetCategory: skill.targetCategory,
                range: Number(skill.range) || 0,
            });
            return;
        }
    }

    const castResult = castHeroSkill(skill, payload);
    if (!castResult.ok) {
        emitResult(command, requestId, castResult.code, castResult.message);
        return;
    }

    game.hero.consumeMP(skill.manaCost);
    clearHeroTargetingState();
    emitState();
    emitResult(command, requestId, 200, `Skill slot ${key} cast accepted.`, {
        phase: 'cast',
        skillKey: key,
        targetCategory: skill.targetCategory,
    });
}

function handleShopCommand(command, requestId) {
    emitResult(command, requestId, 501, 'Shop command is not implemented yet.');
}

function handleLegacyCommand(type, requestId, payload) {
    if (type === 'tick') {
        tick();
        emitResult(type, requestId, 200, 'Tick completed.');
        return true;
    }

    if (type === 'snapshot') {
        emitState();
        emitResult(type, requestId, 200, 'Snapshot sent.');
        return true;
    }

    return false;
}

registerEventBridge();
emitState();

self.onmessage = (event) => {
    const { command, type, payload, requestId } = event.data ?? {};
    const normalizedCommand = typeof command === 'string' ? command : (typeof type === 'string' ? type : '');
    const loweredCommand = normalizedCommand.toLowerCase();

    if (!normalizedCommand) {
        emitResult('unknown', requestId, 400, 'Command is required.');
        return;
    }

    if (handleLegacyCommand(normalizedCommand, requestId, payload)) {
        return;
    }

    if (
        normalizedCommand === 'game:start' ||
        normalizedCommand === 'game:pause' ||
        normalizedCommand === 'game:resume'
    ) {
        handleGameCommand(normalizedCommand, requestId);
        return;
    }

    if (normalizedCommand === 'hero:move') {
        handleHeroMove(normalizedCommand, requestId, payload);
        return;
    }

    if (normalizedCommand === 'hero:stop') {
        handleHeroStop(normalizedCommand, requestId);
        return;
    }

    if (loweredCommand.startsWith('hero:press:')) {
        handleHeroPress(normalizedCommand, requestId);
        return;
    }

    if (loweredCommand.startsWith('hero:cast:')) {
        handleHeroCast(normalizedCommand, requestId, payload);
        return;
    }

    if (
        loweredCommand.startsWith('shop:learn') ||
        loweredCommand.startsWith('shop:upgrade') ||
        loweredCommand === 'shop:repair'
    ) {
        handleShopCommand(normalizedCommand, requestId);
        return;
    }

    emitResult(normalizedCommand, requestId, 400, `Unknown worker command: ${normalizedCommand}`);
};
