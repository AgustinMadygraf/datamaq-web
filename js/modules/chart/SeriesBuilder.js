/*
Path: js/modules/chart/SeriesBuilder.js
*/

export default class SeriesBuilder {
    /**
     * Construye todas las series para el gráfico
     * @param {Object} chartData - Datos del gráfico
     * @returns {Array} - Array de configuraciones de series
     */
    buildSeries(chartData) {
        return [
            this.buildInductiveSensorSeries(chartData),
            this.buildOpticalSensorSeries(chartData),
            this.buildMarchaSeries(chartData)
        ];
    }

    /**
     * Construye la serie del sensor inductivo
     * @param {Object} chartData - Datos del gráfico
     * @returns {Object} - Configuración de la serie
     */
    buildInductiveSensorSeries(chartData) {
        return {
            name: 'Sensor inductivo',
            animation: false,
            data: this.getInductiveSensorData(chartData)
        };
    }

    /**
     * Obtiene los datos para la serie del sensor inductivo
     * @param {Object} chartData - Datos del gráfico
     * @returns {Array} - Array de puntos de datos
     */
    getInductiveSensorData(chartData) {
        try {
            const data = [];
            chartData.rawdata.forEach((point, index) => {
                if(index > 0 && point && point.unixtime && point.HR_COUNTER1 !== undefined) {
                    data.push([1000 * point.unixtime, point.HR_COUNTER1 / 5]);
                }
            });
            console.log(`SeriesBuilder - Serie 'Sensor inductivo' generada: ${data.length} puntos`);
            return data;
        } catch (err) {
            console.error("SeriesBuilder - Error generando serie 'Sensor inductivo':", err);
            return [];
        }
    }

    /**
     * Construye la serie del sensor óptico
     * @param {Object} chartData - Datos del gráfico
     * @returns {Object} - Configuración de la serie
     */
    buildOpticalSensorSeries(chartData) {
        return {
            name: 'Sensor optico',
            animation: false,
            data: this.getOpticalSensorData(chartData)
        };
    }

    /**
     * Obtiene los datos para la serie del sensor óptico
     * @param {Object} chartData - Datos del gráfico
     * @returns {Array} - Array de puntos de datos
     */
    getOpticalSensorData(chartData) {
        try {
            const data = [];
            chartData.rawdata.forEach((point, index) => {
                if(index > 0 && point && point.unixtime && point.HR_COUNTER2 !== undefined) {
                    data.push([1000 * point.unixtime, point.HR_COUNTER2 / 5]);
                }
            });
            console.log(`SeriesBuilder - Serie 'Sensor optico' generada: ${data.length} puntos`);
            return data;
        } catch (err) {
            console.error("SeriesBuilder - Error generando serie 'Sensor optico':", err);
            return [];
        }
    }

    /**
     * Construye la serie de marcha
     * @param {Object} chartData - Datos del gráfico
     * @returns {Object} - Configuración de la serie
     */
    buildMarchaSeries(chartData) {
        return {
            name: 'marcha',
            animation: false,
            data: this.getMarchaData(chartData)
        };
    }

    /**
     * Obtiene los datos para la serie de marcha
     * @param {Object} chartData - Datos del gráfico
     * @returns {Array} - Array de puntos de datos
     */
    getMarchaData(chartData) {
        try {
            const data = [];
            chartData.rawdata.forEach((point, index) => {
                if(index > 0 && point && point.unixtime) {
                    data.push([1000 * point.unixtime, 20]);
                }
            });
            console.log(`SeriesBuilder - Serie 'marcha' generada: ${data.length} puntos`);
            return data;
        } catch (err) {
            console.error("SeriesBuilder - Error generando serie 'marcha':", err);
            return [];
        }
    }
}
