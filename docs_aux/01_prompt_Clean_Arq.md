# GUÍA DE REFACTORIZACIÓN Y AUDITORÍA PARA DESACOPLAMIENTO FRONTEND (HTML/CSS/JS → Vue.js Ready)

## Objetivo
Guiar la refactorización y auditoría del sistema para lograr un frontend desacoplado, aplicando principios de arquitectura limpia. El objetivo es que el frontend actual (HTML, CSS, JS) evolucione de forma ordenada y sea fácilmente migrable a un framework moderno como Vue.js.

---

## POLÍTICA DE ARQUITECTURA PARA DESACOPLAMIENTO Y MIGRACIÓN

1. El flujo de dependencias será **unidireccional: UI (HTML/CSS) → JS (Controladores/Vistas) → Servicios/API → Modelos de Dominio**.
2. El frontend debe consumir solo APIs REST/JSON, nunca lógica embebida ni dependencias directas del backend.
3. Separar claramente la lógica de presentación (renderizado), lógica de negocio (servicios) y acceso a datos (API).
4. Evitar dependencias globales y acoplamientos fuertes entre módulos JS; usar funciones puras y módulos ES6.
5. Todo el estado de la aplicación debe estar centralizado y ser fácilmente serializable (pensando en Vuex/pinia).
6. Componentes y funciones reutilizables deben estar en módulos independientes.
7. Complejidad ciclomática ≤ 10 por función; longitud de archivo ≤ 400 líneas.
8. Cobertura de tests ≥ 80 % (tests de unidad para lógica JS; mocks para API).

---

## INSTRUCCIONES DE REVISIÓN Y REFACTORIZACIÓN

0. **Preguntas Críticas + Hipótesis**
   - Formula hasta 7 preguntas clave para el desacoplamiento y cumplimiento de la política.

1. **Mapa de Capas y Migrabilidad**
   - Muestra el árbol de carpetas (≤ 3 niveles).
   - Indica qué partes pueden migrarse 1:1 y cuáles requieren rediseño para Vue.js.

2. **Fortalezas / Debilidades para el Desacoplamiento y la Migración**
   - Listas separadas; ordena por impacto en el desacoplamiento y migración.
   - Para debilidades, añade Severidad (Alta/Media/Baja) y si bloquea la migración.

3. **Código Muerto, Acoplamientos y Complejidad**
   - Enumera símbolos sin referencias, funciones > 10 de complejidad, y acoplamientos difíciles de portar.
   - Indica si su eliminación o refactorización facilita el desacoplamiento y la migración.

**Puntuación:** <n>/100 — <clasificación>

---

## SUGERENCIAS ESPECÍFICAS PARA EL PROYECTO ACTUAL

- **Separar lógica de UI y lógica de negocio:** Extraer funciones de renderizado y manipulación del DOM a módulos independientes.
- **Centralizar el estado:** Crear un módulo JS para el estado global (imitando Vuex/pinia).
- **Servicios de API:** Encapsular llamadas a la API en módulos de servicios.
- **Componentizar:** Identificar bloques repetidos (botonera, info, gráficos) y convertirlos en funciones/componentes reutilizables.
- **Evitar código duplicado:** Consolidar lógica repetida en utilidades.
- **Preparar para Vue:** Usar módulos ES6, evitar variables globales y side-