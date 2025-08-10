/*
Path: js/modules/chart/ChartDataValidator.js
*/

export default class ChartDataValidator {
    /**
     * Valida que chartData tenga todas las propiedades necesarias
     * @param {Object} chartData - Los datos para el gráfico
     * @returns {boolean} - true si los datos son válidos
     */
    validateChartData(chartData) {
        // Verificar la existencia de chartData
        if (!chartData) {
            console.error("ChartDataValidator - Error crítico: chartData no está definido");
            return false;
        }

        // Verificar propiedades requeridas
        try {
            const requiredProps = ['conta', 'rawdata', 'ls_periodos', 'menos_periodo', 'periodo'];
            const missingProps = requiredProps.filter(prop => !chartData.hasOwnProperty(prop));
            
            if (missingProps.length > 0) {
                console.error(`ChartDataValidator - Error: chartData no tiene las propiedades requeridas: ${missingProps.join(', ')}`);
                return false;
            }
            
            // Verificar datos específicos
            if (!Array.isArray(chartData.rawdata) || chartData.rawdata.length === 0) {
                console.error("ChartDataValidator - Error: chartData.rawdata no es un array válido:", chartData.rawdata);
                return false;
            }
            
            console.log("ChartDataValidator - chartData validado correctamente:", {
                conta: chartData.conta,
                rawdataLength: chartData.rawdata.length,
                periodo: chartData.periodo
            });
            
            return true;
        } catch (validationError) {
            console.error("ChartDataValidator - Error validando chartData:", validationError);
            return false;
        }
    }
}
