export default class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }

    // 开启事件监听，返回一个取消监听的函数
    on(eventName, handler) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(handler);

        return () => {
            this.off(eventName, handler);
        };
    }

    // 监听一次事件，事件触发后自动取消监听
    once(eventName, handler) {
        const off = this.on(eventName, (...args) => {
            off();
            handler(...args);
        });
        return off;
    }

    // 取消事件监听
    off(eventName, handler) {
        const set = this.listeners.get(eventName);
        if (!set) return;
        set.delete(handler);
        if (set.size === 0) {
            this.listeners.delete(eventName);
        }
    }

    // 触发事件，调用所有监听该事件的处理函数
    emit(eventName, payload) {
        const set = this.listeners.get(eventName);
        if (!set) return;
        for (const handler of [...set]) {
            handler(payload);
        }
    }

    clear(eventName) {
        if (eventName) {
            this.listeners.delete(eventName);
            return;
        }
        this.listeners.clear();
    }
}
