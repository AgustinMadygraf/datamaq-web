/**
 * Clase para manejar la configuración de Highcharts
 */
export default class HighchartsConfig {
    /**
     * Aplica la configuración global a Highcharts
     */
    static applyGlobalConfig() {
        console.log("HighchartsConfig - Aplicando configuración global");
        
        Highcharts.setOptions({
            global: { 
                useUTC: false 
            },
            lang: {
                thousandsSep: "",
                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
            }
        });
    }

    /**
     * Crea una configuración de gráfico estándar
     * @param {Object} chartData - Datos para el gráfico
     * @param {Array} series - Series para mostrar en el gráfico
     * @param {Function} onClickHandler - Manejador para eventos de clic
     * @param {Function} onLoadHandler - Manejador para evento de carga
     * @returns {Object} Configuración para Highcharts
     */
    static getChartConfig(chartData, series, onClickHandler, onLoadHandler) {
        return {
            chart: {
                type: 'spline',
                animation: false,
                marginRight: 10,
                events: {
                    load: onLoadHandler,
                    click: onClickHandler
                }
            },
            title: {
                text: Highcharts.dateFormat("%A, %d %B %Y - %H:%M:%S", chartData.conta),
                events: {
                    click: onClickHandler
                }
            },
            xAxis: { 
                type: 'datetime', 
                tickPixelInterval: 1 
            },
            yAxis: {
                title: { 
                    text: '[Producción]' 
                },
                plotLines: [{ 
                    value: 0, 
                    width: 1, 
                    color: '#808080' 
                }]
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat("%A, %d %B %Y - %H:%M:%S", this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 1) + '  Unidades por minuto';
                }
            },
            legend: { enabled: true },
            exporting: { enabled: true },
            series: series
        };
    }
}
