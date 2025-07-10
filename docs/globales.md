# Identificación de variables y funciones globales

## Variables globales detectadas

- `window.initialData`
  - Almacena los datos iniciales recibidos de la API.
  - Se utiliza para renderizar la UI y recargar datos.

- `window._scriptsLoaded`
  - Flag para evitar cargar varias veces los scripts principales (`main.js`, `ChartController.js`).

- `appState`
  - Objeto global (no en window, pero en el scope principal) para almacenar el estado de la app (período, datos).

## Funciones globales detectadas

- `window.changePeriodo(periodo)`
  - Cambia el período de datos, realiza un fetch a la API y actualiza la UI.

- `renderDashboard(data)`
  - Renderiza la botonera, la info principal y recarga el gráfico.

- `renderBotonera(data)`
  - Renderiza la botonera de períodos.

- `renderInfoDisplay(data)`
  - Renderiza la información de producción.

- `window.ChartController`
  - Controlador de gráficos, expuesto globalmente para ser accedido desde el HTML y otros scripts.

- `window.initChart`
  - Alternativa global para inicializar el gráfico si `ChartController` no está disponible.

## Observaciones

- El uso de variables y funciones globales incrementa el acoplamiento y dificulta la migración a una arquitectura desacoplada o a frameworks modernos como Vue.js.
- Se recomienda migrar estas variables y funciones a módulos ES6 y centralizar el estado en un store dedicado.

---

**Explicación:**
Este inventario de variables y funciones globales es esencial para planificar su eliminación progresiva y reducir el acoplamiento, facilitando la refactorización y migración futura.
