from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.models.persona_juridica import PersonaJuridicaInput
from app.models.regimen_simple import ComparativaSimpleInput, RegimenSimpleInput
from app.services.beneficios import (
    LiquidacionSancionRequest,
    SimulacionAjusteArticulo73Request,
    SimulacionInmuebleAfcRequest,
    calcular_ajuste_articulo_73,
    calcular_exencion_inmueble_afc,
    calcular_sancion_tributaria,
    get_catalogo_beneficios,
    get_tabla_articulo_73,
    get_tabla_componente_inflacionario,
)
from app.services.liquidacion_pj import liquidar_persona_juridica
from app.services.liquidacion_simple import comparar_ordinario_vs_simple, liquidar_regimen_simple

client = TestClient(app)


def test_pj_all_regimes_and_surcharges_coverage():
    """Cubre todas las ramas de regímenes especiales y sobretasas en liquidacion_pj.py."""
    # 1. Zona Franca (20%)
    inp_zf = PersonaJuridicaInput(
        tax_year=2026,
        tipo_regimen="zona_franca",
        ingresos_brutos_operacionales=500000000.0,
        costos_procedentes=200000000.0,
    )
    out_zf = liquidar_persona_juridica(inp_zf)
    assert out_zf.tarifa_renta_aplicada == 0.20

    # 2. Hotelero (15%)
    inp_hot = PersonaJuridicaInput(
        tax_year=2026,
        tipo_regimen="hotelero",
        ingresos_brutos_operacionales=500000000.0,
        costos_procedentes=200000000.0,
    )
    out_hot = liquidar_persona_juridica(inp_hot)
    assert out_hot.tarifa_renta_aplicada == 0.15

    # 3. Cooperativa (20%)
    inp_coop = PersonaJuridicaInput(
        tax_year=2026,
        tipo_regimen="cooperativa",
        ingresos_brutos_operacionales=500000000.0,
        costos_procedentes=200000000.0,
    )
    out_coop = liquidar_persona_juridica(inp_coop)
    assert out_coop.tarifa_renta_aplicada == 0.20

    # 4. ZOMAC (tarifa escalonada / 50% de 35% = 17.5%)
    inp_zomac = PersonaJuridicaInput(
        tax_year=2026,
        tipo_regimen="zomac",
        ingresos_brutos_operacionales=500000000.0,
        costos_procedentes=200000000.0,
    )
    out_zomac = liquidar_persona_juridica(inp_zomac)
    assert out_zomac.tarifa_renta_aplicada == 0.175

    # 5. Tarifa personalizada override
    inp_cust = PersonaJuridicaInput(
        tax_year=2026,
        tarifa_personalizada=0.22,
        ingresos_brutos_operacionales=500000000.0,
    )
    out_cust = liquidar_persona_juridica(inp_cust)
    assert out_cust.tarifa_renta_aplicada == 0.22

    # 6. Sobretasa Hidroeléctrica y Minero-Petrolera
    inp_sur = PersonaJuridicaInput(
        tax_year=2026,
        custom_uvt=50000.0,
        ingresos_brutos_operacionales=3500000000.0,  # 70.000 UVT (> 50.000 UVT)
        aplica_sobretasa_hidroelectrica=True,
        sobretasa_minero_petroleo_pct=0.10,
        credito_fiscal_256_1=5000000.0,
        obras_por_impuestos_mod1=10000000.0,
        descuento_obras_mod2=8000000.0,
        compensacion_perdidas_fiscales=50000000.0,
        compensacion_exceso_renta_presuntiva=20000000.0,
        descuento_tributario_ica=20000000000.0,  # Excede c91
        otros_descuentos_tributarios=4000000.0,
    )
    out_sur = liquidar_persona_juridica(inp_sur)
    assert out_sur.puntos_adicionales_sobretasa == 0.13  # 0.03 hidro + 0.10 minero


