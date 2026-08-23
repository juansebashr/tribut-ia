from fastapi.testclient import TestClient

from app.main import app
from app.services.beneficios import (
    SimulacionCombinabilidadRequest,
    SimulacionComponenteInflacionarioRequest,
    calcular_componente_inflacionario,
    get_tabla_componente_inflacionario,
    simular_combinabilidad_inflacion_art73,
)

client = TestClient(app)


def test_tabla_componente_inflacionario_loading():
    """Valida que la tabla histórica de decretos y porcentajes del componente inflacionario se cargue correctamente."""
    tabla = get_tabla_componente_inflacionario()
    assert len(tabla) >= 9
    anos = {item.ano_gravable for item in tabla}
    assert 2023 in anos
    assert 2024 in anos
    assert 2026 in anos

    # Verificar datos específicos del año 2023 (Decreto 1006 de 2024)
    item_2023 = next(i for i in tabla if i.ano_gravable == 2023)
    assert item_2023.porcentaje_rendimientos_nacionales == 55.43
    assert item_2023.decreto_reglamentario == "Decreto 1006 de 2024"
    assert item_2023.reajuste_fiscal_art70_pct == 10.97


def test_calcular_componente_inflacionario_cdt_2023():
    """Valida la liquidación de INCRNGO en CDT bancario con Decreto 1006/2024 (55,43%)."""
    req = SimulacionComponenteInflacionarioRequest(
        tax_year=2023,
        tipo_instrumento="nacional_financiero",
        monto_bruto_cop=10000000.0,  # 10M rendimientos
        tarifa_marginal_estimada_pct=28.0,
    )
    res = calcular_componente_inflacionario(req)

    assert res.tax_year == 2023
    assert res.porcentaje_inflacionario_aplicado == 55.43
    # INCRNGO = 10M * 55.43% = 5.543.000 (Casilla 59)
    assert res.monto_incrngo_no_gravado_cop == 5543000.0
    # Rendimiento gravable real = 10M - 5.543.000 = 4.457.000 (Casilla 60)
    assert res.monto_gravable_real_cop == 4457000.0
    # Ahorro estimado = 5.543.000 * 28% = 1.552.040
    assert res.ahorro_estimado_impuesto_cop == 1552040.0
    assert res.casilla_f210_numero == 59
    assert res.combinabilidad_art73["combinable_con_art73"] is True


def test_calcular_componente_inflacionario_fics_2024():
    """Valida la liquidación de utilidades en FICs/fondos mutuos con Decreto 0572/2025."""
    req = SimulacionComponenteInflacionarioRequest(
        tax_year=2024,
        tipo_instrumento="fics_fondos_mutuos",
        monto_bruto_cop=20000000.0,  # 20M
        tarifa_marginal_estimada_pct=33.0,
    )
    res = calcular_componente_inflacionario(req)

    assert res.tax_year == 2024
    assert res.porcentaje_inflacionario_aplicado == 60.32
    assert res.monto_incrngo_no_gravado_cop == 12064000.0
    assert res.monto_gravable_real_cop == 7936000.0
    assert res.ahorro_estimado_impuesto_cop == 3981120.0


def test_calcular_componente_inflacionario_gastos_intereses_art118():
    """Valida la porción no deducible de intereses pagados según Art. 81-1 y 118 E.T."""
    req = SimulacionComponenteInflacionarioRequest(
        tax_year=2023,
        tipo_instrumento="gastos_intereses_costo",
        monto_bruto_cop=10000000.0,
        tarifa_marginal_estimada_pct=28.0,
    )
    res = calcular_componente_inflacionario(req)

    # 55.43% no deducible = 5.543.000 COP
    assert res.monto_no_deducible_intereses_cop == 5543000.0
    # Deducible real = 4.457.000 COP (Casilla 61)
    assert res.monto_deducible_intereses_reales_cop == 4457000.0
    assert res.casilla_f210_numero == 61


