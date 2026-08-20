# Referencia de Eventos SSE (Server-Sent Events)

Endpoint: `GET /api/v1/session/events?session_id={session_id}`
Content-Type: `text/event-stream`

---

## 1. Tipos de Eventos Transmitidos

### Evento: `connected`

Emitido inmediatamente al establecerse la conexión HTTP.

```text
event: connected
data: {"session_id": "default", "message": "Conectado al stream de eventos en vivo"}
```

### Evento: `state_update`

Emitido cada vez que un cliente externo o la interfaz actualiza los valores de la sesión.

```text
event: state_update
data: {
"session_id": "default",
"source": "api",
"state": {
"metadata": { "nombre": "MARIANA RESTREPO BOTERO", "nit": "9008765432" },
"persona_natural": { "rentas_trabajo": 700000000 },
"calculation_results": { "persona_natural": { "impuesto_bruto_renta": 162187000 } }
}
}
```

### Evento: `reset`

Emitido cuando la sesión es reiniciada a valores en blanco.

```text
event: reset
data: {"session_id": "default", "message": "Sesión restablecida"}
```
