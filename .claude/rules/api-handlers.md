---
paths:
  - "backend/app/api/**/*.py"
  - "backend/app/main.py"
---

# Reglas de Handlers y Endpoints de la API

## 1. FastAPI y Routing

- Usar `APIRouter` por dominio funcional (`persona_natural`, `persona_juridica`, `beneficios`, `session_sync`, `simulation`, `reconciliation`, `rules`).
- Todos los routers deben registrarse en `backend/app/api/v1/router.py` bajo el prefijo `/api/v1`.
- Siempre especificar `response_model` y `status_code` en los decoradores de ruta.

## 2. Sincronización Bidireccional y SSE

- El endpoint `GET /api/v1/session/events` provee Server-Sent Events en tiempo real.
- `POST /api/v1/session/state` actualiza el estado de la sesión y propaga los eventos a todos los clientes suscritos.
- El almacenamiento de sesiones utiliza `SessionStore` (memoria o Redis). Garantizar que todas las operaciones asíncronas respeten `asyncio.Queue` y cierres limpios.

## 3. Manejo de Errores

- Envolver errores de validación y cálculo en `HTTPException` con códigos semánticos (400, 404, 422, 500).
- Usar encadenamiento de excepciones (`raise HTTPException(...) from err`) para trazabilidad de errores (regla Ruff B904).
