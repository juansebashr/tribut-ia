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

    # Renta líquida gravable = Ingreso neto (110.400.000) - Alivios procedentes (44.160.000) - Deducción 1% Factura Elec (500.000)
    assert result.renta_liquida_gravable == 110400000 - 44160000 - 500000
    assert result.renta_liquida_gravable == 65740000
    assert result.impuesto_bruto_renta > 0
    assert len(result.audit_trace) >= 8
