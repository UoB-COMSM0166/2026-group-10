export default class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }

    on(eventName, handler) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(handler);

        return () => {
            this.off(eventName, handler);
        };
    }

    once(eventName, handler) {
        const off = this.on(eventName, (...args) => {
            off();
            handler(...args);
        });
        return off;
    }

    off(eventName, handler) {
        const set = this.listeners.get(eventName);
        if (!set) return;
        set.delete(handler);
        if (set.size === 0) {
            this.listeners.delete(eventName);
        }
    }

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
