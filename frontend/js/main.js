/*
Path: frontend/js/main.js
*/

import ApiService from './services/ApiService.js';
import UiService from './services/UiService.js';

console.log("main.js cargado correctamente.");

// Función para ocultar el indicador de carga
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
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
            
            // Disparar evento para notificar que el contenedor está listo
            document.dispatchEvent(new CustomEvent('containerReady', {
                detail: { 
                    containerId: 'container',
                    timestamp: Date.now()
                }
            }));
            console.log("main.js - Evento containerReady disparado");
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
        console.error("main.js - Error al notificar que el contenedor está listo:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("main.js - DOMContentLoaded iniciado");
        console.log("main.js - Datos iniciales:", window.initialData);
        
        // Inicialización segura de window.chartData para evitar problemas de timing
        if (!window.chartData) {
            console.log("main.js - Inicializando window.chartData como objeto vacío para evitar errores de referencia");
            window.chartData = { _placeholder: true };
        }
        
        // Obtener periodo y conta de los datos iniciales
        const { periodo, conta } = window.initialData;
        
        console.log("main.js - Iniciando solicitud de datos a la API...");
        let response;
        try {
            response = await ApiService.getDashboardData(periodo, conta);
        } catch (apiError) {
            console.error("main.js - Error al obtener datos de la API:", apiError);
            throw new Error("Error de comunicación con la API: " + apiError.message);
        }
        
        if (response.status !== 'success') {
            throw new Error('Error en la respuesta de la API: ' + (response.message || 'No se recibieron datos'));
        }
        
        const data = response.data;
        console.log("main.js - Datos recibidos:", data);

        // Actualizar la interfaz con los datos recibidos
        await UiService.updateDashboard(data);
        
        console.log("main.js - Configurando chartData en window...");
        
        // Configurar el gráfico con los datos recibidos
        window.chartData = {
            conta: data.conta,
            rawdata: data.rawdata,
            ls_periodos: data.ls_periodos,
            menos_periodo: data.menos_periodo,
            periodo: data.periodo
        };
        
        console.log("main.js - window.chartData configurado:", window.chartData);
        
        // Notificar que el contenedor está listo (iniciar verificación)
        notifyContainerReady();
        
        console.log("main.js - Disparando evento chartDataReady");
        
        // Pequeña pausa para asegurarnos que otros procesos están listos
        setTimeout(() => {
            // Disparar evento para que ChartController sepa que los datos están listos
            try {
                const event = new CustomEvent('chartDataReady', { 
                    detail: { 
                        chartDataSource: 'main.js',
                        timestamp: Date.now(),
                        // Incluir una copia de los datos como respaldo
                        chartData: {
                            conta: data.conta,
                            rawdata: data.rawdata,
                            ls_periodos: data.ls_periodos,
                            menos_periodo: data.menos_periodo,
                            periodo: data.periodo
                        }
                    } 
                });
                document.dispatchEvent(event);
                console.log("main.js - Evento chartDataReady disparado correctamente");
            } catch (eventError) {
                console.error("main.js - Error al disparar evento chartDataReady:", eventError);
                
                // Verificar si chartData está disponible en window
                if (window.chartData) {
                    console.log("main.js - Verificación de respaldo: window.chartData está disponible");
                } else {
                    console.error("main.js - Verificación de respaldo: window.chartData NO está disponible");
                }
            }
        }, 200);
        
        console.log("main.js - Elementos actualizados correctamente.");
    } catch (error) {
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
        // Ocultar indicador de carga
        hideLoadingIndicator();
    }
});

// Mecanismo de verificación global para chartData
window.checkChartDataAvailability = function() {
    console.log("Verificación global de chartData:", {
        exists: typeof window.chartData !== 'undefined',
        value: window.chartData
    });
    return window.chartData;
};

// Añadir manejador de errores global para debugging
window.addEventListener('error', function(event) {
    console.error('main.js - Error global capturado:', {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});
