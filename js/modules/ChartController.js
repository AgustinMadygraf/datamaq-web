/*
Path: frontend/js/modules/ChartController.js
Este script se encarga de generar el gráfico de Highcharts y de manejar el evento de doble click sobre el gráfico.
*/

import { onDbClick } from './DoubleClickHandler.js';
import ChartDataValidator from './chart/ChartDataValidator.js';
import SeriesBuilder from './chart/SeriesBuilder.js';
import HighchartsConfig from './chart/HighchartsConfig.js';

// Clase principal para manejar el gráfico
class ChartController {
    constructor() {
        try {
            console.log("ChartController - Constructor iniciado");
            
            this.chartInitialized = false;
            this.chartDataReceived = false;
            this.failedAttempts = 0;
            this.maxFailedAttempts = 5;
            
            // Intentar cargar las dependencias con manejo de errores
            try {
                this.validator = new ChartDataValidator();
                console.log("ChartController - ChartDataValidator inicializado correctamente");
            } catch (e) {
                console.error("ChartController - Error al crear ChartDataValidator:", e);
                // Crear un validador fallback básico
                this.validator = {
                    validateChartData: (data) => {
                        console.warn("ChartController - Usando validador fallback");
                        return data && data.rawdata && Array.isArray(data.rawdata);
                    }
                };
            }
            
            try {
                this.seriesBuilder = new SeriesBuilder();
                console.log("ChartController - SeriesBuilder inicializado correctamente");
            } catch (e) {
                console.error("ChartController - Error al crear SeriesBuilder:", e);
                // Crear un builder fallback básico
                this.seriesBuilder = {
                    buildSeries: () => {
                        console.warn("ChartController - Usando builder fallback");
                        return [];
                    }
                };
            }

            // Intentar acceder a window.chartData en el constructor (solo para depuración)
            try {
                console.log("ChartController - Estado inicial de window.chartData:", 
                            window.chartData ? "Definido" : "No definido");
                
                if (window.chartData) {
                    console.log("ChartController - window.chartData ya está disponible en constructor:", 
                                typeof window.chartData);
                }
            } catch (e) {
                console.error("ChartController - Error al acceder a window.chartData en constructor:", e);
            }

            // Vincular métodos al contexto de la instancia
            this.initChart = this.initChart.bind(this);
            this.logChartDataStatus = this.logChartDataStatus.bind(this);
            this.setupEventListeners = this.setupEventListeners.bind(this);
            this.startPeriodicCheck = this.startPeriodicCheck.bind(this);
            this.handleChartClick = this.handleChartClick.bind(this);
            this.handleChartLoad = this.handleChartLoad.bind(this);
            this.forceChartDataLoad = this.forceChartDataLoad.bind(this);
            
            console.log("ChartController - Constructor completado exitosamente");
        } catch (e) {
            console.error("ChartController - Error fatal en el constructor:", e);
        }
    }
    
    // Método para forzar la carga de datos del gráfico desde main.js
    forceChartDataLoad() {
        try {
            console.log("ChartController - Intentando forzar carga de datos desde main.js");
            
            // Verificar si el módulo main.js está cargado
            if (typeof window.initialData !== 'undefined') {
                console.log("ChartController - initialData encontrado, intentando cargar datos");
                
                // Importar dinámicamente ApiService
                import('../services/ApiService.js')
                    .then(module => {
                        const ApiService = module.default;
                        console.log("ChartController - ApiService importado correctamente");
                        
                        // Obtener datos del dashboard
                        const periodo = window.initialData.periodo || 'semana';
                        const conta = window.initialData.conta || null;
                        
                        return ApiService.getDashboardData(periodo, conta);
                    })
                    .then(response => {
                        if (response.status === 'success') {
                            console.log("ChartController - Datos recibidos correctamente de API");
                            
                            // Actualizar chartData
                            window.chartData = {
                                conta: response.data.conta,
                                rawdata: response.data.rawdata,
                                ls_periodos: response.data.ls_periodos,
                                menos_periodo: response.data.menos_periodo,
                                periodo: response.data.periodo
                            };
                            
                            console.log("ChartController - window.chartData establecido:", window.chartData);
                            this.initChart();
                        } else {
                            throw new Error("Error en la respuesta de la API: " + response.message);
                        }
                    })
                    .catch(err => {
                        console.error("ChartController - Error al cargar datos:", err);
                        this.failedAttempts++;
                    });
            } else {
                console.warn("ChartController - initialData no encontrado");
                this.failedAttempts++;
            }
        } catch (e) {
            console.error("ChartController - Error en forceChartDataLoad:", e);
            this.failedAttempts++;
        }
    }

