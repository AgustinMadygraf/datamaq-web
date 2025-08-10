/*
Path: js/services/UiService.js
Este servicio se encarga de actualizar la interfaz de usuario con los datos recibidos de la API.
*/

import { sanitizeHTML } from '../utils/DomUtils.js';
import appState from '../state/AppState.js';
import eventBus from '../utils/EventBus.js';
import { EVENT_CONTRACT } from '../utils/eventBus.contract.js';
class UiService {
    /**
     * Actualiza el dashboard completo con los datos recibidos
     * @param {Object} data - Datos recibidos de la API
     */
    /**
     * Ahora solo retorna la estructura de datos para el info-display
     * El controlador externo debe encargarse del renderizado y manipulación del DOM
     */
    static getDashboardDataForRender(data) {
        try {
            console.log("UiService - Preparando estructura para renderizar dashboard");
            const infoDisplayStructure = this.getInfoDisplayStructure(data);
            return infoDisplayStructure;
        } catch (error) {
            console.error('UiService - Error en getDashboardDataForRender:', error);
            throw error;
        }
    }
    
    /**
     * Genera el HTML para el info-display
     * @param {Object} data - Datos recibidos de la API
     * @returns {string} HTML generado
     */
    /**
     * Nueva función pura: retorna la estructura del info-display como objeto
     * @param {Object} data - Datos recibidos de la API
     * @returns {Object} Estructura del info-display
     */
    static getInfoDisplayStructure(data) {
        const { vel_ult_calculada, formatoData, uiData } = data;
        const { formato, ancho_bobina } = formatoData;
        const { estiloFondo } = uiData;
        const containerId = 'container';
        return {
            type: 'hoja',
            style: estiloFondo,
            children: [
                {
                    type: 'info',
                    children: [
                        {
                            type: 'cabecera',
                            children: [
                                {
                                    type: 'c1',
                                    children: [
                                        { type: 'p2', text: `Velocidad ${vel_ult_calculada} unidades por minuto` },
                                        { type: 'p1', text: `Formato ${formato}` },
                                        { type: 'p2', text: `Ancho Bobina ${ancho_bobina}` }
                                    ]
                                }
                            ]
                        },
                        {
                            type: 'graf',
                            id: containerId,
                            style: 'min-height: 400px;',
                            children: []
                        },
                        {
                            type: 'botonera-container',
                            children: this.getBotoneraStructure(data)
                        }
                    ]
                }
            ]
        };
    }

    /**
     * Wrapper temporal para compatibilidad: genera HTML a partir de la estructura
     */
    static generateInfoDisplayHtml(data) {
        try {
            const structure = this.getInfoDisplayStructure(data);
            // Función auxiliar para renderizar la estructura como HTML
            function renderNode(node) {
                if (Array.isArray(node)) {
                    return node.map(renderNode).join('');
                }
                switch (node.type) {
                    case 'hoja':
                        return `<div class="hoja" style="${sanitizeHTML(node.style)}">${renderNode(node.children)}</div>`;
                    case 'info':
                        return `<div class="info">${renderNode(node.children)}</div>`;
                    case 'cabecera':
                        return `<div class="cabecera">${renderNode(node.children)}</div>`;
                    case 'c1':
                        return `<div class="c1">${renderNode(node.children)}</div>`;
                    case 'p2':
                        return `<p2>${sanitizeHTML(node.text)}</p2>`;
                    case 'p1':
                        return `<p1>${sanitizeHTML(node.text)}</p1>`;
                    case 'graf':
                        return `<div id="${sanitizeHTML(node.id)}" class="graf" style="${sanitizeHTML(node.style)}"></div>`;
                    case 'botonera-container':
                        // Renderiza la botonera usando la estructura
                        return `<div class="botonera-container">${renderNode(node.children)}</div>`;
                    case 'form':
                        let formHtml = `<form action="${node.action}" method="${node.method}" class="${node.className}">`;
                        for (const input of node.inputs) {
                            if (input.type === 'hidden') {
                                formHtml += `<input type="hidden" name="${input.name}" value="${input.value}">`;
                            } else if (input.type === 'submit') {
                                formHtml += `<input type="submit" value="${input.value}" class="${input.className}">`;
                            }
                        }
                        formHtml += '</form>';
                        return formHtml;
                    case 'spacer':
                        return "<div class='spacer'></div>";
                    default:
                        return '';
                }
            }
            return renderNode(structure);
        } catch (error) {
            console.error("UiService - Error en generateInfoDisplayHtml:", error);
            return `<div class="alert alert-danger">Error al generar la visualización: ${error.message}</div>`;
        }
    }

