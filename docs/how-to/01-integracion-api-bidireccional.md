# 🛠️ Guía How-To: Integración API Bidireccional en Tiempo Real (REST & SSE)

Esta guía explica cómo integrar scripts externos o agentes de Inteligencia Artificial con TributIA para inyectar datos en vivo a la pantalla web y leer el estado actual de los formularios.

---

## 1. Inyectar datos en la pantalla en vivo (API ➔ UI)

Para enviar un payload JSON y hacer que el navegador web del usuario se actualice al instante con animaciones y formato contable:

```bash
curl -X POST http://localhost:8000/api/v1/session/state \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "nombre": "MARIANA RESTREPO BOTERO",
      "nit": "9008765432"
    },
    "persona_natural": {
      "rentas_trabajo": 700000000,
      "aporte_salud_obligatorio": 28000000,
      "aporte_pension_obligatorio": 28000000,
      "medicina_prepagada_anual": 10051200,
      "intereses_vivienda_anual": 62820000,
      "retenciones_fuente_practicadas": 140000000
    }
  }'
```

### Ejemplo en Python `requests`:
```python
import requests

payload = {
    "persona_natural": {
        "rentas_trabajo": 250_000_000,
        "aporte_salud_obligatorio": 10_000_000,
        "aporte_pension_obligatorio": 10_000_000,
        "retenciones_fuente_practicadas": 15_000_000
    }
}
response = requests.post("http://localhost:8000/api/v1/session/state", json=payload)
print("Estado sincronizado:", response.json()["status"])
```

---

## 2. Leer lo que el usuario tiene en pantalla (UI ➔ API)

Para inspeccionar en cualquier momento los datos exactos que el usuario está viendo o digitando en la interfaz gráfica:

```bash
curl -s http://localhost:8000/api/v1/session/state | jq .
```

Respuesta JSON estructurada:
```json
{
  "session_id": "default",
  "metadata": {
    "nombre": "CARLOS ALBERTO PEREZ GOMEZ",
    "nit": "1234567890",
    "tax_year": 2026,
    "custom_uvt": 52350
  },
  "persona_natural": {
    "rentas_trabajo": 120000000,
    "aporte_salud_obligatorio": 4800000,
    "aporte_pension_obligatorio": 4800000
  },
  "calculation_results": {
    "persona_natural": {
      "renta_liquida_gravable": 88643500,
      "impuesto_bruto_renta": 5996000,
      "tarifa_marginal_maxima": 0.19
    }
  }
}
```

---

## 3. Escuchar Eventos en Vivo mediante Server-Sent Events (SSE)

Para conectarte al stream en tiempo real:

```bash
curl -N http://localhost:8000/api/v1/session/events?session_id=default
```