    // Registra el estado actual de chartData con detalles adicionales
    logChartDataStatus() {
        try {
            const chartDataExists = typeof window.chartData !== 'undefined';
            const chartDataType = chartDataExists ? typeof window.chartData : 'undefined';
            const chartDataIsObject = chartDataExists && typeof window.chartData === 'object';
            const chartDataIsNull = chartDataExists && window.chartData === null;
            
            console.log("ChartController - Estado detallado de chartData:", {
                exists: chartDataExists,
                type: chartDataType,
                isObject: chartDataIsObject,
                isNull: chartDataIsNull,
                value: chartDataExists ? window.chartData : undefined,
                chartInitialized: this.chartInitialized,
                dataReceived: this.chartDataReceived,
                failedAttempts: this.failedAttempts
            });
            
            // Inspeccionar contexto global (window)
            console.log("ChartController - Objetos globales relevantes presentes:", {
                initialData: typeof window.initialData !== 'undefined',
                Highcharts: typeof window.Highcharts !== 'undefined',
                Chart: typeof window.Chart !== 'undefined',
                jQuery: typeof window.jQuery !== 'undefined',
                $: typeof window.$ !== 'undefined',
            });
            
            return chartDataExists;
        } catch (e) {
            console.error("ChartController - Error al registrar estado de chartData:", e);
            return false;
        }
    }

    // Método para esperar a que el contenedor esté disponible
    waitForContainer(maxWaitTime = 5000, interval = 200) {
        console.log("ChartController - Esperando a que el contenedor esté disponible");
        
        return new Promise((resolve, reject) => {
            // Si ya está disponible, resolvemos inmediatamente
            const container = document.getElementById('container');
            if (container) {
                console.log("ChartController - Contenedor encontrado inmediatamente");
                resolve(container);
                return;
            }
            
            // Variables para la espera
            const startTime = Date.now();
            let checkInterval;
            
            // Función para verificar el contenedor
            const checkContainer = () => {
                const container = document.getElementById('container');
                
                if (container) {
                    clearInterval(checkInterval);
                    console.log("ChartController - Contenedor encontrado después de esperar");
                    resolve(container);
                } else if (Date.now() - startTime > maxWaitTime) {
                    clearInterval(checkInterval);
                    console.error(`ChartController - Tiempo de espera agotado después de ${maxWaitTime}ms`);
                    reject(new Error("Tiempo de espera agotado buscando el contenedor"));
                }
            };
            
            // Iniciar verificación periódica
            checkInterval = setInterval(checkContainer, interval);
        });
    }