def test_simple_all_groups_and_coverage_branches():
    """Cubre todas las ramas de los 6 grupos y opciones en liquidacion_simple.py."""
    uvt = 50000.0

    # Test Grupos 1 al 6 con diferentes ingresos
    for grupo, ingresos_uvt in [
        (1, 5000),
        (2, 25000),
        (3, 40000),
        (4, 15000),
        (5, 8000),
        (6, 60000),
    ]:
        inp = RegimenSimpleInput(
            tax_year=2026,
            custom_uvt=uvt,
            grupo_actividad=grupo,
            ingresos_brutos_nacionales=ingresos_uvt * uvt,
            componente_ica_territorial_fijo=1000000.0,
            gmf_pagado=2000000.0,
            retenciones_antes_pertenecer_simple=500000.0,
            anticipo_renta_ano_anterior=1000000.0,
            saldo_a_favor_simple_ano_anterior=800000.0,
            saldo_a_favor_inc_ano_anterior=200000.0,
            saldo_a_favor_go_ano_anterior=100000.0,
            ganancias_ocasionales_brutas=50000000.0,
            costos_ganancia_ocasional=30000000.0,
            ganancias_ocasionales_exentas=5000000.0,
            sanciones_simple=500000.0,
            sanciones_ica=100000.0,
            sanciones_inc=150000.0,
            sanciones_go=80000.0,
        )
        out = liquidar_regimen_simple(inp)
        assert out.grupo_actividad == grupo
        assert out.tarifa_simple_consolidada_pct > 0
        assert out.form_260_casillas.c980_pago_total > 0

    # Grupo con ingresos en 0
    inp_zero = RegimenSimpleInput(tax_year=2026, grupo_actividad=1, ingresos_brutos_nacionales=0.0)
    out_zero = liquidar_regimen_simple(inp_zero)
    assert out_zero.impuesto_simple_consolidado == 0.0


def test_comparativa_simple_options():
    """Valida ramas de la comparativa de regímenes."""
    # Caso 1: Persona Natural
    inp_pn = ComparativaSimpleInput(
        tax_year=2026,
        tipo_persona="natural",
        grupo_actividad=5,
        ingresos_brutos_anuales=200000000.0,
        costos_y_gastos_deducibles=40000000.0,
    )
    out_pn = comparar_ordinario_vs_simple(inp_pn)
    assert out_pn.impuesto_renta_ordinario > 0

    # Caso 2: Ingresos en 0
    inp_zero = ComparativaSimpleInput(
        tax_year=2026,
        ingresos_brutos_anuales=0.0,
        costos_y_gastos_deducibles=0.0,
    )
    out_zero = comparar_ordinario_vs_simple(inp_zero)
    assert out_zero.total_carga_tributaria_simple == 0.0


def test_regimen_simple_api_endpoints_exceptions():
    """Valida los endpoints FastAPI de régimen simple incluyendo manejo de errores."""
    # 1. Successful POST /calculate
    res1 = client.post(
        "/api/v1/calculate/regimen-simple/calculate",
        json={"tax_year": 2026, "grupo_actividad": 2, "ingresos_brutos_nacionales": 400000000.0},
    )
    assert res1.status_code == 200

    # 2. Successful POST /comparativa
    res2 = client.post(
        "/api/v1/calculate/regimen-simple/comparativa",
        json={"tax_year": 2026, "ingresos_brutos_anuales": 500000000.0},
    )
    assert res2.status_code == 200

    # 3. Exception branch test with mock
    with patch(
        "app.api.v1.endpoints.regimen_simple.liquidar_regimen_simple",
        side_effect=ValueError("Simulated Error"),
    ):
        res_err1 = client.post(
            "/api/v1/calculate/regimen-simple/calculate",
            json={
                "tax_year": 2026,
                "grupo_actividad": 2,
                "ingresos_brutos_nacionales": 400000000.0,
            },
        )
        assert res_err1.status_code == 400

    with patch(
        "app.api.v1.endpoints.regimen_simple.comparar_ordinario_vs_simple",
        side_effect=ValueError("Simulated Error Comparativa"),
    ):
        res_err2 = client.post(
            "/api/v1/calculate/regimen-simple/comparativa",
            json={"tax_year": 2026, "ingresos_brutos_anuales": 500000000.0},
        )
        assert res_err2.status_code == 400


