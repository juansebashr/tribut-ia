---
paths:
  - "docs/**/*.md"
  - "README.md"
---

# Reglas de Documentación

## 1. Estándar Diataxis

- La documentación técnica en `docs/` sigue los cuatro cuadrantes de Diataxis:
  - `docs/tutorials/`: Aprendizaje paso a paso.
  - `docs/how-to/`: Guías prácticas orientadas a tareas.
  - `docs/reference/`: Referencias técnicas, esquemas y endpoints.
  - `docs/explanation/`: Conceptos tributarios y fundamentos teóricos.
  - `docs/decisions/`: ADRs (Architecture Decision Records).

## 2. Conformidad con Markdownlint

- Todos los documentos deben cumplir con las reglas en `.markdownlint.json`.
- Usar `markdownlint -c .markdownlint.json "docs/**/*.md"` para validar cualquier modificación.
