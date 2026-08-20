from app.models.persona_natural import PersonaNaturalInput
from app.services.beneficios import (
    BeneficioAuditoriaRequest,
    ReduccionSancionRequest,
    calcular_beneficio_auditoria,
    calcular_reduccion_sancion,
    get_catalogo_beneficios,
)
from app.services.liquidacion_pn import liquidar_persona_natural


def test_persona_natural_con_ganancia_ocasional():
    """Valida la liquidación de Ganancia Ocasional (venta inmueble > 2 años) y su integración en el Form 210."""
    uvt = 52350
    input_data = PersonaNaturalInput(
        tax_year=2026,
        custom_uvt=uvt,
        patrimonio_bruto=500000000,
        deudas=150000000,
        rentas_trabajo=80000000,
        aporte_salud_obligatorio=3200000,
        aporte_pension_obligatorio=3200000,
        aplica_dependiente_general=True,
        ganancias_ocasionales_brutas_activos_fijos=300000000,  # Venta inmueble
        costos_ganancia_ocasional=200000000,  # Costo fiscal
        ganancias_ocasionales_exentas_solicitadas=0,
        ganancias_ocasionales_brutas_loterias=10000000,  # Lotería (tarifa 20%)
    )

    result = liquidar_persona_natural(input_data)

    # 1. Patrimonio Líquido = 500M - 150M = 350M (Casilla 32)
    assert result.patrimonio_liquido == 350000000
    assert result.form_210_casillas["c30_patrimonio_bruto"] == 500000000
    assert result.form_210_casillas["c31_deudas"] == 150000000
    assert result.form_210_casillas["c32_patrimonio_liquido"] == 350000000

    # 2. Ganancia Ocasional Bruta = 300M + 10M = 310M (Casilla 104)
    assert result.total_ganancias_ocasionales_brutas == 310000000
    assert result.costos_ganancia_ocasional == 200000000

    # GO Gravable = (300M - 200M) + 10M = 110M (Casilla 107)
    assert result.ganancia_ocasional_gravable == 110000000

    # Impuesto GO = (100M * 15%) + (10M * 20%) = 15.000.000 + 2.000.000 = 17.000.000 (Casilla 113)
    assert result.impuesto_ganancias_ocasionales == 17000000

    # Total Impuesto a Cargo = Impuesto Neto Renta + Impuesto GO (Casilla 115)
    assert result.total_impuesto_a_cargo == result.impuesto_neto_renta + 17000000
    assert result.form_210_casillas["c113_impuesto_ganancias_ocasionales"] == 17000000
    assert result.form_210_casillas["c115_total_impuesto_a_cargo"] == result.total_impuesto_a_cargo


def test_beneficio_auditoria_calculo():
    """Valida el cálculo del beneficio de auditoría para 6 y 12 meses."""
    req = BeneficioAuditoriaRequest(
        tax_year=2026, impuesto_neto_ano_anterior=10000000, custom_uvt=52350
    )
    res = calcular_beneficio_auditoria(req)

    assert res.cumple_impuesto_minimo
    # +35% para 6 meses = 13.500.000
    assert res.impuesto_objetivo_6_meses_cop == 13500000
    # +25% para 12 meses = 12.500.000
    assert res.impuesto_objetivo_12_meses_cop == 12500000


def test_reduccion_sanciones():
    """Valida la reducción de sanciones por el Art. 640 y 644 E.T."""
    req = ReduccionSancionRequest(
        monto_sancion_base_cop=2000000,
        sin_sanciones_ultimos_2_anos=True,
        sin_sanciones_ultimo_1_ano=True,
    )
    res = calcular_reduccion_sancion(req)

    assert res.porcentaje_reduccion_aplicado == 50.0
    assert res.sancion_final_reducida_cop == 1000000
    assert res.ahorro_sancion_cop == 1000000


def test_catalogo_beneficios():
    """Valida que el catálogo de beneficios contenga todas las categorías legales."""
    catalog = get_catalogo_beneficios()
    categories = {b.categoria for b in catalog}
    assert "incrngo" in categories
    assert "deducciones" in categories
    assert "rentas_exentas" in categories
    assert "auditoria_sanciones" in categories
    assert len(catalog) >= 10


