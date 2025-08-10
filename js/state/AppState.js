
/**
 * Path: js/state/AppState.js
 * AppState.js - Gestión centralizada del estado de la aplicación
 * Implementa el patrón observable para desacoplar la gestión del estado de los componentes UI
 *
 * SHAPE DEL ESTADO (compatible con Redux/Context):
 * {
 *   chart: {
 *     conta: string|null,
 *     rawdata: Array,
 *     ls_periodos: Array,
 *     menos_periodo: string|null,
 *     periodo: string
 *   },
 *   initial: {
 *     periodo: string,
 *     conta: string|null,
 *     csrfToken: string|null
 *   },
 *   loading: {
 *     dashboard: boolean,
 *     chart: boolean
 *   },
 *   errors: Array<{ id: number, source: string, message: string, timestamp: string }>
 * }
 *
 * MÉTODOS PRINCIPALES:
 * - getState(): Obtiene el estado completo
 * - get(key): Obtiene una parte específica del estado
 * - update(key, value, merge): Actualiza una parte del estado
 * - setChartData(chartData): Actualiza datos del gráfico
 * - getChartData(): Obtiene datos del gráfico
 * - setInitialData(initialData): Actualiza datos iniciales
 * - getInitialData(): Obtiene datos iniciales
 * - setLoading(key, isLoading): Actualiza estado de carga
 * - isLoading(): Verifica si algún componente está cargando
 * - addError(source, error): Registra un error
 * - clearError(id): Elimina un error
 * - clearAllErrors(): Elimina todos los errores
 * - subscribe(key, callback): Suscribe a cambios de estado
 * - resetState(): Restablece el estado inicial
 *
 * Todas las claves y métodos son serializables y desacoplados de la UI.
 */

class AppState {
    constructor() {
        // Estado interno inicial
        this._state = {
            // Datos del gráfico
            chart: {
                conta: null,
                rawdata: [],
                ls_periodos: [],
                menos_periodo: null,
                periodo: 'semana'
            },
            // Datos iniciales
            initial: {
                periodo: 'semana',
                conta: null,
                csrfToken: null
            },
            // Estado de carga
            loading: {
                dashboard: false,
                chart: false
            },
            // Errores
            errors: []
        };

        // Suscriptores por clave de estado
        this._subscribers = {
            'chart': [],
            'initial': [],
            'loading': [],
            'errors': [],
            'all': []  // Suscriptores a cualquier cambio
        };

        console.log("AppState - Estado centralizado inicializado");
    }

    /**
     * Obtiene todo el estado actual
     */
    getState() {
        return {...this._state};
    }

    /**
     * Obtiene una parte específica del estado
     * @param {string} key - Clave del estado (chart, initial, loading, errors)
     */
    get(key) {
        if (key in this._state) {
            return {...this._state[key]};
        }
        
        console.warn(`AppState - Intentando acceder a una clave de estado no existente: ${key}`);
        return null;
    }

    /**
     * Actualiza una parte específica del estado y notifica a los suscriptores
     * @param {string} key - Clave del estado a actualizar
     * @param {object} value - Nuevo valor
     * @param {boolean} merge - Si es true, fusiona con el valor existente en lugar de reemplazar
     */
    update(key, value, merge = true) {
        if (!(key in this._state)) {
            console.warn(`AppState - Intentando actualizar una clave de estado no existente: ${key}`);
            return false;
        }

        // Actualizar el estado
        if (merge && typeof this._state[key] === 'object' && value !== null && typeof value === 'object') {
            this._state[key] = {...this._state[key], ...value};
        } else {
            this._state[key] = value;
        }

        console.log(`AppState - Estado actualizado: ${key}`, this._state[key]);

        // Notificar a los suscriptores
        this._notify(key);
        return true;
    }

    /**
     * Establece los datos del gráfico
     * @param {object} chartData - Datos del gráfico
     */
    setChartData(chartData) {
        if (!chartData || typeof chartData !== 'object') {
            console.warn("AppState - Intentando establecer datos de gráfico inválidos");
            return false;
        }
        // Validación opcional de propiedades requeridas
        const required = ['conta', 'rawdata', 'ls_periodos', 'menos_periodo', 'periodo'];
        for (const key of required) {
            if (!(key in chartData)) {
                console.warn(`AppState - chartData incompleto, falta '${key}'`);
            }
        }
        return this.update('chart', chartData);
    }

