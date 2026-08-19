# Referencia de Endpoints REST — TributIA API (v1)

Base URL: `http://localhost:8000/api/v1`

---

## 🔒 Control de Acceso y Aislamiento de Sesión

Todos los endpoints del módulo `/session` aceptan la cabecera HTTP estándar **`X-Session-ID`** para aislar los datos en Redis:

```http
X-Session-ID: ses_9b8f2c3d4e5f6a7b
```

| Mecanismo | Origen | Comportamiento |
| :--- | :--- | :--- |
| **`X-Session-ID` (Header)** | Scripts CLI, Python, cURL, Agentes IA | Máxima prioridad. Direcciona lectura/escritura a esa sesión exacta en Redis. |
| **`?session_id=` (Query)** | Enlaces compartidos, Navegador | Segunda prioridad. Sincroniza la URL con la sesión de Redis. |
| **`tributia_sid` (Cookie)** | Navegador Web / Stream SSE | Tercera prioridad. Se envía automáticamente en conexiones `EventSource`. |
| **Auto-Generación** | Usuario nuevo sin sesión | Genera un UUIDv4 seguro (`ses_...`) y setea la cookie con TTL de 24 horas. |

---

## 1. Módulo de Sesión y Sincronización en Tiempo Real (`/session`)

### `GET /session/current`
Retorna la información y el identificador de la sesión activa asignada al cliente.

**Headers**:
- `X-Session-ID` (Opcional): Si se provee, retorna y valida esa sesión.

**Response 200 OK**:
```json
{
  "session_id": "ses_7c9e6679742540de",
  "ttl_seconds": 86400,
  "auth_mode": "header_or_cookie"
}
```

---

### `GET /session/state`
Obtiene el estado completo actual de la sesión en Redis (metadatos, datos de Persona Natural, Persona Jurídica y resultados de liquidación del Formulario 210 / 110).

**Headers**:
- `X-Session-ID: <session_id>`

**Response 200 OK**:
```json
{
  "session_id": "ses_7c9e6679742540de",
  "revision": 3,
  "metadata": {
    "nombre": "CARLOS ALBERTO PEREZ GOMEZ",
    "nit": "1022440206",
    "tax_year": 2025,
    "custom_uvt": 49799.0
  },
  "persona_natural": {
    "patrimonio_bruto": 850000000.0,
    "rentas_trabajo": 206083000.0,
    "aporte_salud_obligatorio": 8243320.0,
    "aporte_pension_obligatorio": 8243320.0
  },
  "calculation_results": {
    "persona_natural": {
      "renta_liquida_gravable": 123899340.0,
      "impuesto_bruto_renta": 27959123.0,
      "saldo_a_pagar": 0.0
    }
  }
}
```

---

### `POST /session/state`
Inyecta o actualiza datos en la sesión activa en Redis, ejecuta el recálculo tributario automático y publica un evento en el canal Pub/Sub `session:{id}:events` para actualizar la pantalla web conectada en tiempo real.

**Headers**:
- `Content-Type: application/json`
- `X-Session-ID: <session_id>`

**Query Params**:
- `source`: `"api"` (por defecto) o `"ui"`.

**Payload Request**:
```json
{
  "metadata": {
    "nombre": "CARLOS ALBERTO PEREZ",
    "nit": "1022440206",
    "tax_year": 2025
  },
  "persona_natural": {
    "rentas_trabajo": 206083000.0,
    "aporte_salud_obligatorio": 8243320.0,
    "aporte_pension_obligatorio": 8243320.0,
    "medicina_prepagada_anual": 7200000.0,
    "compras_factura_electronica": 15000000.0
  }
}
```

---

### `GET /session/events`
Canal de streaming Server-Sent Events (SSE) al que se conecta el navegador para recibir notificaciones en vivo.

**Headers**:
- `Accept: text/event-stream`
- Cookie `tributia_sid` automática o query param `?session_id=...`.

**Formato de Eventos SSE**:
```http
event: state_update
data: {"type": "state_update", "source": "api", "session_id": "ses_7c9e...", "revision": 4, "state": {...}}

event: ping
data: {"time": 1723456789.12}
```

---

### `POST /session/reset`
Restablece todos los datos de la sesión actual a sus valores iniciales en blanco.

**Headers**:
- `X-Session-ID: <session_id>`

---

## 2. Módulo de Liquidación Tributaria (`/calculate`)

### `POST /calculate/persona-natural/calculate`
Calcula la depuración de Renta para Personas Naturales (Cédula General, Ganancias Ocasionales y Formulario 210) sin persistir estado.

**Payload Request**:
```json
{
  "tax_year": 2025,
  "custom_uvt": 49799.0,
  "patrimonio_bruto": 850000000.0,
  "rentas_trabajo": 206083000.0,
  "aporte_salud_obligatorio": 8243320.0,
  "aporte_pension_obligatorio": 8243320.0,
  "medicina_prepagada_anual": 7200000.0,
  "compras_factura_electronica": 15000000.0
}
```

---

## 3. Módulo de Reglas y Parámetros (`/rules`)

- `GET /rules/years`: Lista de años gravables disponibles (`[2022, 2024, 2025, 2026]`).
- `GET /rules/{year}`: Matriz completa de reglas del año fiscal (UVT, límites, tarifas Art. 241).
- `GET /rules/uvt/convert`: Conversor dinámico entre UVT y pesos COP.

---

## 4. Módulo de Beneficios & Sanciones (`/beneficios`)

- `GET /beneficios/catalog`: Catálogo de beneficios y optimizaciones fiscales.
- `POST /beneficios/simular-auditoria`: Simulación del beneficio de auditoría (Art. 689-3 E.T. - firmeza en 6 o 12 meses).
- `POST /beneficios/simular-reduccion-sancion`: Reducción de sanciones por corrección o extemporaneidad (Art. 640 E.T.).

---

## 5. Módulo de Calendario Tributario (`/calendario`)

- `GET /calendario/vencimientos`: Calendario completo de vencimientos DIAN.
- `GET /calendario/nit/{nit}`: Consulta de fecha límite de declaración por NIT con cálculo del Dígito de Verificación (Módulo 11).
