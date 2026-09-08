import pytest

from app.models.persona_natural import PersonaNaturalInput
from app.services.liquidacion_pn import liquidar_persona_natural


def test_persona_natural_excel_benchmark_2022():
    """Valida la liquidación contra el Excel original 'Calculador - Renta.xlsx' del año 2022."""
    input_data = PersonaNaturalInput(
        tax_year=2022,
        custom_uvt=38004,
        rentas_trabajo=77855856,
        viaticos=4000000,
        otros_ingresos_brutos=0,
        aporte_salud_obligatorio=2563292,
        aporte_pension_obligatorio=3154789,
        otros_incrngo=0,
        aplica_dependiente_general=True,
        medicina_prepagada_anual=0,
        intereses_vivienda_anual=0,
        gmf_4x1000_total=0,
        compras_factura_electronica=0,
        aportes_voluntarios_pension_afc=10068221,
        otras_rentas_exentas=0,
        descuentos_tributarios=0,
        retenciones_fuente_practicadas=0,
        anticipo_ano_anterior=0,
        saldo_a_favor_ano_anterior=0,
    )

    result = liquidar_persona_natural(input_data)

    # 1. Total Ingresos Brutos = 81.855.856
    assert result.total_ingresos_brutos == 81855856

    # 2. Total INCRNGO = 5.718.081
    assert result.total_incrngo == 5718081

    # 3. Total Ingresos Netos = 76.137.775
    assert result.ingreso_neto == 76137775

    # 4. Deducción Dependiente = 10% de 81.855.856 = 8.185.585.60
    assert pytest.approx(result.total_deducciones_aceptadas, 0.01) == 8185585.60

    # 5. Aporte AFC = 10.068.221
    assert result.total_rentas_exentas_previas == 10068221

    # 6. Renta Exenta Laboral 25% = (76.137.775 - 8.185.585.60 - 10.068.221) * 25% = 14.470.992.10
    assert pytest.approx(result.renta_exenta_laboral_25, 0.01) == 14470992.10

    # 7. Subtotal Alivios = 8.185.585.60 + 10.068.221 + 14.470.992.10 = 32.724.798.70
    assert pytest.approx(result.subtotal_alivios_antes_de_limite, 0.01) == 32724798.70

    # 8. Límite 40% del Ingreso Neto = 76.137.775 * 40% = 30.455.110
    assert pytest.approx(result.limite_conjunto_porcentaje_cop, 0.01) == 30455110

    # 9. Alivios Procedentes = 30.455.110
    assert pytest.approx(result.alivios_procedentes_finales, 0.01) == 30455110

    # 10. Renta Líquida Gravable = 76.137.775 - 30.455.110 = 45.682.665
    assert pytest.approx(result.renta_liquida_gravable, 1.0) == 45682665

    # 11. Renta Líquida en UVT = 45.682.665 / 38.004 = 1.202.0488 UVT
    assert pytest.approx(result.renta_liquida_gravable_uvt, 0.01) == 1202.05

    # 12. Impuesto de Renta = $809.000 COP (coincidencia exacta con la celda G8 del Excel)
    assert result.impuesto_bruto_renta == 809000
    assert result.saldo_a_pagar == 809000


