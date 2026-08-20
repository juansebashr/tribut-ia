from fastapi.testclient import TestClient

from app.main import app
from app.services.beneficios import (
    SimulacionAjusteArticulo73Request,
    calcular_ajuste_articulo_73,
    get_tabla_articulo_73,
)

client = TestClient(app)


def test_get_tabla_articulo_73_loads_successfully():
    tabla = get_tabla_articulo_73()
    assert len(tabla) == 70
    assert tabla[0].ano_adquisicion == "1955 y anteriores"
    assert tabla[0].acciones_aportes == 4664.64
    assert tabla[0].bienes_raices_urbanos == 36085.10
    assert tabla[-1].ano_adquisicion == "2024"
    assert tabla[-1].acciones_aportes == 1.05


def test_calcular_ajuste_articulo_73_inmueble_urbano():
    req = SimulacionAjusteArticulo73Request(
        ano_adquisicion="1995",
        tipo_activo="bienes_raices_urbanos",
        costo_adquisicion_historico_cop=20000000,
        precio_venta_estimado_cop=500000000,
        ano_gravable_enajenacion=2025,
    )
    res = calcular_ajuste_articulo_73(req)

    # 1995 urbanos factor is 23.50
    assert res.factor_multiplicador == 23.50
    assert res.costo_adquisicion_historico_cop == 20000000
    assert res.costo_fiscal_ajustado_art73_cop == 470000000
    assert res.incremento_costo_fiscal_cop == 450000000
    assert res.ganancia_sin_ajuste_cop == 480000000
    assert res.ganancia_con_ajuste_cop == 30000000
    assert res.ahorro_base_gravable_cop == 450000000
    assert res.es_ganancia_ocasional is True
    assert res.tarifa_ganancia_ocasional_pct == 15.0
    # Impuesto sin ajuste: 480M * 15% = 72M
    # Impuesto con ajuste: 30M * 15% = 4.5M
    # Ahorro impuesto: 67.5M
    assert res.impuesto_estimado_sin_ajuste_cop == 72000000
    assert res.impuesto_estimado_con_ajuste_cop == 4500000
    assert res.ahorro_impuesto_estimado_cop == 67500000
    assert len(res.pasos_calculo) >= 7


def test_calcular_ajuste_articulo_73_acciones():
    req = SimulacionAjusteArticulo73Request(
        ano_adquisicion="2010",
        tipo_activo="acciones_aportes",
        costo_adquisicion_historico_cop=50000000,
        precio_venta_estimado_cop=120000000,
        ano_gravable_enajenacion=2025,
    )
    res = calcular_ajuste_articulo_73(req)

    # 2010 acciones factor is 2.03
    assert res.factor_multiplicador == 2.03
    assert res.costo_fiscal_ajustado_art73_cop == 101500000
    assert res.ganancia_sin_ajuste_cop == 70000000
    assert res.ganancia_con_ajuste_cop == 18500000
    assert res.ahorro_base_gravable_cop == 51500000
    assert res.ahorro_impuesto_estimado_cop == round(51500000 * 0.15)


def test_api_endpoints_articulo_73():
    # Test GET table
    resp_tabla = client.get("/api/v1/beneficios/articulo-73/tabla")
    assert resp_tabla.status_code == 200
    data = resp_tabla.json()
    assert len(data) == 70

    # Test POST simulate
    payload = {
        "ano_adquisicion": "2015",
        "tipo_activo": "bienes_raices_rurales_agro",
        "costo_adquisicion_historico_cop": 100000000,
        "precio_venta_estimado_cop": 200000000,
        "ano_gravable_enajenacion": 2025,
    }
    resp_sim = client.post("/api/v1/beneficios/simular-articulo-73", json=payload)
    assert resp_sim.status_code == 200
    sim_data = resp_sim.json()
    assert sim_data["factor_multiplicador"] == 1.63
    assert sim_data["costo_fiscal_ajustado_art73_cop"] == 163000000
    assert sim_data["ahorro_impuesto_estimado_cop"] > 0
