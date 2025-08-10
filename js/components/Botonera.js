/*
Path: js/components/Botonera.js
Componente funcional para renderizar la botonera a partir de una estructura de datos
*/

export function renderBotonera(structure) {
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
}
