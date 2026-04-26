import GameManager from './GameManager.js';

const TICK_RATE = 60;
const TICK_MS = 1000 / TICK_RATE;

let game = null;
let loopHandle = null;
let heroTargetingState = createHeroTargetingState();
let lastGameConfig = null;

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

function buildCastState(unit) {
    const castState = unit?.castState;
    if (!castState) {
        return null;
    }

    const skill = castState.skill ?? null;
    const phase = castState.phase ?? null;
    const remaining = Math.max(0, Number(castState.remaining) || 0);
    const skillEntityData = typeof skill?.getCastSkillEntityData === 'function'
        ? skill.getCastSkillEntityData(castState) ?? null
        : null;
    const duration = phase === 'backswing'
        ? Math.max(0, Number(skill?.backswingDuration) || Number(skill?.backswingRemaining) || remaining)
        : Math.max(0, Number(skill?.castDuration) || remaining);

    return {
        phase,
        remaining,
        duration,
        casting: phase === 'casting',
        skillName: skill?.name ?? null,
        skillEntityData,
    };
}

function buildUnitState(unit) {
    if (!unit) {
        return null;
    }

    return {
        id: unit.id,
        name: unit.name ?? unit.id,
        category: unit.category ?? null,
        position: clonePosition(unit.position),
        velocity: unit.velocity ? {
            vx: Number(unit.velocity.vx) || 0,
            vy: Number(unit.velocity.vy) || 0,
        } : null,
        angle: Number(unit.angle) || 0,
        hp: Number(unit.currentHP) || 0,
        maxHP: Number(unit.maxHP) || 0,
        mp: Number(unit.currentMP) || 0,
        maxMP: Number(unit.maxMP) || 0,
        hpRegen: Number(unit.hpRegen) || 0,
        mpRegen: Number(unit.mpRegen) || 0,
        speed: typeof unit.getStat === 'function' ? unit.getStat('Speed') : Number(unit.speed) || 0,
        baseSpeed: typeof unit.getBaseStat === 'function' ? unit.getBaseStat('Speed') : Number(unit.baseSpeed) || 0,
        armor: typeof unit.getStat === 'function' ? unit.getStat('Armor') : Number(unit.armor) || 0,
        strength: Number(unit.strength) || 0,
        intelligence: Number(unit.intelligence) || 0,
        hitbox: Number(unit.hitbox) || 0,
        isBoss: unit?.skills instanceof Map && typeof unit.castSkill === 'function',
        inFountain: false,
        alive: typeof unit.alive === 'function' ? unit.alive() : true,
        finished: Boolean(unit.finished),
        castState: buildCastState(unit),
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
        const unlocked = typeof hero.isSkillSlotUnlocked === 'function'
            ? hero.isSkillSlotUnlocked(slot)
            : true;
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
            upgradeCost: Number(skill.upgradeCost) || 0,
            unlocked,
        } : null;
    }

    return skills;
}

function buildHeroSkillTreeState(hero) {
    const skillTree = {};
    if (!(hero?.skillTree instanceof Map)) {
        return skillTree;
    }

    for (const [slot, skills] of hero.skillTree.entries()) {
        const unlocked = typeof hero.isSkillSlotUnlocked === 'function'
            ? hero.isSkillSlotUnlocked(slot)
            : true;
        skillTree[slot] = Array.isArray(skills)
            ? skills.map((skill) => skill ? {
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
                upgradeCost: Number(skill.upgradeCost) || 0,
                unlocked,
            } : null)
            : [];
    }

    return skillTree;
}

function buildMapState(map) {
    if (!(map instanceof Map)) {
        return {};
    }

    return Object.fromEntries(map.entries());
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
        angle: Number(entity.angle) || 0,
        hitbox: Number(entity.hitbox) || 0,
        finished: Boolean(entity.finished),
        duration: Number(entity.duration) || 0,
    };
}