    /**
     * Obtiene los datos del gráfico
     */
    getChartData() {
        return this.get('chart');
    }

    /**
     * Establece los datos iniciales
     * @param {object} initialData - Datos iniciales
     */
    setInitialData(initialData) {
        if (!initialData || typeof initialData !== 'object') {
            console.warn("AppState - Intentando establecer datos iniciales inválidos");
            return false;
        }
        return this.update('initial', initialData);
    }

    /**
     * Obtiene los datos iniciales
     */
    getInitialData() {
        return this.get('initial');
    }

    /**
     * Actualiza el estado de carga
     * @param {string} key - Componente (dashboard, chart)
     * @param {boolean} isLoading - Estado de carga
     */
    setLoading(key, isLoading) {
        const loading = {...this._state.loading, [key]: isLoading};
        return this.update('loading', loading, false);
    }

    /**
     * Verifica si algún componente está en estado de carga
     */
    isLoading() {
        return Object.values(this._state.loading).some(value => value === true);
    }

    /**
     * Registra un error en el estado
     * @param {string} source - Fuente del error
     * @param {Error|string} error - Error ocurrido
     */
    addError(source, error) {
        const newError = {
            id: Date.now(),
            source,
            message: error instanceof Error ? error.message : error,
            timestamp: new Date().toISOString()
        };

        const errors = [...this._state.errors, newError];
        this.update('errors', errors, false);
        return newError.id;
    }

    /**
     * Elimina un error del estado
     * @param {number} id - ID del error a eliminar
     */
    clearError(id) {
        const errors = this._state.errors.filter(e => e.id !== id);
        return this.update('errors', errors, false);
    }

    /**
     * Limpia todos los errores
     */
    clearAllErrors() {
        return this.update('errors', [], false);
    }

    /**
     * Se suscribe a cambios en una parte específica del estado
     * @param {string} key - Clave del estado (chart, initial, loading, errors, all)
     * @param {Function} callback - Función a ejecutar cuando cambie el estado
     * @returns {Function} Función para cancelar la suscripción
     */
    subscribe(key, callback) {
        if (typeof callback !== 'function') {
            console.error("AppState - El callback debe ser una función");
            return () => {};
        }

        if (!this._subscribers[key]) {
            console.warn(`AppState - Suscripción a una clave no existente: ${key}, se usará 'all'`);
            key = 'all';
        }

        this._subscribers[key].push(callback);
        console.log(`AppState - Nueva suscripción a ${key}, total: ${this._subscribers[key].length}`);
        
        // Devolver función para cancelar suscripción
        return () => {
            this._subscribers[key] = this._subscribers[key].filter(cb => cb !== callback);
            console.log(`AppState - Suscripción a ${key} cancelada, restantes: ${this._subscribers[key].length}`);
        };
    }

    /**
     * Notifica a los suscriptores sobre cambios en el estado
     * @param {string} key - Clave del estado que cambió
     * @private
     */
    _notify(key) {
        const value = this._state[key];
        
        // Notificar a los suscriptores específicos de esta clave
        if (this._subscribers[key]) {
            this._subscribers[key].forEach(callback => {
                try {
                    callback(value);
                } catch (error) {
                    console.error(`AppState - Error en callback de ${key}:`, error);
                }
            });
        }

        // Notificar a los suscriptores generales
        this._subscribers.all.forEach(callback => {
            try {
                callback({[key]: value});
            } catch (error) {
                console.error(`AppState - Error en callback general para ${key}:`, error);
            }
        });
    }

    /**
     * Restablece el estado a los valores iniciales
     */
    resetState() {
        console.log("AppState - Restableciendo estado");
        // Mantener lista de suscriptores
        const subscribers = this._subscribers;
        
        // Reiniciar estado
        this._state = {
            chart: {
                conta: null,
                rawdata: [],
                ls_periodos: [],
                menos_periodo: null,
                periodo: 'semana'
            },
            initial: {
                periodo: 'semana',
                conta: null,
                csrfToken: null
            },
            loading: {
                dashboard: false,
                chart: false
            },
            errors: []
        };
        
        // Restaurar suscriptores
        this._subscribers = subscribers;
        
        // Notificar a todos los suscriptores
        Object.keys(this._state).forEach(key => this._notify(key));
    }
}

// Crear instancia singleton
const appState = new AppState();
export default appState;
