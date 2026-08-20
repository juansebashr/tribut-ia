---
paths:
  - "backend/app/models/**/*.py"
---

# Reglas de Modelos y Esquemas Pydantic

## 1. Validación Estricta

- Todos los modelos heredan de `BaseModel` de Pydantic v2.
- Utilizar `Field(default=..., description=...)` para documentar cada casilla y variable tributaria.
- Campos numéricos monetarios deben usar `int` o `Decimal` (evitar `float` para montos en pesos colombianos para prevenir imprecisiones de coma flotante).

## 2. Tipado Estático y Mypy

- Todos los campos opcionales deben anotarse explícitamente como `Optional[T]` o `T | None`.
- Configurar defaults claros en modelos para soportar formularios parcialmente diligenciados sin causar excepciones.
