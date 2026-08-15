# Referencia de Endpoints REST — TributIA API (v1)

Base URL: `http://localhost:8000/api/v1`

---

## 1. Módulo de Liquidación Tributaria (`/calculate`)

### `POST /calculate/persona-natural/calculate`
Calcula la depuración de Renta para Personas Naturales (Cédula General, Ganancias Ocasionales y Formulario 210).

**Payload Request**:
```json
{
"tax_year": 2026,
"custom_uvt": 52350,
"patrimonio_bruto": 1200000000.0,
"deudas": 200000000.0,
"rentas_trabajo": 700000000.0,
"aporte_salud_obligatorio": 28000000.0,
"aporte_pension_obligatorio": 28000000.0,
"medicina_prepagada_anual": 10051200.0,
"intereses_vivienda_anual": 62820000.0,
"compras_factura_electronica": 20000000.0,
"retenciones_fuente_practicadas": 140000000.0
}
```

**Response 200 OK**:
```json
{
"tax_year": 2026,
"uvt_value": 52350.0,
"renta_liquida_gravable": 573851000.0,
"renta_liquida_gravable_uvt": 10961.81,
"tarifa_marginal_maxima": 0.35,
"impuesto_bruto_renta": 162187000.0,
"saldo_a_pagar": 22187000.0,
"saldo_a_favor": 0.0,
"form_210_casillas": {
"c33_ingresos_brutos_trabajo": 700000000.0,
"c34_incrngo_trabajo": 56000000.0,
"c39_renta_liquida_gravable_trabajo": 573851000.0,
"c108_impuesto_rentas_liquidas_gravables": 162187000.0,
"c134_saldo_pagar_impuesto": 22187000.0
},
"audit_trace": []
}
```

---

## 2. Módulo de Sincronización de Estado (`/session` y `/ui`)

### `GET /session/state`
Obtiene el estado completo actual de la interfaz y los resultados de cálculo.

### `POST /session/state`
Actualiza el estado de la sesión, ejecuta liquidación reactiva y transmite un evento SSE a los navegadores conectados.

### `GET /session/events`
Stream SSE en tiempo real (`text/event-stream`).

### `POST /session/reset`
Restablece la sesión activa a valores en blanco.

---

## 3. Módulo de Reglas y Parámetros (`/rules`)

### `GET /rules/years`
Retorna la lista de años gravables soportados: `[2022, 2024, 2025, 2026]`.

### `GET /rules/{year}?custom_uvt=52350`
Retorna la matriz de reglas legales para el año especificado.

