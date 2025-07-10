/*
Path: frontend/js/inject.js
*/

document.addEventListener('mouseup', function(e) {
    // Asegurar que className se trate como cadena, incluso si es un objeto u otro tipo.
    let targetClass = (typeof e.target.className === 'string') 
        ? e.target.className 
        : (e.target.className ? e.target.className.toString() : '');
    if (targetClass.indexOf("your-class-name") !== -1) {
        // ...existing mouseup logic...
    }
});