def test_persona_natural_2026_con_dependientes_adicionales_y_compras():
    """Valida reglas tributarias de 2026 con dependientes adicionales (72 UVT c/u) y factura electrónica (1%)."""
    uvt_2026 = 52350
    input_data = PersonaNaturalInput(
        tax_year=2026,
        custom_uvt=uvt_2026,
        rentas_trabajo=120000000,
        viaticos=0,
        aporte_salud_obligatorio=4800000,
        aporte_pension_obligatorio=4800000,
        aplica_dependiente_general=True,
        numero_dependientes_adicionales_72uvt=2,  # 2 * 72 UVT = 144 UVT
        medicina_prepagada_anual=10000000,  # Tope 192 UVT ($10.051.200)
        intereses_vivienda_anual=15000000,  # Tope 1200 UVT ($62.820.000)
        gmf_4x1000_total=2000000,  # 50% = $1.000.000
        compras_factura_electronica=50000000,  # 1% = $500.000 (Tope 240 UVT)
        aportes_voluntarios_pension_afc=15000000,
        retenciones_fuente_practicadas=5000000,
    )

    result = liquidar_persona_natural(input_data)

    assert result.total_ingresos_brutos == 120000000
    assert result.total_incrngo == 9600000
    assert result.ingreso_neto == 110400000

    # Límite conjunto 2026: min(40% de 110.400.000 = 44.160.000, 1.340 UVT = 70.149.000)
    assert result.limite_conjunto_porcentaje_cop == 44160000
    assert result.limite_conjunto_aplicable_cop == 44160000

    # Renta líquida gravable = Ingreso neto (110.400.000) - Alivios 40% (44.160.000) - 2 Dep. Adic 72 UVT (7.538.400) - Deducción 1% Factura Elec (500.000)
    assert result.renta_liquida_gravable == 110400000 - 44160000 - (2 * 72 * uvt_2026) - 500000
    assert result.renta_liquida_gravable == 58201600
    assert result.impuesto_bruto_renta > 0
    assert len(result.audit_trace) >= 8


def test_anticipo_ano_siguiente_art_807():
    """Valida la liquidación de saldo a pagar con anticipo para el año siguiente (Art. 807 E.T.)."""
    # Escenario 1: Saldo a pagar previo + anticipo
    input_data = PersonaNaturalInput(
        tax_year=2025,
        custom_uvt=49799,
        rentas_trabajo=220000000,
        aporte_salud_obligatorio=8800000,
        aporte_pension_obligatorio=8800000,
        retenciones_fuente_practicadas=10722300,
        anticipo_ano_anterior=3388700,
        anticipo_ano_siguiente=6015000,
    )
    result = liquidar_persona_natural(input_data)
    assert result.saldo_a_pagar > 0
    assert result.anticipo_ano_siguiente == 6015000
    assert result.total_a_pagar == result.saldo_a_pagar + 6015000
    assert result.form_210_casillas["c133_anticipo_ano_siguiente"] == 6015000
    assert result.form_210_casillas["c980_total_a_pagar"] == result.total_a_pagar
    # Validar que audit trace incluye el paso del anticipo
    trace_steps = [item.step_id for item in result.audit_trace]
    assert "anticipo_ano_siguiente" in trace_steps

    # Escenario 2: Saldo a favor previo menor que el anticipo compensa parcialmente
    input_data_favor = PersonaNaturalInput(
        tax_year=2025,
        custom_uvt=49799,
        rentas_trabajo=150000000,
        aporte_salud_obligatorio=6000000,
        aporte_pension_obligatorio=6000000,
        retenciones_fuente_practicadas=10722300,
        anticipo_ano_anterior=3388700,
        anticipo_ano_siguiente=6015000,
    )
    res_favor = liquidar_persona_natural(input_data_favor)
    assert res_favor.saldo_a_pagar == 0
    assert res_favor.total_a_pagar == 2956000


