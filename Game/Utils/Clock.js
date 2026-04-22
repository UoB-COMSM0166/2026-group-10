export default class Clock {
    constructor({
        tickRate = 60,
        maxDelta = 250,     // 防止切后台导致delta过大（ms）
        maxSteps = 5        // 每帧最多补多少tick，防止卡死
    } = {}) {
        this.dt = 1000 / tickRate;

        this.maxDelta = maxDelta;
        this.maxSteps = maxSteps;

        this.running = false;
        this.paused = false;

        this.accumulator = 0;
        this.lastTime = 0;

        this.tickCount = 0;

        this._rafId = null;
        this._boundLoop = this._loop.bind(this);

        // 外部回调
        this.onTick = null;     // function(dt)
        this.onRender = null;   // function(alpha)
    }

    start() {
        if (this.running) return;

        this.running = true;
        this.paused = false;

        this.accumulator = 0;
        this.lastTime = performance.now();

        this._rafId = requestAnimationFrame(this._boundLoop);
    }

    stop() {
        if (!this.running) return;

        this.running = false;

        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    pause() {
        this.paused = true;
    }

    now() {
        return this.tickCount;
    }

    resume() {
        this.paused = false;
        this.lastTime = performance.now();
    }

    // 手动更新（用于 Worker 或自定义循环）
    update(now = performance.now()) {
        if (!this.running || this.paused) return;

        let delta = now - this.lastTime;
        this.lastTime = now;

        if (delta > this.maxDelta) delta = this.maxDelta;

        this.accumulator += delta;

        let steps = 0;

        while (this.accumulator >= this.dt && steps < this.maxSteps) {
            this._tick();
            this.accumulator -= this.dt;
            steps++;
        }

        // 防止死亡螺旋
        if (steps === this.maxSteps) {
            this.accumulator = 0;
        }

        const alpha = this.accumulator / this.dt;

        if (this.onRender) {
            this.onRender(alpha);
        }
    }

    _loop(now) {
        this.update(now);

        if (this.running) {
            this._rafId = requestAnimationFrame(this._boundLoop);
        }
    }

    _tick() {
        this.tickCount++;

        if (this.onTick) {
            this.onTick(this.dt);
        }
    }
}
