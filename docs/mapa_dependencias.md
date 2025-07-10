# Mapeo de dependencias entre archivos y funciones

## 1. Estructura y relaciones principales

- **index.html**
  - Define la estructura principal y contiene scripts inline que:
    - Realizan fetch a la API (`DASHBOARD_API_URL`)
    - Renderizan la UI con funciones: `renderDashboard`, `renderBotonera`, `renderInfoDisplay`
    - Manejan el estado global (`appState`, `window.initialData`)
    - Exponen funciones globales (`window.changePeriodo`)
    - Cargan scripts de módulos: `js/main.js`, `js/modules/ChartController.js`

- **js/main.js**
  - (No se muestra el contenido, pero se carga como módulo principal de lógica JS)

- **js/modules/ChartController.js**
  - Controlador de gráficos, expuesto como `window.ChartController` para ser usado desde el HTML y otros scripts.

- **js/services/ApiService.js**
  - (Debe encapsular las llamadas a la API, actualmente el fetch está inline en el HTML)

- **js/state/AppState.js**
  - (Debe centralizar el estado, actualmente el estado está en variables globales en el HTML)

- **js/utils/DomUtils.js**
  - (Debe contener utilidades de manipulación DOM, actualmente mezcladas en funciones inline)

## 2. Flujo de datos y dependencias

- El flujo de datos inicia en el HTML con un fetch a la API.
- Los datos recibidos se almacenan en `window.initialData` y `appState`.
- Las funciones de renderizado (`renderDashboard`, `renderBotonera`, `renderInfoDisplay`) manipulan directamente el DOM.
- El cambio de período (`changePeriodo`) hace un nuevo fetch y actualiza el estado/UI.
- El controlador de gráficos (`ChartController`) depende de los datos y del estado global, y es llamado desde el render principal.

## 3. Acoplamientos detectados

- Uso de variables y funciones globales (`window.*`)
- Dependencia en el orden de carga de scripts (el HTML espera que `ChartController` esté disponible en `window`)
- Lógica de negocio y presentación mezcladas en el HTML

---

**Explicación:**  
Este mapeo permite identificar qué archivos dependen entre sí y cómo fluye la información. Es fundamental para planificar la extracción de servicios, la centralización del estado y la componentización, minimizando el riesgo de romper la funcionalidad existente.
