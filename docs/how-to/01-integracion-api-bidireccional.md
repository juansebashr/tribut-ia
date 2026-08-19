# Guía How-To: Integración API Bidireccional en Tiempo Real (REST, SSE & Redis)

Esta guía explica cómo integrar scripts externos, terminales o agentes de Inteligencia Artificial con **TributIA** para inyectar datos en vivo a una sesión de usuario aislada en Redis y leer el estado actual de los formularios.

---

## 1. Control de Acceso por Sesión (`X-Session-ID`)

Para dirigir tus comandos a la pantalla exacta del usuario (y no colisionar con otros usuarios en Cloud Run), obtén el ID de sesión visible en la barra superior de la web (o cópialo con el botón **`📋 Copiar`**) y agrégalo en la cabecera `X-Session-ID`:

```bash
SESSION_ID="ses_9b8f2c3d4e5f"
```

---

## 2. Inyectar datos en la pantalla en vivo (API ➔ UI)

Para enviar un payload JSON y hacer que el navegador web del usuario se actualice al instante con animaciones, formato contable y casillas del Formulario 210:

```bash
curl -X POST "http://localhost:8000/api/v1/session/state?source=api" \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: $SESSION_ID" \
  -d '{
    "metadata": {
      "nombre": "CARLOS ALBERTO PEREZ GOMEZ",
      "nit": "1022440206",
      "tax_year": 2025
    },
    "persona_natural": {
      "patrimonio_bruto": 850000000,
      "rentas_trabajo": 206083000,
      "aporte_salud_obligatorio": 8243320,
      "aporte_pension_obligatorio": 8243320,
      "medicina_prepagada_anual": 7200000,
      "compras_factura_electronica": 15000000,
      "retenciones_fuente_practicadas": 26000000
    }
  }'
```

### Ejemplo en Python `requests` (para Agentes IA):
```python
import requests

session_id = "ses_9b8f2c3d4e5f"
api_url = "http://localhost:8000/api/v1/session/state?source=api"

headers = {
    "Content-Type": "application/json",
    "X-Session-ID": session_id
}

payload = {
    "metadata": {
        "nombre": "CARLOS ALBERTO PEREZ",
        "nit": "1022440206",
        "tax_year": 2025
    },
    "persona_natural": {
        "rentas_trabajo": 206_083_000,
        "aporte_salud_obligatorio": 8_243_320,
        "aporte_pension_obligatorio": 8_243_320,
        "medicina_prepagada_anual": 7_200_000,
        "compras_factura_electronica": 15_000_000,
        "retenciones_fuente_practicadas": 26_000_000
    }
}

response = requests.post(api_url, json=payload, headers=headers)
state = response.json()
print(f"Impuesto calculado en vivo: {state['calculation_results']['persona_natural']['impuesto_bruto_renta']}")
```

---

## 3. Inyección Automatizada con el Script del Skill

Puedes usar el script oficial del Skill `colombian-tax-assistant`:

```bash
# Inyectar payload consolidado directamente a la sesión activa:
python skills/colombian-tax-assistant/scripts/inyectar_tributia.py payload_declaracion.json \
  --api-url http://localhost:8000 \
  --session-id $SESSION_ID
```

---

## 4. Leer lo que el usuario tiene en pantalla (UI ➔ API)

Para inspeccionar en cualquier momento los datos exactos que el usuario está viendo o digitando en la interfaz gráfica:

```bash
curl -s http://localhost:8000/api/v1/session/state \
  -H "X-Session-ID: $SESSION_ID" | jq .
```

---

## 5. Escuchar eventos en vivo vía Server-Sent Events (SSE)

Para que un microservicio o bot escuche en tiempo real cada vez que la declaración cambia en pantalla:

```bash
curl -N -H "Accept: text/event-stream" \
  "http://localhost:8000/api/v1/session/events?session_id=$SESSION_ID"
```
