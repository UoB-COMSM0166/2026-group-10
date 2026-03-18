export default class Controller {
    static Y_SCALE = 1;
    static SKILL_KEYS = ['A', 'Q', 'W', 'E', 'R'];

    constructor(p5, events, ui, enemies, hero, objective, size, clock) {
        this.p5 = p5;   
        this.events = events;
        this.ui = ui;
        this.enemies = enemies;
        this.hero = hero;
        this.objective = objective;
        this.size = size;
        this.pendingSkill = null;
        this.virtualSkillEntityRange = null;
        this.clock = clock;
        p5.mousePressed = () => this.handleMousePressed();
        p5.keyPressed = () => this.handleKeyPressed();
    }

    getPointerPosition() {
        if (this.p5.mouseX)
        return {
            x: this.p5.mouseX,
            y: this.p5.mouseY / Controller.Y_SCALE,
        };
    }

    findTargetEnemy(position) {
        const enemies = this.enemies instanceof Map ? this.enemies.values() : this.enemies;
        for (const enemy of enemies) {
            const distance = enemy.getDistance(position);
            if (distance <= enemy.hitbox) {
                return enemy;
            }
        }
        return null;
    }

    handleMousePressed() {
        const position = this.getPointerPosition();
        // console.log("Mouse pressed at", position, "Button:", this.p5.mouseButton);
        if (this.p5.mouseButton.left && !this.p5.mouseButton.right) {
            this.handleLeftClick(position);
        } else if (this.p5.mouseButton.right && !this.p5.mouseButton.left) {
            this.handleRightClick(position);
            return false;
        }
    }

    handleKeyPressed() {
        if (!this.p5) {
            return;
        }

        this.handleButtonPress(this.p5.key);
    }

    handleLeftClick(position) {
        if (this.pendingSkill) {
            this.handlePendingSkillLeftClick(position);
            return;
        }

        // console.log("Handling left click at", position);
        const targetEnemy = this.findTargetEnemy(position);
        if (targetEnemy) {
            this.ui.emit('show:enemy:info', { enemy: targetEnemy });
            console.log(`Clicked on enemy ${targetEnemy.id}`);
        } else if (this.objective.checkInside(position)) {
            this.ui.emit('show:objective:info', {});
            console.log(`Clicked on objective ${this.objective.id}`);
        }
    }

    handleRightClick(position) {
        this.cancelPendingSkill();
        this.clearVirtualSkillPointer();
        const targetEnemy = this.findTargetEnemy(position);
        if (targetEnemy) {
            // this.events.emit('hero:events:attack', { enemy: targetEnemy });
            this.hero.setTarget(targetEnemy);
            this.hero.clearWaypoints();
            this.ui.emit('show:enemy:info', { enemy: targetEnemy });
        } else {
            this.events.emit('hero:events:move', { position });
            this.hero.removeTarget();
            if (!this.p5.keyIsDown(this.p5.SHIFT)) {
                this.hero.clearWaypoints();
            }
            this.hero.appendWaypoint(position);
        }
    }

    handlePendingSkillLeftClick(position) {
        const pendingSkill = this.pendingSkill;
        if (!pendingSkill) {
            return;
        }

        if (pendingSkill.targetCategory === 'Unit') {
            const targetEnemy = this.findTargetEnemy(position);
            if (!targetEnemy) {
                this.ui.emit('toast:skill:standby', { message: '选择一个目标' });
                console.log('选择一个目标');
                return;
            }
            this.hero.stop();
            this.castTargetUnitSkill(pendingSkill, targetEnemy);
            this.ui.emit('show:enemy:info', { enemy: targetEnemy });
            this.clearPendingSkill();
            return;
        }

        if (pendingSkill.targetCategory === 'Point') {
            this.hero.stop();
            this.castTargetPointSkill(pendingSkill, position);
            this.clearPendingSkill();
        }
    }

    clearPendingSkill() {
        this.pendingSkill = null;
        this.hero.clearRenderRange();
    }

    cancelPendingSkill() {
        if (!this.pendingSkill) {
            return;
        }

        this.ui.emit('toast:skill:standby', { alert: '已取消施法' });
        this.clearPendingSkill();
    }

    canCastSkill(skill) {
        if (!skill) {
            this.ui.emit('toast:skill:failed', { alert: '未学会' });
            console.log('未学会');
            return false;
        }

        if (skill.passive) {
            this.ui.emit('toast:skill:failed', { alert: '无法施放被动技能' });
            console.log('无法施放被动技能');
            return false;
        }

        if (!skill.cooledDown()) {
            this.ui.emit('toast:skill:failed', { alert: '冷却中' });
            console.log('冷却中');
            return false;
        }

        if (!skill.sufficientMP(this.hero.currentMP)) {
            this.ui.emit('toast:skill:failed', { alert: '魔法不足' });
            console.log('魔法不足');
            return false;
        }

        return true;
    }

    handleButtonPress(button) {
        this.clearVirtualSkillPointer();
        const normalizedButton = typeof button === 'string' ? button.toUpperCase() : '';

        if (normalizedButton === 'P') {
            this.events.emit('system:pause');
            return;
        } else if (normalizedButton === 'B') {
            this.ui.emit('hero:events:buy');
            return;
        } else if (normalizedButton === 'T') {
            this.ui.emit('hero:events:skill_tree');
            return;
        }

        if (normalizedButton === 'S') {
            this.cancelPendingSkill();
            this.hero.stop();
        } else if (Controller.SKILL_KEYS.includes(normalizedButton)) {
            if (this.pendingSkill && this.hero.skill.get(normalizedButton) !== this.pendingSkill) {
                this.cancelPendingSkill();
            }

            const skill = this.hero.skill.get(normalizedButton);
            if (!this.canCastSkill(skill)) {
                return;
            }

            if (skill.targetCategory === 'Unit') {
                this.clearPendingSkill();
                this.pendingSkill = skill;
                this.hero.setRenderRange(skill);
                this.ui.emit('toast:skill:standby', { alert: '选择目标' });
                console.log('选择目标');
            } else if (skill.targetCategory === 'Point') {
                this.clearPendingSkill();
                this.pendingSkill = skill;
                this.hero.setRenderRange(skill);
                this.setVirtualSkillPointer(skill);
                this.ui.emit('toast:skill:standby', { alert: '选择地点' });
                console.log('选择地点');
            } else if (!skill.targetCategory) {
                this.hero.consumeMP(skill.manaCost);
                skill.casted(this.hero, this.clock.now());
            } else {
                this.clearPendingSkill();
            }
        }
    }

    castTargetUnitSkill(skill, target) {
        if (!target) {
            this.ui.emit('toast:skill:failed', { alert: '需要目标单位' });
            console.log('需要目标单位');
            return;
        }

        if (!skill.inRange(this.hero.getDistance(target.position))) {
            this.ui.emit('toast:skill:failed', { alert: '超出攻击范围' });
            console.log(`超出攻击范围`);
            return;
        }

        this.hero.consumeMP(skill.manaCost);
        skill.casted(target, this.hero.name, { x: this.hero.position.x, y: this.hero.position.y }, this.clock.now());
    }

    castTargetPointSkill(skill, TargetPoint) {
        this.clearVirtualSkillPointer();
        if (!TargetPoint) {
            this.ui.emit('toast:skill:failed', { alert: '需要目标点' });
            console.log('需要目标点');
            return;
        }

        if (!skill.inRange(this.hero.getDistance(TargetPoint))) {
            this.ui.emit('toast:skill:failed', { alert: '超出施法范围' });
            console.log(`超出施法范围`);
            return;
        }

        this.hero.consumeMP(skill.manaCost);
        skill.casted(TargetPoint, this.hero.name, this.clock.now());
    }

    setVirtualSkillPointer(skill) {
        this.virtualSkillEntityRange = skill.hitbox;
    }

    clearVirtualSkillPointer() {
        this.virtualSkillEntityRange = null;
    }
}
