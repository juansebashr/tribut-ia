# Diagrama de Secuencia: Sincronización Bidireccional API ↔ UI en Redis

Este diagrama documenta la interacción reactiva y aislada entre un cliente externo (ej. Agente IA o script cURL con `X-Session-ID`), el Backend FastAPI en Cloud Run, Redis y el Navegador del usuario conectado vía Server-Sent Events (SSE).

```mermaid
sequenceDiagram
    autonumber
    actor Agente as 🤖 Agente IA / Script CLI
    participant API as 🚀 FastAPI (Cloud Run)
    participant Redis as ⚡ Redis (Key & PubSub)
    actor Browser as 🌐 Navegador del Usuario

    %% Conexión inicial
    Note over Browser, Redis: 1. Conexión Inicial y Auto-Aprovisionamiento de Sesión
    Browser->>API: GET / (sin sesión previa)
    API->>API: Genera UUID seguro (ses_9b8f2c...)
    API-->>Browser: HTML + Set-Cookie: tributia_sid=ses_9b8f2c...
    Browser->>API: GET /api/v1/session/events (Cookie tributia_sid)
    API->>Redis: Suscribir worker a canal session:ses_9b8f2c...:events
    API-->>Browser: HTTP 200 SSE stream abierto ("connected")

    %% Inyección externa
    Note over Agente, Browser: 2. Inyección Externa desde Agente / Script IA
    Agente->>API: POST /api/v1/session/state (Header X-Session-ID: ses_9b8f2c...)
    API->>API: Ejecuta liquidación automática (F210 + Art. 241)
    API->>Redis: SETEX session:ses_9b8f2c... (TTL 86.400s)
    API->>Redis: PUBLISH session:ses_9b8f2c...:events
    Redis-->>API: Notifica evento Pub/Sub al worker SSE
    API-->>Browser: SSE Push: event="state_update"
    Browser->>Browser: applyStateToUi(state) + showToast("⚡ Actualizado por Agente")
    Note over Browser: Renderiza Formulario 210, Casillas 42, 78, 97 y Termómetro

    %% Modificación manual en UI
    Note over Browser, Redis: 3. Modificación Manual en UI con Autoguardado
    Browser->>Browser: Usuario edita campo "Rentas de Trabajo"
    Browser->>Browser: saveLocalDraft() en localStorage
    Browser->>API: POST /api/v1/session/state?source=ui (Header X-Session-ID, Debounced)
    API->>Redis: SETEX session:ses_9b8f2c... (Renueva TTL +24h)

    %% Consulta externa de lo que está en pantalla
    Note over Agente, API: 4. Inspección del Estado por el Agente
    Agente->>API: GET /api/v1/session/state (Header X-Session-ID: ses_9b8f2c...)
    API->>Redis: GET session:ses_9b8f2c... (Renueva TTL)
    API-->>Agente: HTTP 200 { metadata, persona_natural, calculation_results }
```
