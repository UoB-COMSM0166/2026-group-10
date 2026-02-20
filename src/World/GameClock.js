export default class GameClock {
    constructor(tickRate = 60) {
        this.tickRate = tickRate;
        this.tick = 0;

        // 将游戏时间分为不同的频道，方便控制不同系统的时间流速
        // Divide game time into different channels for flexible control of time flow in different systems
        this.channels = {
            gameplay: { tick: 0, scale: 1 },
            spawn: { tick: 0, scale: 1 },
            ui: { tick: 0, scale: 1 }
        };
    }

    // 增加一个tick（游戏逻辑tick）
    // Increment a tick (game logic tick)
    updateTick() {
        this.tick += 1;
        for (const ch of Object.values(this.channels)) {
            ch.tick += ch.scale;
        }
    }

    // 获取指定频道的游戏tick数，默认为gameplay频道
    // Get the game tick count for the specified channel, default is 'gameplay'
    now(channel = "gameplay") {
        return this.channels[channel].tick;
    }

    // 获取当前游戏时间（秒），用于显示
    // Get the current game time in seconds, for display purposes
    getDisplaySeconds(channel = "gameplay") {
        return this.channels[channel].tick / this.tickRate;
    }

    // 设置指定频道的时间流速，scale为倍速
    // Set the time flow speed for the specified channel, scale is the multiplier
    setScale(channel, scale) {
        this.channels[channel].scale = scale;
    }

    // 获取全局tick数
    // Get the total global tick count
    getTotalTick() {
        return this.tick;
    }
}
