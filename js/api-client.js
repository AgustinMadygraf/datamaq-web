/**
Path: js/api-client.js
 */

// Variable global para almacenar el token CSRF
let csrfToken = '';

/**
 * Inicializa el cliente API con el token CSRF
 * @param {string} token - El token CSRF generado en el servidor
 */
function initApiClient(token) {
    csrfToken = token;
    console.log('API Client inicializado con token CSRF');
}

/**
 * Realiza peticiones fetch con CSRF token incluido
 * @param {string} url - URL del endpoint
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object|null} data - Datos a enviar en la petición
 * @returns {Promise} - Promesa con la respuesta JSON
 */
function apiRequest(url, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json'
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }
    
    return fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la petición: ' + response.status);
            }
            return response.json();
        });
}
