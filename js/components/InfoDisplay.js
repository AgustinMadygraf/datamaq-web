/*
Path: js/components/InfoDisplay.js
Componente funcional para renderizar el info-display a partir de una estructura de datos
*/

import { renderBotonera } from './Botonera.js';
import { sanitizeHTML } from '../utils/DomUtils.js';

export function renderInfoDisplay(structure) {
    // Función auxiliar para renderizar nodos
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
                return `<div class="botonera-container">${renderBotonera(node.children)}</div>`;
            default:
                return '';
        }
    }
    return renderNode(structure);
}
