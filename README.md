# TributIA Colombia 🇨🇴 — Suite Tributaria & Motor de Liquidación DIAN 2026

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.14-blue?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Tests](https://img.shields.io/badge/Pytest-28%20Passed-brightgreen?logo=pytest&logoColor=white)](https://pytest.org)
[![Documentation](https://img.shields.io/badge/Docs-Diátaxis%20N3%20%7C%20C4%20Architecture-purple)](./docs/)
[![Architecture Decisions](https://img.shields.io/badge/ADRs-Nygard%20Format-orange)](./docs/decisions/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**TributIA** es una plataforma profesional y API de liquidación, depuración y auditoría tributaria para Colombia. Integra un motor de reglas desacoplado por año gravable (Ley 2277 de 2022 / UVT 2026), sincronización bidireccional reactiva en tiempo real (API ↔ UI vía SSE), simulación de la Tasa Mínima de Tributación (TTD 15%), Termómetro Progresivo (Art. 241 E.T.) y Calendario Tributario con algoritmo Módulo 11 para NITs.

Diseñada tanto para contadores y contribuyentes como para **Agentes de Inteligencia Artificial Autónomos (AI Skills / MCP)**.

---

## 🧭 Documentación Técnica (Diátaxis)

La documentación completa del proyecto se encuentra en el directorio [`docs/`](./docs/):

- 🎓 **[Tutoriales](./docs/tutorials/)**: [Guía paso a paso para liquidar Persona Natural (F210)](./docs/tutorials/01-primeros-pasos-liquidacion-pn.md).
- 🛠️ **[Guías How-To](./docs/how-to/)**:
  - [Sincronización Bidireccional en Tiempo Real (REST & SSE)](./docs/how-to/01-integracion-api-bidireccional.md)
  - [Simulación de Tasa Mínima TTD 15% (PJ)](./docs/how-to/02-simular-tasa-minima-ttd-pj.md)
  - [Consulta de Vencimientos por NIT (Módulo 11)](./docs/how-to/03-consultar-calendario-por-nit.md)
- 📖 **[Referencias Técnicas](./docs/reference/)**:
  - [Endpoints REST y OpenAPI](./docs/reference/api/rest-endpoints.md)
  - [Canal de Eventos SSE en Vivo](./docs/reference/api/sse-events.md)
  - [Fórmulas Matemáticas de la Tabla Marginal (Art. 241 E.T.)](./docs/reference/tax-engine/statutory-rules-art241.md)
  - [Mapeo Oficial de Casillas Formulario 210](./docs/reference/tax-engine/form210-casillas-mapping.md)
  - [Mapeo Oficial de Casillas Formulario 110 & TTD](./docs/reference/tax-engine/form110-casillas-mapping.md)
- 🏛️ **[Arquitectura y Diagramas C4](./docs/reference/architecture/)**:
  - [Diagramas C4 (Contexto, Contenedores, Componentes)](./docs/reference/architecture/c4/architecture-c4.md)
  - [Structurizr DSL (`workspace.dsl`)](./docs/reference/architecture/c4/workspace.dsl)
  - [Diagrama de Secuencia: Sincronización Reactiva](./docs/reference/architecture/sequence/seq-two-way-sync.md)
  - [Diagrama de Secuencia: Pipeline de Liquidación](./docs/reference/architecture/sequence/seq-tax-calculation-pipeline.md)
  - [Flowchart: Límites Conjuntos Art. 336 (40% / 1.340 UVT)](./docs/reference/architecture/flow/flow-cedula-general-deductions.md)
  - [Modelo ERD de Sesión](./docs/reference/architecture/erd/session-state-model.md)
- 💡 **[Explicaciones Conceptuales](./docs/explanation/)**:
  - [Arquitectura del Sistema TributIA](./docs/explanation/01-arquitectura-sistema-tributia.md)
  - [El Sistema Cedular en Colombia](./docs/explanation/02-sistema-cedular-colombiano.md)
  - [Desmitificando el Salto de Tramo Marginal](./docs/explanation/03-mito-tributario-tarifas-marginales.md)
- 🏛️ **[Decisiones de Arquitectura (ADRs)](./docs/decisions/README.md)**:
  - [ADR 0001: Motor de Reglas Declarativo](./docs/decisions/0001-motor-de-reglas-declarativo-json.md)
  - [ADR 0002: Sincronización Reactiva SSE](./docs/decisions/0002-sincronizacion-bidireccional-sse.md)
  - [ADR 0003: Máscara Contable Colombiana en DOM](./docs/decisions/0003-mascara-contable-colombiana-en-dom.md)

---

## 🎯 Características Principales

1. **Renta Personas Naturales (Formulario 210)**:
   - Depuración de cédula general: rentas de trabajo, capital y no laborales.
   - Deducción general (10%), dependientes adicionales (72 UVT c/u), medicina prepagada (192 UVT), intereses vivienda (1.200 UVT), 50% GMF y 1% compras factura electrónica (240 UVT).
   - Renta exenta laboral del 25% (Tope 790 UVT) y límite conjunto 40% / 1.340 UVT (Art. 336 E.T.).
   - Tabla progresiva marginal de 7 tramos (0% a 39%) del Art. 241 E.T.
2. **Renta Personas Jurídicas (Formulario 110 & TTD)**:
   - Conciliación fiscal societaria (Tarifa general 35%).
   - Cálculo automático de la **Tasa de Tributación Depurada (TTD 15% según Art. 240 Par. 6)** con liquidación del Impuesto Adicional (IA).
3. **Sincronización Bidireccional en Tiempo Real (API ↔ UI)**:
   - Inyección de estados desde la terminal/API hacia el navegador mediante Server-Sent Events (SSE).
   - Consulta instantánea del estado de pantalla vía `GET /api/v1/session/state`.
   - Modales interactivos de Importar / Exportar JSON en la interfaz.
4. **Experiencia de Usuario Contable Colombiana**:
   - Máscara interactiva con separador de millones `'` y miles `.` (ej. `$1'280.000` y `$120'000.000`).
   - Termómetro visual didáctico de tarifas marginales y simulador de incrementos.
   - Barra lateral colapsable fluida con emblema compacto adaptable.
5. **Calendario Tributario 2026 & DIAN Módulo 11**:
   - Consulta por NIT con cálculo dinámico del Dígito de Verificación (DV).
   - Vista de calendario interactivo mes a mes.

---

## 🚀 Inicio Rápido

### 1. Clonar y ejecutar:
```bash
git clone https://github.com/juansebashr/tribut-ia.git
cd tribut-ia
./start.sh
```

### 2. Acceso:
- 🌐 **Aplicación Web**: [http://localhost:8000](http://localhost:8000)
- 📖 **Documentación Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 📡 **Stream SSE**: [http://localhost:8000/api/v1/session/events](http://localhost:8000/api/v1/session/events)

---

## 🧪 Suite de Pruebas Automatizadas

Para ejecutar la suite completa de 28 pruebas unitarias y de integración:

```bash
cd backend
./venv/bin/pytest tests -v
```

```
======================== 28 passed, 3 warnings in 0.34s ========================
```

---

## 👤 Autor

Desarrollado por **Juan Sebastian Hernandez** ([@juansebashr](https://github.com/juansebashr)).
