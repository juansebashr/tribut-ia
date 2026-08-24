from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_ui_root_serving():
    response = client.get("/")
    assert response.status_code == 200
    assert "Fiscol" in response.text


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
    response = client.post(
        "/api/v1/rules/convert-uvt", json={"tax_year": 2026, "amount_cop": 104700000}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["amount_uvt"] > 0


def test_api_calculate_pn():
    payload = {
        "tax_year": 2026,
        "rentas_trabajo": 100000000,
        "aporte_salud_obligatorio": 4000000,
        "aporte_pension_obligatorio": 4000000,
        "aplica_dependiente_general": True,
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
        "utilidad_contable_antes_impuestos": 200000000,
    }
    response = client.post("/api/v1/calculate/persona-juridica/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["renta_bruta"] == 300000000
    assert data["impuesto_basico_renta"] > 0
    assert len(data["audit_trace"]) > 0
    assert "form_110_casillas" in data


def test_api_calculate_simple():
    payload = {
        "tax_year": 2025,
        "grupo_actividad": 2,
        "ingresos_brutos_nacionales": 250000000,
        "tarifa_ica_consolidada_x_mil": 7.0,
        "aportes_pension_empleador_ano": 5000000,
        "ventas_por_medios_electronicos": 100000000,
    }
    response = client.post("/api/v1/calculate/regimen-simple/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["grupo_actividad"] == 2
    assert data["impuesto_simple_consolidado"] > 0
    assert "form_260_casillas" in data
    assert len(data["audit_trace"]) > 0


def test_api_comparativa_simple():
    payload = {
        "tax_year": 2025,
        "tipo_persona": "juridica",
        "grupo_actividad": 2,
        "ingresos_brutos_anuales": 300000000,
        "costos_y_gastos_deducibles": 180000000,
        "aportes_pension_empleador": 6000000,
        "porcentaje_ventas_medios_electronicos": 50.0,
        "tarifa_ica_x_mil": 7.0,
        "numero_empleados_menos_10_smlmv": 2,
    }
    response = client.post("/api/v1/calculate/regimen-simple/comparativa", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "regimen_recomendado" in data
    assert data["total_carga_tributaria_ordinario"] > 0
    assert data["total_carga_tributaria_simple"] > 0


def test_seo_robots_txt():
    response = client.get("/robots.txt")
    assert response.status_code == 200
    assert "User-agent" in response.text
    assert "GPTBot" in response.text or "Googlebot" in response.text


def test_seo_sitemap_xml():
    response = client.get("/sitemap.xml")
    assert response.status_code == 200
    assert "urlset" in response.text
    assert "https://fiscol.co" in response.text


def test_llms_txt():
    response = client.get("/llms.txt")
    assert response.status_code == 200
    assert "Fiscol" in response.text


def test_llms_full_txt():
    response = client.get("/llms-full.txt")
    assert response.status_code == 200
    assert "Estatuto Tributario" in response.text


def test_favicon_endpoints():
    r_ico = client.get("/favicon.ico")
    assert r_ico.status_code == 200
    assert "image/x-icon" in r_ico.headers["content-type"]
    assert len(r_ico.content) > 1000

    r_svg = client.get("/favicon.svg")
    assert r_svg.status_code == 200
    assert "image/svg+xml" in r_svg.headers["content-type"]
    assert b"<svg" in r_svg.content

    for path in [
        "/favicon.png",
        "/favicon-32x32.png",
        "/favicon-16x16.png",
        "/apple-touch-icon.png",
    ]:
        r_png = client.get(path)
        assert r_png.status_code == 200
        assert "image/png" in r_png.headers["content-type"]
        assert len(r_png.content) > 500
