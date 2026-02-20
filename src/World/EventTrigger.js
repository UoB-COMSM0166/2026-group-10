export default class EventTrigger {
    constructor() {
        this.listeners = {};
    }

    // 监听事件，并注册回调函数，当事件被触发时调用
    // listen the event, and register the callback function to be called when the event is emitted
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    // 取消监听事件，移除注册的回调函数
    // stop listening the event, remove the registered callback function
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    // 触发事件，并调用所有注册的回调函数，传入提供的数据
    // trigger the event, and call all the registered callback functions with the provided data
    emit(event, data) {
        if (this.listeners[event]) {
        this.listeners[event].forEach(callback => callback(data));
        }
    }
}