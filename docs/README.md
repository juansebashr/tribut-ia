# Documentacion Tecnica de Fiscol

Bienvenido a la documentacion tecnica de **Fiscol**, la plataforma colombiana de liquidacion tributaria (Formulario 210, Formulario 110, TTD Art. 240, Calendario DIAN y Sincronizacion Bidireccional API <-> UI en tiempo real).

Esta documentacion sigue el estandar internacional **Diataxis** (adoptado por GitHub, Stripe, AWS y Kubernetes), complementado con **ADRs (Architecture Decision Records)** y diagramas arquitectonicos **C4 + Mermaid**.

---

## Cuadrantes Diataxis

```text
               ORIENTADO AL APRENDIZAJE
                          ^
                          |
          TUTORIALES      |      EXPLICACIONES
  (Paso a paso para       |  (Conceptos, diseno y
    principiantes)        |   fundamentos legales)
                          |
<-------------------------+------------------------->
                          |
          GUIAS HOW-TO    |      REFERENCIAS
  (Resolucion de tareas   |  (APIs, formulas, C4
    especificas)          |   y esquemas tecnicos)
                          |
                          v
             ORIENTADO A LA INFORMACION
```

### 1. [Tutoriales](./tutorials/) - *Orientado al Aprendizaje*

- [01. Primeros pasos liquidando Persona Natural (F210)](./tutorials/01-primeros-pasos-liquidacion-pn.md): Guia practica para realizar una depuracion completa de cedula general con rentas de trabajo y beneficios.

### 2. [Guias How-To](./how-to/) - *Orientado a Tareas*

- [01. Sincronizacion Bidireccional API <-> UI](./how-to/01-integracion-api-bidireccional.md): Como conectar agentes autonomos y scripts via REST y Server-Sent Events (SSE).
- [02. Simular Tasa Minima de Tributacion (TTD - PJ)](./how-to/02-simular-tasa-minima-ttd-pj.md): Como calcular la TTD del 15% (Art. 240 Par. 6 E.T.) y generar el Formulario 110.
- [03. Consultar Vencimientos por NIT y Calendario DIAN](./how-to/03-consultar-calendario-por-nit.md): Calculo de digito de verificacion (Modulo 11) y plazos tributarios 2026.

### 3. [Referencias Tecnicas](./reference/) - *Orientado a la Informacion*

- **APIs & Sincronizacion**:
  - [Especificacion OpenAPI / REST Endpoints](./reference/api/rest-endpoints.md)
  - [Canal de Eventos en Tiempo Real (SSE)](./reference/api/sse-events.md)
- **Motor Tributario & DIAN**:
  - [Algoritmo Matematico de la Tabla Marginal (Art. 241 E.T.)](./reference/tax-engine/statutory-rules-art241.md)
  - [Mapeo de Casillas Oficiales Formulario 210](./reference/tax-engine/form210-casillas-mapping.md)
  - [Mapeo de Casillas Oficiales Formulario 110 & TTD](./reference/tax-engine/form110-casillas-mapping.md)
- **Arquitectura & Diagramas**:
  - [C4 Architecture (Context, Container, Component)](./reference/architecture/c4/architecture-c4.md)
  - [Structurizr DSL (`workspace.dsl`)](./reference/architecture/c4/workspace.dsl)
  - [Diagrama de Secuencia: Sincronizacion Bidireccional](./reference/architecture/sequence/seq-two-way-sync.md)
  - [Diagrama de Secuencia: Pipeline de Liquidacion](./reference/architecture/sequence/seq-tax-calculation-pipeline.md)
  - [Flowchart: Algoritmo de Topes y Rentas Exentas (40% / 1.340 UVT)](./reference/architecture/flow/flow-cedula-general-deductions.md)
  - [Modelo de Entidades & Estado de Sesion](./reference/architecture/erd/session-state-model.md)

### 4. [Explicaciones](./explanation/) - *Orientado a la Comprension*

- [01. Arquitectura del Sistema Fiscol](./explanation/01-arquitectura-sistema-fiscol.md): Filosofia de diseno, arquitectura modular y motor desacoplado.
- [02. El Sistema Cedular en Colombia (Ley 2277 de 2022)](./explanation/02-sistema-cedular-colombiano.md): Como funciona la cedula general, pensiones, dividendos y ganancias ocasionales.
- [03. Desmitificando las Tarifas Progresivas en Renta](./explanation/03-mito-tributario-tarifas-marginales.md): Por que ganar mas dinero nunca reduce tu ingreso neto.

---

## [Registro de Decisiones Arquitectonicas (ADRs)](./decisions/README.md)

Historial formal de decisiones tecnicas (formato Michael Nygard):
- [ADR 0001: Motor de Reglas Declarativo en JSON](./decisions/0001-motor-de-reglas-declarativo-json.md)
- [ADR 0002: Sincronizacion en Tiempo Real con Server-Sent Events (SSE)](./decisions/0002-sincronizacion-bidireccional-sse.md)
- [ADR 0003: Manejo de Mascara Contable Colombiana en el DOM](./decisions/0003-mascara-contable-colombiana-en-dom.md)
