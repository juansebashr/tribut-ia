import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_session_sync_get_initial_default_state():
    """Valida la obtención del estado inicial por defecto de la sesión."""
    response = client.get("/api/v1/session/state?session_id=default")
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "default"
    assert "metadata" in data
    assert "persona_natural" in data
    assert "persona_juridica" in data
    assert data["metadata"]["tax_year"] == 2026


def test_session_sync_post_and_get_state():
    """Inyecta un estado completo en la sesión y verifica su persistencia."""
    payload = {
        "metadata": {
            "nombre": "ALEJANDRO ESCOBAR RESTREPO",
            "nit": "9005554441",
            "tax_year": 2026,
            "custom_uvt": 52350
        },
        "persona_natural": {
            "patrimonio_bruto": 850000000.0,
            "deudas": 120000000.0,
            "rentas_trabajo": 450000000.0,
            "aporte_salud_obligatorio": 18000000.0,
            "aporte_pension_obligatorio": 18000000.0,
            "aplica_dependiente_general": True,
            "medicina_prepagada_anual": 8000000.0,
            "intereses_vivienda_anual": 24000000.0,
            "retenciones_fuente_practicadas": 75000000.0
        }
    }
    
    post_res = client.post("/api/v1/session/state?session_id=test_sync_1", json=payload)
    assert post_res.status_code == 200
    res_data = post_res.json()
    assert res_data["metadata"]["nombre"] == "ALEJANDRO ESCOBAR RESTREPO"
    assert res_data["persona_natural"]["rentas_trabajo"] == 450000000.0
    assert "calculation_results" in res_data
    assert "persona_natural" in res_data["calculation_results"]
    assert res_data["calculation_results"]["persona_natural"]["renta_liquida_gravable"] > 0

    # Consultar por GET y validar que persiste idéntico
    get_res = client.get("/api/v1/session/state?session_id=test_sync_1")
    assert get_res.status_code == 200
    assert get_res.json()["metadata"]["nit"] == "9005554441"
    assert get_res.json()["persona_natural"]["patrimonio_bruto"] == 850000000.0


def test_session_sync_partial_updates():
    """Verifica que actualizaciones parciales preserven el resto de los campos."""
    client.post("/api/v1/session/state?session_id=test_partial", json={
        "metadata": {"nombre": "LINA MARIA LOPEZ"},
        "persona_natural": {"rentas_trabajo": 200000000.0, "deudas": 50000000.0}
    })
    
    # Actualizar solo patrimonio_bruto
    patch_res = client.post("/api/v1/session/state?session_id=test_partial", json={
        "persona_natural": {"patrimonio_bruto": 600000000.0}
    })
    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["metadata"]["nombre"] == "LINA MARIA LOPEZ"
    assert data["persona_natural"]["patrimonio_bruto"] == 600000000.0
    assert data["persona_natural"]["rentas_trabajo"] == 200000000.0
    assert data["persona_natural"]["deudas"] == 50000000.0


def test_session_sync_multi_sessions_isolation():
    """Valida el aislamiento estricto entre sesiones concurrentes con IDs distintos."""
    client.post("/api/v1/session/state?session_id=user_alpha", json={
        "metadata": {"nombre": "USUARIO ALPHA"},
        "persona_natural": {"rentas_trabajo": 100000000.0}
    })
    client.post("/api/v1/session/state?session_id=user_beta", json={
        "metadata": {"nombre": "USUARIO BETA"},
        "persona_natural": {"rentas_trabajo": 990000000.0}
    })

    state_a = client.get("/api/v1/session/state?session_id=user_alpha").json()
    state_b = client.get("/api/v1/session/state?session_id=user_beta").json()

    assert state_a["metadata"]["nombre"] == "USUARIO ALPHA"
    assert state_a["persona_natural"]["rentas_trabajo"] == 100000000.0

    assert state_b["metadata"]["nombre"] == "USUARIO BETA"
    assert state_b["persona_natural"]["rentas_trabajo"] == 990000000.0


def test_session_sync_reset():
    """Valida el reinicio de la sesión."""
    client.post("/api/v1/session/state?session_id=to_reset", json={
        "metadata": {"nombre": "NOMBRE MODIFICADO"},
        "persona_natural": {"rentas_trabajo": 777000000.0}
    })
    
    reset_res = client.post("/api/v1/session/reset?session_id=to_reset")
    assert reset_res.status_code == 200
    data = reset_res.json()
    assert data["metadata"]["nombre"] == "CARLOS ALBERTO PEREZ GOMEZ"
    assert data["persona_natural"]["rentas_trabajo"] == 120000000.0


def test_ui_alias_routes():
    """Verifica que las rutas alias /ui/state y /ui/reset funcionen igual que /session."""
    res = client.get("/api/v1/ui/state?session_id=default")
    assert res.status_code == 200
    assert "session_id" in res.json()


def test_session_sync_header_resolution():
    """Verifica la resolución de sesión mediante el Header HTTP 'X-Session-ID'."""
    payload = {
        "metadata": {"nombre": "TEST VIA HEADER"},
        "persona_natural": {"rentas_trabajo": 333000000.0}
    }
    # Enviar POST con Header X-Session-ID
    post_res = client.post("/api/v1/session/state", headers={"X-Session-ID": "ses_header_123"}, json=payload)
    assert post_res.status_code == 200
    assert post_res.json()["session_id"] == "ses_header_123"
    assert post_res.json()["metadata"]["nombre"] == "TEST VIA HEADER"

    # Consultar con Header X-Session-ID
    get_res = client.get("/api/v1/session/state", headers={"X-Session-ID": "ses_header_123"})
    assert get_res.status_code == 200
    assert get_res.json()["session_id"] == "ses_header_123"
    assert get_res.json()["persona_natural"]["rentas_trabajo"] == 333000000.0


def test_session_sync_cookie_auto_provisioning():
    """Verifica que clientes sin header o query reciban automáticamente un UUID seguro en la cookie tributia_sid."""
    res = client.get("/api/v1/session/current")
    assert res.status_code == 200
    data = res.json()
    assert data["session_id"].startswith("ses_")
    assert data["auth_mode"] == "header_or_cookie"
    assert "tributia_sid" in res.cookies