def test_pn_calculadora_exactitud_aritmetica_vertical():
    """Verifica que en todo cálculo la liquidación cumpla la igualdad contable exacta:
    1. Ingreso Neto = Total Ingresos Brutos - Total INCRNGO (Casilla 91)
    2. Subtotal Alivios = Deducciones Sujetas + Total Rentas Exentas
    3. Alivios Procedentes = min(Subtotal Alivios, Límite Aplicable) (Casilla 92)
    4. Renta Líquida Gravable = Ingreso Neto - Alivios Procedentes - Deducciones Fuera 40% (Casilla 111)
    5. Impuesto a Cargo = Impuesto Renta + Impuesto Ganancias Ocasionales (Casilla 129)
    6. Saldo a Pagar = max(0, Impuesto a Cargo - Anticipos y Retenciones)
    7. Total a Pagar = Saldo a Pagar + Anticipo Siguiente
    """
    uvt = 49799
    input_data = PersonaNaturalInput(
        tax_year=2025,
        custom_uvt=uvt,
        rentas_trabajo=120000000,
        aporte_salud_obligatorio=4800000,
        aporte_pension_obligatorio=4800000,
        aplica_dependiente_general=True,
        medicina_prepagada_anual=6000000,
        intereses_vivienda_anual=12000000,
        gmf_4x1000_total=2000000,
        compras_factura_electronica=15000000,  # 1% = $150.000 (fuera de 40%)
        aportes_voluntarios_pension_afc=10000000,
        retenciones_fuente_practicadas=3000000,
        anticipo_ano_siguiente=2000000,
    )
    res = liquidar_persona_natural(input_data)

    # 1. Ingreso Neto
    assert res.ingreso_neto == res.total_ingresos_brutos - res.total_incrngo

    # 2. Subtotal alivios antes de límite
    expected_subtotal_alivios = (
        res.total_deducciones_sujetas_40 + res.total_rentas_exentas_aceptadas
    )
    assert pytest.approx(res.subtotal_alivios_antes_de_limite, 0.01) == expected_subtotal_alivios

    # 3. Límite conjunto 40% / 1.340 UVT
    assert res.limite_conjunto_aplicable_cop == min(
        res.limite_conjunto_porcentaje_cop, res.limite_conjunto_uvt_cop
    )
    assert res.alivios_procedentes_finales == min(
        res.subtotal_alivios_antes_de_limite, res.limite_conjunto_aplicable_cop
    )
    assert res.alivios_rechazados_por_limite == max(
        0.0, res.subtotal_alivios_antes_de_limite - res.alivios_procedentes_finales
    )

    # 4. Renta líquida gravable vertical exacta (Casilla 91 - Casilla 92 - Fuera 40% = Casilla 111)
    expected_renta_gravable = max(
        0.0, res.ingreso_neto - res.alivios_procedentes_finales - res.deducciones_fuera_limite_40
    )
    assert pytest.approx(res.renta_liquida_gravable, 0.01) == expected_renta_gravable

    # 5. Impuesto a cargo
    assert (
        res.total_impuesto_a_cargo == res.impuesto_neto_renta + res.impuesto_ganancias_ocasionales
    )

    # 6. Saldo a pagar y saldo a favor
    expected_saldo_pagar = max(0.0, res.total_impuesto_a_cargo - res.total_anticipos_y_retenciones)
    raw_saldo_favor = max(0.0, res.total_anticipos_y_retenciones - res.total_impuesto_a_cargo)
    assert pytest.approx(res.saldo_a_pagar, 0.01) == expected_saldo_pagar
    # Como el anticipo de $2.000.000 supera el saldo a favor bruto de $756.000,
    # el saldo a favor se consume totalmente dejando saldo a favor neto en $0 y total a pagar de $1.244.000
    expected_saldo_favor_neto = max(0.0, raw_saldo_favor - 2000000)
    assert pytest.approx(res.saldo_a_favor, 0.01) == expected_saldo_favor_neto

    # 7. Total a pagar con anticipo: si hay saldo a favor, compensa parcialmente el anticipo
    if res.saldo_a_pagar > 0:
        assert res.total_a_pagar == res.saldo_a_pagar + 2000000
    else:
        assert res.total_a_pagar == max(0.0, 2000000 - raw_saldo_favor)
        assert res.total_a_pagar == 1244000.0


def test_pn_calculadora_sin_superar_tope_40():
    """Verifica caso donde los alivios no superan el 40% ni 1.340 UVT: 100% aceptado."""
    uvt = 49799
    input_data = PersonaNaturalInput(
        tax_year=2025,
        custom_uvt=uvt,
        rentas_trabajo=100000000,
        aporte_salud_obligatorio=4000000,
        aporte_pension_obligatorio=4000000,
        aplica_dependiente_general=False,
        gmf_4x1000_total=1000000,  # 50% = 500.000
    )
    res = liquidar_persona_natural(input_data)
    # Ingreso neto = 92.000.000. Límite 40% = 36.800.000.
    # Deducciones = 500.000. Renta exenta 25% = (92M - 500k) * 25% = 22.875.000.
    # Total alivios = 23.375.000 < 36.800.000
    assert res.alivios_rechazados_por_limite == 0.0
    assert res.alivios_procedentes_finales == res.subtotal_alivios_antes_de_limite
    assert res.renta_liquida_gravable == res.ingreso_neto - res.alivios_procedentes_finales


