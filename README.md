# TributIA Colombia — Suite Tributaria & Motor de Liquidación DIAN 2026

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.14-blue?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Redis](https://img.shields.io/badge/Redis-Session%20Store%20%7C%20PubSub-red?logo=redis&logoColor=white)](https://redis.io)
[![GCP Cloud Run](https://img.shields.io/badge/GCP-Cloud%20Run%20Ready-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![Tests](https://img.shields.io/badge/Pytest-35%20Passed-brightgreen?logo=pytest&logoColor=white)](https://pytest.org)
[![Documentation](https://img.shields.io/badge/Docs-Diátaxis%20N3%20%7C%20C4%20Architecture-purple)](./docs/)
[![Architecture Decisions](https://img.shields.io/badge/ADRs-Nygard%20Format-orange)](./docs/decisions/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**TributIA** es una plataforma profesional y API de liquidación, depuración y auditoría tributaria para Colombia. Integra un motor de reglas desacoplado por año gravable (Ley 2277 de 2022 / UVT 2026), sincronización bidireccional reactiva en tiempo real (API ↔ UI vía SSE y Redis Pub/Sub), persistencia en memoria RAM con TTL de 1 día, simulación de la Tasa Mínima de Tributación (TTD 15%), Termómetro Progresivo (Art. 241 E.T.) y Calendario Tributario con algoritmo Módulo 11 para NITs.

Diseñada tanto para contadores y contribuyentes como para **Agentes de Inteligencia Artificial Autónomos (AI Skills / MCP)** con aislamiento de sesión de alta seguridad sin requerir login (`X-Session-ID`).

---

## Documentación Técnica (Diátaxis)

La documentación completa del proyecto se encuentra en el directorio [`docs/`](./docs/):

- **[Tutoriales](./docs/tutorials/)**: [Guía paso a paso para liquidar Persona Natural (F210)](./docs/tutorials/01-primeros-pasos-liquidacion-pn.md).
- **[Guías How-To](./docs/how-to/)**:
  - [Sincronización Bidireccional en Tiempo Real (REST, SSE & Redis)](./docs/how-to/01-integracion-api-bidireccional.md)
  - [Simulación de Tasa Mínima TTD 15% (PJ)](./docs/how-to/02-simular-tasa-minima-ttd-pj.md)
  - [Consulta de Vencimientos por NIT (Módulo 11)](./docs/how-to/03-consultar-calendario-por-nit.md)
- **[Referencias Técnicas](./docs/reference/)**:
  - [Endpoints REST, Headers y OpenAPI](./docs/reference/api/rest-endpoints.md)
  - [Canal de Eventos SSE en Vivo](./docs/reference/api/sse-events.md)
  - [Fórmulas Matemáticas de la Tabla Marginal (Art. 241 E.T.)](./docs/reference/tax-engine/statutory-rules-art241.md)
  - [Mapeo Oficial de Casillas Formulario 210](./docs/reference/tax-engine/form210-casillas-mapping.md)
  - [Mapeo Oficial de Casillas Formulario 110 & TTD](./docs/reference/tax-engine/form110-casillas-mapping.md)
- **[Arquitectura y Diagramas C4](./docs/reference/architecture/)**:
  - [Diagramas C4 (Contexto, Contenedores, Componentes)](./docs/reference/architecture/c4/architecture-c4.md)
  - [Structurizr DSL (`workspace.dsl`)](./docs/reference/architecture/c4/workspace.dsl)
  - [Diagrama de Secuencia: Sincronización Reactiva en Redis](./docs/reference/architecture/sequence/seq-two-way-sync.md)
  - [Diagrama de Secuencia: Pipeline de Liquidación](./docs/reference/architecture/sequence/seq-tax-calculation-pipeline.md)
  - [Flowchart: Límites Conjuntos Art. 336 (40% / 1.340 UVT)](./docs/reference/architecture/flow/flow-cedula-general-deductions.md)
  - [Modelo ERD de Sesión](./docs/reference/architecture/erd/session-state-model.md)
- **[Explicaciones Conceptuales](./docs/explanation/)**:
  - [Arquitectura del Sistema TributIA](./docs/explanation/01-arquitectura-sistema-tributia.md)
  - [El Sistema Cedular en Colombia](./docs/explanation/02-sistema-cedular-colombiano.md)
  - [Desmitificando el Salto de Tramo Marginal](./docs/explanation/03-mito-tributario-tarifas-marginales.md)
- **[Decisiones de Arquitectura (ADRs)](./docs/decisions/README.md)**:
  - [ADR 0001: Motor de Reglas Declarativo](./docs/decisions/0001-motor-de-reglas-declarativo-json.md)
  - [ADR 0002: Sincronización Reactiva SSE](./docs/decisions/0002-sincronizacion-bidireccional-sse.md)
  - [ADR 0003: Máscara Contable Colombiana en DOM](./docs/decisions/0003-mascara-contable-colombiana-en-dom.md)
  - [ADR 0004: Persistencia en Redis, Aislamiento de Sesiones sin Login y GCP Cloud Run](./docs/decisions/0004-persistencia-redis-cloudrun-aislamiento-sesion.md)
  - [ADR 0005: Visualizador Efímero de Conciliación Exógena y Transacciones CSV sin Persistencia](./docs/decisions/0005-visualizador-efimero-conciliacion-exogena-csv.md)
  - [ADR 0006: Sistema Responsivo, Menú Off-Canvas y Modo Mobile](./docs/decisions/0006-sistema-responsivo-y-modo-mobile.md)

---

## Características Principales

1. **Renta Personas Naturales (Formulario 210)**:
   - Depuración de cédula general: rentas de trabajo, capital y no laborales con aislamiento estricto de casillas.
   - Deducción general (10%), dependientes adicionales (72 UVT c/u), medicina prepagada (192 UVT), intereses vivienda (1.200 UVT), 50% GMF y 1% compras factura electrónica (240 UVT).
   - Renta exenta laboral del 25% (Tope 790 UVT) y límite conjunto 40% / 1.340 UVT (Art. 336 E.T.).
   - Tabla progresiva marginal de 7 tramos (0% a 39%) del Art. 241 E.T.
2. **Renta Personas Jurídicas (Formulario 110 & TTD)**:
   - Conciliación fiscal societaria (Tarifa general 35%).
   - Cálculo automático de la **Tasa de Tributación Depurada (TTD 15% según Art. 240 Par. 6)** con liquidación del Impuesto Adicional (IA).
3. **Reajuste Fiscal de Activos Fijos (Art. 73 E.T.)**:
   - Tabla DANE histórica completa de 70 años (1955-2025) con factores multiplicadores oficiales para bienes raíces urbanos, rurales y acciones/aportes.
   - Simulador en tiempo real de costo fiscal ajustado, ganancia ocasional depurada y ahorro neto en pesos COP.
4. **Bienes Inmuebles & Cuentas AFC (Art. 311-1 y 126-4 E.T.)**:
   - Simulación de la exención especial de hasta **5.000 UVT ($261.750.000 COP en 2026)** en ganancia ocasional por enajenación de casa o apartamento de habitación.
5. **Beneficio de Auditoría & Régimen Sancionatorio (Arts. 689-3, 640, 641, 644, 639 E.T.)**:
   - Simulador de firmeza en 6 meses (incremento $\ge 35\%$) y 12 meses (incremento $\ge 25\%$) con control de piso de 71 UVT.
   - Calculadora didáctica de sanciones (extemporaneidad y corrección) con reducciones del Art. 640 y sanción mínima de 10 UVT ($523.500 COP).
6. **Hoja de Cálculo Fiscal & Conciliación Exógena CSV (100% Stateless)**:
   - Procesamiento en memoria local de transacciones bancarias y certificados tributarios contra la Información Exógena DIAN.
   - Diagnóstico didáctico casilla por casilla sin persistencia en base de datos.
7. **Sistema Responsivo & Modo Mobile Integral**:
   - Drawer de navegación lateral off-canvas con backdrop de desenfoque y botón hamburguesa accesible.
   - Contenedores con desplazamiento táctil horizontal en tablas de alta densidad.
   - Adaptación fluida sin desbordamiento horizontal en smartphones, tablets, laptops y pantallas de escritorio.
8. **Persistencia Redis & Escalamiento en Cloud Run**:
   - Persistencia en memoria RAM con TTL de 1 día (86.400 segundos) y renovación continua.
   - Difusión multihost con Redis Pub/Sub para Server-Sent Events (SSE).
   - Contenedores Docker stateless optimizados para GCP Cloud Run (`Dockerfile` multi-stage en Python 3.11-slim).

---

## Inicio Rápido

### 1. Clonar y ejecutar

```bash
git clone https://github.com/juansebashr/tribut-ia.git
cd tribut-ia
./start.sh
```

### 2. Acceso

- **Aplicación Web**: [http://localhost:8000](http://localhost:8000)
- **Documentación Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Stream SSE**: [http://localhost:8000/api/v1/session/events](http://localhost:8000/api/v1/session/events)

---

## Suite de Pruebas Automatizadas

Para ejecutar la suite completa de pruebas unitarias, de integración y E2E Playwright:

```bash
# Pruebas backend (unitarias y de integración)
poetry run pytest backend -v --ignore=backend/tests/test_e2e_playwright.py

# Pruebas End-to-End con Playwright (multi-viewport desktop y móvil)
poetry run pytest backend/tests/test_e2e_playwright.py -v
```

```text
======================= 100 passed, 2 warnings in 51.00s ========================
- 78 Pruebas Unitarias y de Integración Backend (100% pasando)
- 22 Pruebas E2E de Flujos Tributarios, Responsividad y Modo Móvil
```
