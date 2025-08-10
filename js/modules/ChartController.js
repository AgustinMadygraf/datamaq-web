/*
Path: js/modules/ChartController.js
Este script se encarga de generar el gráfico de Highcharts y de manejar el evento de doble click sobre el gráfico.
*/

import { onDbClick } from './DoubleClickHandler.js';
import HighchartsConfig from './chart/HighchartsConfig.js';
import ChartDataValidator from './chart/ChartDataValidator.js';
import SeriesBuilder from './chart/SeriesBuilder.js';
// El estado se recibirá por argumentos/setters

// Módulos nuevos a crear
import { waitForElement } from '../utils/DomUtils.js';
import ChartEventManager from './chart/ChartEventManager.js';

import eventBus from '../utils/EventBus.js';
import { EVENT_CONTRACT } from '../utils/eventBus.contract.js';
// Clase principal para manejar el gráfico
class ChartController {
    constructor() {
        this.chartInitialized = false;
        this.chartDataReceived = false;
        this.failedAttempts = 0;
        this.maxFailedAttempts = 5;
        this.chartData = null;
        this.initialData = null;
        this.validator = new ChartDataValidator();
        this.seriesBuilder = new SeriesBuilder();
        this.eventManager = new ChartEventManager(this);
        this.initChart = this.initChart.bind(this);
        this.handleChartClick = this.handleChartClick.bind(this);
        this.handleChartLoad = this.handleChartLoad.bind(this);
    }

    setChartData(chartData) {
        this.chartData = chartData;
    }

    setInitialData(initialData) {
        this.initialData = initialData;
    }
    
    // Método para forzar la carga de datos del gráfico desde main.js
    async forceChartDataLoad() {
        try {
            console.log("ChartController - Intentando forzar carga de datos desde main.js");
            const initialData = this.initialData;
            if (!initialData) {
                console.warn("ChartController - initialData no encontrado");
                this.failedAttempts++;
                return;
            }
            const ApiService = (await import('../services/ApiService.js')).default;
            const periodo = initialData.periodo || 'semana';
            const conta = initialData.conta || null;
            const response = await ApiService.getDashboardData(periodo, conta);
            if (response.status === 'success') {
                console.log("ChartController - Datos recibidos correctamente de API");
                this.setChartData({
                    conta: response.data.conta,
                    rawdata: response.data.rawdata,
                    ls_periodos: response.data.ls_periodos,
                    menos_periodo: response.data.menos_periodo,
                    periodo: response.data.periodo
                });
                this.initChart();
            } else {
                throw new Error("Error en la respuesta de la API: " + response.message);
            }
        } catch (e) {
            console.error("ChartController - Error en forceChartDataLoad:", e);
            this.failedAttempts++;
        }
    }

    // Registra el estado actual de chartData con detalles adicionales
    logChartDataStatus() {
        try {
            const chartData = this.chartData;
            const chartDataExists = chartData !== undefined && chartData !== null;
            const chartDataType = chartDataExists ? typeof chartData : 'undefined';
            const chartDataIsObject = chartDataExists && typeof chartData === 'object';
            const chartDataIsNull = chartDataExists && chartData === null;

            console.log("ChartController - Estado detallado de chartData:", {
                exists: chartDataExists,
                type: chartDataType,
                isObject: chartDataIsObject,
                isNull: chartDataIsNull,
                value: chartDataExists ? chartData : undefined,
                chartInitialized: this.chartInitialized,
                dataReceived: this.chartDataReceived,
                failedAttempts: this.failedAttempts
            });

            // Inspeccionar contexto global y estado centralizado
            const initialData = this.initialData;
            console.log("ChartController - Objetos relevantes presentes:", {
                initialData: initialData !== undefined && initialData !== null,
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
        return waitForElement('container', maxWaitTime, interval);
    }

    // Inicializa el gráfico Highcharts con manejo mejorado de errores
    async initChart() {
        try {
            console.log("ChartController - Iniciando initChart()...");
            const chartData = this.chartData;
            if (!chartData) {
                console.error("ChartController - chartData no existe, no se puede inicializar el gráfico");
                this.failedAttempts++;
                
                if (this.failedAttempts >= this.maxFailedAttempts) {
                    console.error("ChartController - Máximo de intentos de inicialización alcanzado");
                } else {
                    console.log("ChartController - Intentando cargar datos...");
                    this.loadChartData();
                }
                return;
            }

            // Verificar existencia de Highcharts
            if (typeof window.Highcharts === 'undefined') {
                console.error("ChartController - Error: Highcharts no está definido.");
                return;
            }

            // Esperar a que el contenedor esté disponible usando la utilidad
            let container;
            try {
                container = await waitForElement('container');
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

                // Validar los datos usando el estado centralizado
                if (!this.validator.validateChartData(this.chartData)) {
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
            
            // Definir las series usando el estado centralizado
            const chartData = this.chartData;
            let series = [];
            try {
                series = this.seriesBuilder.buildSeries(chartData);
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
                    chartData,
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
            eventBus.subscribe('appDomReady', () => {
                console.log("ChartController - Evento appDomReady recibido (event bus)");
                try {
                    const chartDataExists = this.logChartDataStatus();
                    if (chartDataExists) {
                        console.log("ChartController - chartData encontrado en appDomReady, iniciando gráfico");
                        this.initChart();
                    } else {
                        console.warn("ChartController - chartData no encontrado. Esperando evento CHART_DATA_UPDATED");
                        const initialData = appState.getInitialData();
                        console.log("ChartController - Estado de módulos:", {
                            initialData: initialData !== undefined && initialData !== null ? "disponible" : "no disponible"
                        });
                    }
                } catch (err) {
                    console.error("ChartController - Error en el manejador de appDomReady:", err);
                }
            });

            // Escuchar el evento chartDataReady usando event bus local
            eventBus.subscribe(EVENT_CONTRACT.CHART_DATA_UPDATED, (payload) => {
                console.log("ChartController - Evento CHART_DATA_UPDATED recibido", payload);
                try {
                    if (payload && payload.chartData) {
                        this.setChartData(payload.chartData);
                    }
                    const chartDataExists = this.logChartDataStatus();
                    if (!chartDataExists) {
                        console.error("ChartController - chartData sigue indefinido después del evento CHART_DATA_UPDATED");
                        this.forceChartDataLoad();
                        return;
                    }
                    console.log("ChartController - Iniciando gráfico desde evento chartDataReady");
                    setTimeout(this.initChart, 100);
                } catch (err) {
                    console.error("ChartController - Error en el manejador de chartDataReady:", err);
                }
            });

            // Nueva verificación: Custom event para cuando el container se haga visible
            eventBus.subscribe('containerReady', (payload) => {
                console.log("ChartController - Evento containerReady recibido (event bus)", payload);
                if (this.chartData && !this.chartInitialized) {
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
                    // Verificar si chartData existe usando el estado centralizado
                    const chartData = this.chartData;
                    const chartDataExists = chartData !== undefined && chartData !== null;
                    
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
    init(initialData, chartData) {
        try {
            console.log("ChartController - Inicializando...");
            this.setInitialData(initialData);
            this.setChartData(chartData);
            this.logChartDataStatus();
            this.setupEventListeners();
            this.startPeriodicCheck();
            console.log("ChartController - Inicialización completada");
        } catch (e) {
            console.error("ChartController - Error durante la inicialización:", e);
        }
    }
}

// Exportar la clase para que el controlador principal la instancie y pase el estado
export default ChartController;
