# Diagrama de Secuencia: Sincronizacion Bidireccional API <-> UI

Este diagrama documenta la interaccion reactiva entre un cliente externo (ej. Agente IA o script cURL), el Backend FastAPI y el Navegador del usuario conectado via Server-Sent Events (SSE).

```mermaid
sequenceDiagram
    autonumber
    actor Agente as Agente IA / API Client
    participant API as FastAPI Backend
    participant Store as Session Store (Memory)
    participant SSE as SSE Event Stream
    actor Browser as Navegador (UI Web)

    %% Conexion inicial
    Note over Browser, SSE: El navegador inicia la conexion reactiva
    Browser->>API: GET /api/v1/session/events?session_id=default
    API-->>Browser: HTTP 200 (text/event-stream)
    API->>Store: Registrar suscriptor (asyncio.Queue)
    API-->>Browser: Event: "connected" (Estado Conectado)

    %% Inyeccion desde el exterior
    Note over Agente, Browser: Flujo 1: Inyeccion de datos externa (API -> UI)
    Agente->>API: POST /api/v1/session/state (payload JSON $700M)
    API->>API: Ejecuta liquidacion automatica en el motor
    API->>Store: Actualizar SessionState(inputs + results)
    Store->>SSE: _broadcast(event="state_update", source="api")
    SSE-->>Browser: SSE Push "state_update"
    Browser->>Browser: applyStateToUi(state)
    Note over Browser: Aplica mascara contable ($700.000.000),<br/>actualiza Formulario 210 y Termometro 35%

    %% Modificacion manual en UI
    Note over Browser, Agente: Flujo 2: Modificacion manual en UI (UI -> API)
    Browser->>Browser: Usuario edita campo "Rentas de Trabajo"
    Browser->>API: POST /api/v1/calculate/persona-natural/calculate
    API-->>Browser: Retorna nuevo resultado liquidado
    Browser->>Browser: Renderiza Formulario 210 y KPIs
    Browser->>API: POST /api/v1/session/state?source=ui (Debounced 400ms)
    API->>Store: Actualiza SessionState en memoria

    %% Consulta externa de lo que esta en pantalla
    Agente->>API: GET /api/v1/session/state
    API->>Store: Leer SessionState actual
    API-->>Agente: HTTP 200 { metadata, persona_natural, calculation_results }
```