function buildStateSnapshot() {
    if (!game) {
        return null;
    }

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
            inFountain: typeof game.hero.inFountain === 'function'
                ? Boolean(game.hero.inFountain(game.objective.position))
                : false,
            remainingRespawnCD: Number(game.hero.remainingRespawnCD) || 0,
            respawnCD: Number(game.hero.respawnCD) || 0,
            gold: Number(game.hero.gold) || 0,
            stats: buildMapState(game.hero.stats),
            statsGrowth: buildMapState(game.hero.statsGrowth),
            upgradeCost: buildMapState(game.hero.upgradeCost),
            spellSlotLevel: Number(game.hero.spellSlotLevel) || 0,
            spellSlotUpgradeCost: Number(game.hero.spellSlotUpgradeCost) || 0,
            skillSlotUnlocked: buildMapState(game.hero.skillSlotUnlocked),
            nextSkillSlotToUnlock: game.hero.nextSkillSlotToUnlock ?? null,
            selectedSkill: heroTargetingState.skillKey,
            targeting: { ...heroTargetingState },
            casting: game.hero.isCasting(),
            skills: buildHeroSkillState(game.hero),
            skillTree: buildHeroSkillTreeState(game.hero),
        },
        objective: buildUnitState(game.objective),
        boss: buildUnitState(game.boss),
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
        case 'game:start':
            return {};
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
        case 'hero:attack:hit':
            return {
                heroId: payload.hero?.id ?? null,
                skillName: payload.skill?.name ?? null,
                targetIds: Array.isArray(payload.targets)
                    ? payload.targets.map((target) => target?.id ?? null).filter(Boolean)
                    : [],
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
        case 'skill_entity:created':
        case 'enemy_skill_entity:created':
        case 'allied_decoy:created':
            return {
                entity: buildEntityState(payload.entity),
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
    if (!game?.events) {
        return;
    }

    const forwardedEvents = [
        'game:start',
        'wave:start',
        'wave:end',
        'game:win',
        'objective:destroyed',
        'hero:death',
        'hero:respawn',
        'hero:attack:hit',
        'enemy:spawned',
        'enemy:killed',
        'enemy:reached_objective',
        'skill_entity:created',
        'enemy_skill_entity:created',
        'allied_decoy:created',
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
    if (!game) {
        return;
    }

    game.clock.tickCount += 1;
    game.update();
    emitState();
}

function createGame(payload = {}) {
    const hero = String(payload.hero ?? '').trim();
    const category = payload.category ?? null;
    const world = String(payload.world ?? '').trim();

    if (!hero) {
        return { ok: false, code: 400, message: 'Hero is required.' };
    }

    if (!world) {
        return { ok: false, code: 400, message: 'World is required.' };
    }

    stopLoop();
    clearHeroTargetingState();

    try {
        game = new GameManager(hero, category, world);
        lastGameConfig = { hero, category, world };
        registerEventBridge();
        emitState();
        return {
            ok: true,
            code: 200,
            message: 'Game created.',
            data: { hero, category, world },
        };
    } catch (error) {
        game = null;
        return {
            ok: false,
            code: 400,
            message: error instanceof Error ? error.message : 'Failed to create game.',
        };
    }
}

function destroyGame() {
    stopLoop();
    clearHeroTargetingState();
    game = null;
    emitState();

    return {
        ok: true,
        code: 200,
        message: 'Game destroyed.',
    };
}

function requireGame(command, requestId) {
    if (game) {
        return true;
    }

    emitResult(command, requestId, 409, 'Game has not been created. Send create:game first.');
    return false;
}

function startLoop() {
    if (!game) {
        return false;
    }

    if (loopHandle !== null) {
        return false;
    }

    if (!game.started) {
        game.started = true;
        game.events.emit('game:start', {});
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
    if (!game) {
        return { ok: false, code: 409, message: 'Game has not been created.' };
    }

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

function isHeroInFountain() {
    if (!game) {
        return false;
    }

    return typeof game.hero.inFountain === 'function'
        && game.hero.inFountain(game.objective.position);
}

function getHeroSkill(key) {
    if (!game) {
        return { key: normalizeKey(key), skill: null };
    }

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
    if (typeof game.hero.isSkillSlotUnlocked === 'function' && !game.hero.isSkillSlotUnlocked(key)) {
        return { ok: false, code: 409, message: `Skill slot ${key} is locked.` };
    }

    if (!skill) {
        return { ok: false, code: 404, message: `Skill slot ${key} not found.` };
    }

    if (skill.passive) {
        return { ok: false, code: 400, message: `Skill slot ${key} is passive and cannot be used.` };
    }

    if (game.hero.isCasting()) {
        return { ok: false, code: 409, message: 'Hero cannot use skills while casting.' };
    }

    if (game.hero.skillCastingDisabled) {
        return { ok: false, code: 409, message: 'Hero cannot cast skills right now.' };
    }

    if (key === 'A' && game.hero.sheatheSwordActive) {
        return { ok: false, code: 409, message: 'Skill slot A is unavailable while Sheathe Sword is active.' };
    }

    if (!skill.toggleable && !skill.cooledDown()) {
        return { ok: false, code: 409, message: `Skill slot ${key} is cooling down.` };
    }

    if (!skill.sufficientMP(game.hero.currentMP)) {
        return { ok: false, code: 409, message: `Not enough MP for skill slot ${key}.` };
    }

    return { ok: true };
}

function resolveUnitTarget(payload = {}, skill) {
    if (!game) {
        return null;
    }

    const targetId = payload.targetId ?? payload.target?.id ?? null;
    if (targetId) {
        const explicitTarget = game.enemies.get(targetId) ?? null;
        if (explicitTarget?.alive && explicitTarget.alive()) {
            return explicitTarget;
        }
    }

    return game.hero.findNearestEnemy(game.enemies, skill.range);
}

function resolveTowerTarget(payload = {}) {
    if (!game) {
        return null;
    }

    const targetId = payload.targetId ?? payload.target?.id ?? null;
    if (targetId) {
        const explicitTarget = game.skillEntities.get(targetId) ?? null;
        if (explicitTarget?.category === 'Tower' && !explicitTarget.finished) {
            return explicitTarget;
        }
    }

    const targetPosition = clonePosition(payload.position ?? payload.target);
    if (!targetPosition) {
        return null;
    }

    let nearestTower = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const entity of game.skillEntities.values()) {
        if (entity?.category !== 'Tower' || entity.finished || !entity.position) {
            continue;
        }

        const dx = entity.position.x - targetPosition.x;
        const dy = entity.position.y - targetPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= nearestDistance) {
            continue;
        }

        nearestTower = entity;
        nearestDistance = distance;
    }

    return nearestTower;
}

function isTargetInRange(targetPosition, skill) {
    if (!game) {
        return false;
    }

    if (!targetPosition || !skill) {
        return false;
    }

    return skill.inRange(game.hero.getDistance(targetPosition));
}

function castHeroSkill(skill, payload = {}) {
    if (!game) {
        return { ok: false, code: 409, message: 'Game has not been created.' };
    }

    const tickNow = game.clock.now();
    const source = clonePosition(game.hero.position);
    const category = skill.targetCategory;
    const normalizeSkillCastResult = (result) => {
        if (result && typeof result === 'object' && Object.prototype.hasOwnProperty.call(result, 'ok')) {
            return result;
        }

        if (result === false) {
            return { ok: false, code: 409, message: 'Skill cast failed.' };
        }

        return { ok: true };
    };

    if (category === null) {
        return normalizeSkillCastResult(skill.casted(game.hero, tickNow));
    }

    if (category === 'Point') {
        const target = clonePosition(payload.position ?? payload.target);
        if (!target) {
            return { ok: false, code: 400, message: 'Point target is required.' };
        }

        if (!isTargetInRange(target, skill)) {
            return { ok: false, code: 409, message: 'Point target is out of range.' };
        }

        return normalizeSkillCastResult(skill.casted(target, game.hero, source, tickNow));
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

        return normalizeSkillCastResult(skill.casted({ start, end }, game.hero, source, tickNow));
    }

    if (category === 'Unit') {
        const target = resolveUnitTarget(payload, skill);
        if (!target) {
            return { ok: false, code: 404, message: 'No valid enemy target found.' };
        }

        if (!isTargetInRange(target.position, skill)) {
            return { ok: false, code: 409, message: 'Unit target is out of range.' };
        }

        return normalizeSkillCastResult(skill.casted(target, game.hero, source, tickNow));
    }

    if (category === 'Tower') {
        const target = resolveTowerTarget(payload);
        if (!target) {
            return { ok: false, code: 404, message: 'No valid tower target found.' };
        }

        if (!isTargetInRange(target.position, skill)) {
            return { ok: false, code: 409, message: 'Tower target is out of range.' };
        }

        return normalizeSkillCastResult(skill.casted(target, game.hero, source, tickNow));
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
    if (!requireGame(command, requestId)) {
        return;
    }

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
    }
}

function handleHeroMove(command, requestId, payload = {}) {
    if (!requireGame(command, requestId)) {
        return;
    }

    const heroState = isHeroControllable();
    if (!heroState.ok) {
        emitResult(command, requestId, heroState.code, heroState.message);
        return;
    }

    if (game.hero.isCasting()) {
        emitResult(command, requestId, 409, 'Hero cannot move while casting.');
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
    if (!requireGame(command, requestId)) {
        return;
    }

    if (!game.started) {
        emitResult(command, requestId, 400, 'Game has not started.');
        return;
    }

    if (game.hero.isCasting()) {
        emitResult(command, requestId, 409, 'Hero cannot stop while casting.');
        return;
    }

    game.hero.interruptCast();
    game.hero.stop();
    clearHeroTargetingState();
    emitState();
    emitResult(command, requestId, 200, 'Hero stopped.');
}

function handleHeroPress(command, requestId) {
    if (!requireGame(command, requestId)) {
        return;
    }

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

    if (skill.toggleable) {
        const active = skill.toggle(game.hero, game.clock.now());
        if (active) {
            skill.casted();
        } else {
            skill.currentCooldown = 0;
        }

        clearHeroTargetingState();
        emitState();
        emitResult(command, requestId, 200, `Skill slot ${key} ${active ? 'activated' : 'deactivated'}.`, {
            phase: 'cast',
            skillKey: key,
            targetCategory: null,
            active,
        });
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
    if (!requireGame(command, requestId)) {
        return;
    }

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

function handleHeroUpgradeSkill(command, requestId, payload = {}) {
    if (!requireGame(command, requestId)) {
        return;
    }

    if (!game.started) {
        emitResult(command, requestId, 400, 'Game has not started.');
        return;
    }

    if (!isHeroInFountain()) {
        emitResult(command, requestId, 409, 'Hero upgrades can only be used in the fountain.');
        return;
    }

    const key = normalizeKey(payload.slot ?? payload.key);
    if (!key) {
        emitResult(command, requestId, 400, 'Skill slot is required.');
        return;
    }

    if (typeof game.hero.isSkillSlotUnlocked === 'function' && !game.hero.isSkillSlotUnlocked(key)) {
        emitResult(command, requestId, 409, `Skill slot ${key} is locked.`);
        return;
    }

    const equippedSkill = game.hero.skill.get(key) ?? null;
    const targetName = String(payload.name ?? equippedSkill?.name ?? '').trim();
    if (!targetName) {
        emitResult(command, requestId, 404, `No upgrade target found for slot ${key}.`);
        return;
    }

    if (typeof game.hero.upgradeSkill !== 'function') {
        emitResult(command, requestId, 501, 'Hero upgrade command is not supported.');
        return;
    }

    const upgradedSkill = game.hero.upgradeSkill(key, targetName);
    if (!upgradedSkill) {
        emitResult(command, requestId, 404, `Unable to upgrade ${targetName} in slot ${key}.`);
        return;
    }

    emitState();
    emitResult(command, requestId, 200, `${upgradedSkill.name} upgraded.`, {
        slot: key,
        name: upgradedSkill.name,
        upgraded: true,
    });
}

function handleHeroUpgrade(command, requestId, payload = {}) {
    if (!requireGame(command, requestId)) {
        return;
    }

    if (!game.started) {
        emitResult(command, requestId, 400, 'Game has not started.');
        return;
    }

    if (!isHeroInFountain()) {
        emitResult(command, requestId, 409, 'Hero upgrades can only be used in the fountain.');
        return;
    }

    const category = String(payload.category ?? payload.type ?? '').trim();
    if (!category) {
        emitResult(command, requestId, 400, 'Upgrade category is required.');
        return;
    }

    if (typeof game.hero.upgrade !== 'function') {
        emitResult(command, requestId, 501, 'Hero upgrade command is not supported.');
        return;
    }

    const result = game.hero.upgrade(category);
    emitState();
    emitResult(
        command,
        requestId,
        result?.success ? 200 : 400,
        result?.message ?? 'Hero upgrade failed.',
        {
            category,
            success: Boolean(result?.success),
        }
    );
}

function handleHeroSkillChange(command, requestId, payload = {}) {
    if (!requireGame(command, requestId)) {
        return;
    }

    if (!game.started) {
        emitResult(command, requestId, 400, 'Game has not started.');
        return;
    }

    if (!isHeroInFountain()) {
        emitResult(command, requestId, 409, 'Skills can only be changed in the fountain.');
        return;
    }

    const slot = normalizeKey(payload.slot ?? payload.key);
    const name = String(payload.name ?? '').trim();
    if (!slot || !name) {
        emitResult(command, requestId, 400, 'Skill slot and name are required.');
        return;
    }

    if (typeof game.hero.isSkillSlotUnlocked === 'function' && !game.hero.isSkillSlotUnlocked(slot)) {
        emitResult(command, requestId, 409, `Skill slot ${slot} is locked.`);
        return;
    }

    if (typeof game.hero.changeSkill !== 'function') {
        emitResult(command, requestId, 501, 'Hero skill change command is not supported.');
        return;
    }

    const nextSkill = game.hero.skillTree?.get(slot)?.find((skill) => skill?.name === name) ?? null;
    if (!nextSkill) {
        emitResult(command, requestId, 404, `Unable to equip ${name} in slot ${slot}.`);
        return;
    }

    const changedSkill = game.hero.changeSkill(slot, nextSkill);
    if (!changedSkill || changedSkill.name !== name) {
        emitResult(command, requestId, 404, `Unable to equip ${name} in slot ${slot}.`);
        return;
    }

    clearHeroTargetingState();
    emitState();
    emitResult(command, requestId, 200, `${changedSkill.name} equipped to slot ${slot}.`, {
        slot,
        name: changedSkill.name,
    });
}

function handleShopCommand(command, requestId) {
    emitResult(command, requestId, 501, 'Shop command is not implemented yet.');
}

function clearEnemiesWithoutEvents() {
    if (!game) {
        return 0;
    }

    const enemyIds = [...game.enemies.keys()];
    for (const id of enemyIds) {
        game.units.delete(id);
    }

    game.enemies.clear();
    game.boss = null;
    return enemyIds.length;
}

function parseCheatMoneyAmount(command, payload = {}) {
    const payloadAmount = Number(payload.amount);
    if (Number.isFinite(payloadAmount)) {
        return payloadAmount;
    }

    const match = String(command).match(/^cheat:money\(([-+]?\d+(?:\.\d+)?)\)$/i);
    if (!match) {
        return null;
    }

    const parsedAmount = Number(match[1]);
    return Number.isFinite(parsedAmount) ? parsedAmount : null;
}

function resetCurrentGame() {
    if (!lastGameConfig) {
        return {
            ok: false,
            code: 409,
            message: 'No game configuration available to reset.',
        };
    }

    const wasRunning = loopHandle !== null;
    stopLoop();
    clearHeroTargetingState();

    try {
        game = new GameManager(lastGameConfig.hero, lastGameConfig.category, lastGameConfig.world);
        registerEventBridge();
        if (wasRunning) {
            startLoop();
        }
        emitState();
        return {
            ok: true,
            code: 200,
            message: 'Current game reset.',
            data: { ...lastGameConfig, running: wasRunning },
        };
    } catch (error) {
        game = null;
        emitState();
        return {
            ok: false,
            code: 400,
            message: error instanceof Error ? error.message : 'Failed to reset current game.',
        };
    }
}

function handleCheatCommand(command, requestId, payload = {}) {
    if (!requireGame(command, requestId)) {
        return;
    }

    const loweredCommand = String(command).toLowerCase();

    if (loweredCommand === 'cheat:suicide') {
        game.hero.currentHP = 0;
        game.hero.die();
        emitState();
        emitResult(command, requestId, 200, 'Hero has been killed.');
        return;
    }

    if (loweredCommand.startsWith('cheat:money')) {
        const amount = parseCheatMoneyAmount(command, payload);
        if (!Number.isFinite(amount)) {
            emitResult(command, requestId, 400, 'Cheat money command requires a numeric amount.');
            return;
        }

        game.hero.collectCoin(amount);
        emitState();
        emitResult(command, requestId, 200, `Granted ${amount} gold.`, { amount });
        return;
    }

    if (loweredCommand === 'cheat:clear') {
        if (!game.currentWave) {
            emitResult(command, requestId, 409, 'No active wave to clear.');
            return;
        }

        for (const lane of game.currentWave.lanes) {
            lane.counter = 0;
            lane.timer = lane.cd;
        }

        const removedEnemies = clearEnemiesWithoutEvents();
        game.beforeWave = 0;
        game.finishWave();
        emitState();
        emitResult(command, requestId, 200, 'Current wave cleared.', { removedEnemies });
        return;
    }

    if (loweredCommand === 'cheat:surrender') {
        game.objective.currentHP = 0;
        game.events.emit('objective:destroyed', {});
        emitState();
        emitResult(command, requestId, 200, 'Objective destroyed. Game over.');
        return;
    }

    if (loweredCommand === 'cheat:nuclear') {
        const removedEnemies = clearEnemiesWithoutEvents();
        emitState();
        emitResult(command, requestId, 200, 'All current enemies removed without death events.', { removedEnemies });
        return;
    }

    if (loweredCommand === 'cheat:win') {
        game.events.emit('game:win', {});
        emitState();
        emitResult(command, requestId, 200, 'Game declared won.');
        return;
    }

    if (loweredCommand === 'cheat:reset') {
        const result = resetCurrentGame();
        emitResult(command, requestId, result.code, result.message, result.data ?? null);
        return;
    }

    emitResult(command, requestId, 400, `Unknown cheat command: ${command}`);
}

function handleLegacyCommand(type, requestId) {
    if (type === 'tick') {
        if (!requireGame(type, requestId)) {
            return true;
        }
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

    if (normalizedCommand === 'create:game') {
        const result = createGame(payload);
        emitResult(
            normalizedCommand,
            requestId,
            result.code,
            result.message,
            result.data ?? null
        );
        return;
    }

    if (normalizedCommand === 'destroy:game') {
        const result = destroyGame();
        emitResult(
            normalizedCommand,
            requestId,
            result.code,
            result.message,
            result.data ?? null
        );
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

    if (normalizedCommand === 'hero:upgrade') {
        handleHeroUpgrade(normalizedCommand, requestId, payload);
        return;
    }

    if (normalizedCommand === 'hero:upgrade:skill') {
        handleHeroUpgradeSkill(normalizedCommand, requestId, payload);
        return;
    }

    if (normalizedCommand === 'hero:skill:change') {
        handleHeroSkillChange(normalizedCommand, requestId, payload);
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

    if (loweredCommand.startsWith('cheat:')) {
        handleCheatCommand(normalizedCommand, requestId, payload);
        return;
    }

    emitResult(normalizedCommand, requestId, 400, `Unknown worker command: ${normalizedCommand}`);
};

emitState();
