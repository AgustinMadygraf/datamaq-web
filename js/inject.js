document.addEventListener('mouseup', function(e) {
    let targetClass = '';
    try {
        console.log('inject.js - mouseup event:', e);
        console.log('inject.js - e.target:', e.target);

        if (e.target) {
            try {
                console.log('inject.js - typeof e.target.className:', typeof e.target.className);
                console.log('inject.js - e.target.className:', e.target.className);

                if (typeof e.target.className === 'string') {
                    targetClass = e.target.className;
                    console.log('inject.js - className es string:', targetClass);
                } else if (e.target.className && typeof e.target.className.baseVal === 'string') {
                    targetClass = e.target.className.baseVal;
                    console.log('inject.js - className.baseVal es string:', targetClass);
                } else if (e.target.className) {
                    targetClass = String(e.target.className);
                    console.log('inject.js - className convertido a string:', targetClass);
                } else {
                    console.warn('inject.js - e.target.className es null o undefined');
                }
            } catch (innerErr) {
                console.error('inject.js - Error procesando className:', innerErr);
                targetClass = '';
            }
        } else {
            console.warn('inject.js - e.target es undefined o null');
        }

        // Depuración: log del valor final de targetClass y su tipo
        console.log('inject.js - targetClass final:', targetClass, 'typeof:', typeof targetClass);

        let safeClass = '';
        try {
            safeClass = String(targetClass);
            console.log('inject.js - safeClass:', safeClass, 'typeof:', typeof safeClass);
        } catch (convErr) {
            console.error('inject.js - Error convirtiendo targetClass a string:', convErr);
            safeClass = '';
        }

        // Log antes de usar indexOf
        console.log('inject.js - Antes de indexOf, safeClass:', safeClass, 'typeof:', typeof safeClass);

        if (typeof safeClass === 'string') {
            if (safeClass.indexOf('graf') !== -1) {
                console.log('inject.js - Se encontró "graf" en safeClass');
                // ...tu lógica aquí...
            } else {
                console.log('inject.js - "graf" NO encontrado en safeClass');
            }
        } else {
            console.warn('inject.js - safeClass no es string, no se puede usar indexOf');
        }
    } catch (err) {
        console.error('inject.js - Error en mouseup handler:', err);
    }
});
