# AGENTS.md — Protocolo y Directivas para Agentes Autónomos en TributIA

Bienvenido agente. Este repositorio implementa el sistema **TributIA** para la liquidación, auditoría y análisis tributario en Colombia.

---

## 🎯 Objetivo y Capacidades

- **Liquidación Persona Natural (Formulario 210):** Cédula General (Rentas de Trabajo, Capital, No Laborales), Cédula de Pensiones, Cédula de Dividendos, Ganancias Ocasionales y Liquidación del Impuesto según Art. 241 E.T.
- **Liquidación Persona Jurídica (Formulario 110):** Renta Ordinaria, Sobretasas Financiera/Energética, Descuentos Tributarios y Tasa de Tributación Depurada (TTD Art. 240 Par. 6).
- **Beneficio de Auditoría (Art. 689-3 E.T.):** Evaluación de firmeza en 6 meses (+35%) o 12 meses (+25%).
- **Sincronización Bidireccional:** Estado en vivo sincronizado entre API, Agentes CLI y Frontend mediante Server-Sent Events (SSE).

---

## 🧭 Flujo de Trabajo para Tareas

1. **Lectura y Consulta:**
   - Para dudas sobre el código y dependencias, consultar el grafo arquitectónico: `graphify query "<pregunta>"`.
   - Para normas fiscales y artículos específicos, referirse a `docs/estatuto_tributario.md`.
2. **Implementación:**
   - Modificar o crear código siguiendo las reglas modulares en `.claude/rules/`.
   - Asegurar tipado completo con Pydantic v2 y Python 3.11.
3. **Verificación Estricta:**
   - Linteo: `poetry run ruff check backend skills run.py`
   - Formato: `poetry run ruff format --check backend skills run.py`
   - Tipos: `poetry run mypy --config-file pyproject.toml backend skills run.py`
   - Pruebas: `poetry run pytest backend -v`
   - Documentación: `markdownlint -c .markdownlint.json "docs/**/*.md" "README.md" "CLAUDE.md" "AGENTS.md"`
