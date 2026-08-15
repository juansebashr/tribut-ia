# 📚 Documentación Técnica de TributIA

Bienvenido a la documentación técnica de **TributIA**, la plataforma colombiana de liquidación tributaria (Formulario 210, Formulario 110, TTD Art. 240, Calendario DIAN y Sincronización Bidireccional API ↔ UI en tiempo real).

Esta documentación sigue el estándar internacional **Diátaxis** (adoptado por GitHub, Stripe, AWS y Kubernetes), complementado con **ADRs (Architecture Decision Records)** y diagramas arquitectónicos **C4 + Mermaid**.

---

## 🧭 Cuadrantes Diátaxis

```
               ORIENTADO AL APRENDIZAJE
                          ▲
                          │
       🎓 TUTORIALES      │      💡 EXPLICACIONES
  (Paso a paso para       │  (Conceptos, diseño y
    principiantes)        │   fundamentos legales)
                          │
◀─────────────────────────┼─────────────────────────▶
                          │
       🛠️ GUÍAS HOW-TO    │      📖 REFERENCIAS
  (Resolución de tareas   │  (APIs, fórmulas, C4
    específicas)          │   y esquemas técnicos)
                          │
                          ▼
             ORIENTADO A LA INFORMACIÓN
```

### 1. 🎓 [Tutoriales](./tutorials/) — *Orientado al Aprendizaje*
- [01. Primeros pasos liquidando Persona Natural (F210)](./tutorials/01-primeros-pasos-liquidacion-pn.md): Guía práctica para realizar una depuración completa de cédula general con rentas de trabajo y beneficios.

### 2. 🛠️ [Guías How-To](./how-to/) — *Orientado a Tareas*
- [01. Sincronización Bidireccional API ↔ UI](./how-to/01-integracion-api-bidireccional.md): Cómo conectar agentes autónomos y scripts vía REST y Server-Sent Events (SSE).
- [02. Simular Tasa Mínima de Tributación (TTD - PJ)](./how-to/02-simular-tasa-minima-ttd-pj.md): Cómo calcular la TTD del 15% (Art. 240 Par. 6 E.T.) y generar el Formulario 110.
- [03. Consultar Vencimientos por NIT y Calendario DIAN](./how-to/03-consultar-calendario-por-nit.md): Cálculo de dígito de verificación (Módulo 11) y plazos tributarios 2026.

### 3. 📖 [Referencias Técnicas](./reference/) — *Orientado a la Información*
- **APIs & Sincronización**:
  - [Especificación OpenAPI / REST Endpoints](./reference/api/rest-endpoints.md)
  - [Canal de Eventos en Tiempo Real (SSE)](./reference/api/sse-events.md)
- **Motor Tributario & DIAN**:
  - [Algoritmo Matemático de la Tabla Marginal (Art. 241 E.T.)](./reference/tax-engine/statutory-rules-art241.md)
  - [Mapeo de Casillas Oficiales Formulario 210](./reference/tax-engine/form210-casillas-mapping.md)
  - [Mapeo de Casillas Oficiales Formulario 110 & TTD](./reference/tax-engine/form110-casillas-mapping.md)
- **Arquitectura & Diagramas**:
  - [C4 Architecture (Context, Container, Component)](./reference/architecture/c4/architecture-c4.md)
  - [Structurizr DSL (`workspace.dsl`)](./reference/architecture/c4/workspace.dsl)
  - [Diagrama de Secuencia: Sincronización Bidireccional](./reference/architecture/sequence/seq-two-way-sync.md)
  - [Diagrama de Secuencia: Pipeline de Liquidación](./reference/architecture/sequence/seq-tax-calculation-pipeline.md)
  - [Flowchart: Algoritmo de Topes y Rentas Exentas (40% / 1.340 UVT)](./reference/architecture/flow/flow-cedula-general-deductions.md)
  - [Modelo de Entidades & Estado de Sesión](./reference/architecture/erd/session-state-model.md)

### 4. 💡 [Explicaciones](./explanation/) — *Orientado a la Comprensión*
- [01. Arquitectura del Sistema TributIA](./explanation/01-arquitectura-sistema-tributia.md): Filosofía de diseño, arquitectura modular y motor desacoplado.
- [02. El Sistema Cedular en Colombia (Ley 2277 de 2022)](./explanation/02-sistema-cedular-colombiano.md): Cómo funciona la cédula general, pensiones, dividendos y ganancias ocasionales.
- [03. Desmitificando las Tarifas Progresivas en Renta](./explanation/03-mito-tributario-tarifas-marginales.md): Por qué ganar más dinero nunca reduce tu ingreso neto.

---

## 🏛️ [Registro de Decisiones Arquitectónicas (ADRs)](./decisions/README.md)
Historial formal de decisiones técnicas (formato Michael Nygard):
- [ADR 0001: Motor de Reglas Declarativo en JSON](./decisions/0001-motor-de-reglas-declarativo-json.md)
- [ADR 0002: Sincronización en Tiempo Real con Server-Sent Events (SSE)](./decisions/0002-sincronizacion-bidireccional-sse.md)
- [ADR 0003: Manejo de Máscara Contable Colombiana en el DOM](./decisions/0003-mascara-contable-colombiana-en-dom.md)
