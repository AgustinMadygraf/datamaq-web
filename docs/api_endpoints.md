# Documentación de Endpoints API y Formatos de Respuesta

## Endpoint principal

- **URL:** `../datamaq/backend/api/endpoints/dashboard.php`
- **Método:** GET
- **Parámetros:**
  - `periodo` (opcional): Puede ser `semana`, `turno`, `hora`. Cambia el período de datos solicitado.

## Ejemplo de llamada

```
GET ../datamaq/backend/api/endpoints/dashboard.php
GET ../datamaq/backend/api/endpoints/dashboard.php?periodo=semana
```

## Formato de respuesta esperado

```json
{
  "status": "success" | "error",
  "data": {
    "periodo": "semana" | "turno" | "hora",
    "conta": <número>,
    "vel_ult_calculada": <número>,
    "formatoData": {
      "formato": <string>,
      "ancho_bobina": <número>
    },
    "ls_periodos": {
      "semana": <número>,
      "turno": <número>,
      "hora": <número>
    }
    // ...otros campos posibles...
  }
}
```

- Si `status` es `error`, el campo `data` puede estar ausente o contener un mensaje de error.

## Uso en la app
- El endpoint es consumido por el frontend para:
  - Inicializar el dashboard con datos actuales.
  - Cambiar el período de visualización (botonera).
  - Actualizar la información de producción y recargar gráficos.

---

**Explicación:**
Esta documentación permite conocer cómo interactúa el frontend con la API, qué datos espera y cómo debe manejar los posibles errores. Es clave para desacoplar la lógica de negocio y facilitar la migración a servicios reutilizables.
