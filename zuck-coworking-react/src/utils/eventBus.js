/**
 * Simple pub/sub event bus for React <-> Phaser communication
 */
class EventBus {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, ...args) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(cb => cb(...args));
    }

    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    removeAllListeners(event) {
        if (event) {
            delete this.listeners[event];
        } else {
            this.listeners = {};
        }
    }
}

const eventBus = new EventBus();
export default eventBus;
