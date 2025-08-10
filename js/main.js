/*
// Redirigir eventos globales mouseup al event bus
window.addEventListener('mouseup', (e) => {
    eventBus.emit('mouseup', e);
});
Path: js/main.js
*/

import ApiService from './services/ApiService.js';
import UiService from './services/UiService.js';
import appState from './state/AppState.js';
import eventBus from './utils/EventBus.js';
import { EVENT_CONTRACT } from './utils/eventBus.contract.js';

console.log("main.js cargado correctamente.");

// Función para ocultar el indicador de carga
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    appState.update('loading', { global: false });
}

// Función para notificar que el contenedor del gráfico está listo
function notifyContainerReady() {
    try {
        console.log("main.js - Verificando si el contenedor del gráfico existe");
        const container = document.getElementById('container');
        
        if (container) {
            console.log("main.js - Contenedor del gráfico encontrado", {
                width: container.offsetWidth,
                height: container.offsetHeight,
                isVisible: container.offsetParent !== null
            });
            
            // Si el contenedor no tiene dimensiones, intentar establecerlas
            if (container.offsetWidth === 0 || container.offsetHeight === 0) {
                console.log("main.js - Ajustando dimensiones del contenedor del gráfico");
                container.style.minHeight = '400px';
                container.style.width = '100%';
            }
            
            // Disparar evento para notificar que el contenedor está listo usando event bus
            eventBus.emit('containerReady', {
                containerId: 'container',
                timestamp: Date.now()
            });
            console.log("main.js - Evento containerReady disparado (event bus)");
        } else {
            console.warn("main.js - Contenedor del gráfico aún no existe");
            
            // Buscar elementos con clase 'graf'
            const grafElements = document.querySelectorAll('.graf');
            if (grafElements.length > 0) {
                console.log("main.js - Encontrados elementos con clase 'graf':", grafElements);
                
                // Si hay un elemento con clase 'graf', podemos asignarle el id 'container'
                if (grafElements[0].id !== 'container') {
                    grafElements[0].id = 'container';
                    console.log("main.js - Se asignó id 'container' a un elemento .graf");
                    
                    // Disparar evento ahora que tenemos un contenedor
                    notifyContainerReady();
                    return;
                }
            }
            
            // Si aún no existe, intentar nuevamente en un momento
            setTimeout(notifyContainerReady, 500);
        }
    } catch (error) {
        appState.addError('global', error);
        console.error("main.js - Error al notificar que el contenedor está listo:", error);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("main.js - DOMContentLoaded iniciado");
        eventBus.emit('appDomReady', { timestamp: Date.now() });
        try {
            response = await ApiService.getDashboardData(periodo, conta);
        } catch (apiError) {
            appState.setLoading('dashboard', false);
            appState.addError('global', apiError);
            throw new Error("Error de comunicación con la API: " + apiError.message);
        }

        appState.setLoading('dashboard', false);

        if (response.status !== 'success') {
            appState.addError('global', response.message || 'No se recibieron datos');
            throw new Error('Error en la respuesta de la API: ' + (response.message || 'No se recibieron datos'));
        }

        const data = response.data;
        console.log("main.js - Datos recibidos:", data);

        // Actualizar la interfaz con los datos recibidos
        await UiService.updateDashboard(data);

        // Guardar los datos del gráfico en el store centralizado
        if (typeof appState.setChartData === 'function') {
            appState.setChartData({
                conta: data.conta,
                rawdata: data.rawdata,
                ls_periodos: data.ls_periodos,
                menos_periodo: data.menos_periodo,
                periodo: data.periodo
            });
        } else {
            appState.update('chartData', {
                conta: data.conta,
                rawdata: data.rawdata,
                ls_periodos: data.ls_periodos,
                menos_periodo: data.menos_periodo,
                periodo: data.periodo
            });
        }

        console.log("main.js - chartData configurado en appState:", appState.getState().chartData);

        // Notificar que el contenedor está listo (iniciar verificación)
        notifyContainerReady();

        // Disparar evento para que ChartController sepa que los datos están listos
        setTimeout(() => {
            try {
                const event = new CustomEvent('chartDataReady', { 
                    detail: { 
                        chartDataSource: 'main.js',
                        timestamp: Date.now(),
                        chartData: appState.getState().chartData
                    } 
                });
                document.dispatchEvent(event);
                console.log("main.js - Evento chartDataReady disparado correctamente");
            } catch (eventError) {
                console.error("main.js - Error al disparar evento chartDataReady:", eventError);
            }
        }, 200);

        console.log("main.js - Elementos actualizados correctamente.");
    } catch (error) {
        appState.setLoading('dashboard', false);
        appState.addError('global', error);
        console.error("main.js - Error crítico en la aplicación:", error);
        console.log("main.js - Stack trace:", error.stack);
        // Mostrar mensaje de error al usuario
        const container = document.getElementById('info-display-container');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Error al cargar los datos: ${error.message}
                </div>
            `;
        }
    } finally {
        hideLoadingIndicator();
    }
});

// Mecanismo de verificación global para chartData
window.checkChartDataAvailability = function() {
    const chartData = appState.getState().chartData;
    console.log("Verificación global de chartData:", {
        exists: typeof chartData !== 'undefined',
        value: chartData
    });
    return chartData;
};

// Añadir manejador de errores global para debugging
window.addEventListener('error', function(event) {
    appState.addError('global', event.error || event.message);
    console.error('main.js - Error global capturado:', {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});