    // Inicializa el gráfico Highcharts con manejo mejorado de errores
    async initChart() {
        try {
            console.log("ChartController - Iniciando initChart()...");
            const chartDataExists = this.logChartDataStatus();
            
            if (!chartDataExists) {
                console.error("ChartController - chartData no existe, no se puede inicializar el gráfico");
                this.failedAttempts++;
                
                if (this.failedAttempts >= this.maxFailedAttempts) {
                    console.error("ChartController - Máximo de intentos de inicialización alcanzado");
                } else {
                    console.log("ChartController - Intentando forzar carga de datos...");
                    this.forceChartDataLoad();
                }
                return;
            }

            // Verificar existencia de Highcharts
            if (typeof window.Highcharts === 'undefined') {
                console.error("ChartController - Error: Highcharts no está definido. Verificar que la librería está cargada.");
                return;
            }

            // Esperar a que el contenedor esté disponible
            let container;
            try {
                container = await this.waitForContainer();
                console.log("ChartController - Container obtenido correctamente");
            } catch (containerError) {
                console.error("ChartController - Error esperando al contenedor:", containerError);
                
                // Verificar si el contenedor hay que crearlo
                const infoDisplayContainer = document.getElementById('info-display-container');
                if (infoDisplayContainer) {
                    console.log("ChartController - Intentando crear el contenedor manualmente");
                    // Crear el contenedor si no existe
                    const newContainer = document.createElement('div');
                    newContainer.id = 'container';
                    newContainer.className = 'graf';
                    infoDisplayContainer.appendChild(newContainer);
                    container = newContainer;
                    console.log("ChartController - Contenedor creado manualmente:", container);
                } else {
                    console.error("ChartController - No se puede crear el contenedor, no se encontró el contenedor padre");
                    
                    // Imprimir todos los elementos con clase 'graf' para depuración
                    const grafElements = document.querySelectorAll('.graf');
                    console.log(`ChartController - Encontrados ${grafElements.length} elementos con clase 'graf':`, 
                                Array.from(grafElements));
                    
                    // Verificar la estructura DOM
                    console.log("ChartController - Estructura del DOM:", {
                        body: document.body.innerHTML.substring(0, 500) + '...'
                    });
                    
                    return;
                }
            }
            
            console.log("ChartController - Container encontrado:", {
                id: container.id,
                className: container.className,
                parentNode: container.parentNode?.tagName,
                isVisible: container.offsetParent !== null,
                dimensions: {
                    width: container.offsetWidth,
                    height: container.offsetHeight
                }
            });

            // Validar los datos
            if (!this.validator.validateChartData(window.chartData)) {
                console.error("ChartController - Validación de chartData falló");
                return;
            }

            this.chartDataReceived = true;

            // Configuración global de Highcharts
            try {
                HighchartsConfig.applyGlobalConfig();
            } catch (configError) {
                console.error("ChartController - Error al aplicar configuración global:", configError);
                // Configuración fallback
                Highcharts.setOptions({
                    global: { useUTC: false }
                });
            }

            // Crear el gráfico
            this.createChart(container);

            console.log("ChartController - Inicialización del gráfico completada");
        } catch (e) {
            console.error("ChartController - Error crítico durante la inicialización del gráfico:", e);
            console.log("ChartController - Stack trace:", e.stack);
            
            // Intentar recuperación
            this.failedAttempts++;
            if (this.failedAttempts < this.maxFailedAttempts) {
                console.log(`ChartController - Intentando recuperación (intento ${this.failedAttempts}/${this.maxFailedAttempts})...`);
                
                // Dar tiempo al DOM para actualizarse
                setTimeout(() => {
                    this.forceChartDataLoad();
                }, 1000);
            }
        }
    }

    // Resto de métodos con try-catch mejorado
    handleChartClick(event) {
        try {
            console.log("ChartController - Evento de clic en gráfico");
            onDbClick(event);
        } catch (err) {
            console.error("ChartController - Error al manejar clic en gráfico:", err);
        }
    }

    handleChartLoad() {
        try {
            console.log("ChartController - Gráfico cargado exitosamente");
            this.chartInitialized = true;
            this.failedAttempts = 0; // Resetear contador de fallos
        } catch (err) {
            console.error("ChartController - Error en handleChartLoad:", err);
        }
    }