def test_calcular_componente_inflacionario_personalizado():
    """Valida la simulación con porcentaje personalizado de inflación."""
    req = SimulacionComponenteInflacionarioRequest(
        tax_year=2025,
        tipo_instrumento="nacional_financiero",
        monto_bruto_cop=50000000.0,
        porcentaje_personalizado_pct=48.50,
        tarifa_marginal_estimada_pct=35.0,
    )
    res = calcular_componente_inflacionario(req)

    assert res.es_porcentaje_personalizado is True
    assert res.porcentaje_inflacionario_aplicado == 48.50
    assert res.monto_incrngo_no_gravado_cop == 24250000.0
    assert res.monto_gravable_real_cop == 25750000.0
    assert res.ahorro_estimado_impuesto_cop == 8487500.0


def test_simular_combinabilidad_inflacion_art73():
    """Valida la simulación combinada de Componente Inflacionario (Rentas de Capital) + Reajuste Art. 73 (Ganancias Ocasionales)."""
    req = SimulacionCombinabilidadRequest(
        tax_year=2025,
        rendimientos_financieros_brutos_cop=20000000.0,  # $20M CDT
        ano_adquisicion_activo="2010",
        tipo_activo="bienes_raices_urbanos",
        costo_historico_activo_cop=100000000.0,  # $100M compra en 2010
        precio_venta_activo_cop=450000000.0,  # $450M venta en 2025
        tarifa_marginal_renta_pct=28.0,
    )
    res = simular_combinabilidad_inflacion_art73(req)

    # 1. Beneficio en Rentas de Capital
    assert res.se_pueden_combinar is True
    assert res.rendimientos_brutos_cop == 20000000.0
    assert res.incrngo_inflacionario_cop > 0
    assert res.ahorro_renta_capital_cop > 0

    # 2. Beneficio en Ganancia Ocasional con Art. 73
    assert res.factor_art73_aplicado > 1.0
    assert res.costo_ajustado_art73_cop > 100000000.0
    assert res.ahorro_impuesto_go_cop > 0

    # 3. Consolidación
    assert (
        res.ahorro_total_combinado_cop == res.ahorro_renta_capital_cop + res.ahorro_impuesto_go_cop
    )
    assert "SÍ, AMBOS BENEFICIOS SE PUEDEN COMBINAR" in res.conclusion_juridica
    assert (
        "no se puede aplicar simultáneamente el reajuste ordinario anual del Art. 70"
        in res.advertencia_art70_vs_art73
    )


def test_api_endpoints_componente_inflacionario():
    """Valida los endpoints REST del componente inflacionario."""
    # 1. GET /tabla
    res_tabla = client.get("/api/v1/beneficios/componente-inflacionario/tabla")
    assert res_tabla.status_code == 200
    data_tabla = res_tabla.json()
    assert isinstance(data_tabla, list)
    assert len(data_tabla) >= 9

    # 2. POST /simular-componente-inflacionario
    res_sim = client.post(
        "/api/v1/beneficios/simular-componente-inflacionario",
        json={
            "tax_year": 2023,
            "tipo_instrumento": "nacional_financiero",
            "monto_bruto_cop": 15000000,
            "tarifa_marginal_estimada_pct": 28.0,
        },
    )
    assert res_sim.status_code == 200
    data_sim = res_sim.json()
    assert data_sim["tax_year"] == 2023
    assert data_sim["monto_incrngo_no_gravado_cop"] == 8314500.0

    # 3. POST /simular-combinabilidad-inflacion-art73
    res_comb = client.post(
        "/api/v1/beneficios/simular-combinabilidad-inflacion-art73",
        json={
            "tax_year": 2025,
            "rendimientos_financieros_brutos_cop": 10000000,
            "ano_adquisicion_activo": "2015",
            "tipo_activo": "bienes_raices_urbanos",
            "costo_historico_activo_cop": 80000000,
            "precio_venta_activo_cop": 300000000,
            "tarifa_marginal_renta_pct": 28.0,
        },
    )
    assert res_comb.status_code == 200
    data_comb = res_comb.json()
    assert data_comb["se_pueden_combinar"] is True
    assert data_comb["ahorro_total_combinado_cop"] > 0