def test_calcular_sancion_correccion_voluntaria_con_reduccion():
    """Valida el cálculo de sanción por corrección voluntaria (10%) y reducción al 50% (Art. 640)."""
    from app.services.beneficios import LiquidacionSancionRequest, calcular_sancion_tributaria

    req = LiquidacionSancionRequest(
        tipo_sancion="correccion",
        monto_base_cop=20000000,  # Mayor valor: 20M
        es_voluntario_sin_emplazamiento=True,
        sin_sanciones_ultimos_2_anos=True,
        sin_sanciones_ultimo_1_ano=True,
        tax_year=2026,
        custom_uvt=52350,
    )
    res = calcular_sancion_tributaria(req)

    # 10% de 20M = 2.000.000
    assert res.sancion_plena_sin_reduccion_cop == 2000000
    assert res.porcentaje_reduccion_art640_pct == 50.0
    # Sanción con 50% de descuento = 1.000.000
    assert res.sancion_con_reduccion_cop == 1000000
    assert res.sancion_final_a_pagar_cop == 1000000
    assert not res.aplico_sancion_minima
    # Comparativa si la DIAN hubiese emplazado: 20% de 20M = 4.000.000
    assert res.comparativa_sancion_con_emplazamiento_dian_cop == 4000000
    assert res.ahorro_por_corregir_antes_de_dian_cop == 3000000


def test_calcular_sancion_control_minima_10_uvt():
    """Valida que la sanción liquidada nunca sea inferior a 10 UVT (Art. 639 E.T.)."""
    from app.services.beneficios import LiquidacionSancionRequest, calcular_sancion_tributaria

    uvt = 52350
    req = LiquidacionSancionRequest(
        tipo_sancion="correccion",
        monto_base_cop=1000000,  # Mayor valor pequeño: 1M (sanción 10% = 100k, reducida al 50% = 50k)
        es_voluntario_sin_emplazamiento=True,
        sin_sanciones_ultimos_2_anos=True,
        tax_year=2026,
        custom_uvt=uvt,
    )
    res = calcular_sancion_tributaria(req)

    # 10 UVT = 524.000 COP redondeado
    assert res.aplico_sancion_minima
    assert res.sancion_final_a_pagar_cop == 524000


def test_calcular_sancion_extemporaneidad_mensual():
    """Valida la sanción por extemporaneidad voluntaria (5% por mes o fracción)."""
    from app.services.beneficios import LiquidacionSancionRequest, calcular_sancion_tributaria

    req = LiquidacionSancionRequest(
        tipo_sancion="extemporaneidad",
        monto_base_cop=10000000,  # Impuesto a cargo: 10M
        meses_fraccion_retraso=3,  # 3 meses (15%)
        es_voluntario_sin_emplazamiento=True,
        sin_sanciones_ultimos_2_anos=False,
        sin_sanciones_ultimo_1_ano=True,  # 25% descuento (paga 75%)
        tax_year=2026,
        custom_uvt=52350,
    )
    res = calcular_sancion_tributaria(req)

    # 15% de 10M = 1.500.000
    assert res.sancion_plena_sin_reduccion_cop == 1500000
    assert res.porcentaje_reduccion_art640_pct == 25.0
    # 1.500.000 * 0.75 = 1.125.000
    assert res.sancion_con_reduccion_cop == 1125000
    assert res.sancion_final_a_pagar_cop == 1125000


def test_calcular_exencion_inmueble_afc_art311_1():
    """Valida el cálculo de la utilidad exenta por venta de casa de habitación depositada en AFC (hasta 5.000 UVT)."""
    from app.services.beneficios import SimulacionInmuebleAfcRequest, calcular_exencion_inmueble_afc

    uvt = 52350
    # Venta de casa en 700M con costo de 350M => Utilidad bruta: 350M
    # Monto depositado en AFC: 300M
    # Tope 5.000 UVT: 261.750.000
    req = SimulacionInmuebleAfcRequest(
        precio_venta_cop=700000000,
        costo_fiscal_inmueble_cop=350000000,
        es_vivienda_habitacion=True,
        posesion_mas_2_anos=True,
        monto_depositado_afc_o_vivienda_cop=300000000,
        tax_year=2026,
        custom_uvt=uvt,
    )
    res = calcular_exencion_inmueble_afc(req)

    assert res.ganancia_ocasional_bruta_cop == 350000000
    assert res.tope_maximo_exencion_cop == 261750000
    # La exención no puede superar el tope de 5.000 UVT
    assert res.ganancia_ocasional_exenta_cop == 261750000
    # Gravada = 350M - 261.75M = 88.25M
    assert res.ganancia_ocasional_gravada_final_cop == 88250000
    # Impuesto sin AFC = 350M * 15% = 52.500.000
    assert res.impuesto_go_sin_afc_cop == 52500000
    # Impuesto con AFC = 88.25M * 15% = 13.237.500
    assert res.impuesto_go_con_afc_cop == 13237500
    # Ahorro = 261.75M * 15% = 39.262.500
    assert res.ahorro_impuesto_afc_cop == 39262500