    createChart(container) {
        try {
            console.log("ChartController - Creando gráfico...");
            
            // Definir las series
            let series = [];
            try {
                series = this.seriesBuilder.buildSeries(window.chartData);
            } catch (seriesError) {
                console.error("ChartController - Error al construir series:", seriesError);
                // Series fallback
                series = [{
                    name: 'Fallback',
                    data: [[Date.now(), 0]]
                }];
            }
            
            let config = {};
            try {
                // Obtener la configuración del gráfico
                config = HighchartsConfig.getChartConfig(
                    window.chartData, 
                    series, 
                    this.handleChartClick, 
                    this.handleChartLoad
                );
            } catch (configError) {
                console.error("ChartController - Error al obtener configuración:", configError);
                // Configuración fallback básica
                config = {
                    chart: {
                        type: 'spline',
                        events: {
                            load: this.handleChartLoad
                        }
                    },
                    title: { text: 'Gráfico de recuperación' },
                    series: series
                };
            }
            
            // Crear el gráfico
            try {
                console.log("ChartController - Iniciando renderizado de Highcharts");
                Highcharts.chart('container', config);
                console.log("ChartController - Renderizado de Highcharts completado");
            } catch (renderError) {
                console.error("ChartController - Error al renderizar el gráfico:", renderError);
                
                // Intento final de recuperación: gráfico ultra simple
                console.log("ChartController - Intentando renderizar gráfico mínimo de recuperación");
                try {
                    Highcharts.chart('container', {
                        chart: { type: 'line' },
                        title: { text: 'Error de renderizado - Gráfico fallback' },
                        series: [{ data: [1, 2, 3] }]
                    });
                } catch (finalError) {
                    console.error("ChartController - Falló incluso el gráfico de recuperación:", finalError);
                    // Mostrar mensaje de error en el contenedor
                    container.innerHTML = '<div class="alert alert-danger">Error al cargar el gráfico</div>';
                }
            }
        } catch (e) {
            console.error("ChartController - Error crítico en createChart:", e);
            // Si hay un contenedor válido, mostrar un mensaje de error
            if (container && typeof container.innerHTML === 'string') {
                container.innerHTML = '<div class="alert alert-danger">Error crítico al crear el gráfico</div>';
            }
        }
    }

    setupEventListeners() {
        try {
            console.log("ChartController - Configurando event listeners");
            
            // Escuchar cuando el DOM esté listo
            document.addEventListener('DOMContentLoaded', () => {
                console.log("ChartController - DOMContentLoaded disparado");
                try {
                    const chartDataExists = this.logChartDataStatus();
                    
                    if (chartDataExists) {
                        console.log("ChartController - window.chartData encontrado en DOMContentLoaded, iniciando gráfico");
                        this.initChart();
                    } else {
                        console.warn("ChartController - window.chartData no encontrado. Esperando evento chartDataReady");
                        
                        // Verificar si main.js está cargado
                        console.log("ChartController - Estado de módulos:", {
                            "window.initialData": window.initialData !== undefined ? "disponible" : "no disponible"
                        });
                    }
                } catch (err) {
                    console.error("ChartController - Error en el manejador de DOMContentLoaded:", err);
                }
            });

            // Escuchar el evento chartDataReady
            document.addEventListener('chartDataReady', (event) => {
                console.log("ChartController - Evento chartDataReady recibido", event.detail);
                
                try {
                    const chartDataExists = this.logChartDataStatus();
                    
                    if (!chartDataExists) {
                        console.error("ChartController - window.chartData sigue indefinido después del evento chartDataReady");
                        
                        // Recuperación: intentar obtener datos del evento
                        if (event.detail && event.detail.chartData) {
                            console.log("ChartController - Intentando recuperar chartData desde el evento");
                            window.chartData = event.detail.chartData;
                        } else {
                            // Intentar forzar carga
                            this.forceChartDataLoad();
                            return;
                        }
                    }
                    
                    console.log("ChartController - Iniciando gráfico desde evento chartDataReady");
                    // Pequeño retraso para asegurar que el DOM está listo
                    setTimeout(this.initChart, 100);
                } catch (err) {
                    console.error("ChartController - Error en el manejador de chartDataReady:", err);
                }
            });
            
            // Nueva verificación: Custom event para cuando el container se haga visible
            document.addEventListener('containerReady', () => {
                console.log("ChartController - Evento containerReady recibido");
                if (window.chartData && !this.chartInitialized) {
                    setTimeout(this.initChart, 100);
                }
            });
            
            console.log("ChartController - Event listeners configurados correctamente");
        } catch (e) {
            console.error("ChartController - Error al configurar event listeners:", e);
        }
    }