def test_beneficios_catalogo_and_helpers_coverage():
    """Cubre funciones auxiliares de catálogo de beneficios y deducciones."""
    all_b = get_catalogo_beneficios()
    assert len(all_b) >= 8

    # Tablas auxiliares
    tabla_art73 = get_tabla_articulo_73()
    assert len(tabla_art73) == 70

    tabla_inf = get_tabla_componente_inflacionario()
    assert len(tabla_inf) >= 5

    # Ajuste Art. 73
    req_art73 = SimulacionAjusteArticulo73Request(
        ano_adquisicion="2010",
        tipo_activo="acciones_aportes",
        costo_adquisicion_historico_cop=100000000.0,
        precio_venta_estimado_cop=400000000.0,
        ano_gravable_enajenacion=2026,
    )
    aj = calcular_ajuste_articulo_73(req_art73)
    assert aj.costo_fiscal_ajustado_art73_cop > 100000000.0

    # Exención inmueble AFC
    req_afc = SimulacionInmuebleAfcRequest(
        precio_venta_cop=600000000.0,
        costo_adquisicion_historico_cop=300000000.0,
        monto_depositado_afc_o_vivienda_cop=250000000.0,
        ano_adquisicion="2015",
        metodo_costo_fiscal="historico",
    )
    res_afc = calcular_exencion_inmueble_afc(req_afc)
    assert res_afc.ganancia_ocasional_bruta_cop == 300000000.0
    assert res_afc.ahorro_total_impuesto_cop > 0


def test_sanciones_all_variations_coverage():
    """Cubre todas las ramas y tipos de sanción en calcular_sancion_tributaria."""
    # 1. Corrección con emplazamiento
    req_corr_emp = LiquidacionSancionRequest(
        tax_year=2026,
        tipo_sancion="correccion",
        monto_base_cop=50000000.0,
        es_voluntario_sin_emplazamiento=False,
    )
    res1 = calcular_sancion_tributaria(req_corr_emp)
    assert res1.sancion_plena_sin_reduccion_cop == 10000000.0

    # 2. Extemporaneidad con emplazamiento
    req_ext_emp = LiquidacionSancionRequest(
        tax_year=2026,
        tipo_sancion="extemporaneidad",
        monto_base_cop=50000000.0,
        meses_fraccion_retraso=3,
        es_voluntario_sin_emplazamiento=False,
    )
    res2 = calcular_sancion_tributaria(req_ext_emp)
    assert res2.sancion_plena_sin_reduccion_cop > 0

    # 3. Inexactitud proveedores ficticios
    req_falsas = LiquidacionSancionRequest(
        tax_year=2026,
        tipo_sancion="inexactitud_facturas_falsas",
        monto_base_cop=50000000.0,
    )
    res3 = calcular_sancion_tributaria(req_falsas)
    assert res3.sancion_plena_sin_reduccion_cop == 80000000.0  # 160%

    # 4. Inexactitud abuso tributario
    req_abuso = LiquidacionSancionRequest(
        tax_year=2026,
        tipo_sancion="inexactitud_abuso",
        monto_base_cop=50000000.0,
    )
    res4 = calcular_sancion_tributaria(req_abuso)
    assert res4.sancion_plena_sin_reduccion_cop == 100000000.0  # 200%

    # 5. Inexactitud requerimiento especial
    req_req_esp = LiquidacionSancionRequest(
        tax_year=2026,
        tipo_sancion="inexactitud_req_especial",
        monto_base_cop=50000000.0,
    )
    res5 = calcular_sancion_tributaria(req_req_esp)
    assert res5.sancion_plena_sin_reduccion_cop == 17500000.0  # 35%

    # 6. Inexactitud recurso de reconsideración
    req_recurso = LiquidacionSancionRequest(
        tax_year=2026,
        tipo_sancion="inexactitud_recurso",
        monto_base_cop=50000000.0,
    )
    res6 = calcular_sancion_tributaria(req_recurso)
    assert res6.sancion_plena_sin_reduccion_cop == 35000000.0  # 70%
