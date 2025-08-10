/*
Path: js/utils/DomUtils.js
*/

/**
 * Utilidad para sanitizar cadenas de HTML y evitar inyecciones XSS.
 * Esta función reemplaza los caracteres especiales por sus entidades HTML.
 *
 * @param {string} html - La cadena HTML a sanitizar.
 * @returns {string} - La cadena HTML sanitizada.
 */
export function sanitizeHTML(html) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    // Reemplaza cualquier carácter que pueda ser interpretado como código HTML
    return String(html).replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Espera a que un elemento con el ID especificado esté disponible en el DOM
 * @param {string} elementId - ID del elemento a esperar
 * @param {number} maxWaitTime - Tiempo máximo de espera en ms (por defecto 5000ms)
 * @param {number} interval - Intervalo de verificación en ms (por defecto 200ms)
 * @returns {Promise<HTMLElement>} - Promesa que se resuelve con el elemento o se rechaza si no se encuentra
 */
export function waitForElement(elementId, maxWaitTime = 5000, interval = 200) {
    console.log(`DomUtils - Esperando a que el elemento '${elementId}' esté disponible`);
    
    return new Promise((resolve, reject) => {
        // Si ya está disponible, resolvemos inmediatamente
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`DomUtils - Elemento '${elementId}' encontrado inmediatamente`);
            resolve(element);
            return;
        }
        
        // Variables para la espera
        const startTime = Date.now();
        let checkInterval;
        
        // Función para verificar el elemento
        const checkElement = () => {
            const element = document.getElementById(elementId);
            
            if (element) {
                clearInterval(checkInterval);
                console.log(`DomUtils - Elemento '${elementId}' encontrado después de esperar`);
                resolve(element);
            } else if (Date.now() - startTime > maxWaitTime) {
                clearInterval(checkInterval);
                console.error(`DomUtils - Tiempo de espera agotado después de ${maxWaitTime}ms buscando '${elementId}'`);
                reject(new Error(`Tiempo de espera agotado buscando el elemento '${elementId}'`));
            }
        };
        
        // Iniciar verificación periódica
        checkInterval = setInterval(checkElement, interval);
    });
}
