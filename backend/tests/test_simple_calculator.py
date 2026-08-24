from app.models.regimen_simple import ComparativaSimpleInput, RegimenSimpleInput
from app.services.liquidacion_simple import (
    comparar_ordinario_vs_simple,
    liquidar_regimen_simple,
)


def test_regimen_simple_grupo1_tiendas():
    """Valida la liquidación de Grupo 1 (Tiendas y Minimercados) con tarifa reducida."""
    input_data = RegimenSimpleInput(
        tax_year=2025,
        grupo_actividad=1,
        ingresos_brutos_nacionales=120000000,  # ~2.409 UVT (Rango 0 - 6.000 UVT -> Tarifa 1.2%)
        tarifa_ica_consolidada_x_mil=5.0,
        aportes_pension_empleador_ano=2400000,
        ventas_por_medios_electronicos=60000000,  # 0.5% = $300.000 COP
        anticipos_simple_pagados=[200000, 200000, 200000, 200000, 200000, 200000],  # 1.2M
    )

    result = liquidar_regimen_simple(input_data)

    # Tarifa 1.2%
    assert result.tarifa_simple_consolidada_pct == 1.2
    # Impuesto consolidado = 120M * 1.2% = 1.440.000
    assert result.impuesto_simple_consolidado == 1440000
    # ICA = 120M * 5 por mil = 600.000
    assert result.componente_ica_territorial == 600000
    # Componente nacional = 1.440.000 - 600.000 = 840.000
    assert result.componente_simple_nacional == 840000

    # Descuentos: 2.4M (pensión) + 300k (0.5% medios electrónicos) = 2.7M limitado a componente nacional (840k)
    assert result.total_descuentos_aplicados == 840000
    # Impuesto neto nacional = 0
    assert result.impuesto_neto_simple == 0

    # Formulario 260 Casillas
    f260 = result.form_260_casillas
    assert f260.c43_total_ingresos_brutos_sin_go == 120000000
    assert f260.c46_impuesto_simple == 1440000
    assert f260.c47_componente_ica_territorial == 600000
    assert f260.c48_valor_componente_simple_nacional == 840000
    assert f260.c52_total_descuentos == 840000
    assert f260.c53_impuesto_neto_simple == 0


def test_regimen_simple_grupo3_restaurante_con_inc():
    """Valida Grupo 3 (Restaurantes) con aplicación de INC del 8%."""
    input_data = RegimenSimpleInput(
        tax_year=2025,
        grupo_actividad=3,
        ingresos_brutos_nacionales=350000000,
        ingresos_servicio_comidas_bebidas=350000000,
        tarifa_ica_consolidada_x_mil=8.0,
        aportes_pension_empleador_ano=6000000,
        ventas_por_medios_electronicos=200000000,
        anticipos_simple_pagados=[1000000] * 6,
        anticipos_inc_pagados=[4000000] * 6,
    )

    result = liquidar_regimen_simple(input_data)

    # INC 8% sobre 350M = 28.000.000
    assert result.impuesto_inc_comidas_bebidas == 28000000
    assert result.total_anticipos_inc_pagados == 24000000
    assert result.saldo_a_pagar_inc == 4000000

    f260 = result.form_260_casillas
    assert f260.c69_ingresos_gravados_inc == 350000000
    assert f260.c70_impuesto_nacional_consumo == 28000000
    assert f260.c78_total_saldo_a_pagar_inc == 4000000


def test_comparativa_ordinario_vs_simple():
    """Valida la comparación de decisión tributaria entre Ordinario y SIMPLE."""
    input_data = ComparativaSimpleInput(
        tax_year=2025,
        tipo_persona="juridica",
        grupo_actividad=2,
        ingresos_brutos_anuales=400000000,
        costos_y_gastos_deducibles=240000000,  # Utilidad 160M
        aportes_pension_empleador=8000000,
        porcentaje_ventas_medios_electronicos=50.0,
        tarifa_ica_x_mil=7.0,
        numero_empleados_menos_10_smlmv=3,
    )

    comp = comparar_ordinario_vs_simple(input_data)

    # Renta Ordinaria = 160M * 35% = 56M + ICA 2.8M = 58.8M
    assert comp.renta_liquida_ordinaria == 160000000
    assert comp.impuesto_renta_ordinario == 56000000
    assert comp.total_carga_tributaria_ordinario == 58800000

    # SIMPLE resulta con menor carga
    assert comp.total_carga_tributaria_simple < comp.total_carga_tributaria_ordinario
    assert comp.ahorro_tributario_neto_cop > 0
    assert "SIMPLE" in comp.regimen_recomendado
