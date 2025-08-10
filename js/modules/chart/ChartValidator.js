/*
ChartValidator.js
Responsable de la validación de datos para el gráfico Highcharts.
*/

export default class ChartValidator {
    constructor() {}

    /**
     * Valida los datos del gráfico antes de renderizar
     * @param {Object} chartData - Datos a validar
     * @returns {boolean} - true si los datos son válidos, false si no
     */
    validate(chartData) {
        // Ejemplo básico de validación
        if (!chartData || typeof chartData !== 'object') {
            console.warn('ChartValidator - chartData inválido');
            return false;
        }
        // Validar estructura mínima
        if (!chartData.series || !Array.isArray(chartData.series)) {
            console.warn('ChartValidator - chartData.series faltante o inválido');
            return false;
        }
        // Otras validaciones según necesidades...
        return true;
    }
}
