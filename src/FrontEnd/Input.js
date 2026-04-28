export default class Input {
    static WORLD_Y_SCALE = 0.7;

    constructor({ getState, getVectorTargetStart, setVectorTargetStart, postCommand, toggleBook, isBookOpen, handleSkillClick, setCheatInputState }) {
        this.getState = getState;
        this.getVectorTargetStart = getVectorTargetStart;
        this.setVectorTargetStart = setVectorTargetStart;
        this.postCommand = postCommand;
        this.toggleBook = toggleBook;
        this.isBookOpen = isBookOpen;
        this.handleSkillClick = handleSkillClick;
        this.setCheatInputState = setCheatInputState;
        this.vectorTargetingActive = false;
        this.cheatInputActive = false;
        this.cheatInputContent = '';
    }

    bind(sketch) {
        sketch.keyTyped = () => {
            this.handleKeyTyped(sketch);
        };
    }

    handleMousePressed(sketch) {
        if (this.cheatInputActive) {
            return;
        }

        if (this.isBookOpen?.()) {
            if (sketch.mouseButton.left && typeof this.handleSkillClick === 'function') {
                this.handleSkillClick({
                    state: this.getState(),
                    mouse: { x: sketch.mouseX, y: sketch.mouseY },
                });
            }
            return;
        }

        const state = this.getState();
        const targeting = state?.hero?.targeting;
        if (targeting?.status === 'targeting' && targeting.targetCategory === 'Vector') {
            if (sketch.mouseButton.left && !sketch.mouseButton.right) {
                this.setVectorTargetStart(this.getMouseWorldPosition(sketch));
                this.vectorTargetingActive = true;
            }
            return;
        }

        if (sketch.mouseButton.right && !sketch.mouseButton.left) {
            this.setVectorTargetStart(null);
            this.vectorTargetingActive = false;
            this.postCommand('hero:move', {
                position: this.getMouseWorldPosition(sketch),
            });
            return;
        }

        if (!targeting || targeting.status !== 'targeting') {
            if (sketch.mouseButton.left && !sketch.mouseButton.right) {
                this.setVectorTargetStart(null);
                this.vectorTargetingActive = false;
                this.postCommand('hero:move', {
                    position: this.getMouseWorldPosition(sketch),
                });
            }
            return;
        }

        const command = `hero:cast:${targeting.skillKey}`;

        if (targeting.targetCategory === 'Point') {
            this.postCommand(command, {
                position: this.getMouseWorldPosition(sketch),
            });
            return;
        }

        if (targeting.targetCategory === 'Unit') {
            const nearestEnemy = this.findNearestEnemy(state.enemies, this.getMouseWorldPosition(sketch));
            this.postCommand(command, {
                targetId: nearestEnemy?.id ?? null,
            });
            return;
        }

        if (targeting.targetCategory === 'Tower') {
            const nearestTower = this.findNearestTower(state.skillEntities, this.getMouseWorldPosition(sketch));
            this.postCommand(command, {
                targetId: nearestTower?.id ?? null,
            });
        }
    }

    handleMouseReleased(sketch) {
        if (this.cheatInputActive) {
            return;
        }

        if (this.isBookOpen?.()) {
            this.setVectorTargetStart(null);
            this.vectorTargetingActive = false;
            return;
        }

        if (!this.vectorTargetingActive) {
            return;
        }

        const vectorTargetStart = this.getVectorTargetStart();
        if (!vectorTargetStart) {
            this.vectorTargetingActive = false;
            return;
        }

        const targeting = this.getState()?.hero?.targeting;
        if (!targeting || targeting.status !== 'targeting' || targeting.targetCategory !== 'Vector') {
            this.setVectorTargetStart(null);
            this.vectorTargetingActive = false;
            return;
        }

        this.postCommand(`hero:cast:${targeting.skillKey}`, {
            start: { ...vectorTargetStart },
            end: this.getMouseWorldPosition(sketch),
        });
        this.setVectorTargetStart(null);
        this.vectorTargetingActive = false;
    }

    handleKeyPressed(sketch) {
        if (sketch.keyCode === 13) {
            if (this.cheatInputActive) {
                this.submitCheatInput();
            } else {
                this.openCheatInput();
                if (!this.getState()?.flags?.paused) {
                    this.postCommand('game:pause');
                }
            }
            return;
        }

        if (this.cheatInputActive) {
            if (sketch.keyCode === 8) {
                this.cheatInputContent = this.cheatInputContent.slice(0, -1);
                this.syncCheatInputState();
                return;
            }

            if (sketch.keyCode === 27) {
                this.closeCheatInput();
            }
            return;
        }

        if (String(sketch.key ?? '').toUpperCase() === 'B') {
            const hero = this.getState()?.hero;
            if (hero?.id === 'Architect' || hero?.name === 'Architect') {
                return;
            }

            if (typeof this.toggleBook === 'function') {
                this.toggleBook();
            }
            return;
        }

        if (this.isBookOpen?.()) {
            return;
        }

        const skillKey = this.getSkillKeyFromKeyboard(sketch.key);
        if (skillKey) {
            this.postCommand(`hero:press:${skillKey}`);
            return;
        }

        if (String(sketch.key ?? '').toUpperCase() === 'S') {
            this.setVectorTargetStart(null);
            this.vectorTargetingActive = false;
            this.postCommand('hero:stop');
            return;
        }

        if (sketch.key === ' ') {
            if (this.getState()?.flags?.paused) {
                this.postCommand('game:resume');
            } else {
                this.postCommand('game:pause');
            }
        }
    }

    handleKeyTyped(sketch) {
        if (!this.cheatInputActive) {
            return;
        }

        const key = String(sketch.key ?? '');
        if (key.length !== 1 || key === '\r' || key === '\n') {
            return;
        }

        this.cheatInputContent += key;
        this.syncCheatInputState();
    }

    openCheatInput() {
        this.setVectorTargetStart(null);
        this.vectorTargetingActive = false;
        this.cheatInputActive = true;
        this.cheatInputContent = '';
        this.syncCheatInputState();
    }

    closeCheatInput() {
        this.cheatInputActive = false;
        this.cheatInputContent = '';
        this.syncCheatInputState();
    }

    submitCheatInput() {
        const content = this.cheatInputContent;
        this.closeCheatInput();
        if (!content) {
            return;
        }

        const normalizedContent = String(content).trim().replace(/^cheat:/i, '');
        if (!normalizedContent) {
            return;
        }

        this.postCommand(`cheat:${normalizedContent}`);
    }

    syncCheatInputState() {
        if (typeof this.setCheatInputState !== 'function') {
            return;
        }

        this.setCheatInputState({
            active: this.cheatInputActive,
            content: this.cheatInputContent,
        });
    }

    getMouseWorldPosition(sketch) {
        return {
            x: sketch.mouseX,
            y: sketch.mouseY / Input.WORLD_Y_SCALE,
        };
    }

    getSkillKeyFromKeyboard(key) {
        const normalized = String(key ?? '').toUpperCase();
        const allowed = new Set(['A', 'Q', 'W', 'E', 'R']);
        return allowed.has(normalized) ? normalized : null;
    }

    findNearestEnemy(enemies = [], position) {
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

    findNearestTower(entities = [], position) {
        if (!position) {
            return null;
        }

        let nearestTower = null;
        let nearestDistance = Number.POSITIVE_INFINITY;

        for (const entity of entities) {
            if (entity?.category !== 'Tower' || !entity?.position || entity.finished) {
                continue;
            }

            const dx = entity.position.x - position.x;
            const dy = entity.position.y - position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance >= nearestDistance) {
                continue;
            }

            nearestTower = entity;
            nearestDistance = distance;
        }

        return nearestTower;
    }
}
