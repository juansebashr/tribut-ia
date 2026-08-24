from app.models.persona_juridica import PersonaJuridicaInput
from app.services.liquidacion_pj import liquidar_persona_juridica


def test_persona_juridica_formulario_110_estandar():
    """Valida la liquidación de Formulario 110 para una sociedad con tarifa general del 35%."""
    input_data = PersonaJuridicaInput(
        tax_year=2025,
        ingresos_brutos_operacionales=1000000000,
        ingresos_brutos_no_operacionales=50000000,
        devoluciones_rebajas_descuentos=20000000,
        ingresos_no_constitutivos_renta=10000000,
        costos_procedentes=600000000,
        gastos_administracion=150000000,
        gastos_ventas=80000000,
        gastos_financieros=20000000,
        gastos_no_deducibles=10000000,
        utilidad_contable_antes_impuestos=200000000,
        descuento_tributario_ica=10000000,
        retenciones_en_la_fuente=30000000,
        autorretenciones_practicadas=15000000,
        porcentaje_anticipo_siguiente=0.75,
    )

    result = liquidar_persona_juridica(input_data)

    # 1. Ingresos Netos = 1.050.000.000 - 20.000.000 - 10.000.000 = 1.020.000.000
    assert result.ingresos_netos == 1020000000

    # 2. Renta Bruta = 1.020.000.000 - 600.000.000 = 420.000.000
    assert result.renta_bruta == 420000000

    # 3. Gastos deducibles = (150M + 80M + 20M) - 10M no deducibles = 240.000.000
    assert result.total_gastos_deducibles == 240000000

    # 4. Renta Líquida Gravable = 420.000.000 - 240.000.000 = 180.000.000
    assert result.renta_liquida_gravable == 180000000

    # 5. Impuesto Básico 35% = 180.000.000 * 35% = 63.000.000
    assert result.impuesto_basico_renta == 63000000

    # 6. Descuento ICA = 10.000.000
    assert result.total_descuentos_tributarios_aplicados == 10000000

    # 7. Impuesto neto renta = 63.000.000 - 10.000.000 = 53.000.000
    # TTD = 53M / 200M = 26.5% >= 15% (cumple tasa mínima, no genera IA)
    assert not result.aplica_impuesto_adicional_ttd
    assert result.impuesto_adicional_ttd == 0

    # 8. Anticipo año siguiente = (53M * 75%) - 45M = 39.750.000 - 45.000.000 = 0 (negativo)
    assert result.anticipo_ano_siguiente == 0

    # 9. Retenciones = 30M + 15M = 45.000.000
    # Saldo a pagar = 53.000.000 - 45.000.000 = 8.000.000
    assert result.saldo_a_pagar == 8000000
    assert result.saldo_a_favor == 0

    # 10. Mapeo de casillas F110
    f110 = result.form_110_casillas
    assert f110.c58_total_ingresos_brutos == 1050000000
    assert f110.c61_total_ingresos_netos == 1020000000
    assert f110.c62_costos == 600000000
    assert f110.c79_renta_liquida_gravable == 180000000
    assert f110.c84_impuesto_renta_liquida_gravable == 63000000
    assert f110.c93_descuentos_tributarios == 10000000
    assert f110.c96_impuesto_neto_renta_con_adicion == 53000000
    assert f110.c113_total_saldo_a_pagar == 8000000


def test_persona_juridica_tasa_minima_ttd_gatillada():
    """Valida que si la TTD es inferior al 15%, se genere el Impuesto Adicional (IA) según Art. 240 Parágrafo 6."""
    input_data = PersonaJuridicaInput(
        tax_year=2025,
        ingresos_brutos_operacionales=500000000,
        costos_procedentes=300000000,
        gastos_administracion=150000000,
        utilidad_contable_antes_impuestos=300000000,  # Gran utilidad comercial pero renta gravable baja por beneficios
        rentas_exentas=40000000,
        retenciones_en_la_fuente=0,
    )

    result = liquidar_persona_juridica(input_data)

    # Renta Bruta = 200M
    # Renta Líquida = 200M - 150M = 50M
    # Renta Líquida Gravable = 50M - 40M exentas = 10M
    # Impuesto básico = 10M * 35% = 3.5M
    # TTD = 3.5M / 300M = 1.16% < 15%
    # Impuesto requerido = 300M * 15% = 45M
    # Impuesto Adicional IA = 45M - 3.5M = 41.5M
    assert result.aplica_impuesto_adicional_ttd
    assert result.impuesto_adicional_ttd == 41500000
    assert result.impuesto_neto_total == 45000000
    assert result.form_110_casillas.c95_impuesto_a_adicionar_ttd == 41500000


def test_persona_juridica_sobretasa_financiera():
    """Valida la liquidación de sobretasa del 5% para entidades financieras con renta >= 120k UVT."""
    uvt = 49799  # 2025
    rlg = 150000 * uvt  # 150.000 UVT (> 120.000 UVT)
    input_data = PersonaJuridicaInput(
        tax_year=2025,
        aplica_sobretasa_financiera=True,
        ingresos_brutos_operacionales=rlg + 500000000,
        costos_procedentes=500000000,
        utilidad_contable_antes_impuestos=rlg,
        retenciones_en_la_fuente=0,
    )

    result = liquidar_persona_juridica(input_data)

    assert result.puntos_adicionales_sobretasa == 0.05
    assert result.impuesto_sobretasa > 0
    assert result.form_110_casillas.c85_puntos_adicionales_sobretasa > 0
    assert result.form_110_casillas.c110_anticipo_sobretasa_ano_siguiente > 0
