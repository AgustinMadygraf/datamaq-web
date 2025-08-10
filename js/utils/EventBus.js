/*
Path: js/utils/EventBus.js
EventBus local para comunicación desacoplada entre módulos
*/

class EventBus {
    constructor() {
        this.events = {};
    }

    subscribe(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
        // Retorna función para desuscribirse
        return () => {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        };
    }

    emit(eventName, payload) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(cb => {
                try {
                    cb(payload);
                } catch (err) {
                    console.error(`EventBus - Error en callback de '${eventName}':`, err);
                }
            });
        }
    }
}

const eventBus = new EventBus();
export default eventBus;
