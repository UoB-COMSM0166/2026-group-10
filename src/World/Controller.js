export default class Controller {
    constructor(gameManager, hero) {
        this.gameManager = gameManager;
        this.hero = hero;
        this.events = this.gameManager.events;
        this.registerEventHandlers();
    }

    registerEventHandlers() {
        this.events.on('input:key', ({ key, x, y }) => {
            this.onKeyInput(key, x, y);
        });

        this.events.on('input:mouse:right', ({ x, y, append }) => {
            this.onRightClickInput(x, y, append);
        });
    }

    handleRightClick(x, y, append = false) {
        this.events.emit('input:mouse:right', { x, y, append });
    }

    onRightClickInput(x, y, append = false) {
        if (x < 0 || x > this.gameManager.map.width || y < 0 || y > this.gameManager.map.height) {
            this.events.emit('hero:move:ignored', { x, y, append, reason: 'out_of_bounds' });
            return false;
        }

        const targetSpot = { x, y };
        if (!append) {
            this.hero.clearWaypoints();
        }

        this.hero.appendWaypoint(targetSpot);
        this.events.emit('hero:move:queued', { x, y, append });
        return true;
    }

    handleButton(key, x, y) {
        this.events.emit('input:key', { key, x, y });
    }

    onKeyInput(key, x, y) {
        if (key === 's' || key === 'S') {
            console.log('Hero stopped');
            this.hero.clearWaypoints();
            this.hero.stop();
            this.events.emit('hero:stop', { key });
        }
        else if (key === 'u' || key === 'U') {
            this.hero.levelUp();
            this.events.emit('hero:upgrade:manual', { key });
        }
        else {
            const slot = String(key || '').toUpperCase();
            if (this.hero.skills[slot]) {
                this.events.emit('hero:skill:cast', { key: slot, x, y });
            }
        }
    }
}
