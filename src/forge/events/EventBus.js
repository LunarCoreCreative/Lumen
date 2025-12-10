/**
 * 🔥 FORGE ENGINE - Event Bus
 * 
 * Sistema de eventos pub/sub para comunicação entre componentes.
 */

export class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Registra um listener para um evento
     * @param {string} eventName - Nome do evento
     * @param {Function} callback - Função a ser chamada
     * @returns {Function} Função para remover o listener
     */
    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }

        this.listeners.get(eventName).add(callback);

        // Retorna função de cleanup
        return () => this.off(eventName, callback);
    }

    /**
     * Registra um listener que executa apenas uma vez
     */
    once(eventName, callback) {
        const wrapper = (data) => {
            this.off(eventName, wrapper);
            callback(data);
        };
        this.on(eventName, wrapper);
    }

    /**
     * Remove um listener
     */
    off(eventName, callback) {
        const eventListeners = this.listeners.get(eventName);
        if (eventListeners) {
            eventListeners.delete(callback);
        }
    }

    /**
     * Dispara um evento
     * @param {string} eventName - Nome do evento
     * @param {any} data - Dados a serem passados
     */
    emit(eventName, data) {
        const eventListeners = this.listeners.get(eventName);
        if (eventListeners) {
            for (const callback of eventListeners) {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for "${eventName}":`, error);
                }
            }
        }

        // Também emite para listeners globais (*)
        const globalListeners = this.listeners.get('*');
        if (globalListeners) {
            for (const callback of globalListeners) {
                try {
                    callback({ eventName, data });
                } catch (error) {
                    console.error(`Error in global event listener:`, error);
                }
            }
        }
    }

    /**
     * Remove todos os listeners de um evento
     */
    clear(eventName) {
        if (eventName) {
            this.listeners.delete(eventName);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Lista todos os eventos registrados
     */
    getRegisteredEvents() {
        return Array.from(this.listeners.keys());
    }
}
