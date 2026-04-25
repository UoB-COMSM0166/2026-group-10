export default class Input {
    static WORLD_Y_SCALE = 0.7;

    constructor({ getState, getVectorTargetStart, setVectorTargetStart, postCommand, toggleBook, isBookOpen, handleSkillClick }) {
        this.getState = getState;
        this.getVectorTargetStart = getVectorTargetStart;
        this.setVectorTargetStart = setVectorTargetStart;
        this.postCommand = postCommand;
        this.toggleBook = toggleBook;
        this.isBookOpen = isBookOpen;
        this.handleSkillClick = handleSkillClick;
    }

    bind(sketch) {
        sketch.mousePressed = () => {
            this.handleMousePressed(sketch);
        };

        sketch.mouseReleased = () => {
            this.handleMouseReleased(sketch);
        };

        sketch.keyPressed = () => {
            this.handleKeyPressed(sketch);
        };
    }

    handleMousePressed(sketch) {
        if (this.isBookOpen?.()) {
            if (sketch.mouseButton.left && typeof this.handleSkillClick === 'function') {
                this.handleSkillClick({
                    state: this.getState(),
                    mouse: { x: sketch.mouseX, y: sketch.mouseY },
                });
            }
            return;
        }

        if (sketch.mouseButton.right && !sketch.mouseButton.left) {
            this.setVectorTargetStart(null);
            this.postCommand('hero:move', {
                position: this.getMouseWorldPosition(sketch),
            });
            return;
        }

        const state = this.getState();
        if (!state?.hero?.targeting || state.hero.targeting.status !== 'targeting') {
            return;
        }

        const targeting = state.hero.targeting;
        const command = `hero:cast:${targeting.skillKey}`;

        if (targeting.targetCategory === 'Vector') {
            this.setVectorTargetStart(this.getMouseWorldPosition(sketch));
            return;
        }

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
        }
    }

    handleMouseReleased(sketch) {
        if (this.isBookOpen?.()) {
            this.setVectorTargetStart(null);
            return;
        }

        if (sketch.mouseButton !== sketch.LEFT) {
            return;
        }

        const vectorTargetStart = this.getVectorTargetStart();
        if (!vectorTargetStart) {
            return;
        }

        const targeting = this.getState()?.hero?.targeting;
        if (!targeting || targeting.status !== 'targeting' || targeting.targetCategory !== 'Vector') {
            this.setVectorTargetStart(null);
            return;
        }

        this.postCommand(`hero:cast:${targeting.skillKey}`, {
            start: { ...vectorTargetStart },
            end: this.getMouseWorldPosition(sketch),
        });
        this.setVectorTargetStart(null);
    }

    handleKeyPressed(sketch) {
        if (String(sketch.key ?? '').toUpperCase() === 'B') {
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
}
