from fastapi.testclient import TestClient

from app.main import app
from app.models.retefuente import (
    RetefuenteF350Input,
    RetefuenteLaboralInput,
)
from app.services.liquidacion_retefuente import (
    calcular_formulario_350,
    calcular_retefuente_laboral_art383,
    obtener_tabla_maestra_retefuente,
)

client = TestClient(app)


def test_retefuente_laboral_salario_bajo_sin_retencion():
    """Salario de $4.000.000 mensual debe quedar en el rango de 0% (hasta 95 UVT)."""
    payload = RetefuenteLaboralInput(
        tax_year=2026,
        salario_basico=4000000.0,
        aporte_salud_obligatorio=160000.0,
        aporte_pension_obligatorio=160000.0,
        solicitar_25pct_exenta_laboral=True,
    )
    res = calcular_retefuente_laboral_art383(payload)
    assert res.total_ingresos_brutos_laborales == 4000000.0
    assert res.total_incrngo_seguridad_social == 320000.0
    assert res.ingreso_laboral_neto == 3680000.0
    assert res.retencion_fuente_pesos == 0.0
    assert "0 a 95 UVT" in res.rango_tabla_art383


def test_retefuente_laboral_salario_alto_con_retencion_y_deducciones():
    """Salario de $15.000.000 mensual con medicina prepagada, dependientes y 25% exenta."""
    payload = RetefuenteLaboralInput(
        tax_year=2026,
        custom_uvt=50000.0,
        salario_basico=15000000.0,
        comisiones_horas_extras=2000000.0,
        aporte_salud_obligatorio=680000.0,
        aporte_pension_obligatorio=680000.0,
        intereses_vivienda_mes=1500000.0,
        medicina_prepagada_mes=500000.0,
        aplica_dependiente_10pct=True,
        numero_dependientes_adicionales_72uvt=1,
        solicitar_25pct_exenta_laboral=True,
    )
    res = calcular_retefuente_laboral_art383(payload)
    assert res.total_ingresos_brutos_laborales == 17000000.0
    assert res.total_incrngo_seguridad_social == 1360000.0
    assert res.ingreso_laboral_neto == 15640000.0
    assert res.total_deducciones_aceptadas > 0.0
    assert res.renta_exenta_laboral_25_aceptada > 0.0
    assert res.base_gravable_depurada_cop > 0.0
    assert res.retencion_fuente_pesos > 0.0
    assert len(res.audit_trace) >= 6


def test_retefuente_f350_liquidacion_completa():
    """Valida la liquidación del Formulario 350 con compras, servicios, honorarios, autorretención y ReteIVA."""
    payload = RetefuenteF350Input(
        tax_year=2026,
        custom_uvt=50000.0,
        periodo_mes=3,
        razon_social="DISTRIBUIDORA ANDINA S.A.S.",
        nit="900987654",
        dv="3",
        base_rentas_trabajo=25000000.0,
        retencion_rentas_trabajo=1250000.0,
        base_honorarios_declarante=10000000.0,  # 11% = 1.100.000
        base_honorarios_no_declarante=5000000.0,  # 10% = 500.000
        base_servicios_declarante=20000000.0,  # 4% = 800.000
        base_servicios_no_declarante=0.0,
        base_servicios_transporte_carga=10000000.0,  # 1% = 100.000
        base_compras_declarante=50000000.0,  # 2.5% = 1.250.000
        base_compras_no_declarante=0.0,
        base_arrendamiento_inmuebles=8000000.0,  # 3.5% = 280.000
        base_arrendamiento_muebles=2000000.0,  # 4% = 80.000
        base_rendimientos_financieros=1000000.0,  # 7% = 70.000
        base_enajenacion_activos_fijos=0.0,
        base_pagos_exterior_servicios=5000000.0,  # 20% = 1.000.000
        base_pagos_exterior_paraisos=0.0,
        ingresos_brutos_propios_mes=100000000.0,
        tarifa_autorretencion_especial_pct=0.55,  # 0.55% = 550.000
        otras_autorretenciones_valor=0.0,
        base_iva_sujeto_reteiva=19000000.0,  # 15% = 2.850.000
        reteiva_servicios_exterior=0.0,
        base_impuesto_timbre=0.0,
        tarifa_timbre_pct=0.0,
        sanciones=0.0,
    )
    res = calcular_formulario_350(payload)

    # Verificación de totales y casillas
    assert res.total_bases_renta > 0
    assert res.casillas.c42_ret_rentas_trabajo == 1250000.0
    assert res.casillas.c43_ret_honorarios == 1600000.0  # 1.100.000 + 500.000
    assert res.casillas.c45_ret_servicios == 900000.0  # 800.000 + 100.000
    assert res.casillas.c49_ret_compras == 1250000.0
    assert res.casillas.c62_autorretencion_especial_decreto_2201 == 550000.0
    assert res.casillas.c68_retencion_iva_practicada == 2850000.0
    assert res.total_a_pagar > 0
    assert res.casillas.c84_total_saldo_a_pagar == res.total_a_pagar


def test_tabla_maestra_retenciones():
    """Valida la generación de la tabla de retenciones."""
    items = obtener_tabla_maestra_retefuente(2026, custom_uvt=50000.0)
    assert len(items) >= 10
    compras = next(it for it in items if it.id == "comp_gen")
    assert compras.base_minima_uvt == 27.0
    assert compras.base_minima_cop == 1350000.0  # 27 * 50.000
    assert compras.tarifa_declarante == 2.5


def test_api_endpoints_retefuente():
    """Valida los endpoints FastAPI de Retefuente."""
    # 1. Laboral
    res_lab = client.post(
        "/api/v1/calculate/retefuente/laboral",
        json={
            "tax_year": 2026,
            "salario_basico": 8000000,
            "solicitar_25pct_exenta_laboral": True,
        },
    )
    assert res_lab.status_code == 200
    data_lab = res_lab.json()
    assert "retencion_fuente_pesos" in data_lab

    # 2. Formulario 350
    res_f350 = client.post(
        "/api/v1/calculate/retefuente/f350",
        json={
            "tax_year": 2026,
            "periodo_mes": 1,
            "base_compras_declarante": 10000000,
            "ingresos_brutos_propios_mes": 50000000,
            "tarifa_autorretencion_especial_pct": 0.55,
        },
    )
    assert res_f350.status_code == 200
    data_f350 = res_f350.json()
    assert data_f350["casillas"]["c49_ret_compras"] == 250000.0
    assert data_f350["total_a_pagar"] > 0

    # 3. Tabla retenciones
    res_tab = client.get("/api/v1/calculate/retefuente/tabla-retenciones?year=2026")
    assert res_tab.status_code == 200
    data_tab = res_tab.json()
    assert len(data_tab) > 0
