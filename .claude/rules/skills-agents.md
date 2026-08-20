---
paths:
  - "skills/**/*.py"
  - "skills/**/*.md"
---

# Reglas de Skills y Agentes Autónomos

## 1. Estructura de Skills

- Cada skill reside en `skills/<skill-name>/` y contiene su propio `SKILL.md`.
- `SKILL.md` define los roles, directivas, flujo de trabajo por fases y herramientas disponibles.
- Los scripts auxiliares residen en `skills/<skill-name>/scripts/` y deben ser ejecutables vía CLI (`--help`, argumentos parseados con `argparse`).

## 2. Tipado y Calidad

- Todos los scripts en `skills/` deben pasar el linter `ruff check`, `ruff format` y el chequeo estático `mypy`.
