# Explicación: Arquitectura del Sistema TributIA

Este documento expone la filosofía de diseño, principios de ingeniería y decisiones técnicas fundamentales detrás de la plataforma **TributIA**.

---

## 1. Principios de Diseño

1. **Motor Tributario Desacoplado & Agnóstico**:
   La lógica de liquidación (`liquidacion_pn.py`, `liquidacion_pj.py`) no depende de frameworks web ni de bases de datos. Recibe modelos de dominio inmutables Pydantic y catálogos de reglas en memoria, lo que permite ejecutar cálculos a velocidad nativa en APIs, terminales CLI o agentes autónomos.

2. **Persistencia Distribuida en Memoria (Redis & TTL de 1 Día)**:
   Las sesiones activas se persisten en Redis (`session:{session_id}`) con un TTL de 86.400 segundos (24 horas) y renovación continua (*sliding expiration*). Esto garantiza compatibilidad nativa con contenedores *stateless* y escalamiento horizontal de 0 a N instancias en **GCP Cloud Run**.

3. **Aislamiento de Sesión por Dispositivo sin Login (Zero-Login Pattern)**:
   El usuario no requiere autenticación ni registro. Al ingresar a la web, el sistema auto-asigna una cookie de sesión criptográfica de alta entropía (`tributia_sid=ses_...`). Los scripts externos y agentes IA pueden interactuar con la misma sesión mediante la cabecera estándar `X-Session-ID: ses_...`.

4. **Sincronización Bidireccional Reactiva (API ↔ UI vía SSE & Redis Pub/Sub)**:
   Cualquier mutación generada desde la API o un Agente IA se publica en el canal Redis `session:{id}:events` y se retransmite instantáneamente a la pantalla del usuario vía Server-Sent Events (SSE).

5. **Reglas como Código Declarativo Versionado**:
   Cada año fiscal posee su propia matriz de configuración JSON (`rules_2026.json`, `rules_2025.json`, etc.), permitiendo liquidar vigencias anteriores con sus topes históricos (UVT, 1.340 UVT, 790 UVT) sin modificar el código fuente.

6. **Trazabilidad y Auditoría Estatutaria**:
   Cada resultado genera un árbol de trazabilidad (`audit_trace`) que documenta cada artículo estatutario, el tope legal aplicado y la justificación contable de cada peso deducido.

---

## 2. Diagrama de Arquitectura Global

```mermaid
graph TB
    subgraph Clientes["Clientes & Fuentes de Entrada"]
        USER["👤 Contribuyente / Contador (Navegador)"]
        AGENT["🤖 Agente IA Autónomo (Skill / MCP)"]
        CLI["💻 Script CLI (inyectar_tributia.py)"]
    end

    subgraph Edge["GCP Cloud Run - Capa Web & API"]
        INGRESS["Cloud Run Ingress (Port 8080)"]
        MIDDLEWARE["FastAPI Session Resolver<br/>(Header X-Session-ID / Cookie tributia_sid)"]
        ROUTER["FastAPI REST Router (/api/v1)"]
        SSE_EP["SSE Stream (/api/v1/session/events)"]
    end

    subgraph CoreEngine["Motor de Liquidación & Reglas"]
        RULES["Reglas JSON Versionadas<br/>(rules_2026.json, rules_2025.json)"]
        PN_CALC["Liquidador PN (F210)<br/>Cédula General, Topes Art. 336"]
        PJ_CALC["Liquidador PJ (F110)<br/>Tasa Mínima TTD Art. 240"]
        CAL_ENGINE["Motor Calendario & NIT (Módulo 11)"]
    end

    subgraph StorageLayer["Persistencia en Memoria RAM"]
        REDIS["Redis Store (Memorystore / Upstash)"]
        REDIS_STATE["session:{id} (JSON State, TTL 24h)"]
        REDIS_PUBSUB["session:{id}:events (Pub/Sub Channel)"]
    end

    USER -- "Navega con Cookie tributia_sid" --> INGRESS
    AGENT -- "POST con Header X-Session-ID" --> INGRESS
    CLI -- "POST con Header X-Session-ID" --> INGRESS

    INGRESS --> MIDDLEWARE
    MIDDLEWARE --> ROUTER
    MIDDLEWARE --> SSE_EP

    ROUTER --> PN_CALC
    ROUTER --> PJ_CALC
    ROUTER --> CAL_ENGINE
    RULES --> PN_CALC
    RULES --> PJ_CALC

    ROUTER -- "Persiste estado & Publica evento" --> REDIS
    REDIS --> REDIS_STATE
    REDIS --> REDIS_PUBSUB

    REDIS_PUBSUB -- "Broadcast multihost" --> SSE_EP
    SSE_EP -- "Stream en vivo (SSE)" --> USER
```

---

## 3. Manejo de Concurrencia y Resiliencia en Frontend

- **Prevención de Condiciones de Carrera**:
  Al sincronizar desde la UI hacia el backend, se utiliza un *debounce* de 400ms y un flag `isApplyingRemoteState` que previene bucles infinitos de eco entre SSE y REST.
- **Respaldo Local (`localStorage`)**:
  Cada modificación se respalda instantáneamente en el almacenamiento del navegador (`tributia_draft_ses_...`). Si el usuario recarga la página o sufre un corte de red, el borrador se restaura al instante.
- **Guardarraíles ante Acciones Destructivas**:
  Acciones como *"Importar JSON"* o *"Limpiar Formulario"* ejecutan validaciones previas para desplegar un modal de confirmación antes de sobreescribir datos reales.
