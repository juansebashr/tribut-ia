---
paths:
  - "backend/app/services/**/*.py"
  - "backend/app/core/rules_engine/**/*.py"
---

# Reglas del Motor de Liquidación Tributaria (Tax Engine)

## 1. Principios Estatutarios y Normativos

- **Estatuto Tributario Nacional:** Todas las fórmulas de cálculo deben respetar estrictamente el Estatuto Tributario colombiano (E.T.).
  - Personas Naturales: Sistema cedular (Cédula General, Cédula de Pensiones, Cédula de Dividendos) según Ley 2277 de 2022 y Art. 241 E.T.
  - Personas Jurídicas: Tasa General Art. 240 E.T., Sobretasas Financiera y Energética, y Tasa de Tributación Depurada (TTD Art. 240 Par. 6).
  - Beneficio de Auditoría: Art. 689-3 E.T. (incremento del 35% para 6 meses, 25% para 12 meses).
  - Ganancias Ocasionales: Art. 300, 313, 314, 316 E.T. (15% general, 20% loterías y rifas).

## 2. Precisión y Manejo Numérico

- Todos los cálculos monetarios deben realizarse con redondeo legal DIAN (al múltiplo de mil más cercano o entero según casilla).
- Los límites en UVT se convierten dinámicamente multiplicando por el valor anual de la UVT (ej. 2025 = $49.799, 2026 = $52.374).
- Nunca quemar valores de UVT en duro dentro de las funciones de cálculo; deben parametrizarse en `common.py` o recibirse en el payload.

## 3. Arquitectura del Servicio

- Las funciones de liquidación (`liquidacion_pn.py`, `liquidacion_pj.py`) deben ser funciones puras y deterministas.
- Las reglas parametrizables deben cargarse a través de `rules_engine/loader.py` en lugar de codificarse como lógica condicional rígida.
- Los modelos de entrada y salida deben validar tipos con Pydantic v2.
