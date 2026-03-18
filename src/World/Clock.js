export default class Clock {
    constructor(p5, tickRate, maxFrameMs, maxTicksPerFrame) {
        this.p5 = p5;
        this.tickRate = tickRate;
        this.tick = 0;
        this.lastFrameMs = this.p5.millis();
        this.tickSampleCount = 0;
        this.tpsSampleMs = 0;
        this.tps = 0;
        this.accumulatorMs = 0;
        this.maxFrameMs = maxFrameMs;
        this.fixedStepMs = 1000 / tickRate;
        this.maxTicksPerFrame = maxTicksPerFrame;
    }

    start() {
        this.lastFrameMs = this.p5.millis();
        this.accumulatorMs = 0;
        this.tickSampleCount = 0;
        this.tpsSampleMs = 0;
        this.tps = 0;
    }

    update() {
        const nowMs = this.p5.millis();
        const frameMs = Math.min(Math.max(0, nowMs - this.lastFrameMs), this.maxFrameMs);
        this.lastFrameMs = nowMs;
        this.accumulatorMs += frameMs;

        let ticks = 0;
        while (this.accumulatorMs >= this.fixedStepMs && ticks < this.maxTicksPerFrame) {
            this.accumulatorMs -= this.fixedStepMs;
            ticks += 1;
        }

        if (ticks === this.maxTicksPerFrame && this.accumulatorMs >= this.fixedStepMs) {
            this.accumulatorMs = 0;
        }

        this.tick += ticks;
        this.tickSampleCount += ticks;
        this.tpsSampleMs += frameMs;

        if (this.tpsSampleMs >= 1000) {
            this.tps = (this.tickSampleCount * 1000) / this.tpsSampleMs;
            this.tickSampleCount = 0;
            this.tpsSampleMs = 0;
        }

        return ticks;
    }

    now() {
        return this.tick;
    }

    timeFormat(tick = this.tick) {
        const second = Math.floor(tick / this.tickRate) % 60;
        const minute = Math.floor(tick / this.tickRate / 60);
        return `${minute.toFixed(0).padStart(2, '0')}:${second.toFixed(0).padStart(2, '0')}`;
    }
}