    /**
     * Genera el HTML para la botonera
     * @param {Object} data - Datos recibidos de la API
     * @returns {string} HTML generado
     */
    /**
     * Nueva función pura: retorna la estructura de la botonera como array de objetos
     * @param {Object} data - Datos recibidos de la API
     * @returns {Array} Estructura de la botonera
     */
    static getBotoneraStructure(data) {
        const { periodo, conta } = data;
        const { refClass, preConta, postConta } = data.uiData;
        const csrfToken = (typeof appState.getInitialData === 'function' ? appState.getInitialData().csrfToken : '') || '';
        return [
            {
                type: 'form',
                action: `?periodo=${periodo}&conta=${preConta}`,
                method: 'post',
                className: 'botonI',
                inputs: [
                    { type: 'hidden', name: 'csrf_token', value: csrfToken },
                    { type: 'submit', value: `${periodo} anterior`, className: 'presione' }
                ]
            },
            { type: 'spacer' },
            {
                type: 'form',
                action: `?periodo=semana&conta=${conta}`,
                method: 'post',
                className: 'periodo',
                inputs: [
                    { type: 'hidden', name: 'csrf_token', value: csrfToken },
                    { type: 'submit', value: 'semana', className: refClass[0] }
                ]
            },
            {
                type: 'form',
                action: `?periodo=turno&conta=${conta}`,
                method: 'post',
                className: 'periodo',
                inputs: [
                    { type: 'hidden', name: 'csrf_token', value: csrfToken },
                    { type: 'submit', value: 'turno', className: refClass[1] }
                ]
            },
            {
                type: 'form',
                action: `?periodo=hora&conta=${conta}`,
                method: 'post',
                className: 'periodo',
                inputs: [
                    { type: 'hidden', name: 'csrf_token', value: csrfToken },
                    { type: 'submit', value: '2 horas', className: refClass[2] }
                ]
            },
            { type: 'spacer' },
            {
                type: 'form',
                action: `?periodo=${periodo}&conta=${postConta}`,
                method: 'post',
                className: 'botonD',
                inputs: [
                    { type: 'hidden', name: 'csrf_token', value: csrfToken },
                    { type: 'submit', value: `${periodo} siguiente`, className: 'presione' }
                ]
            },
            {
                type: 'form',
                action: `?periodo=${periodo}`,
                method: 'post',
                className: 'fin',
                inputs: [
                    { type: 'hidden', name: 'csrf_token', value: csrfToken },
                    { type: 'submit', value: '>|', className: 'presione' }
                ]
            }
        ];
    }

    /**
     * Wrapper temporal para compatibilidad: genera HTML a partir de la estructura
     */
    static generateBotoneraHtml(data) {
        try {
            const structure = this.getBotoneraStructure(data);
            let html = '<div class="botonera">';
            for (const item of structure) {
                if (item.type === 'spacer') {
                    html += "<div class='spacer'></div>";
                } else if (item.type === 'form') {
                    html += `<form action="${item.action}" method="${item.method}" class="${item.className}">`;
                    for (const input of item.inputs) {
                        if (input.type === 'hidden') {
                            html += `<input type="hidden" name="${input.name}" value="${input.value}">`;
                        } else if (input.type === 'submit') {
                            html += `<input type="submit" value="${input.value}" class="${input.className}">`;
                        }
                    }
                    html += '</form>';
                }
            }
            html += '</div>';
            return html;
        } catch (error) {
            console.error('Error en UiService.generateBotoneraHtml:', error);
            return `<div class="alert alert-danger">Error en la botonera: ${error.message}</div>`;
        }
    }
    
    /**
     * Configura event listeners para los botones de la botonera
     */
    static setupBotoneraEventListeners() {
        // Implementar la funcionalidad de los botones utilizando AJAX en lugar de envío de formulario
        const forms = document.querySelectorAll('.botonera form');

        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                // Extraer periodo y conta de la URL del formulario
                const action = form.getAttribute('action');
                const params = new URLSearchParams(action.split('?')[1]);
                const periodo = params.get('periodo');
                const conta = params.get('conta');

                // Emitir evento en el event bus para manejar la acción de la botonera
                eventBus.emit('botoneraSubmit', { periodo, conta, action });
            });
        });
    }

    /**
     * Muestra un mensaje de error en la interfaz
     * @param {string} message - Mensaje de error a mostrar
     */
    static showError(message) {
        // Puedes personalizar esto para mostrar el error en un modal, toast, etc.
        alert(`Error: ${message}`);
    }
}

export default UiService;