    startPeriodicCheck() {
        try {
            console.log("ChartController - Iniciando verificación periódica");
            
            let checkAttempts = 0;
            const maxAttempts = 15; // Aumentado para dar más tiempo
            
            const checkInterval = setInterval(() => {
                checkAttempts++;
                console.log(`ChartController - Verificación periódica #${checkAttempts}`);
                
                try {
                    // Verificar si chartData existe
                    const chartDataExists = typeof window.chartData !== 'undefined' && window.chartData !== null;
                    
                    // Verificar si el contenedor existe
                    const containerExists = document.getElementById('container') !== null;
                    
                    console.log(`ChartController - Verificación #${checkAttempts}: chartData=${chartDataExists}, container=${containerExists}, initialized=${this.chartInitialized}`);
                    
                    if (chartDataExists && containerExists && !this.chartInitialized) {
                        console.log("ChartController - Condiciones cumplidas en verificación periódica");
                        clearInterval(checkInterval);
                        this.initChart();
                    } else if (checkAttempts >= maxAttempts) {
                        console.warn("ChartController - Máximo de intentos de verificación alcanzado, cancelando verificación periódica");
                        clearInterval(checkInterval);
                        
                        // Último intento de recuperación
                        if (!this.chartInitialized) {
                            console.log("ChartController - Último intento de recuperación");
                            this.forceChartDataLoad();
                        }
                    } else if (checkAttempts % 3 === 0) {
                        // Cada 3 intentos, intentar forzar la carga si no hay datos
                        if (!chartDataExists && this.failedAttempts < this.maxFailedAttempts) {
                            console.log("ChartController - Intentando forzar carga de datos en verificación periódica");
                            this.forceChartDataLoad();
                        }
                        
                        // Verificar el DOM
                        if (!containerExists) {
                            console.log("ChartController - El contenedor 'container' no existe en verificación periódica");
                            // Buscar elementos que podrían contener el gráfico
                            const infoDisplay = document.getElementById('info-display-container');
                            if (infoDisplay) {
                                console.log("ChartController - info-display-container encontrado, verificando contenido");
                                
                                // Verificar si hay elementos con clase 'graf'
                                const grafElements = infoDisplay.querySelectorAll('.graf');
                                if (grafElements.length > 0) {
                                    console.log("ChartController - Elementos .graf encontrados:", grafElements);
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error("ChartController - Error en verificación periódica:", err);
                }
            }, 1000);
        } catch (e) {
            console.error("ChartController - Error al iniciar verificación periódica:", e);
        }
    }

    // Método de inicialización mejorado
    init() {
        try {
            console.log("ChartController - Inicializando...");
            
            // Registrar el estado inicial
            this.logChartDataStatus();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Iniciar verificación periódica
            this.startPeriodicCheck();
            
            console.log("ChartController - Inicialización completada");
        } catch (e) {
            console.error("ChartController - Error durante la inicialización:", e);
        }
    }
}

// Crear la instancia del controlador
let chartController;

// Inicializar el controlador con manejo de errores global
try {
    console.log("ChartController - Creando instancia");
    chartController = new ChartController();
    chartController.init();
    console.log("ChartController - Instancia creada e inicializada correctamente");
} catch (e) {
    console.error("ChartController - Error fatal al crear o inicializar el controlador:", e);
    // Crear un controlador fallback
    chartController = {
        init: () => console.error("ChartController - Usando controlador fallback")
    };
}

// Exportar la instancia creada
export default chartController;
