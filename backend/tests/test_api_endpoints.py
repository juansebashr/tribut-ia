import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_ui_root_serving():
    response = client.get("/")
    assert response.status_code == 200
    assert "TributIA Colombia" in response.text


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_get_years():
    response = client.get("/api/v1/rules/years")
    assert response.status_code == 200
    years = response.json()
    assert 2026 in years
    assert 2022 in years


def test_get_rules_2026():
    response = client.get("/api/v1/rules/2026")
    assert response.status_code == 200
    data = response.json()
    assert data["tax_year"] == 2026
    assert data["uvt_value"] > 0
    assert "persona_natural" in data
    assert "persona_juridica" in data


def test_convert_uvt():
    response = client.post("/api/v1/rules/convert-uvt", json={
        "tax_year": 2026,
        "amount_cop": 104700000
    })
    assert response.status_code == 200
    data = response.json()
    assert data["amount_uvt"] > 0


def test_api_calculate_pn():
    payload = {
        "tax_year": 2026,
        "rentas_trabajo": 100000000,
        "aporte_salud_obligatorio": 4000000,
        "aporte_pension_obligatorio": 4000000,
        "aplica_dependiente_general": True
    }
    response = client.post("/api/v1/calculate/persona-natural/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_ingresos_brutos"] == 100000000
    assert data["ingreso_neto"] == 92000000
    assert len(data["audit_trace"]) > 0


def test_api_calculate_pj():
    payload = {
        "tax_year": 2026,
        "ingresos_brutos_operacionales": 500000000,
        "costos_procedentes": 200000000,
        "gastos_administracion": 100000000,
        "utilidad_contable_antes_impuestos": 200000000
    }
    response = client.post("/api/v1/calculate/persona-juridica/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["renta_bruta"] == 300000000
    assert data["impuesto_basico_renta"] > 0
    assert len(data["audit_trace"]) > 0
