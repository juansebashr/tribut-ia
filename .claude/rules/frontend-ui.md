---
paths:
  - "frontend/src/**/*.tsx"
  - "frontend/src/**/*.ts"
---

# Reglas del Frontend (React / TypeScript / Vite)

## 1. Stack Tecnológico

- React 18+ con TypeScript estricto.
- Vite como bundler y dev server.
- Tailwind CSS para diseño y estilos de interfaz de usuario.
- Lucide React para iconografía.

## 2. Máscara Contable y Entradas

- Todos los inputs monetarios deben formatearse con la máscara contable colombiana (separadores de miles con punto o coma formateada).
- La sincronización con el backend se realiza vía `EventSource` (SSE) y llamadas REST debounced a `/api/v1/session/state`.

## 3. Componentes

- Modularizar los formularios por pestañas y cédulas (Formulario 210 PN, Formulario 110 PJ, Conciliación Exógena, Calendario Tributario).