def test_pn_calculadora_superando_tope_porcentual_40():
    """Verifica caso donde el 40% del ingreso neto restringe los alivios (tope porcentual)."""
    uvt = 49799
    input_data = PersonaNaturalInput(
        tax_year=2025,
        custom_uvt=uvt,
        rentas_trabajo=100000000,
        aporte_salud_obligatorio=4000000,
        aporte_pension_obligatorio=4000000,
        aplica_dependiente_general=True,  # 10% = 10.000.000
        intereses_vivienda_anual=20000000,  # 20.000.000
        medicina_prepagada_anual=8000000,  # 8.000.000
        aportes_voluntarios_pension_afc=15000000,  # 15.000.000
    )
    res = liquidar_persona_natural(input_data)
    # Ingreso neto = 92.000.000. Tope 40% = 36.800.000 COP (< 1.340 UVT = 66.730.660 COP).
    assert res.limite_conjunto_aplicable_cop == 36800000
    assert res.subtotal_alivios_antes_de_limite > 36800000
    assert res.alivios_procedentes_finales == 36800000
    assert res.alivios_rechazados_por_limite == res.subtotal_alivios_antes_de_limite - 36800000
    # Renta líquida gravable = 92.000.000 - 36.800.000 = 55.200.000
    assert pytest.approx(res.renta_liquida_gravable, 0.01) == 55200000


def test_pn_calculadora_superando_tope_uvt_1340():
    """Verifica caso de ingresos altos donde el tope de 1.340 UVT restringe los alivios (tope UVT)."""
    uvt = 49799
    tope_1340_cop = 1340 * uvt  # 66.730.660 COP
    input_data = PersonaNaturalInput(
        tax_year=2025,
        custom_uvt=uvt,
        rentas_trabajo=400000000,
        aporte_salud_obligatorio=16000000,
        aporte_pension_obligatorio=16000000,
        aplica_dependiente_general=True,
        intereses_vivienda_anual=30000000,
        medicina_prepagada_anual=10000000,
        aportes_voluntarios_pension_afc=50000000,
    )
    res = liquidar_persona_natural(input_data)
    # Ingreso neto = 368.000.000. 40% = 147.200.000 COP.
    # Tope 1.340 UVT = 66.730.660 COP -> Es el limitante aplicable
    assert res.limite_conjunto_aplicable_cop == tope_1340_cop
    assert res.alivios_procedentes_finales == tope_1340_cop
    assert res.alivios_rechazados_por_limite == res.subtotal_alivios_antes_de_limite - tope_1340_cop
    assert pytest.approx(res.renta_liquida_gravable, 0.01) == 368000000 - tope_1340_cop


def test_pn_calculadora_ganancias_ocasionales_y_f210():
    """Verifica integración de Ganancias Ocasionales y mapeo de casillas oficiales F210."""
    uvt = 49799
    input_data = PersonaNaturalInput(
        tax_year=2025,
        custom_uvt=uvt,
        rentas_trabajo=150000000,
        aporte_salud_obligatorio=6000000,
        aporte_pension_obligatorio=6000000,
        ganancias_ocasionales_brutas_activos_fijos=80000000,
        costos_ganancia_ocasional=50000000,
        ganancias_ocasionales_exentas_solicitadas=10000000,
        ganancias_ocasionales_brutas_loterias=5000000,
        retenciones_fuente_practicadas=8000000,
    )
    res = liquidar_persona_natural(input_data)

    # GO ordinaria = 80M - 50M - 10M = 20M @ 15% = 3.000.000 COP
    # GO lotería = 5M @ 20% = 1.000.000 COP
    # Total impuesto GO = 4.000.000 COP
    assert res.impuesto_ganancias_ocasionales == 4000000
    assert res.total_impuesto_a_cargo == res.impuesto_neto_renta + 4000000

    # Validar mapeo de casillas Formulario 210
    casillas = res.form_210_casillas
    assert casillas["c32_ingresos_brutos_trabajo"] == 150000000
    assert casillas["c33_incrngo_trabajo"] == 12000000
    assert casillas["c34_renta_liquida_trabajo"] == 138000000
    assert casillas["c91_total_renta_liquida_ordinaria_cedula_general"] == 138000000
    assert (
        casillas["c92_total_rentas_exentas_deducciones_limitadas"]
        == res.alivios_procedentes_finales
    )
    assert casillas["c111_total_rentas_liquidas_gravables"] == res.renta_liquida_gravable
    assert casillas["c126_impuesto_neto_renta"] == res.impuesto_neto_renta
    assert casillas["c127_impuesto_ganancias_ocasionales"] == 4000000
    assert casillas["c129_total_impuesto_a_cargo"] == res.total_impuesto_a_cargo
    assert casillas["c132_retenciones_fuente"] == 8000000


