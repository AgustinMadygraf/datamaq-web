/*
Path: frontend/js/utils/DomUtils.js
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