def test_pn_caso_real_papa_2025_completo():
    """Valida los números exactos del caso real (Juan Pablo Herrera - 2025):
    - Ingresos de trabajo: $220.000.000
    - INCRNGO: $14.441.593
    - Ingreso Neto (Casilla 91): $205.558.407
    - GMF deducible (50% de $7.404.866): $3.702.433
    - Cesantías exentas: $8.030.049
    - Renta exenta 25% laboral: $50.097.026
    - Total alivios: $61.829.508
    - Límite aplicable: $66.730.660 (1.340 UVT)
    - Alivios procedentes (Casilla 92): $61.829.508
    - Deducción 1% compras FE: $397.364
    - Renta líquida gravable (Casilla 111): $143.331.535
    - Retenciones: $10.722.300
    - Anticipo previo: $3.388.700
    - Anticipo siguiente: $6.015.000
    """
    uvt = 49799
    input_data = PersonaNaturalInput(
        tax_year=2025,
        custom_uvt=uvt,
        rentas_trabajo=220000000,
        aporte_salud_obligatorio=7220796,
        aporte_pension_obligatorio=7220797,
        aplica_dependiente_general=False,
        gmf_4x1000_total=7404866,
        compras_factura_electronica=39736438,
        otras_rentas_exentas=8030049,
        retenciones_fuente_practicadas=10722300,
        anticipo_ano_anterior=3388700,
        anticipo_ano_siguiente=6015000,
    )
    res = liquidar_persona_natural(input_data)

    assert res.total_ingresos_brutos == 220000000
    assert res.total_incrngo == 14441593
    assert res.ingreso_neto == 205558407
    assert pytest.approx(res.total_deducciones_sujetas_40, 1.0) == 3702433
    assert pytest.approx(res.deducciones_fuera_limite_40, 1.0) == 397364
    assert pytest.approx(res.renta_exenta_laboral_25, 1.0) == 50097026
    assert pytest.approx(res.total_rentas_exentas_aceptadas, 1.0) == 58127075
    assert pytest.approx(res.subtotal_alivios_antes_de_limite, 1.0) == 61829508

    # Límite conjunto 40% vs 1340 UVT:
    # 40% de 205.558.407 = 82.223.362,80. 1.340 UVT = 66.730.660. Menor = 66.730.660.
    assert pytest.approx(res.limite_conjunto_aplicable_cop, 1.0) == 66730660
    assert res.alivios_rechazados_por_limite == 0.0
    assert pytest.approx(res.alivios_procedentes_finales, 1.0) == 61829508

    # Renta líquida gravable = 205.558.407 - 61.829.508 - 397.364 = 143.331.535
    assert pytest.approx(res.renta_liquida_gravable, 1.0) == 143331535

    # Verificación de que Casilla 91 - Casilla 92 - Deducción 1% == Casilla 111
    assert (
        pytest.approx(
            res.ingreso_neto - res.alivios_procedentes_finales - res.deducciones_fuera_limite_40,
            1.0,
        )
        == res.renta_liquida_gravable
    )

    assert res.anticipo_ano_siguiente == 6015000
    assert res.total_a_pagar == res.saldo_a_pagar + 6015000
